"""
Database configuration for FastAPI with SQLAlchemy ORM.
Supports both local SQLite development and production PostgreSQL on Render.
"""

import os
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# ============================================================================
# DATABASE URL CONFIGURATION
# ============================================================================

# Read DATABASE_URL from environment variables
# For Render deployment: postgresql://user:password@hostname/dbname
# For local development: Falls back to SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to local SQLite database if DATABASE_URL is not set
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./local.db"
    print("WARNING: DATABASE_URL not found. Using local SQLite: " + DATABASE_URL)
else:
    print("SUCCESS: Using DATABASE_URL from environment")

# ============================================================================
# SQLALCHEMY ENGINE CONFIGURATION
# ============================================================================

# Determine if using SQLite or PostgreSQL
IS_SQLITE = DATABASE_URL.startswith("sqlite")

if IS_SQLITE:
    # SQLite configuration for local development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Required for SQLite
        poolclass=StaticPool,  # Use StaticPool to avoid issues with SQLite in-memory/file access
    )
else:
    # PostgreSQL configuration for production
    # pool_pre_ping=True ensures connections are alive before using them
    # This is critical for production stability
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections are alive
        pool_size=10,  # Number of connections to pool
        max_overflow=20,  # Max additional connections above pool_size
        pool_recycle=3600,  # Recycle connections after 1 hour (Render best practice)
        echo=False,  # Set to True for SQL query logging
    )

# ============================================================================
# SESSION FACTORY
# ============================================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ============================================================================
# DECLARATIVE BASE FOR ORM MODELS
# ============================================================================

Base = declarative_base()

# ============================================================================
# DATABASE DEPENDENCY FOR FASTAPI
# ============================================================================


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.
    
    Automatically closes the session after the request is complete.
    
    Usage in FastAPI:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# SQLITE-SPECIFIC CONFIGURATION (if needed for development)
# ============================================================================

if IS_SQLITE:
    # Enable foreign keys for SQLite (disabled by default)
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        """Enable SQLite foreign key constraints."""
        if not isinstance(dbapi_conn, type(None)):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def init_db():
    """
    Initialize the database by creating all tables.
    Call this during application startup.
    """
    # Import models so they register on Base.metadata
    import app.models.payment  # noqa: F401
    import app.models.subscription  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")


def close_db():
    """
    Close database connections.
    Call this during application shutdown.
    """
    engine.dispose()
    print("✓ Database connections closed")


# ============================================================================
# DATABASE HEALTH CHECK
# ============================================================================


def check_db_connection() -> bool:
    """
    Check if the database connection is working.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with engine.connect() as connection:
            if IS_SQLITE:
                connection.execute("SELECT 1")
            else:
                connection.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False
