import logging
from typing import Any

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from curiosity.common.configuration import settings

logger = logging.getLogger(__name__)


class FirebaseService:
    def initialize(self) -> None:
        if not firebase_admin._apps:
            if settings.firebase_credentials_path:
                cred = credentials.Certificate(settings.firebase_credentials_path)
                firebase_admin.initialize_app(cred, options={"projectId": settings.firebase_project_id})
            else:
                firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
            logger.info("Firebase Admin SDK initialized for project '%s'", settings.firebase_project_id)

    def verify_token(self, token: str) -> dict[str, Any]:
        return firebase_auth.verify_id_token(token)  # type: ignore[no-any-return]


firebase_service = FirebaseService()
