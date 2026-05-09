import logging
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from curiosity.common.configuration import settings

logger = logging.getLogger(__name__)


class FirebaseService:
    def initialize(self) -> None:
        if not firebase_admin._apps:
            cred_path = settings.firebase_credentials_path
            if cred_path:
                if not Path(cred_path).is_file():
                    raise FileNotFoundError(
                        f"FIREBASE_CREDENTIALS_PATH is set to '{cred_path}' but no file exists there. "
                        "Set it to a valid Firebase service-account JSON path in backend/.env, or leave it "
                        "empty to use Application Default Credentials."
                    )
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, options={"projectId": settings.firebase_project_id})
            else:
                firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
            logger.info("Firebase Admin SDK initialized for project '%s'", settings.firebase_project_id)

    def verify_token(self, token: str) -> dict[str, Any]:
        return firebase_auth.verify_id_token(token)  # type: ignore[no-any-return]


firebase_service = FirebaseService()
