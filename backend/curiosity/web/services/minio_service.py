import asyncio
import io
import logging

from minio import Minio

from curiosity.common.configuration import settings

logger = logging.getLogger(__name__)


class MinioService:
    def __init__(self) -> None:
        self._client: Minio | None = None

    @property
    def client(self) -> Minio:
        if self._client is None:
            self._client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=False,
            )
        return self._client

    async def upload_file(self, file_content: bytes, bucket: str, object_name: str) -> str:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: self.client.put_object(
                bucket,
                object_name,
                io.BytesIO(file_content),
                length=len(file_content),
            ),
        )
        return f"{settings.minio_url_base}/{object_name}"


minio_service = MinioService()
