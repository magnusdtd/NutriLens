import mlflow
from huggingface_hub import hf_hub_download
import onnx
import torch
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from volume_predictor.depth_anything_v2.dpt import DepthAnythingV2

def download_and_log_model(
    repo_id: str,
    filename: str,
    registered_model_name: str,
    local_dir: str = "models/",
    model_type: str = "onnx",  # Accept "onnx" or "torch"
):
    # Download model from Hugging Face
    model_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=local_dir
    )

    # Log model to MLflow depending on type
    with mlflow.start_run(run_name=f"upload_{registered_model_name}"):
        if model_type == "onnx":
            model = onnx.load(model_path)
            mlflow.onnx.log_model(
                onnx_model=model,
                name=repo_id.split('/')[-1],
                registered_model_name=registered_model_name
            )
        elif model_type == "torch":
            model = DepthAnythingV2(
                **{'encoder': 'vits', 'features': 64, 'out_channels': [48, 96, 192, 384], 'max_depth': 20})
            checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
            state_dict = checkpoint.get("state_dict", checkpoint)
            model.load_state_dict(state_dict)
            mlflow.pytorch.log_model(
                pytorch_model=model,
                name=repo_id.split('/')[-1],
                registered_model_name=registered_model_name
            )
            mlflow.log_artifact(model_path, artifact_path=repo_id.split('/')[-1])
        else:
            raise ValueError(f"Unsupported model_type: {model_type}")
    return registered_model_name

def main():
    mlflow.set_tracking_uri("http://localhost:5002")

    # Each entry can optionally include a model_type; fallback to "onnx" if omitted
    model_list = [
        {
            "repo_id": "intfloat/multilingual-e5-small",
            "filename": "onnx/model.onnx",
            "model_type": "onnx"
        },
        {
            "repo_id": "magnusdtd/yolov8-foodseg103",
            "filename": "yolov8_foodseg103.onnx",
            "model_type": "onnx"
        },
        {
            "repo_id": "depth-anything/Depth-Anything-V2-Metric-Hypersim-Small",
            "filename": "depth_anything_v2_metric_hypersim_vits.pth",
            "model_type": "torch"
        },
    ]

    for model_info in model_list:
        registered_name = (
            model_info["repo_id"].replace("/", "_")
            + f"_{model_info['model_type']}_model"
        )
        print(f"Downloading and logging {model_info['repo_id']} ({model_info['model_type']}) ...")
        result = download_and_log_model(
            repo_id=model_info["repo_id"],
            filename=model_info["filename"],
            local_dir="../checkpoints/",
            registered_model_name=registered_name,
            model_type=model_info.get("model_type")
        )
        print(f"Model {model_info['repo_id']} ({model_info['model_type']}) logged to MLflow as '{result}'.")

if __name__ == "__main__":
    main()
