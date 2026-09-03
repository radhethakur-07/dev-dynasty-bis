from typing import Any, Dict, Literal, Optional
from pydantic import BaseModel, Field


class StandardSearchInput(BaseModel):
    product: str = Field(..., min_length=2, max_length=200, description="Product name or keywords")
    query: Optional[str] = Field(default=None, max_length=500, description="User question or additional context")
    category: Optional[str] = Field(default=None, max_length=100, description="Product category or sector")
    material: Optional[str] = Field(default=None, max_length=100, description="Material composition (e.g., aluminium, stainless steel, plastic)")
    intended_use: Optional[str] = Field(default=None, max_length=200, description="Intended application or user group")
    description: Optional[str] = Field(default=None, max_length=500, description="Detailed product description or specifications")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")


class CertificationGuidanceInput(BaseModel):
    product: str = Field(..., min_length=2, max_length=200, description="Product name or industry")
    scheme: Optional[str] = Field(default=None, max_length=100, description="Optional scheme name like ISI, CRS, FMCS")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")


class SchemeInformationInput(BaseModel):
    scheme_name: str = Field(..., min_length=2, max_length=100, description="BIS scheme name (e.g. ISI, CRS, Hallmarking)")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")


class HallmarkingSearchInput(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="Question regarding gold/silver hallmarking or HUID")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")


class LaboratorySearchInput(BaseModel):
    product_or_test: str = Field(..., min_length=2, max_length=200, description="Product type or specific test required")
    location: Optional[str] = Field(default=None, max_length=100, description="City or State in India")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")


class KnowledgeSearchInput(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="Search query across BIS knowledge base")
    category: Optional[str] = Field(default=None, max_length=100, description="Optional knowledge category filter")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")
