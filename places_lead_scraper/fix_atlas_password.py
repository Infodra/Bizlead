#!/usr/bin/env python3
"""Connect to MongoDB Atlas and fix the user password."""
import pymongo
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

# Get MongoDB Atlas URL
mongo_uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
print(f"Connecting to: {mongo_uri[:50]}...")

try:
    client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
    
    # Test connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas!")
    
    # Get database
    db = client["bizlead"]
    users_coll = db["bizlead_users"]
    
    print(f"\nTotal users: {users_coll.count_documents({})}")
    
    # Find existing devaraj user
    existing_user = users_coll.find_one({"email": "devaraj.design@gmail.com"})
    
    if existing_user:
        print(f"\n✅ User found in Atlas:")
        print(f"  _id: {existing_user['_id']}")
        print(f"  email: {existing_user['email']}")
        print(f"  full_name: {existing_user.get('full_name', 'N/A')}")
        print(f"  Current hash: {existing_user.get('password_hash', 'N/A')[:40]}...")
        
        # Hash the correct password
        password = "Testing123"
        correct_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
        
        print(f"\n  New hash: {correct_hash}")
        
        # Update the password
        result = users_coll.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"password_hash": correct_hash}}
        )
        
        print(f"\n✅ Updated {result.modified_count} user(s)")
        print(f"\nUser password updated successfully!")
        print(f"Email: devaraj.design@gmail.com")
        print(f"Password: Testing123")
        print(f"New hash: {correct_hash}")
        
    else:
        print("\n❌ User not found")
        print("\nCreating new user...")
        
        # Hash password
        password = "Testing123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
        
        # Get next subscription ID from subscriptions collection
        subs_coll = db["bizlead_subscriptions"]
        sub = subs_coll.find_one({"email": "devaraj.design@gmail.com"})
        sub_id = sub["_id"] if sub else None
        
        # Create new user
        new_user = {
            "full_name": "Test User",
            "email": "devaraj.design@gmail.com",
            "password_hash": password_hash,
            "company_name": "Test Company",
            "phone": "+1234567890",
            "role": "user",
            "is_active": True,
            "current_subscription_id": sub_id,
            "created_at": pymongo.timestamp.Timestamp(1738080000, 1),
            "updated_at": pymongo.timestamp.Timestamp(1738080000, 1),
            "last_login": None,
        }
        
        result = users_coll.insert_one(new_user)
        print(f"✅ Created new user with _id: {result.inserted_id}")
    
    client.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
