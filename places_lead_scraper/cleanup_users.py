#!/usr/bin/env python3
"""
Database cleanup script to delete all users and related records.
This script will delete all records from invoice, payment, subscription, and user_account tables.

Usage:
    python cleanup_users.py
"""

import os
import sys
from sqlalchemy import text

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal


def get_record_counts(session):
    """Get the current count of records in each table."""
    try:
        user_count = session.execute(text("SELECT COUNT(*) FROM user_account")).scalar()
        subscription_count = session.execute(text("SELECT COUNT(*) FROM subscription")).scalar()
        payment_count = session.execute(text("SELECT COUNT(*) FROM payment")).scalar()
        invoice_count = session.execute(text("SELECT COUNT(*) FROM invoice")).scalar()
        
        return {
            "users": user_count,
            "subscriptions": subscription_count,
            "payments": payment_count,
            "invoices": invoice_count
        }
    except Exception as e:
        print(f"Error fetching record counts: {e}")
        return None


def cleanup_database():
    """Delete all user records and related data from the database."""
    session = SessionLocal()
    
    try:
        # Display current counts
        print("\n" + "="*60)
        print("DATABASE CLEANUP UTILITY")
        print("="*60)
        
        print("\n📊 Current database state:")
        counts = get_record_counts(session)
        if counts:
            print(f"  • Users: {counts['users']}")
            print(f"  • Subscriptions: {counts['subscriptions']}")
            print(f"  • Payments: {counts['payments']}")
            print(f"  • Invoices: {counts['invoices']}")
            total = sum(counts.values())
            print(f"  • Total records: {total}")
        
        if total == 0:
            print("\n✓ Database is already clean. No records to delete.")
            return True
        
        # Confirm deletion
        print("\n⚠️  WARNING: This will permanently delete all user records!")
        print("This action cannot be undone.")
        confirmation = input("\nType 'DELETE ALL USERS' to proceed: ").strip()
        
        if confirmation != "DELETE ALL USERS":
            print("\n❌ Cleanup cancelled.")
            return False
        
        print("\n🔄 Deleting records in correct order (respecting foreign keys)...")
        
        # Delete in correct order to respect foreign key constraints
        print("  • Deleting invoices...", end="")
        session.execute(text("DELETE FROM invoice"))
        print(" ✓")
        
        print("  • Deleting payments...", end="")
        session.execute(text("DELETE FROM payment"))
        print(" ✓")
        
        print("  • Deleting subscriptions...", end="")
        session.execute(text("DELETE FROM subscription"))
        print(" ✓")
        
        print("  • Deleting users...", end="")
        session.execute(text("DELETE FROM user_account"))
        print(" ✓")
        
        # Commit the transaction
        session.commit()
        print("\n✅ Database cleanup completed successfully!")
        
        # Display final counts
        print("\n📊 Final database state:")
        counts = get_record_counts(session)
        if counts:
            print(f"  • Users: {counts['users']}")
            print(f"  • Subscriptions: {counts['subscriptions']}")
            print(f"  • Payments: {counts['payments']}")
            print(f"  • Invoices: {counts['invoices']}")
            print(f"  • Total records: {sum(counts.values())}")
        
        print("\n" + "="*60 + "\n")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error during cleanup: {e}")
        print("Transaction rolled back. No changes were made.")
        return False
    
    finally:
        session.close()


if __name__ == "__main__":
    try:
        success = cleanup_database()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Cleanup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
