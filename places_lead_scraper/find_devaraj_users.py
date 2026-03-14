#!/usr/bin/env python3
"""Find all users with email containing 'devaraj'."""
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = pymongo.MongoClient(mongo_uri)
db = client["bizlead_db"]

# Search for any user with devaraj in email
users = list(db["bizlead_users"].find({"email": {"$regex": "devaraj", "$options": "i"}}))

print(f"Found {len(users)} user(s) with 'devaraj' in email:\n")
for i, u in enumerate(users, 1):
    print(f"--- User {i} ---")
    print(f"  _id: {u['_id']}")
    print(f"  email: {u.get('email')}")
    print(f"  password_hash: {u.get('password_hash')}")
    print(f"  full_name: {u.get('full_name')}")
    print(f"  is_active: {u.get('is_active')}")
    print()

# Also search for EXACT email matches
print("\n=== EXACT EMAIL MATCHES ===")
exact_users = list(db["bizlead_users"].find({"email": "devaraj.design@gmail.com"}))
for i, u in enumerate(exact_users, 1):
    print(f"User {i}: {u['_id']} - {u.get('email')}")

client.close()
