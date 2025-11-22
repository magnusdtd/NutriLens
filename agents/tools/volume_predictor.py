from langchain.tools import tool
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from volume_predictor import VolumePredictor
from utils.minio_client import minio_client
from utils.postgresql import engine, Image
from sqlmodel import Session, select

@tool(
    description=(
        "Predict the volume of food in an image using a given image ID. "
        "Fetch the image from the database and MinIO storage, run the prediction model, and return the predicted volume/result as JSON."
    ),
)
def predict_volume_tool(image_id: str) -> dict:
    """
    Given an image_id (UUID), fetch image metadata from PostgreSQL, retrieve the image from MinIO,
    predict its food volume using checkpoints, and return the prediction result as JSON.

    Args:
        image_id (str): The ID (UUID) of the image to process.

    Returns:
        dict: Prediction results or an error message.
    """
    # 1. Retrieve image metadata from Postgres
    with Session(engine) as session:
        try:
            stmt = select(Image).where(Image.id == image_id)
            image_obj = session.exec(stmt).first()
            if not image_obj:
                return {"error": f"Image not found for the provided image_id: {image_id}"}
        except Exception as db_err:
            return {"error": f"Database error while retrieving image: {str(db_err)}"}

    # 2. Retrieve image file from MinIO
    try:
        image_stream = minio_client.get_image(
            file_name=image_obj.file_name,
            bucket_name=image_obj.bucket
        )
    except Exception as minio_err:
        return {"error": f"Error retrieving image from MinIO: {str(minio_err)}"}

    # 3. Load and run the VolumePredictor
    try:
        predictor = VolumePredictor(
            yolo_path=str(Path(__file__).parent / "checkpoints/yolov8_foodseg103.onnx"),
            dav2_path=str(Path(__file__).parent / "checkpoints/depth_anything_v2_metric_hypersim_vits.pth"),
            dav2_type="vits"
        )
        prediction_result = predictor.predict(image_stream)
        if not isinstance(prediction_result, dict):
            return {"error": "Prediction module did not return a dictionary"}
        return prediction_result

    except Exception as predict_err:
        return {"error": f"Error during prediction: {str(predict_err)}"}
