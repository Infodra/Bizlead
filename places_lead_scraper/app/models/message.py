"""
Contact form message models.

Handles MongoDB document schema for contact messages.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class ContactMessageCreate(BaseModel):
    """Request model for creating a contact message."""
    name: str = Field(..., min_length=1, max_length=100, description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's email address")
    phone: str = Field(..., min_length=5, max_length=20, description="Sender's phone number")
    product: Optional[str] = Field(default="", max_length=100, description="Product/service inquiry")
    message: str = Field(..., min_length=1, max_length=5000, description="Message content")


class ContactMessageResponse(BaseModel):
    """Response model for a contact message"""
    id: str = Field(..., alias="_id", description="MongoDB document ID")
    name: str
    email: str
    phone: str
    product: Optional[str] = None
    message: str
    status: str = Field(default="new", description="Message status: new, read, replied, archived")
    created_at: datetime
    updated_at: datetime
    archived: bool = Field(default=False, description="Whether message is archived")
    admin_notes: Optional[str] = Field(default=None, description="Internal admin notes")

    class Config:
        populate_by_name = True


class ContactMessageUpdate(BaseModel):
    """Model for updating contact message (admin only)"""
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    archived: Optional[bool] = None


class ContactStats(BaseModel):
    """Model for contact statistics"""
    total_messages: int
    new_messages: int
    read_messages: int
    replied_messages: int
    archived_messages: int
