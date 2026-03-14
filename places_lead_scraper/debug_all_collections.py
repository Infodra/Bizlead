#!/usr/bin/env python3
"""Debug: List all collections and check various email queries."""
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = pymongo.MongoClient(mongo_uri)
db = client["bizlead_db"]

# List all collections
print("=== ALL COLLECTIONS ===")
collections = db.list_collection_names()
for coll in collections:
    count = db[coll].count_documents({})
    print(f" {coll}: {count} documents")

# Check for any collection with user-like names
print("\n=== CHECKING ALL USERS COLLECTIONS ===")
for coll_name in collections:
    if 'user' in coll_name.lower() or 'account' in coll_name.lower():
        print(f"\n--- Collection: {coll_name} ---")
        users = list(db[coll_name].find({"email": {"$regex": "devaraj", "$options": "i"}}))
        print(f"Found {len(users)} users with 'devaraj'")
        for u in users:
            print(f"  {u['_id']}: {u.get('email', 'NO EMAIL')}")

# Direct query for that user ID
user_id = "69a2d79041ac436ecc7c7442"
print(f"\n=== SEARCHING FOR USER ID {user_id} ===")
for coll_name in collections:
    try:
        from bson import ObjectId
        # Try as ObjectId
        try:
            doc = db[coll_name].find_one({"_id": ObjectId(user_id)})
            if doc:
                print(f"Found in {coll_name}: {doc.get('email', 'NO EMAIL')}")
        except:
            pass
        # Try as string
        doc = db[coll_name].find_one({"_id": user_id})
        if doc:
            print(f"Found (string _id) in {coll_name}: {doc.get('email', 'NO EMAIL')}")
    except:
        pass

client.close()
