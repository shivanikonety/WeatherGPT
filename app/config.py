from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    app_name: str = "WeatherGPT"
    app_version: str = "2.0.0"
    environment: str = "production"

    host: str = "0.0.0.0"
    port: int = 8000
    allowed_origins: str = "*"

    open_meteo_forecast_url: str = "https://api.open-meteo.com/v1/forecast"
    open_meteo_geocoding_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    open_meteo_air_quality_url: str = "https://air-quality-api.open-meteo.com/v1/air-quality"

    redis_url: str = "redis://localhost:6379"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_fallback_models: list[str] = [
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "llama-3.3-70b-versatile"
    ]

    weather_cache_ttl_seconds: int = 300
    geocode_cache_ttl_seconds: int = 86400

    default_city: str = "Hyderabad"
    default_latitude: float = 17.3850
    default_longitude: float = 78.4867

    def get_allowed_origins(self) -> list[str]:
        if not self.allowed_origins or self.allowed_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()