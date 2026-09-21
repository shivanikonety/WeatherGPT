from typing import Optional, List
from pydantic import BaseModel, Field


class LocationQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    name: Optional[str] = None
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")


class ForecastQuery(LocationQuery):
    days: int = Field(default=7, ge=1, le=16)


class GeocodeQuery(BaseModel):
    name: str = Field(..., min_length=1)
    language: Optional[str] = Field(default="en-IN")


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatQuery(BaseModel):
    message: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    days: int = Field(default=3, ge=1, le=16)
    location_name: Optional[str] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")


class NaturalSearchQuery(BaseModel):
    query: str = Field(..., min_length=1)
    language: Optional[str] = Field(default="en-IN")


class ImpactQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = None
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")


class TimelineQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    days: int = Field(default=2, ge=1, le=7)
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")


class ComparisonLocation(BaseModel):
    name: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ComparisonQuery(BaseModel):
    mode: str = Field(default="days", pattern="^(days|locations)$")
    # For days comparison:
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    location_name: Optional[str] = None
    day1_offset: int = Field(default=0, ge=0, le=14)  # 0 = today
    day2_offset: int = Field(default=1, ge=0, le=14)  # 1 = tomorrow
    # For dual locations comparison:
    location1: Optional[ComparisonLocation] = None
    location2: Optional[ComparisonLocation] = None
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")


class ExplainQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = None
    units: Optional[str] = Field(default="metric", pattern="^(metric|imperial)$")
    language: Optional[str] = Field(default="en-IN")