"""
JWT token generation and validation.

Handles creation and validation of access and refresh tokens.
Uses python-jose for JWT operations with HS256 algorithm.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)


class JWTHandler:
    """
    Handles JWT token creation and validation.
    
    Attributes:
        secret_key: Secret key for signing tokens
        algorithm: JWT algorithm (default: HS256)
        access_token_expire_minutes: Access token expiry time
        refresh_token_expire_days: Refresh token expiry time
    """

    def __init__(
        self,
        secret_key: str = settings.JWT_SECRET,
        algorithm: str = settings.ALGORITHM,
        access_token_expire_minutes: int = 15,
        refresh_token_expire_days: int = 7,
    ):
        """Initialize JWT handler with configuration"""
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days

    def create_access_token(self, data: Dict[str, Any]) -> str:
        """
        Create JWT access token (15 minutes expiry).
        
        Args:
            data: Dictionary containing token claims (e.g., {"sub": user_id, "email": email})
            
        Returns:
            str: Encoded JWT token
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "type": "access"})
        
        try:
            encoded_jwt = jwt.encode(
                to_encode,
                self.secret_key,
                algorithm=self.algorithm
            )
            logger.debug(f"Access token created for user: {data.get('sub')}")
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating access token: {str(e)}")
            raise

    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """
        Create JWT refresh token (7 days expiry).
        
        Args:
            data: Dictionary containing token claims
            
        Returns:
            str: Encoded JWT token
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        
        try:
            encoded_jwt = jwt.encode(
                to_encode,
                self.secret_key,
                algorithm=self.algorithm
            )
            logger.debug(f"Refresh token created for user: {data.get('sub')}")
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating refresh token: {str(e)}")
            raise

    def create_tokens(self, user_id: str, email: str) -> Dict[str, str]:
        """
        Create both access and refresh tokens.
        
        Args:
            user_id: User identifier
            email: User email
            
        Returns:
            Dictionary with access_token and refresh_token
        """
        token_data = {"sub": str(user_id), "email": email}
        
        return {
            "access_token": self.create_access_token(token_data),
            "refresh_token": self.create_refresh_token(token_data),
        }

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            return payload
        except JWTError as e:
            logger.debug(f"Invalid token: {str(e)}")
            return None

    def get_user_id_from_token(self, token: str) -> Optional[str]:
        """
        Extract user ID from token.
        
        Args:
            token: JWT token string
            
        Returns:
            User ID or None if token is invalid
        """
        payload = self.verify_token(token)
        if payload:
            return payload.get("sub")
        return None

    def is_token_expired(self, token: str) -> bool:
        """
        Check if token is expired.
        
        Args:
            token: JWT token string
            
        Returns:
            True if expired, False otherwise
        """
        payload = self.verify_token(token)
        if not payload:
            return True
        
        exp = payload.get("exp")
        if not exp:
            return True
        
        return datetime.utcfromtimestamp(exp) < datetime.utcnow()


# Global instance
jwt_handler = JWTHandler()
