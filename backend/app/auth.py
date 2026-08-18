import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import models
from .database import get_db

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "role": role, "exp": expire, "type": "access"}, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(db: Session, user_id: str) -> tuple[str, models.RefreshToken]:
    token = secrets.token_urlsafe(32)
    token_hash = hash_token(token)
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token = models.RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expire.date(),
    )
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)
    return token, refresh_token


def rotate_refresh_token(db: Session, old_token: models.RefreshToken) -> tuple[str, models.RefreshToken]:
    old_token.revoked = True
    new_token_str, new_token = create_refresh_token(db, old_token.user_id)
    old_token.replaced_by = new_token.id
    db.commit()
    return new_token_str, new_token


def verify_refresh_token(db: Session, token: str) -> Optional[models.RefreshToken]:
    token_hash = hash_token(token)
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash
    ).first()
    if not refresh_token:
        return None
    if refresh_token.revoked:
        # Token reuse detected - potential token theft!
        # Revoke all user's refresh tokens as security measure
        revoke_all_user_refresh_tokens(db, refresh_token.user_id)
        return None
    if refresh_token.expires_at < datetime.utcnow().date():
        return None
    return refresh_token


def revoke_refresh_token(db: Session, token: str) -> bool:
    token_hash = hash_token(token)
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash
    ).first()
    if refresh_token:
        refresh_token.revoked = True
        db.commit()
        return True
    return False


def revoke_all_user_refresh_tokens(db: Session, user_id: str) -> int:
    count = db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user_id,
        models.RefreshToken.revoked == False
    ).update({"revoked": True})
    db.commit()
    return count


def revoke_access_token(db: Session, token: str) -> bool:
    """Add access token to revocation list."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return False
        exp_timestamp = payload.get("exp")
        if not exp_timestamp:
            return False
        expires_at = datetime.utcfromtimestamp(exp_timestamp).date()
        token_hash = hash_token(token)
        revoked = models.RevokedToken(
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(revoked)
        db.commit()
        return True
    except JWTError:
        return False


def is_access_token_revoked(db: Session, token: str) -> bool:
    """Check if access token is in revocation list."""
    token_hash = hash_token(token)
    revoked = db.query(models.RevokedToken).filter(
        models.RevokedToken.token_hash == token_hash
    ).first()
    return revoked is not None


def cleanup_expired_revoked_tokens(db: Session) -> int:
    """Remove expired tokens from revocation list."""
    count = db.query(models.RevokedToken).filter(
        models.RevokedToken.expires_at < datetime.utcnow().date()
    ).delete()
    db.commit()
    return count


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось подтвердить учётные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_error
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    if is_access_token_revoked(db, token):
        raise credentials_error

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_error
    return user


def require_role(*roles: str):
    def checker(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Недостаточно прав для этого действия")
        return user
    return checker