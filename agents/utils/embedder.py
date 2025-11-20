import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
import numpy as np
from typing import List
from transformers import AutoTokenizer
import onnxruntime as ort
from mlflow_client import MLFlow
import os

class Embedder:
    """
    Embeds text using ONNX runtime with intfloat/multilingual-e5-small.
    Loads ONNX model and tokenizer once in __init__.
    """
    def __init__(
        self,
        model_name: str = "intfloat/multilingual-e5-small",
        local_model_path: str = "../checkpoints/onnx/model.onnx"
    ):
        self.model_name = model_name
        self.local_model_path = local_model_path
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.mlflow_model_uri = os.environ.get("EMBEDDER_MLFLOW_URI") # "models:/intfloat_multilingual-e5-small_onnx_model/1"

        self.mlflow_client = MLFlow()
        self.mlflow_client.load_onnx_model(self.local_model_path, self.mlflow_model_uri)
        self.session = ort.InferenceSession(self.local_model_path)
    
    @staticmethod
    def mean_pooling(last_hidden_state, attention_mask) -> np.ndarray:
        """
        Applies mean pooling to the token embeddings to get a single sentence embedding using NumPy only.
        last_hidden_state: np.ndarray of shape (batch, seq_len, hidden_size)
        attention_mask: np.ndarray of shape (batch, seq_len)
        Returns: np.ndarray of shape (batch, hidden_size)
        """
        attention_mask_expanded = np.expand_dims(attention_mask, axis=-1)  # (batch, seq_len, 1)
        input_mask_expanded = attention_mask_expanded.astype(np.float32)
        sum_embeddings = np.sum(last_hidden_state * input_mask_expanded, axis=1)  # (batch, hidden_size)
        sum_mask = np.clip(np.sum(input_mask_expanded, axis=1), a_min=1e-9, a_max=None)  # (batch, 1)
        return sum_embeddings / sum_mask

    @staticmethod
    def l2_normalize(x, axis=1, eps=1e-12):
        norm = np.linalg.norm(x, ord=2, axis=axis, keepdims=True)
        return x / np.clip(norm, eps, None)

    def embed(self, texts: List[str]) -> np.ndarray:
        encoded_input = self.tokenizer(
            texts, padding=True, truncation=True, return_tensors="np"
        )
        input_ids = encoded_input["input_ids"]
        attention_mask = encoded_input["attention_mask"]

        inputs_for_onnx = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "token_type_ids": np.zeros_like(input_ids, dtype=np.int64)
        }
        onnx_outputs = self.session.run(None, inputs_for_onnx)
        last_hidden_state = onnx_outputs[0]  # (batch, seq_len, hidden_size)

        # Pooling and normalization
        embeddings = self.mean_pooling(last_hidden_state, attention_mask)
        embeddings = self.l2_normalize(embeddings, axis=1)
        return embeddings