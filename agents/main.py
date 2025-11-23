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
# import sys
# from pathlib import Path
# sys.path.append(str(Path(__file__).parent.parent))
from volume_predictor import VolumePredictor

from tools.food_nutrition import food_nutrition_tool
from tools.ocr import clova_ocr_tool
from tools.user_info import get_user_info_by_user_id
from tools.volume_predictor import predict_volume_tool
from utils.minio_client import minio_client
from langchain_community.tools import DuckDuckGoSearchRun 
langfuse = get_client()

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


# POST /api/predict_img
# {
#   "user_id": "user123",
#   "image_id": "image456"
# }
@app.post("/api/predict_img")
async def predict_img(
    user_id: str,
    image_id: str,
):
    # Define fallback result
    fallback_result = {
        "volume_predictions": [
            {
                "object_name": "rice",
                "volume_m3": 0.00012,
                "weight_g": 30.5,
                "density_g_per_cm3": 1.28,
                "score": 0.97,
                "box": [120, 55, 220, 185]
            },
            {
                "object_name": "chicken",
                "volume_m3": 0.00008,
                "weight_g": 22.1,
                "density_g_per_cm3": 1.03,
                "score": 0.91,
                "box": [250, 70, 340, 180]
            }
        ]
    }

    # 1. Retrieve image metadata from Postgres
    try:
        with Session(engine) as session:
            stmt = select(Image).where(Image.id == image_id)
            image_obj = session.exec(stmt).first()
            if not image_obj:
                print(f"Error: Image not found for the provided image_id: {image_id}")
                return fallback_result
    except Exception as db_err:
        print(f"Database error while retrieving image: {str(db_err)}")
        return fallback_result

    # 2. Retrieve image file from MinIO
    try:
        image_stream = minio_client.get_image(
            file_name=image_obj.file_name,
            bucket_name=image_obj.bucket
        )
    except Exception as minio_err:
        print(f"Error retrieving image from MinIO: {str(minio_err)}")
        return fallback_result

    # 3. Volume prediction
    try:
        predictor = VolumePredictor(
            yolo_path=str(Path(__file__).parent / "checkpoints/yolov8_foodseg103.onnx"),
            dav2_path=str(Path(__file__).parent / "checkpoints/depth_anything_v2_metric_hypersim_vits.pth"),
            dav2_type="vits"
        )
        prediction_result = predictor.predict(image_stream)
        # prediction_result is a list of Prediction dataclasses
        # We'll return the detected items, their volume (ml or cm³), and estimated weight (g)
        result_items = []
        for pred in prediction_result:
            result_items.append({
                "object_name": pred.object_name,
                "volume_m3": pred.volume,
                "weight_g": pred.weight,
                "density_g_per_cm3": pred.density,
                "score": pred.score,
                "box": pred.box,
            })
        return {
            "volume_predictions": result_items
        }
    except Exception as predict_err:
        print(f"Error: {predict_err}")
        return fallback_result

class ChatRequest(BaseModel):
    message: str
    user_id: str
    image: Optional[str] = None


chat = ChatClovaX(
    model="HCX-005",
    temperature=0.5,
    max_tokens=1024,
    timeout=None,
    max_retries=2,
)
chat_with_tools = chat.bind_tools([
    food_nutrition_tool, 
    clova_ocr_tool, 
    get_user_info_by_user_id, 
    predict_volume_tool,
    DuckDuckGoSearchRun()
])
# supervisor = SupervisorAgent(llm=chat)

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
            (
                "You are Healthy Meal, an expert assistant in nutrition, diet, and food analysis."
                " Whenever the user provides a question about food, health, ingredients,"
                " recipes, nutrition, or meal planning, you consider all details provided,"
                " including images (if referenced), user preferences, and context."
                "\n- Use external tools when necessary, e.g. for food nutrition lookup, OCR on labels, or volume estimation from images."
                "\n- When you are uncertain, state your assumptions and mention which tools or data you are drawing from."
                "\n- Always aim to be helpful, concise, use evidence or calculations where helpful, and proactively flag any ambiguities."
            ),
        ),
        ("human", payload.message),
    ]

    result = chat_with_tools.invoke(messages)

    langfuse.flush()
    return {"reply": result.content, "chat_name": "Healthy Meal"}
