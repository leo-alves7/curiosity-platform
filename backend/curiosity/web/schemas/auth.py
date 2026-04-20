from pydantic import BaseModel, ConfigDict


class UserContext(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sub: str
    email: str | None = None
    preferred_username: str | None = None
    roles: list[str] = []
