import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

from langchain_core.language_models import BaseLanguageModel
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import END, StateGraph, START
from langgraph.types import Command

# Tool imports
sys.path.append(str(Path(__file__).parent))
from tools.food_nutrition import food_nutrition_tool
from tools.ocr import clova_ocr_tool
from tools.user_info import get_user_info_by_user_id
from tools.volume_predictor import predict_volume_tool
from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_naver_community.tool import NaverNewsSearch  # For news articles
from langchain_naver_community.tool import NaverBlogSearch  # For blog posts

# ---- State definition ----
class OrchestrationState(TypedDict, total=False):
    messages: List[BaseMessage]
    user_id: Optional[str]
    image: Optional[str]
    # The following are per-agent results
    vision: Optional[Dict[str, Any]]
    nutrition: Optional[Dict[str, Any]]
    summarizer: Optional[Dict[str, Any]]
    composer: Optional[str]

# ---- Prompts ----
SUPERVISOR_SYSTEM = """You are a supervisor. Read the user message and any provided image or user id.
Choose which agents to call, and in what order, to fulfil the request using this list:
- vision: for food image analysis & extracting OCR/volume
- nutrition: for nutrition lookup and synthesis
- summarizer: for user profile/history/context

Respond in JSON: { "plan": ["vision",...], "explanation": str }
"""
VISION_SYSTEM = """You are an expert in food image analysis.
- Call 'predict_volume_tool' to get food volume (if necessary)
- Call 'clova_ocr_tool' to extract text from labels

Reply in JSON containing available info like: detections, ocr, volume, confidence, notes.
"""
NUTRITION_SYSTEM = """You synthesize nutrition info from ingredients, ocr and volume.
Use food_nutrition_tool as needed. Reply in JSON with keys:
foods, macros, micronutrients, confidence, provenance.
"""
SUMMARIZER_SYSTEM = """You pull up user profile and history with get_user_info_by_user_id.
Summarize any constraints, goals, allergies from the user DB. Reply JSON.
"""
COMPOSER_SYSTEM = """Synthesize a readable, actionable user answer.
Include agent/tool sources and mention uncertainty/assumptions where needed.
"""

def new_agent(llm, tools, sys_prompt):
    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])
    return create_agent(llm, tools, system_prompt=prompt)

def safe_json(text) -> Any:
    """Parse a string safely as JSON and return a dict or fallback to str."""
    try:
        return json.loads(text)
    except Exception:
        try:
            # Sometimes output is like ```json ... ```
            import re
            m = re.search(r"\{.*\}", text, flags=re.S)
            if m: return json.loads(m.group(0))
        except Exception:
            pass
    return text

class MultiAgentGraph:
    """Simplified LangGraph setup according to agent-flow.md."""

    def __init__(self, llm: BaseLanguageModel):
        # Instantiate each agent
        self.llm = llm
        self.supervisor = new_agent(llm, [], SUPERVISOR_SYSTEM)
        self.vision = new_agent(llm, [predict_volume_tool, clova_ocr_tool], VISION_SYSTEM)
        self.nutrition = new_agent(llm, [food_nutrition_tool], NUTRITION_SYSTEM)
        self.summarizer = new_agent(llm, [get_user_info_by_user_id], SUMMARIZER_SYSTEM)
        self.composer = new_agent(llm, [], COMPOSER_SYSTEM)

        workflow = StateGraph(OrchestrationState)
        workflow.add_node("supervisor", self._supervisor_node)
        workflow.add_node("vision", self._vision_node)
        workflow.add_node("nutrition", self._nutrition_node)
        workflow.add_node("summarizer", self._summarizer_node)
        workflow.add_node("composer", self._composer_node)
        workflow.set_entry_point("supervisor")
        workflow.add_edge("composer", END)
        self.graph = workflow.compile()

    def _get_next_agent(self, plan: List[str], results: OrchestrationState) -> Optional[str]:
        # plan is a list like ["vision", "nutrition", ...]
        # Return the next agent not yet done (has no output in results)
        for agent in plan:
            if results.get(agent) is None:
                return agent
        return None

    def _supervisor_node(self, state: OrchestrationState) -> Command:
        # Parse user intent and make a plan
        msg_content = state["messages"][-1].content if state.get("messages") else ""
        plan_resp = self.supervisor.invoke({"input": msg_content})
        plan_json = safe_json(plan_resp.get("output", str(plan_resp)))
        plan = plan_json.get("plan") or []
        updates = {"plan": plan}
        next_agent = plan[0] if plan else "composer"
        return Command(update=updates, goto=next_agent)

    def _vision_node(self, state: OrchestrationState) -> Command:
        # Only run if "vision" is in the plan
        info = {
            "user": state.get("user_id"),
            "image": state.get("image"),
            "request": state["messages"][0].content if state.get("messages") else "",
        }
        vision_input = f"User: {info['user']}\nImage: {info['image']}\nRequest: {info['request']}\n"
        output = self.vision.invoke({"input": vision_input}).get("output", "")
        result = safe_json(output)
        updates = {"vision": result}
        # figure out who is next
        plan = state.get("plan", ["vision"])
        next_agent = self._get_next_agent(plan, {**state, **updates})
        next_agent = next_agent or "composer"
        return Command(update=updates, goto=next_agent)

    def _nutrition_node(self, state: OrchestrationState) -> Command:
        # Prepare context from vision and summarizer, if available
        nut_input = {
            "request": state["messages"][0].content if state.get("messages") else "",
            "vision": state.get("vision"),
            "profile": state.get("summarizer")
        }
        input_text = f"Request: {nut_input['request']}\n" \
                     f"Vision: {json.dumps(nut_input['vision'], ensure_ascii=False)}\n" \
                     f"Profile: {json.dumps(nut_input['profile'], ensure_ascii=False)}"
        output = self.nutrition.invoke({"input": input_text}).get("output", "")
        result = safe_json(output)
        updates = {"nutrition": result}
        plan = state.get("plan", ["nutrition"])
        next_agent = self._get_next_agent(plan, {**state, **updates})
        next_agent = next_agent or "composer"
        return Command(update=updates, goto=next_agent)

    def _summarizer_node(self, state: OrchestrationState) -> Command:
        sum_input = {
            "user_id": state.get("user_id"),
            "request": state["messages"][0].content if state.get("messages") else ""
        }
        input_text = f"User: {sum_input['user_id']}\nRequest: {sum_input['request']}"
        output = self.summarizer.invoke({"input": input_text}).get("output", "")
        result = safe_json(output)
        updates = {"summarizer": result}
        plan = state.get("plan", ["summarizer"])
        next_agent = self._get_next_agent(plan, {**state, **updates})
        next_agent = next_agent or "composer"
        return Command(update=updates, goto=next_agent)

    def _composer_node(self, state: OrchestrationState) -> OrchestrationState:
        input_data = {
            "plan": state.get("plan"),
            "vision": state.get("vision"),
            "nutrition": state.get("nutrition"),
            "summarizer": state.get("summarizer"),
            "user": state.get("user_id")
        }
        input_text = f"Plan: {json.dumps(input_data['plan'], ensure_ascii=False)}\n"\
                     f"Vision: {json.dumps(input_data['vision'], ensure_ascii=False)}\n"\
                     f"Nutrition: {json.dumps(input_data['nutrition'], ensure_ascii=False)}\n"\
                     f"Summarizer: {json.dumps(input_data['summarizer'], ensure_ascii=False)}\n"
        resp = self.composer.invoke({"input": input_text})
        output = resp.get("output", str(resp))
        return {**state, "composer": output}

    def invoke(
        self,
        *,
        user_message: str,
        user_id: str,
        image: Optional[str] = None,
    ) -> OrchestrationState:
        initial_state: OrchestrationState = {
            "messages": [HumanMessage(content=user_message)],
            "user_id": user_id,
            "image": image,
        }
        return self.graph.invoke(initial_state)
