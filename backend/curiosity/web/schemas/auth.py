from pydantic import BaseModel, ConfigDict


class UserContext(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: str
    email: str | None = None
