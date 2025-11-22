from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import ORJSONResponse
from langchain_naver import ChatClovaX
from langfuse import get_client
from pydantic import BaseModel
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
# from agents.supervisor import SupervisorAgent
from sqlmodel import Session, select
from utils.postgresql import engine, Image
from fastapi.responses import StreamingResponse


langfuse = get_client()

chat = ChatClovaX(
    model="HCX-005",
    temperature=0.5,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

# supervisor = SupervisorAgent(llm=chat)


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



@app.post("/api/predict_img")
async def predict_img(
    user_id: str,
    image_id: str,
):
    from utils.minio_client import minio_client

    # 1. Retrieve image metadata from Postgres
    with Session(engine) as session:
        try:
            stmt = select(Image).where(Image.id == image_id)
            image_obj = session.exec(stmt).first()
            if not image_obj:
                raise HTTPException(status_code=404, detail=f"Image not found for the provided image_id: {image_id}")
        except Exception as db_err:
            raise HTTPException(status_code=500, detail=f"Database error while retrieving image: {str(db_err)}")

    # 2. Retrieve image file from MinIO
    try:
        image_stream = minio_client.get_image(
            file_name=image_obj.file_name,
            bucket_name=image_obj.bucket
        )
    except Exception as minio_err:
        raise HTTPException(status_code=500, detail=f"Error retrieving image from MinIO: {str(minio_err)}")

    # return StreamingResponse(image_stream, media_type="image/jpeg")

    return { 
        "predictions": ["grilled chicken breast", "brown rice", "steamed broccoli"], 
        "nutritional_info": { "calories": 450, "protein": 45, "carbs": 38, "fat": 8 } 
    }


class ChatRequest(BaseModel):
    message: str
    user_id: str
    image: Optional[str] = None


@app.post("/api/chat")
async def chat_completion(payload: ChatRequest):
    """Route chat requests through the LangGraph-based supervisor."""
    if not payload.message:
        raise HTTPException(status_code=400, detail="message field is required.")

    # result = supervisor.execute(
    #     user_message=payload.message,
    #     user_id=payload.user_id,
    #     image=payload.image,
    # )
    messages = [
        (
            "system",
            "You are a helpful assistant that speak English. Answer the user question.",
        ),
        ("human", payload.message),
    ]

    result = chat.invoke(messages)

    langfuse.flush()
    return {"reply": result.content, "chat_name": "Healthy Meal"}
