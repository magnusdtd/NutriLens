from typing import Optional
from .graph import MultiAgentGraph


class SupervisorAgent:
    """Wrapper that exposes a simple execute() API on top of the LangGraph workflow."""

    def __init__(self, llm):
        self._graph = MultiAgentGraph(llm)

    def execute(
        self,
        *,
        user_message: str,
        user_id: Optional[str] = None,
        image: Optional[str] = None,
    ):
        final_state = self._graph.invoke(
            user_message=user_message,
            user_id=user_id,
            image=image,
        )
        return {
            "response": final_state.get("final_response"),
            "state": final_state,
        }

