"""
Logging configuration for subscription enforcement violations.

This module shows how to set up logging to track:
✔ Access violations (feature/plan blocks)
✔ Quota exceeded incidents
✔ Subscription expiry blocks
✔ Which features users try to access most

Useful for:
- Detecting abuse patterns
- Improving upgrade prompts
- Understanding feature demand
- Security monitoring
"""

import logging
import logging.handlers
import os
from datetime import datetime


# ============================================================================
# Configure Violation Logging
# ============================================================================


def setup_enforcement_logging(log_dir: str = "logs") -> logging.Logger:
    """
    Set up comprehensive logging for enforcement violations.

    Creates separate log files for:
    - access_violations.log → Feature/plan access blocks
    - quota_violations.log → Lead quota violations
    - subscription_violations.log → Subscription issues

    Args:
        log_dir: Directory to store log files

    Returns:
        logger: Configured logger instance
    """
    # Create logs directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)

    # Create logger
    logger = logging.getLogger("enforcement")
    logger.setLevel(logging.DEBUG)

    # ========== Access Violations Handler ==========
    access_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "access_violations.log"),
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5
    )
    access_handler.setLevel(logging.WARNING)
    access_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    access_handler.setFormatter(access_formatter)

    # ========== Quota Violations Handler ==========
    quota_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "quota_violations.log"),
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5
    )
    quota_handler.setLevel(logging.WARNING)
    quota_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    quota_handler.setFormatter(quota_formatter)

    # ========== Subscription Issues Handler ==========
    subscription_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "subscription_violations.log"),
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5
    )
    subscription_handler.setLevel(logging.WARNING)
    subscription_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    subscription_handler.setFormatter(subscription_formatter)

    # ========== Console Handler ==========
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)
    console_formatter = logging.Formatter(
        "🔴 [%(levelname)s] %(message)s"
    )
    console_handler.setFormatter(console_formatter)

    # Add handlers to logger
    logger.addHandler(access_handler)
    logger.addHandler(quota_handler)
    logger.addHandler(subscription_handler)
    logger.addHandler(console_handler)

    return logger


# ============================================================================
# Log Parsing & Analytics
# ============================================================================


def analyze_access_violations(log_file: str = "logs/access_violations.log") -> dict:
    """
    Parse access violation logs and return statistics.

    Returns:
        dict: {
            total_violations: int,
            violations_by_feature: {feature: count},
            violations_by_user: {user_id: count},
            most_requested_features: list
        }

    Example output:
        {
            'total_violations': 1234,
            'violations_by_feature': {
                'analytics': 456,
                'api_access': 234,
                'custom_segments': 200,
                ...
            },
            'violations_by_user': {
                '550e8400-...': 12,
                '660e8400-...': 8,
                ...
            },
            'most_requested_features': [
                ('analytics', 456),
                ('api_access', 234),
                ...
            ]
        }
    """
    if not os.path.exists(log_file):
        return {
            "total_violations": 0,
            "violations_by_feature": {},
            "violations_by_user": {},
            "most_requested_features": []
        }

    violations_by_feature = {}
    violations_by_user = {}

    with open(log_file, "r") as f:
        for line in f:
            # Parse log lines
            if "feature=" in line:
                try:
                    feature = line.split("feature=")[1].split(" ")[0].strip("|")
                    violations_by_feature[feature] = violations_by_feature.get(feature, 0) + 1
                except:
                    pass

            if "user_id=" in line:
                try:
                    user_id = line.split("user_id=")[1].split(" ")[0].strip("|")
                    violations_by_user[user_id] = violations_by_user.get(user_id, 0) + 1
                except:
                    pass

    most_requested = sorted(
        violations_by_feature.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return {
        "total_violations": sum(violations_by_feature.values()),
        "violations_by_feature": violations_by_feature,
        "violations_by_user": violations_by_user,
        "most_requested_features": most_requested
    }


def analyze_quota_violations(log_file: str = "logs/quota_violations.log") -> dict:
    """
    Parse quota violation logs and return statistics.

    Returns:
        dict: {
            total_quota_exceeded: int,
            users_with_quota_issues: list,
            average_quota_overage: int
        }
    """
    if not os.path.exists(log_file):
        return {
            "total_quota_exceeded": 0,
            "users_with_quota_issues": [],
            "average_quota_overage": 0
        }

    quota_exceeded_users = {}

    with open(log_file, "r") as f:
        for line in f:
            if "Lead quota exceeded" in line:
                try:
                    user_id = line.split("user_id=")[1].split(" ")[0].strip("|")
                    quota_exceeded_users[user_id] = quota_exceeded_users.get(user_id, 0) + 1
                except:
                    pass

    return {
        "total_quota_exceeded": sum(quota_exceeded_users.values()),
        "users_with_quota_issues": list(quota_exceeded_users.keys()),
        "quota_exceeded_frequency": quota_exceeded_users
    }


def analyze_subscription_violations(log_file: str = "logs/subscription_violations.log") -> dict:
    """
    Parse subscription violation logs and return statistics.

    Returns:
        dict: {
            total_violations: int,
            expired_subscriptions: int,
            inactive_subscriptions: int,
            no_subscription: int
        }
    """
    if not os.path.exists(log_file):
        return {
            "total_violations": 0,
            "expired_subscriptions": 0,
            "inactive_subscriptions": 0,
            "no_subscription": 0
        }

    stats = {
        "expired_subscriptions": 0,
        "inactive_subscriptions": 0,
        "no_subscription": 0
    }

    with open(log_file, "r") as f:
        for line in f:
            if "Subscription expired" in line:
                stats["expired_subscriptions"] += 1
            elif "Inactive subscription" in line:
                stats["inactive_subscriptions"] += 1
            elif "No active subscription" in line:
                stats["no_subscription"] += 1

    stats["total_violations"] = sum(stats.values())
    return stats


# ============================================================================
# Generate Reports
# ============================================================================


def generate_violation_report() -> str:
    """
    Generate comprehensive violation report.

    Returns:
        str: Formatted report text
    """
    access = analyze_access_violations()
    quota = analyze_quota_violations()
    subscription = analyze_subscription_violations()

    report = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ENFORCEMENT VIOLATIONS REPORT                             ║
║                          {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 ACCESS VIOLATIONS (Feature/Plan Blocks)
──────────────────────────────────────────
  Total Violations:          {access['total_violations']}
  Most Requested Features:   {access['most_requested_features'][:3]}

📊 QUOTA VIOLATIONS (Lead Limit Exceeded)
──────────────────────────────────────────
  Total Quota Exceeded:      {quota['total_quota_exceeded']}
  Users Affected:            {len(quota['users_with_quota_issues'])}

📊 SUBSCRIPTION VIOLATIONS (Expiry/Inactive)
──────────────────────────────────────────
  Expired Subscriptions:     {subscription['expired_subscriptions']}
  Inactive Subscriptions:    {subscription['inactive_subscriptions']}
  No Subscription:           {subscription['no_subscription']}

💡 RECOMMENDATIONS:
──────────────────────────────────────────
  1. Top requested feature ({access['most_requested_features'][0][0] if access['most_requested_features'] else 'N/A'})
     → Consider promoting to lower-tier plans
  
  2. {len(quota['users_with_quota_issues'])} users hit quota limits
     → These are upgrade candidates
  
  3. {subscription['expired_subscriptions']} expired subscriptions
     → Send renewal reminders to these users

"""
    return report


# ============================================================================
# Usage Example
# ============================================================================

if __name__ == "__main__":
    # Set up logging
    logger = setup_enforcement_logging()

    # Log some example violations
    logger.warning(
        "User 550e8400-e29b-41d4-a716-446655440000 blocked from analytics - "
        "insufficient plan | plan=starter"
    )

    logger.warning(
        "Lead quota exceeded | user_id=660e8400-e29b-41d4-a716-446655440001 | "
        "product=bizlead | current=500 | limit=500"
    )

    logger.warning(
        "Subscription expired | user_id=770e8400-e29b-41d4-a716-446655440002 | "
        "product=bizlead | expiry=2026-01-20"
    )

    # Generate report
    print(generate_violation_report())

    # Analyze
    access_stats = analyze_access_violations()
    print("\nAccess Violation Stats:")
    print(f"  Total: {access_stats['total_violations']}")
    print(f"  By feature: {access_stats['violations_by_feature']}")
