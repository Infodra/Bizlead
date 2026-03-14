"""
Notification model and schema definitions for user notifications.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class NotificationCreate(BaseModel):
    """Create notification request schema"""
    user_id: str
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    notification_type: Literal["offer", "system", "update", "plan", "general"] = "general"
    admin_updated_field: Optional[str] = None

    class Config:
        populate_by_name = True


class NotificationUpdate(BaseModel):
    """Update notification (mark as read)"""
    is_read: Optional[bool] = None

    class Config:
        populate_by_name = True


class NotificationResponse(BaseModel):
    """Notification response schema"""
    id: str = Field(alias="_id")
    user_id: str
    title: str
    message: str
    notification_type: str
    admin_updated_field: Optional[str] = None
    is_read: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        from_attributes = True


class NotificationListResponse(BaseModel):
    """List of notifications response"""
    total: int
    unread_count: int
    notifications: list[NotificationResponse]

    class Config:
        populate_by_name = True
