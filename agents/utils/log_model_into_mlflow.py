import mlflow
from huggingface_hub import hf_hub_download
import onnx

def download_and_log_model(
    repo_id: str, 
    filename: str, 
    registered_model_name: str,
    local_dir: str = "models/",
):
    # Download ONNX model from Hugging Face
    onnx_model_path = hf_hub_download(
        repo_id=repo_id, 
        filename=filename, 
        local_dir=local_dir
    )

    # Load the ONNX model object from the downloaded path
    model = onnx.load(onnx_model_path)

    # Log ONNX models to MLflow
    with mlflow.start_run(run_name=f"upload_{registered_model_name}"):
        mlflow.onnx.log_model(
            onnx_model=model,
            artifact_path="model",
            registered_model_name=registered_model_name
        )
    return registered_model_name

def main():
    mlflow.set_tracking_uri("http://localhost:5002")

    model_list = [
        {
            "repo_id": "intfloat/multilingual-e5-small", 
            "filename": "onnx/model.onnx"
        },
        # {
        #     "repo_id": "openfoodfacts/nutrition-extractor", 
        #     "filename": "onnx/model.onnx"
        # },
    ]

    for model_info in model_list:
        registered_name = model_info["repo_id"].replace("/", "_") + "_onnx_model"
        print(f"Downloading and logging {model_info['repo_id']} ...")
        result = download_and_log_model(
            repo_id=model_info["repo_id"],
            filename=model_info["filename"],
            local_dir="models/",
            registered_model_name=registered_name
        )
        print(f"Model {model_info['repo_id']} logged to MLflow as '{result}'.")

if __name__ == "__main__":  
    main()
