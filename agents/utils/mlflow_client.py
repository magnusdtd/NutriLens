import mlflow
import onnx
import os
import shutil
import glob

class MLFlow:
    def __init__(self) -> None:
        mlflow_uri = os.environ.get("MLFLOW_URI")
        mlflow.set_tracking_uri(mlflow_uri)

    def load_onnx_model(self, model_local_path: str, mlflow_model_uri: str):
        # Check if model already exists locally, only download if necessary
        if not os.path.isfile(model_local_path):
            directory = os.path.dirname(model_local_path)
            os.makedirs(directory, exist_ok=True)
            # Try to load the model from MLflow, fall back to local model if it fails
            if mlflow_model_uri is None:
                raise ValueError(f"Model not found at {model_local_path} and MLflow URI is not set. Please set environment variable or ensure the model file exists.")
            try:
                onnx_proto = mlflow.onnx.load_model(mlflow_model_uri) # onnx.onnx_ml_pb2.ModelProto
                onnx.save(onnx_proto, model_local_path)
                print("Loaded ONNX model from MLflow and saved to disk.")
            except Exception as e:
                print(f"Failed to load model from MLflow: {e}")
                raise
        else:
            print(f"ONNX model already exists at {model_local_path}. Skipping download.")

    def load_torch_model(self, model_local_path: str, mlflow_model_uri: str):
        # Check if model already exists locally, only download if necessary
        if not os.path.isfile(model_local_path):
            try:
                # Download the artifacts associated with the MLflow model version
                local_path = mlflow.artifacts.download_artifacts(mlflow_model_uri)
                # Find .pth or .pt file in the downloaded directory (including subdirectories)
                torch_files = []
                for root, _, files in os.walk(local_path):
                    for file in files:
                        if file.endswith('.pth') or file.endswith('.pt'):
                            torch_files.append(os.path.join(root, file))
                
                if not torch_files:
                    raise FileNotFoundError(f"No .pth or .pt file found in {local_path}")
                
                # Ensure destination directory exists
                directory = os.path.dirname(model_local_path)
                os.makedirs(directory, exist_ok=True)
                
                # Copy the first matching file to the destination
                shutil.copy(torch_files[0], model_local_path)
                print(f"Loaded Torch model from MLflow and saved to {model_local_path}.")
            except Exception as e:
                print(f"Failed to load torch model from MLflow: {e}")
                raise
        else:
            print(f"Torch model already exists at {model_local_path}. Skipping download.")