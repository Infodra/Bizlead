"""
Contact form endpoints - public and admin routes.

Handles contact message submission, retrieval, and management.
Messages are stored in MongoDB bizlead_messages collection.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List, Optional
import logging
from bson import ObjectId

from app.config.mongodb import get_messages_collection
from app.models.message import (
    ContactMessageCreate,
    ContactMessageResponse,
    ContactMessageUpdate,
    ContactStats,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact-form"])


# ============================================================================
# PUBLIC ENDPOINTS - No Authentication Required
# ============================================================================


@router.post("/messages", response_model=dict, status_code=201)
async def submit_contact_message(message_data: ContactMessageCreate):
    """
    Submit a contact form message (PUBLIC - No authentication required).

    Anyone can submit a message from the contact form.

    Args:
        message_data: Contact message with name, email, phone, product, message

    Returns:
        dict: Success confirmation with message ID

    Raises:
        HTTPException 500: If database save fails

    Example:
        POST /api/v1/contact/messages
        {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "product": "Email Finder",
            "message": "I'd like to know more about your service."
        }

        Response:
        {
            "status": "success",
            "message_id": "507f1f77bcf86cd799439011",
            "received_at": "2026-02-13T10:30:00"
        }
    """
    try:
        logger.info(f"📨 Receiving contact message from {message_data.email}...")
        
        messages_collection = await get_messages_collection()
        logger.info(f"✓ MongoDB collection connected: {messages_collection.name}")

        # Create message document
        message_doc = {
            "name": message_data.name,
            "email": message_data.email,
            "phone": message_data.phone,
            "product": message_data.product or "General Inquiry",
            "message": message_data.message,
            "status": "new",
            "archived": False,
            "admin_notes": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        logger.info(f"📝 Message document prepared: {message_doc}")

        # Insert into database
        result = await messages_collection.insert_one(message_doc)
        
        logger.info(f"✅ Contact message saved successfully to MongoDB - ID: {result.inserted_id}")

        return {
            "status": "success",
            "message_id": str(result.inserted_id),
            "received_at": message_doc["created_at"].isoformat(),
            "message": "Thank you for reaching out! We'll get back to you within 24 hours.",
        }

    except Exception as e:
        logger.error(f"❌ Error saving contact message: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save message: {str(e)}",
        )


@router.get("/messages/{message_id}", response_model=dict)
async def get_message_confirmation(message_id: str):
    """
    Get message details by ID (PUBLIC - check message status).

    Allows users to check if their message was received.

    Args:
        message_id: MongoDB ObjectId as string

    Returns:
        ContactMessageResponse: Message details

    Raises:
        HTTPException 404: If message not found

    Example:
        GET /api/v1/contact/messages/507f1f77bcf86cd799439011

        Response:
        {
            "id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "john@example.com",
            "status": "new",
            "created_at": "2026-02-13T10:30:00"
        }
    """
    try:
        if not ObjectId.is_valid(message_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message ID format",
            )

        messages_collection = await get_messages_collection()
        message = await messages_collection.find_one({"_id": ObjectId(message_id)})

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found",
            )

        return {
            "id": str(message["_id"]),
            "status": message.get("status", "new"),
            "received_at": message.get("created_at").isoformat(),
            "message": "We've received your message and will respond soon.",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve message",
        )


# ============================================================================
# ADMIN ENDPOINTS - Authenticated Admin Only (To be protected with auth later)
# ============================================================================


@router.get("/admin/messages", response_model=dict)
async def list_messages(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    search_email: Optional[str] = None,
):
    """
    List all contact messages (ADMIN ONLY).

    Retrieve messages with optional filtering by status and email.

    Query Parameters:
        skip: Number of messages to skip (pagination)
        limit: Number of messages to return (max 100)
        status_filter: Filter by status (new, read, replied, archived)
        search_email: Search by email address

    Returns:
        dict: List of messages with pagination info

    Example:
        GET /api/v1/contact/admin/messages?status_filter=new&limit=20

        Response:
        {
            "messages": [...],
            "total": 150,
            "skip": 0,
            "limit": 20,
            "status": "success"
        }
    """
    try:
        limit = min(limit, 100)  # Cap at 100
        messages_collection = await get_messages_collection()

        # Build filter
        query_filter = {}
        if status_filter:
            query_filter["status"] = status_filter
        if search_email:
            query_filter["email"] = {"$regex": search_email, "$options": "i"}  # Case-insensitive

        # Get total count
        total = await messages_collection.count_documents(query_filter)

        # Get paginated messages
        messages = [
            {
                "id": str(msg["_id"]),
                "name": msg["name"],
                "email": msg["email"],
                "phone": msg["phone"],
                "product": msg.get("product", ""),
                "message": msg["message"][:100] + "..." if len(msg["message"]) > 100 else msg["message"],
                "status": msg.get("status", "new"),
                "archived": msg.get("archived", False),
                "created_at": msg["created_at"].isoformat(),
            }
            for msg in await messages_collection.find(query_filter)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
            .to_list(None)
        ]

        return {
            "status": "success",
            "messages": messages,
            "total": total,
            "skip": skip,
            "limit": limit,
            "page": (skip // limit) + 1,
        }

    except Exception as e:
        logger.error(f"❌ Error listing messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages",
        )


@router.get("/admin/messages/{message_id}", response_model=dict)
async def get_message_details(message_id: str):
    """
    Get full message details (ADMIN ONLY).

    Retrieve complete message information including admin notes.

    Args:
        message_id: MongoDB ObjectId as string

    Returns:
        dict: Complete message details

    Example:
        GET /api/v1/contact/admin/messages/507f1f77bcf86cd799439011
    """
    try:
        if not ObjectId.is_valid(message_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message ID format",
            )

        messages_collection = await get_messages_collection()
        message = await messages_collection.find_one({"_id": ObjectId(message_id)})

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found",
            )

        return {
            "id": str(message["_id"]),
            "name": message["name"],
            "email": message["email"],
            "phone": message["phone"],
            "product": message.get("product", ""),
            "message": message["message"],
            "status": message.get("status", "new"),
            "archived": message.get("archived", False),
            "admin_notes": message.get("admin_notes"),
            "created_at": message["created_at"].isoformat(),
            "updated_at": message["updated_at"].isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve message",
        )


@router.patch("/admin/messages/{message_id}", response_model=dict)
async def update_message(message_id: str, update_data: ContactMessageUpdate):
    """
    Update message status and notes (ADMIN ONLY).

    Allows admin to mark as read, replied, or archived, and add notes.

    Args:
        message_id: MongoDB ObjectId as string
        update_data: Fields to update (status, admin_notes, archived)

    Returns:
        dict: Updated message confirmation

    Example:
        PATCH /api/v1/contact/admin/messages/507f1f77bcf86cd799439011
        {
            "status": "replied",
            "admin_notes": "Email sent to customer"
        }
    """
    try:
        if not ObjectId.is_valid(message_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message ID format",
            )

        messages_collection = await get_messages_collection()

        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.status:
            update_doc["status"] = update_data.status
        if update_data.admin_notes is not None:
            update_doc["admin_notes"] = update_data.admin_notes
        if update_data.archived is not None:
            update_doc["archived"] = update_data.archived

        # Update document
        result = await messages_collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": update_doc},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found",
            )

        logger.info(f"✓ Message updated: {message_id}")

        return {
            "status": "success",
            "message_id": message_id,
            "updated_at": update_doc["updated_at"].isoformat(),
            "message": "Message updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update message",
        )


@router.get("/admin/statistics", response_model=dict)
async def get_contact_statistics():
    """
    Get contact form statistics (ADMIN ONLY).

    Returns aggregate statistics about messages.

    Returns:
        ContactStats: Statistics including counts by status

    Example:
        GET /api/v1/contact/admin/statistics

        Response:
        {
            "total_messages": 150,
            "new_messages": 15,
            "read_messages": 45,
            "replied_messages": 85,
            "archived_messages": 5
        }
    """
    try:
        messages_collection = await get_messages_collection()

        # Aggregate statistics
        stats_pipeline = [
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "new": [{"$match": {"status": "new"}}, {"$count": "count"}],
                    "read": [{"$match": {"status": "read"}}, {"$count": "count"}],
                    "replied": [{"$match": {"status": "replied"}}, {"$count": "count"}],
                    "archived": [{"$match": {"archived": True}}, {"$count": "count"}],
                }
            }
        ]

        result = await messages_collection.aggregate(stats_pipeline).to_list(None)
        stats = result[0] if result else {}

        return {
            "status": "success",
            "total_messages": stats.get("total", [{"count": 0}])[0]["count"],
            "new_messages": stats.get("new", [{"count": 0}])[0]["count"],
            "read_messages": stats.get("read", [{"count": 0}])[0]["count"],
            "replied_messages": stats.get("replied", [{"count": 0}])[0]["count"],
            "archived_messages": stats.get("archived", [{"count": 0}])[0]["count"],
        }

    except Exception as e:
        logger.error(f"❌ Error calculating statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics",
        )
