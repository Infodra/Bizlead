#!/usr/bin/env python3
"""Check and fix user subscription in MongoDB Atlas."""
import pymongo
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId

load_dotenv()

mongo_uri = os.getenv("MONGODB_URL")

client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
db = client["bizlead"]

users_coll = db["bizlead_users"]
subs_coll = db["bizlead_subscriptions"]

# Find the user
user = users_coll.find_one({"email": "devaraj.design@gmail.com"})

if user:
    print(f"✅ User found:")
    print(f"  _id: {user['_id']}")
    print(f"  email: {user['email']}")
    print(f"  current_subscription_id: {user.get('current_subscription_id')}")
    
    # Check if subscription exists
    current_sub_id = user.get('current_subscription_id')
    if current_sub_id:
        sub = subs_coll.find_one({"_id": current_sub_id})
        if sub:
            print(f"\n✅ Subscription found:")
            print(f"  _id: {sub['_id']}")
            print(f"  status: {sub.get('status')}")
            print(f"  plan: {sub.get('plan')}")
            print(f"  renewal_date: {sub.get('renewal_date')}")
        else:
            print(f"\n❌ Subscription ID not found in database!")
    else:
        print(f"\n⚠️  No subscription assigned to user")
    
    # Create or update subscription
    print(f"\n\n=== CREATING/UPDATING SUBSCRIPTION ===")
    
    # Create new subscription
    new_sub = {
        "user_id": str(user['_id']),
        "email": user['email'],
        "plan": "basic",
        "status": "active",
        "leads_limit": 1000,
        "leads_used": 0,
        "created_at": datetime.utcnow(),
        "renewal_date": datetime.utcnow() + timedelta(days=365),  # 1 year
        "trial_end_date": None,
        "payment_method": "manual",
        "is_trial": False,
    }
    
    # Check if subscription already exists
    existing_sub = subs_coll.find_one({"email": "devaraj.design@gmail.com"})
    
    if existing_sub:
        # Update status and renewal date
        result = subs_coll.update_one(
            {"_id": existing_sub["_id"]},
            {"$set": {
                "status": "active",
                "renewal_date": new_sub["renewal_date"],
                "is_trial": False,
            }}
        )
        sub_id = existing_sub["_id"]
        print(f"✅ Updated existing subscription: {sub_id}")
    else:
        # Create new subscription
        result = subs_coll.insert_one(new_sub)
        sub_id = result.inserted_id
        print(f"✅ Created new subscription: {sub_id}")
    
    # Update user to reference this subscription
    users_coll.update_one(
        {"_id": user['_id']},
        {"$set": {"current_subscription_id": sub_id}}
    )
    print(f"✅ Updated user to reference subscription: {sub_id}")
    
    print(f"\n✅ User is now ready to login!")
    print(f"Email: devaraj.design@gmail.com")
    print(f"Password: Testing123")
    print(f"Subscription: Active")
    
else:
    print("❌ User not found")

client.close()
