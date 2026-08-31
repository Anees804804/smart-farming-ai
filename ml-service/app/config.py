from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    hf_model_name: str = ""
    max_image_size_mb: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
