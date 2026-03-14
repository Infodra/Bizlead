"""
CRM Lead models for saving and managing leads.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CRMLeadCreate(BaseModel):
    """Model for creating/saving a new lead to CRM"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    source_query: Optional[str] = None  # What search query found this lead
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class CRMLeadUpdate(BaseModel):
    """Model for updating a CRM lead"""
    status: Optional[str] = None  # new/contacted/converted/qualified/rejected
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class CRMLeadResponse(BaseModel):
    """Model for returning a CRM lead"""
    id: str = Field(alias="_id")
    user_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    source_query: Optional[str] = None
    status: str  # new/contacted/converted/qualified/rejected
    tags: List[str]
    notes: Optional[str] = None
    saved_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class CRMLeadListResponse(BaseModel):
    """Model for returning a list of CRM leads"""
    total: int
    limit: int
    skip: int
    leads: List[CRMLeadResponse]


class SearchLeadSave(BaseModel):
    """Model for saving a lead from search results"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    source_query: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
