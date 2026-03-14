"""
MongoDB database connection and setup.

Handles MongoDB connection for user and subscription collections.
Uses motor for async operations with FastAPI.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Global MongoDB client and database instances
mongodb_client: Optional[AsyncIOMotorClient] = None
mongodb: Optional[object] = None  # Motor AsyncDatabase


async def connect_to_mongodb():
    """
    Connect to MongoDB.
    
    Call this during FastAPI startup.
    
    Example in lifespan:
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            await connect_to_mongodb()
            yield
            await close_mongodb()
    """
    global mongodb_client, mongodb
    
    try:
        # Get MongoDB URL from settings or environment
        mongodb_url = settings.MONGODB_URL or "mongodb://localhost:27017"
        
        # Create client with server selection timeout
        mongodb_client = AsyncIOMotorClient(
            mongodb_url,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000
        )
        
        # Test connection with timeout
        try:
            await mongodb_client.admin.command('ping')
        except Exception as ping_error:
            logger.warning(f"⚠️  MongoDB ping failed: {str(ping_error)}")
            # Continue anyway, connection might work for operations
        
        # Get database
        mongodb = mongodb_client[settings.MONGODB_DB_NAME or "bizlead_db"]
        
        logger.info("✓ Connected to MongoDB successfully")
        
        # Create collections if they don't exist
        await create_collections()
        
        # Create indexes for performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
        # Don't raise - allow app to start without MongoDB


async def close_mongodb():
    """
    Close MongoDB connection.
    
    Call this during FastAPI shutdown.
    """
    global mongodb_client
    
    if mongodb_client:
        mongodb_client.close()
        logger.info("✓ MongoDB connection closed")


async def create_collections():
    """Create required collections if they don't exist"""
    global mongodb
    
    if mongodb is None:
        return
    
    try:
        # Check and create bizlead_users collection
        if "bizlead_users" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_users")
            logger.info("✓ Created 'bizlead_users' collection")
        
        # Check and create bizlead_subscriptions collection
        if "bizlead_subscriptions" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_subscriptions")
            logger.info("✓ Created 'bizlead_subscriptions' collection")
        
        # Check and create bizlead_messages collection
        if "bizlead_messages" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_messages")
            logger.info("✓ Created 'bizlead_messages' collection")
        
        # Check and create bizlead_notifications collection
        if "bizlead_notifications" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_notifications")
            logger.info("✓ Created 'bizlead_notifications' collection")
        
        # Check and create bizlead_crm_leads collection (permanent CRM storage)
        if "bizlead_crm_leads" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_crm_leads")
            logger.info("✓ Created 'bizlead_crm_leads' collection")
        
        # Check and create bizlead_search_results collection (30-day auto-delete)
        if "bizlead_search_results" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_search_results")
            logger.info("✓ Created 'bizlead_search_results' collection")
        
        # Check and create bizlead_database_leads collection (30-day auto-delete for temporary storage)
        if "bizlead_database_leads" not in await mongodb.list_collection_names():
            await mongodb.create_collection("bizlead_database_leads")
            logger.info("✓ Created 'bizlead_database_leads' collection")
            
    except Exception as e:
        logger.error(f"Error creating collections: {str(e)}")


async def create_indexes():
    """Create indexes for better query performance"""
    global mongodb
    
    if mongodb is None:
        return
    
    try:
        users_collection = mongodb["bizlead_users"]
        subscriptions_collection = mongodb["bizlead_subscriptions"]
        messages_collection = mongodb["bizlead_messages"]
        notifications_collection = mongodb["bizlead_notifications"]
        crm_leads_collection = mongodb["bizlead_crm_leads"]
        search_results_collection = mongodb["bizlead_search_results"]
        
        # Users indexes
        await users_collection.create_index("email", unique=True)
        logger.info("✓ Created unique index on users.email")
        
        await users_collection.create_index("created_at")
        logger.info("✓ Created index on users.created_at")
        
        # Subscriptions indexes
        await subscriptions_collection.create_index("user_id")
        logger.info("✓ Created index on subscriptions.user_id")
        
        await subscriptions_collection.create_index("status")
        logger.info("✓ Created index on subscriptions.status")
        
        await subscriptions_collection.create_index("trial_end_date")
        logger.info("✓ Created index on subscriptions.trial_end_date")
        
        # Messages indexes
        await messages_collection.create_index("email")
        logger.info("✓ Created index on messages.email")
        
        await messages_collection.create_index("status")
        logger.info("✓ Created index on messages.status")
        
        await messages_collection.create_index([("created_at", -1)])  # Descending for latest-first queries
        logger.info("✓ Created index on messages.created_at")
        
        # Notifications indexes
        await notifications_collection.create_index("user_id")
        logger.info("✓ Created index on notifications.user_id")
        
        await notifications_collection.create_index("is_read")
        logger.info("✓ Created index on notifications.is_read")
        
        await notifications_collection.create_index([("created_at", -1)])  # Descending for latest-first queries
        logger.info("✓ Created index on notifications.created_at")
        
        await notifications_collection.create_index([("user_id", 1), ("is_read", 1)])
        logger.info("✓ Created compound index on notifications (user_id, is_read)")
        
        # CRM Leads indexes
        await crm_leads_collection.create_index("user_id")
        logger.info("✓ Created index on crm_leads.user_id")
        
        await crm_leads_collection.create_index("status")
        logger.info("✓ Created index on crm_leads.status")
        
        await crm_leads_collection.create_index([("saved_at", -1)])
        logger.info("✓ Created index on crm_leads.saved_at")
        
        await crm_leads_collection.create_index("tags")
        logger.info("✓ Created index on crm_leads.tags")
        
        await crm_leads_collection.create_index([("user_id", 1), ("status", 1)])
        logger.info("✓ Created compound index on crm_leads (user_id, status)")
        
        # Search Results indexes with 30-day TTL
        await search_results_collection.create_index("user_id")
        logger.info("✓ Created index on search_results.user_id")
        
        await search_results_collection.create_index([("created_at", -1)])
        logger.info("✓ Created index on search_results.created_at")
        
        # 30-day TTL index: data auto-deletes after 2,592,000 seconds (30 days)
        await search_results_collection.create_index(
            [("created_at", 1)],
            expireAfterSeconds=2592000
        )
        logger.info("✓ Created TTL index on search_results.created_at (30 days)")
        
        # Database Leads indexes with 30-day TTL (temporary storage)
        database_leads_collection = mongodb["bizlead_database_leads"]
        await database_leads_collection.create_index("user_id")
        logger.info("✓ Created index on database_leads.user_id")
        
        await database_leads_collection.create_index([("created_at", -1)])
        logger.info("✓ Created index on database_leads.created_at")
        
        # 30-day TTL index for auto-deletion
        await database_leads_collection.create_index(
            [("expires_at", 1)],
            expireAfterSeconds=0
        )
        logger.info("✓ Created TTL index on database_leads.expires_at (30 days)")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")


def get_mongodb():
    """
    Get MongoDB database instance.
    
    Returns:
        MongoDB database instance
        
    Raises:
        RuntimeError: If MongoDB is not connected
    """
    if mongodb is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongodb() first.")
    return mongodb


def get_mongodb_client():
    """
    Get MongoDB client instance.
    
    Returns:
        MongoDB client instance
        
    Raises:
        RuntimeError: If MongoDB is not connected
    """
    if mongodb_client is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongodb() first.")
    return mongodb_client


async def get_users_collection():
    """Get bizlead_users collection"""
    db = get_mongodb()
    return db["bizlead_users"]


async def get_subscriptions_collection():
    """Get bizlead_subscriptions collection"""
    db = get_mongodb()
    return db["bizlead_subscriptions"]


async def get_messages_collection():
    """Get bizlead_messages collection"""
    db = get_mongodb()
    return db["bizlead_messages"]


async def get_notifications_collection():
    """Get bizlead_notifications collection"""
    db = get_mongodb()
    return db["bizlead_notifications"]


async def get_crm_leads_collection():
    """Get bizlead_crm_leads collection (permanent CRM storage)"""
    db = get_mongodb()
    return db["bizlead_crm_leads"]


async def get_search_results_collection():
    """Get bizlead_search_results collection (30-day auto-delete)"""
    db = get_mongodb()
    return db["bizlead_search_results"]


async def get_database_leads_collection():
    """Get bizlead_database_leads collection (30-day temporary storage)"""
    db = get_mongodb()
    return db["bizlead_database_leads"]
