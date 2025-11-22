from __future__ import annotations

import os
from typing import Optional
from io import BytesIO
from minio import Minio
from minio.error import S3Error

class MinIOClient:
    """
    Client wrapper for MinIO object storage.
    Used to retrieve images stored in MinIO buckets.
    """

    def __init__(
        self,
        endpoint: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        secure: bool = False,
        bucket_name: str = "images",
    ):
        """
        Initialize MinIO client.

        Args:
            endpoint: MinIO server endpoint (default: from env or http://minio:9000)
            access_key: Access key (default: from env or minioadmin)
            secret_key: Secret key (default: from env or minioadmin)
            secure: Use HTTPS (default: False)
            bucket_name: Default bucket name for images
        """

        self.endpoint = endpoint or os.getenv("MINIO_URL")
        self.access_key = access_key or os.getenv("MINIO_ACCESS_KEY")
        self.secret_key = secret_key or os.getenv("MINIO_SECRET_KEY")
        self.secure = secure
        self.bucket_name = bucket_name

        # Remove http:// or https:// prefix if present
        if self.endpoint.startswith("http://"):
            self.endpoint = self.endpoint[7:]
            self.secure = False
        elif self.endpoint.startswith("https://"):
            self.endpoint = self.endpoint[8:]
            self.secure = True

        self.client = Minio(
            self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure,
        )

        # Ensure bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self) -> None:
        """Create bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error as e:
            raise RuntimeError(f"Failed to create/access MinIO bucket: {e}") from e

    def get_image(
        self, 
        file_name: str, 
        bucket_name: str
    ) -> BytesIO:
        """
        Retrieve image from MinIO and return as file-like object.

        Args:
            file_name: The object key/path in MinIO
            bucket_name: Optional bucket name (defaults to instance bucket_name)

        Returns:
            BytesIO object containing image data
        """
        try:
            response = self.client.get_object(bucket_name, file_name)
            image_bytes = response.read()
            response.close()
            response.release_conn()
            return BytesIO(image_bytes)
        except S3Error as e:
            raise RuntimeError(
                f"Failed to retrieve image '{file_name}' from MinIO: {e}"
            ) from e

    def upload_image(
        self,
        image_bytes: bytes,
        image_id: str,
        content_type: str = "image/jpeg",
        bucket_name: Optional[str] = None,
    ) -> None:
        """
        Upload image to MinIO.

        Args:
            image_bytes: Image data as bytes
            image_id: Object key/path in MinIO
            content_type: MIME type of the image
            bucket_name: Optional bucket name (defaults to instance bucket_name)

        Raises:
            RuntimeError: If upload fails
        """
        try:
            self.client.put_object(
                bucket_name,
                image_id,
                BytesIO(image_bytes),
                length=len(image_bytes),
                content_type=content_type,
            )
        except S3Error as e:
            raise RuntimeError(
                f"Failed to upload image '{image_id}' to MinIO: {e}"
            ) from e


minio_client = MinIOClient()