from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import ORJSONResponse
from langchain_naver import ChatClovaX
from langfuse import get_client
from pydantic import BaseModel
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from agents.supervisor import SupervisorAgent

langfuse = get_client()

chat = ChatClovaX(
    model="HCX-005",
    temperature=0.5,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

supervisor = SupervisorAgent(llm=chat)


def lifespan(app: FastAPI):
    print("FastAPI has been installed completely.")
    yield


app = FastAPI(
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
    title="Nutrition Assistant API",
    description="Hierarchical multi-agent orchestration for nutrition guidance.",
    version="1.0.0",
    swagger_ui_parameters={"syntaxHighlight.theme": "monokai"},
)

class ImgRequest(BaseModel):
    user_id: Optional[str] = None
    image: Optional[str] = None 

@app.post("/api/chat")
async def chat_completion(payload: ImgRequest):
    return {}

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    image: Optional[str] = None


@app.post("/api/chat")
async def chat_completion(payload: ChatRequest):
    """Route chat requests through the LangGraph-based supervisor."""
    if not payload.message:
        raise HTTPException(status_code=400, detail="message field is required.")

    result = supervisor.execute(
        user_message=payload.message,
        user_id=payload.user_id,
        image=payload.image,
    )

    langfuse.flush()
    return {"reply": result.get("response"), "details": result}
