"""
Admin routes for managing and viewing MongoDB databases.
"""

from fastapi import APIRouter, HTTPException
from bson import ObjectId
import logging
from datetime import datetime
from app.config.mongodb import get_mongodb_client

logger = logging.getLogger(__name__)

router = APIRouter()


def serialize_document(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    
    if isinstance(doc, dict):
        serialized = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                serialized[key] = str(value)
            elif isinstance(value, datetime):
                serialized[key] = value.isoformat()
            elif isinstance(value, dict):
                serialized[key] = serialize_document(value)
            elif isinstance(value, list):
                serialized[key] = [serialize_document(item) if isinstance(item, (dict, ObjectId, datetime)) else item for item in value]
            else:
                serialized[key] = value
        return serialized
    elif isinstance(doc, list):
        return [serialize_document(item) for item in doc]
    else:
        return doc


@router.get("/databases")
async def get_databases():
    """
    Get all available databases and their collections with document counts.
    """
    try:
        client = get_mongodb_client()
        
        # List all databases
        admin_db = client.admin
        databases_list = await admin_db.command("listDatabases")
        
        databases_info = []
        
        # Filter and get info for each database
        for db_info in databases_list.get("databases", []):
            db_name = db_info.get("name")
            
            # Skip system databases
            if db_name.startswith("admin") or db_name.startswith("config") or db_name.startswith("local"):
                continue
            
            try:
                database = client[db_name]
                collections_list = await database.list_collection_names()
                
                collections = []
                for collection_name in collections_list:
                    try:
                        collection = database[collection_name]
                        count = await collection.count_documents({})
                        collections.append({
                            "name": collection_name,
                            "count": count
                        })
                    except Exception as e:
                        logger.warning(f"Error getting collection {collection_name}: {str(e)}")
                        collections.append({
                            "name": collection_name,
                            "count": 0
                        })
                
                databases_info.append({
                    "name": db_name,
                    "collections": sorted(collections, key=lambda x: x["name"])
                })
                
            except Exception as e:
                logger.warning(f"Error accessing database {db_name}: {str(e)}")
                databases_info.append({
                    "name": db_name,
                    "collections": []
                })
        
        return {
            "status": "success",
            "databases": sorted(databases_info, key=lambda x: x["name"])
        }
    
    except Exception as e:
        logger.error(f"Error getting databases: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/database/{db_name}/collections")
async def get_database_collections(db_name: str):
    """
    Get all collections in a specific database.
    """
    try:
        client = get_mongodb_client()
        database = client[db_name]
        
        collections_list = await database.list_collection_names()
        
        collections = []
        for collection_name in collections_list:
            try:
                collection = database[collection_name]
                count = await collection.count_documents({})
                
                # Get sample document for field information
                sample = await collection.find_one({})
                fields = list(sample.keys()) if sample else []
                
                collections.append({
                    "name": collection_name,
                    "count": count,
                    "fields": fields
                })
            except Exception as e:
                logger.warning(f"Error getting collection {collection_name}: {str(e)}")
                collections.append({
                    "name": collection_name,
                    "count": 0,
                    "fields": []
                })
        
        return {
            "status": "success",
            "database": db_name,
            "collections": sorted(collections, key=lambda x: x["name"])
        }
    
    except Exception as e:
        logger.error(f"Error getting collections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/database/{db_name}/collection/{collection_name}")
async def get_collection_data(db_name: str, collection_name: str, skip: int = 0, limit: int = 50):
    """
    Get paginated data from a specific collection.
    """
    try:
        client = get_mongodb_client()
        database = client[db_name]
        collection = database[collection_name]
        
        # Get total count
        total_count = await collection.count_documents({})
        
        # Get documents with pagination
        documents = []
        async for doc in collection.find({}).skip(skip).limit(limit):
            documents.append(serialize_document(doc))
        
        return {
            "status": "success",
            "database": db_name,
            "collection": collection_name,
            "total_count": total_count,
            "returned_count": len(documents),
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count,
            "data": documents
        }
    
    except Exception as e:
        logger.error(f"Error getting collection data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/database/{db_name}/collection/{collection_name}/stats")
async def get_collection_stats(db_name: str, collection_name: str):
    """
    Get statistics for a collection.
    """
    try:
        client = get_mongodb_client()
        database = client[db_name]
        collection = database[collection_name]
        
        # Get count
        total_count = await collection.count_documents({})
        
        # Get sample documents to analyze structure
        sample_docs = []
        async for doc in collection.find({}).limit(5):
            sample_docs.append(serialize_document(doc))
        
        # Get field information
        fields = set()
        for doc in sample_docs:
            fields.update(doc.keys() if isinstance(doc, dict) else [])
        
        return {
            "status": "success",
            "database": db_name,
            "collection": collection_name,
            "total_documents": total_count,
            "fields": sorted(list(fields)),
            "sample_documents": sample_docs
        }
    
    except Exception as e:
        logger.error(f"Error getting collection stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
