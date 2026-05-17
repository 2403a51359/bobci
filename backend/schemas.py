from pydantic import BaseModel, Field, field_validator


class RepositoryCreate(BaseModel):
    owner: str = Field(..., min_length=1, max_length=100)
    repo: str = Field(..., min_length=1, max_length=100)
    github_token: str = Field(..., min_length=10, max_length=512)
    webhook_secret: str = Field(..., min_length=8, max_length=256)

    @field_validator("owner", "repo")
    @classmethod
    def validate_github_slug(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Invalid GitHub owner/repo name")
        return cleaned
