#!/usr/bin/env python3
"""Update user subscription to professional paid plan (no free tier)."""
import pymongo
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

mongo_uri = os.getenv("MONGODB_URL")
client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
db = client["bizlead"]

users_coll = db["bizlead_users"]
subs_coll = db["bizlead_subscriptions"]

# Find the user
user = users_coll.find_one({"email": "devaraj.design@gmail.com"})

if user:
    print(f"✅ User found: {user['email']}")
    
    sub_id = user.get('current_subscription_id')
    if sub_id:
        # Update existing subscription to Professional paid plan
        update_result = subs_coll.update_one(
            {"_id": sub_id},
            {"$set": {
                "plan": "professional",
                "plan_type": "paid",
                "status": "active",
                "is_trial": False,
                "trial_end_date": None,
                "leads_limit": 10000,  # Professional plan limit
                "leads_used": 0,
                "renewal_date": datetime.utcnow() + timedelta(days=365),
                "payment_method": "stripe",  # Indicate it's paid
                "price": 99.00,  # Monthly price
                "currency": "USD",
                "billing_cycle": "monthly",
                "auto_renewal": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }}
        )
        
        print(f"\n✅ Updated subscription to Professional Paid Plan:")
        print(f"   Plan: professional (PAID)")
        print(f"   Leads Limit: 10,000/month")
        print(f"   Status: active")
        print(f"   Trial: NO")
        print(f"   Price: $99/month")
        print(f"   Renewal: Auto-renewal enabled")
        
        # Verify the update
        updated_sub = subs_coll.find_one({"_id": sub_id})
        print(f"\n✅ Verification:")
        print(f"   Plan: {updated_sub.get('plan')}")
        print(f"   Is Trial: {updated_sub.get('is_trial')}")
        print(f"   Status: {updated_sub.get('status')}")
        print(f"   Price: ${updated_sub.get('price')}")
        
    else:
        print("❌ No subscription found for user")

client.close()
print(f"\n✅ Professional paid plan applied to devaraj.design@gmail.com")
