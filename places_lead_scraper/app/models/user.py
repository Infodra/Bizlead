"""
User model and schema definitions.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


# Type alias for ObjectId fields in Pydantic v2
PyObjectId = str


class UserBase(BaseModel):
    """Base user schema with common fields"""
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company_name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    gstin: Optional[str] = Field(None, max_length=15, description="GST Identification Number (optional)")

    class Config:
        populate_by_name = True


class UserRegister(UserBase):
    """User registration request schema"""
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    terms_accepted: bool = Field(..., description="Must accept terms to register")

    class Config:
        populate_by_name = True


class UserLogin(BaseModel):
    """User login request schema"""
    email: EmailStr
    password: str = Field(..., min_length=1)

    class Config:
        populate_by_name = True


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    company_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    gstin: Optional[str] = Field(None, max_length=15)

    class Config:
        populate_by_name = True


class UserInDB(BaseModel):
    """User document as stored in MongoDB"""
    id: Optional[PyObjectId] = Field(None, alias="_id")
    full_name: str
    email: str
    password_hash: str
    company_name: str
    phone: str
    gstin: Optional[str] = None
    role: str = "user"
    is_active: bool = True
    current_subscription_id: Optional[PyObjectId] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserResponse(BaseModel):
    """User response schema (no password)"""
    id: Optional[PyObjectId] = Field(None, alias="_id")
    full_name: str
    email: str
    company_name: str
    phone: str
    gstin: Optional[str] = None
    role: str
    is_active: bool
    current_subscription_id: Optional[PyObjectId] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserWithToken(BaseModel):
    """User response with authentication tokens"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    subscription_status: str
    trial_end_date: Optional[datetime] = None
    leads_limit: int

    class Config:
        arbitrary_types_allowed = True
