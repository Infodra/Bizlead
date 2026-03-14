"""
Password hashing and verification using bcrypt.

Handles secure password hashing and verification using bcrypt
as recommended by OWASP and security best practices.
"""

import bcrypt
import logging

logger = logging.getLogger(__name__)


class PasswordHandler:
    """
    Handles password hashing and verification.
    
    Uses bcrypt with 12 rounds for secure password hashing.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            str: Hashed password
            
        Raises:
            ValueError: If password is empty or too long
        """
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        if len(password) > 72:
            raise ValueError("Password is too long (max 72 characters)")
        
        try:
            # Encode password to bytes and hash it
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt(rounds=12)
            hashed = bcrypt.hashpw(password_bytes, salt)
            logger.debug("Password hashed successfully")
            # Return as string for storage
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hashing password: {str(e)}")
            raise

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify plain password against hashed password.
        
        Args:
            plain_password: Plain text password from user
            hashed_password: Hashed password from database
            
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            # Encode both passwords to bytes
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            
            # Verify password
            is_valid = bcrypt.checkpw(password_bytes, hashed_bytes)
            
            if is_valid:
                logger.debug("Password verification successful")
            else:
                logger.warning("Password verification failed")
            
            return is_valid
            return is_valid
        except Exception as e:
            try:
                with open(debug_file, "a") as f:
                    f.write(f"Exception: {str(e)}\n")
            except:
                pass
            print(f"[PASSWORD] ⚠️ Exception: {str(e)}")
            logger.error(f"Error verifying password: {str(e)}")
            return False

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password strength.
        
        Args:
            password: Plain text password
            
        Returns:
            Tuple of (is_valid, message)
        """
        if not password:
            return False, "Password is required"
        
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        if len(password) > 72:
            return False, "Password is too long (max 72 characters)"
        
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        strength_score = sum([has_lower, has_upper, has_digit, has_special])
        
        if strength_score < 2:
            return False, "Password must contain uppercase, lowercase, numbers, and special characters"
        
        return True, "Password is strong"


# Global instance
password_handler = PasswordHandler()
