"""
Configuration module for BizLead application.

This module manages all application settings through environment variables,
ensuring secrets are never hardcoded in the application.

Quick Start:
    from app.config.settings import settings
    
    # Use any setting
    db_url = settings.DATABASE_URL
    debug_mode = settings.DEBUG
    allowed_hosts = settings.allowed_hosts_list  # Returns list
"""

from app.config.settings import (
    settings,
    validate_settings,
    print_settings_summary,
)

__all__ = [
    "settings",
    "validate_settings",
    "print_settings_summary",
]
