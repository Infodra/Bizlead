#!/usr/bin/env python3
"""
Direct MongoDB query to check if fake user exists in ANY database.
"""
import pymongo
import os

# Try various MongoDB URIs and databases
test_configs = [
    ("mongodb://localhost:27017", "bizlead_db"),
    ("mongodb://localhost:27017", "test_db"),  
    ("mongodb://localhost:27017", "local"),
    ("mongodb://localhost:27017", ""),  # Default
]

for uri, db_name in test_configs:
    try:
        client = pymongo.MongoClient(uri)
        print(f"\n=== Testing {uri}/{db_name} ===")
        
        if db_name:
            db = client[db_name]
            db_list = [db_name]
        else:
            db_list = client.list_database_names()
        
        for database_name in db_list[:5]:  # Check first 5 databases
            db = client[database_name]
            
            # Check all collections in this database for the fake user
            if "bizlead_users" in db.list_collection_names() or "users" in db.list_collection_names():
                for coll_name in ["bizlead_users", "users"]:
                    if coll_name in db.list_collection_names():
                        user = db[coll_name].find_one({"_id": "69a2d79041ac436ecc7c7442"})
                        if user:
                            print(f"FOUND phantom user in {database_name}.{coll_name}!")
                            print(f"  {user}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")
