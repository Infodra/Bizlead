"""
Plan configuration system for BizLead SaaS backend.

This module defines plan limits and feature access in a structured,
reusable way for centralized plan management across the application.
"""

# Plan configuration dictionary defining limits and features for each product and plan
PLAN_CONFIG = {
    "bizlead": {
        "starter": {
            "lead_limit": 500,
            "features": {
                "basic_info": True,
                "advanced_filters": True,
                "csv_export": True,
                "analytics": False,
                "api_access": False,
                "custom_segments": False
            }
        },
        "professional": {
            "lead_limit": 2000,
            "features": {
                "basic_info": True,
                "advanced_filters": True,
                "csv_export": True,
                "analytics": True,
                "api_access": True,
                "custom_segments": True
            }
        }
    }
}


def get_plan_limits(product_name: str, plan_name: str) -> int:
    """
    Get the lead limit for a specific product and plan.

    Args:
        product_name (str): The name of the product (e.g., 'bizlead').
        plan_name (str): The name of the plan (e.g., 'free', 'starter', 'professional').

    Returns:
        int: The lead limit for the specified plan.

    Raises:
        ValueError: If the product or plan does not exist in the configuration.

    Example:
        >>> get_plan_limits("bizlead", "starter")
        500
    """
    if product_name not in PLAN_CONFIG:
        raise ValueError(
            f"Product '{product_name}' not found in plan configuration. "
            f"Available products: {list(PLAN_CONFIG.keys())}"
        )

    if plan_name not in PLAN_CONFIG[product_name]:
        available_plans = list(PLAN_CONFIG[product_name].keys())
        raise ValueError(
            f"Plan '{plan_name}' not found for product '{product_name}'. "
            f"Available plans: {available_plans}"
        )

    return PLAN_CONFIG[product_name][plan_name]["lead_limit"]


def get_plan_features(product_name: str, plan_name: str) -> dict:
    """
    Get the features dictionary for a specific product and plan.

    Args:
        product_name (str): The name of the product (e.g., 'bizlead').
        plan_name (str): The name of the plan (e.g., 'free', 'starter', 'professional').

    Returns:
        dict: A dictionary of feature flags and their boolean values.

    Raises:
        ValueError: If the product or plan does not exist in the configuration.

    Example:
        >>> get_plan_features("bizlead", "starter")
        {
            'basic_info': True,
            'advanced_filters': True,
            'csv_export': True,
            'analytics': False,
            'api_access': False,
            'custom_segments': False
        }
    """
    if product_name not in PLAN_CONFIG:
        raise ValueError(
            f"Product '{product_name}' not found in plan configuration. "
            f"Available products: {list(PLAN_CONFIG.keys())}"
        )

    if plan_name not in PLAN_CONFIG[product_name]:
        available_plans = list(PLAN_CONFIG[product_name].keys())
        raise ValueError(
            f"Plan '{plan_name}' not found for product '{product_name}'. "
            f"Available plans: {available_plans}"
        )

    return PLAN_CONFIG[product_name][plan_name]["features"].copy()


def is_feature_enabled(product_name: str, plan_name: str, feature: str) -> bool:
    """
    Check if a specific feature is enabled for a given product and plan.

    Args:
        product_name (str): The name of the product (e.g., 'bizlead').
        plan_name (str): The name of the plan (e.g., 'starter', 'professional').
        feature (str): The feature name to check (e.g., 'csv_export').

    Returns:
        bool: True if the feature is enabled, False otherwise.

    Raises:
        ValueError: If the product, plan, or feature does not exist in the configuration.

    Example:
        >>> is_feature_enabled("bizlead", "starter", "csv_export")
        True
        >>> is_feature_enabled("bizlead", "starter", "api_access")
        False
    """
    if product_name not in PLAN_CONFIG:
        raise ValueError(
            f"Product '{product_name}' not found in plan configuration. "
            f"Available products: {list(PLAN_CONFIG.keys())}"
        )

    if plan_name not in PLAN_CONFIG[product_name]:
        available_plans = list(PLAN_CONFIG[product_name].keys())
        raise ValueError(
            f"Plan '{plan_name}' not found for product '{product_name}'. "
            f"Available plans: {available_plans}"
        )

    features = PLAN_CONFIG[product_name][plan_name]["features"]
    if feature not in features:
        available_features = list(features.keys())
        raise ValueError(
            f"Feature '{feature}' not found in plan '{plan_name}'. "
            f"Available features: {available_features}"
        )

    return features[feature]
