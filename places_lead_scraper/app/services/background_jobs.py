"""
Background job examples with enforcement at data level.

This demonstrates how to protect background tasks (Celery, APScheduler, etc.)
with the same enforcement rules as API endpoints.

All functions enforce:
✔ Subscription expiry checks
✔ Feature access validation
✔ Quota enforcement
✔ Access violation logging
"""

import logging
from uuid import UUID
from sqlalchemy.orm import Session

from app.services.quota_enforcement import (
    enforce_csv_export_access,
    enforce_analytics_access,
    enforce_custom_segments_access,
    check_lead_quota,
    validate_active_subscription,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Example: Background Job - Bulk Lead Import
# ============================================================================


def bulk_import_leads_job(db: Session, user_id: UUID, leads_data: list[dict]):
    """
    Background job to import bulk leads.

    Enforces quota at data level - prevents importing even if called
    from background job without going through API.

    Args:
        db: Database session
        user_id: User importing leads
        leads_data: List of lead dictionaries to import

    Raises:
        HTTPException: If quota exceeded or subscription invalid
    """
    try:
        # ⚠️ ENFORCE: Check subscription is valid (includes expiry)
        validate_active_subscription(db, user_id, "bizlead")

        # Process each lead
        for lead in leads_data:
            # ⚠️ ENFORCE: Check quota before EACH lead
            # This prevents someone from bypassing quota by importing 1000 leads
            quota = check_lead_quota(db, user_id, "bizlead")

            if quota["remaining"] <= 0:
                logger.warning(
                    f"Bulk import halted - quota exceeded | user_id={user_id} | "
                    f"leads_processed={len(leads_data) - len(leads_data)} | "
                    f"remaining={quota['remaining']}"
                )
                break

            # Create lead in database
            # lead_obj = Lead(**lead, user_id=user_id)
            # db.add(lead_obj)

        db.commit()

        logger.info(
            f"Bulk import completed | user_id={user_id} | "
            f"leads_imported={len(leads_data)}"
        )

    except Exception as e:
        db.rollback()
        logger.error(
            f"Bulk import failed | user_id={user_id} | error={str(e)}"
        )
        raise


# ============================================================================
# Example: Background Job - Generate CSV Export
# ============================================================================


def generate_csv_export_job(db: Session, user_id: UUID, export_id: str):
    """
    Background job to generate CSV export.

    Enforces feature access at data level - prevents CSV generation
    even if background job is triggered without API check.

    Args:
        db: Database session
        user_id: User requesting export
        export_id: ID of the export task

    Raises:
        Exception: If feature not available
    """
    try:
        # ⚠️ ENFORCE: Check user has CSV export feature
        enforce_csv_export_access(db, user_id)

        logger.info(
            f"CSV export started | user_id={user_id} | export_id={export_id}"
        )

        # Generate CSV data
        # csv_data = generate_leads_csv(user_id)
        # save_to_file(csv_data, f"exports/{export_id}.csv")

        logger.info(
            f"CSV export completed | user_id={user_id} | export_id={export_id}"
        )

    except Exception as e:
        logger.error(
            f"CSV export failed | user_id={user_id} | export_id={export_id} | error={str(e)}"
        )
        raise


# ============================================================================
# Example: Background Job - Compute Analytics
# ============================================================================


def compute_analytics_job(db: Session, user_id: UUID, period: str):
    """
    Background job to compute analytics metrics.

    Enforces feature access at data level - prevents analytics computation
    even if background job is triggered without API check.

    Args:
        db: Database session
        user_id: User requesting analytics
        period: Time period (monthly, quarterly, etc.)

    Raises:
        Exception: If feature not available
    """
    try:
        # ⚠️ ENFORCE: Check subscription is valid
        validate_active_subscription(db, user_id, "bizlead")

        # ⚠️ ENFORCE: Check user has analytics feature
        enforce_analytics_access(db, user_id)

        logger.info(
            f"Analytics computation started | user_id={user_id} | period={period}"
        )

        # Compute metrics
        # metrics = calculate_conversion_rates(user_id, period)
        # metrics.update(calculate_engagement_stats(user_id, period))

        logger.info(
            f"Analytics computation completed | user_id={user_id} | period={period}"
        )

    except Exception as e:
        logger.error(
            f"Analytics computation failed | user_id={user_id} | "
            f"period={period} | error={str(e)}"
        )
        raise


# ============================================================================
# Example: Background Job - Process Custom Segment
# ============================================================================


def process_custom_segment_job(db: Session, user_id: UUID, segment_id: str):
    """
    Background job to process/compute custom segment data.

    Enforces feature access at data level - prevents segment processing
    even if background job is triggered without API check.

    Args:
        db: Database session
        user_id: User owning the segment
        segment_id: ID of the segment to process

    Raises:
        Exception: If feature not available
    """
    try:
        # ⚠️ ENFORCE: Check subscription is valid
        validate_active_subscription(db, user_id, "bizlead")

        # ⚠️ ENFORCE: Check user has custom segments feature
        enforce_custom_segments_access(db, user_id)

        logger.info(
            f"Segment processing started | user_id={user_id} | segment_id={segment_id}"
        )

        # Process segment
        # segment = get_segment(segment_id)
        # matching_leads = query_leads_for_segment(segment)
        # update_segment_lead_count(segment_id, len(matching_leads))

        logger.info(
            f"Segment processing completed | user_id={user_id} | segment_id={segment_id}"
        )

    except Exception as e:
        logger.error(
            f"Segment processing failed | user_id={user_id} | "
            f"segment_id={segment_id} | error={str(e)}"
        )
        raise


# ============================================================================


def cleanup_expired_subscriptions():
    """
    Scheduled task to deactivate expired subscriptions.

    This runs periodically (e.g., every hour) to mark subscriptions as inactive.
    """
    from app.database import SessionLocal
    from app.models.subscription import Subscription
    from datetime import datetime

    db = SessionLocal()
    try:
        expired = db.query(Subscription).filter(
            Subscription.expiry_date < datetime.utcnow(),
            Subscription.is_active == True
        ).all()

        for sub in expired:
            sub.is_active = False
            logger.warning(
                f"Subscription deactivated (expired) | user_id={sub.user_id} | "
                f"product={sub.product_name} | expiry={sub.expiry_date}"
            )

        db.commit()

        if expired:
            logger.info(f"Cleaned up {len(expired)} expired subscriptions")

    finally:
        db.close()

