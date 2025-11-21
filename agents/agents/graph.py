import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

from langchain.agents import create_agent
from langchain_core.language_models import BaseLanguageModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import END, StateGraph
from langgraph.types import Command

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from tools.food_nutrition import food_nutrition_tool
from tools.ocr import clova_ocr_tool
from tools.user_info import get_user_info_by_user_id
from tools.volume_predictor import predict_volume_tool


class OrchestrationState(TypedDict, total=False):
    """State container passed between LangGraph nodes."""

    messages: List[BaseMessage]
    user_id: Optional[str]
    image: Optional[str]
    scenario: Optional[str]
    plan: Dict[str, Any]
    pending_nodes: List[str]
    vision_result: Optional[str]
    nutrition_result: Optional[str]
    summarizer_result: Optional[str]
    final_response: Optional[str]


def _load_prompt(name: str, fallback: str) -> str:
    prompt_path = Path(__file__).parent.parent / "agents" / "prompts" / f"{name}.txt"
    if prompt_path.exists():
        contents = prompt_path.read_text(encoding="utf-8").strip()
        if contents:
            return contents
    return fallback.strip()


def _build_react_agent(
    llm: BaseLanguageModel,
    tools,
    system_prompt: str,
):
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    return create_agent(llm, tools, prompt=prompt)


def _safe_json_loads(text: str) -> Dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?", "", stripped, flags=re.IGNORECASE).strip()
        if stripped.endswith("```"):
            stripped = stripped[:-3].strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
    return {}


class MultiAgentGraph:
    """Builds and runs the LangGraph-based supervisor workflow."""

    def __init__(self, llm: BaseLanguageModel):
        supervisor_prompt = _load_prompt(
            "supervisor",
            """
            You orchestrate Vision, Nutrition, and Summarizer agents according to the
            agent-flow specification. Respond ONLY in compact JSON with keys:
            - scenario: one of ["A","B","C","D"]
            - sequence: ordered list of agent node names among
              ["vision","nutrition","summarizer"] that must run before composer
            - rationale: short explanation
            - expected_outputs: list of strings that describe desired data
            """,
        )
        vision_prompt = _load_prompt(
            "vision",
            """
            You analyze user-provided food images. Use tools when appropriate:
            - predict_volume_tool(image_id: str) for 3D volume estimates
            - clova_ocr_tool(file_input: str) to extract nutrition labels or text
            Return a concise JSON string with keys: detections, ocr, volume, confidence,
            and notes about assumptions.
            """,
        )
        nutrition_prompt = _load_prompt(
            "nutrition",
            """
            You synthesize nutrition facts using food detections, OCR tables, and
            the food_nutrition_tool(food_name: str). Produce JSON with keys:
            foods, macros, micronutrients, confidence, and provenance.
            """,
        )
        summarizer_prompt = _load_prompt(
            "summarizer",
            """
            You retrieve user-specific context using get_user_info_by_user_id(user_id: str).
            Summarize allergies, goals, and history relevant to the request.
            Output JSON with keys: profile, constraints, goals, and confidence.
            """,
        )
        composer_prompt = _load_prompt(
            "meal_planning",
            """
            Combine the supervisor plan, vision, nutrition, and summarizer outputs into a
            final assistant reply. Always cite which agents or tools informed each claim
            and mention uncertainties. Tailor advice to the user profile when available.
            """,
        )

        self.supervisor_agent = _build_react_agent(llm, [], supervisor_prompt)
        self.vision_agent = _build_react_agent(
            llm,
            [predict_volume_tool, clova_ocr_tool],
            vision_prompt,
        )
        self.nutrition_agent = _build_react_agent(
            llm,
            [food_nutrition_tool],
            nutrition_prompt,
        )
        self.summarizer_agent = _build_react_agent(
            llm,
            [get_user_info_by_user_id],
            summarizer_prompt,
        )
        self.composer_agent = _build_react_agent(llm, [], composer_prompt)

        workflow = StateGraph(OrchestrationState)
        workflow.add_node("supervisor", self._supervisor_node)
        workflow.add_node("vision", self._vision_node)
        workflow.add_node("nutrition", self._nutrition_node)
        workflow.add_node("summarizer", self._summarizer_node)
        workflow.add_node("composer", self._composer_node)

        workflow.set_entry_point("supervisor")
        workflow.add_edge("composer", END)

        self.graph = workflow.compile()
        self.graph.get_graph().draw_mermaid_png(output_file_path=Path(__file__).parent.parent / "imgs/agent_graph.png")

    @staticmethod
    def _append_message(state: OrchestrationState, content: str) -> List[BaseMessage]:
        history = state.get("messages", [])
        return history + [AIMessage(content=content)]

    @staticmethod
    def _advance(state: OrchestrationState, updates: Dict[str, Any]) -> Command:
        pending = state.get("pending_nodes", [])
        if pending:
            next_node = pending[0]
            updates["pending_nodes"] = pending[1:]
            return Command(update=updates, goto=next_node)
        return Command(update=updates, goto="composer")

    def _supervisor_node(self, state: OrchestrationState) -> Command:
        user_message = state["messages"][-1].content if state.get("messages") else ""
        image_ref = state.get("image")
        enriched_input = (
            "User request:\n"
            f"{user_message}\n"
            f"User ID: {state.get('user_id')}\n"
            f"Image reference: {image_ref}\n"
            "Follow the agent-flow routing rules."
        )
        response = self.supervisor_agent.invoke({"input": enriched_input})
        output_text = response.get("output", str(response))
        plan = _safe_json_loads(output_text)
        scenario = plan.get("scenario") or "A"
        sequence = plan.get("sequence") or []
        sequence = [node for node in sequence if node in {"vision", "nutrition", "summarizer"}]
        updates: Dict[str, Any] = {
            "messages": self._append_message(state, f"[Supervisor]\n{output_text}"),
            "scenario": scenario,
            "plan": plan,
        }
        if sequence:
            next_node = sequence[0]
            updates["pending_nodes"] = sequence[1:]
        else:
            next_node = "composer"
            updates["pending_nodes"] = []
        return Command(update=updates, goto=next_node)

    def _vision_node(self, state: OrchestrationState) -> Command:
        scenario = state.get("scenario", "A")
        user_msg = state["messages"][0].content if state.get("messages") else ""
        payload = (
            f"Scenario: {scenario}\n"
            f"User request: {user_msg}\n"
            f"Image reference: {state.get('image')}\n"
            "Include structured results for detections, OCR, and volume."
        )
        response = self.vision_agent.invoke({"input": payload})
        output_text = response.get("output", str(response))
        updates = {
            "vision_result": output_text,
            "messages": self._append_message(state, f"[Vision]\n{output_text}"),
        }
        return self._advance(state, updates)

    def _nutrition_node(self, state: OrchestrationState) -> Command:
        scenario = state.get("scenario", "A")
        payload = (
            f"Scenario: {scenario}\n"
            f"User request: {state['messages'][0].content if state.get('messages') else ''}\n"
            f"Vision result: {state.get('vision_result')}\n"
            "Summarizer context (if any): {summarizer}\n"
            "Return nutrition insights."
        ).replace("{summarizer}", state.get("summarizer_result", "N/A"))
        response = self.nutrition_agent.invoke({"input": payload})
        output_text = response.get("output", str(response))
        updates = {
            "nutrition_result": output_text,
            "messages": self._append_message(state, f"[Nutrition]\n{output_text}"),
        }
        return self._advance(state, updates)

    def _summarizer_node(self, state: OrchestrationState) -> Command:
        payload = (
            f"User ID: {state.get('user_id')}\n"
            f"User request: {state['messages'][0].content if state.get('messages') else ''}\n"
            "Fetch and summarize profile constraints."
        )
        response = self.summarizer_agent.invoke({"input": payload})
        output_text = response.get("output", str(response))
        updates = {
            "summarizer_result": output_text,
            "messages": self._append_message(state, f"[Summarizer]\n{output_text}"),
        }
        return self._advance(state, updates)

    def _composer_node(self, state: OrchestrationState) -> OrchestrationState:
        payload = (
            "Compose the final reply using the following:\n"
            f"Scenario: {state.get('scenario')}\n"
            f"Plan: {json.dumps(state.get('plan', {}), ensure_ascii=False)}\n"
            f"Vision: {state.get('vision_result')}\n"
            f"Nutrition: {state.get('nutrition_result')}\n"
            f"Summarizer: {state.get('summarizer_result')}\n"
            "Return a user-facing answer with action items and cite agent sources."
        )
        response = self.composer_agent.invoke({"input": payload})
        output_text = response.get("output", str(response))
        messages = self._append_message(state, f"[Composer]\n{output_text}")
        return {
            **state,
            "messages": messages,
            "final_response": output_text,
        }

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
            "pending_nodes": [],
        }
        return self.graph.invoke(initial_state)

