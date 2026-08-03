from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from models.user import User
from models.otp import OTPCode
from models.token import RefreshToken
from schemas.auth import RegisterRequest, LoginRequest, OTPVerifyRequest
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from services.email_service import generate_otp_code, send_otp_email

async def register_user(db: AsyncSession, req: RegisterRequest) -> User:
    # Check existing user
    result = await db.execute(select(User).where(User.email == req.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )

    # Create new user
    user = User(
        email=req.email,
        full_name=req.full_name,
        phone=req.phone,
        password_hash=hash_password(req.password),
        is_verified=False,
        is_active=True,
        is_admin=False
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create 6-digit OTP code (expires in 10 minutes)
    otp_code = generate_otp_code()
    otp_entry = OTPCode(
        user_id=user.id,
        code=otp_code,
        type="email",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False
    )
    db.add(otp_entry)
    await db.commit()

    await send_otp_email(user.email, otp_code, "Account Verification")
    return user

async def verify_otp(db: AsyncSession, req: OTPVerifyRequest) -> bool:
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(OTPCode).where(
            OTPCode.user_id == user.id,
            OTPCode.code == req.code,
            OTPCode.used == False,
            OTPCode.expires_at > datetime.utcnow()
        )
    )
    otp_entry = result.scalar_one_or_none()
    if not otp_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )

    otp_entry.used = True
    user.is_verified = True
    await db.commit()
    return True

async def login_user(db: AsyncSession, req: LoginRequest) -> dict:
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated"
        )

    access_token = create_access_token({"sub": str(user.id), "email": user.email, "is_admin": user.is_admin})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Store refresh token
    token_entry = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(token_entry)
    await db.commit()

    return {
        "user": user,
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
    token_entry = result.scalar_one_or_none()
    if not token_entry or token_entry.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is no longer valid"
        )

    result = await db.execute(select(User).where(User.id == token_entry.user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive")

    new_access_token = create_access_token({"sub": str(user.id), "email": user.email, "is_admin": user.is_admin})
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

async def logout_user(db: AsyncSession, refresh_token: str) -> bool:
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
    token_entry = result.scalar_one_or_none()
    if token_entry:
        await db.delete(token_entry)
        await db.commit()
    return True
