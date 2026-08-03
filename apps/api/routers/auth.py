from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.dependencies import get_current_user
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    OTPVerifyRequest,
    TokenRefreshRequest,
    TokenResponse,
    UserResponse,
    AuthResponse
)
from models.user import User
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user and generate a 6-digit OTP for verification.
    """
    user = await auth_service.register_user(db, req)
    return user

@router.post("/verify-email")
async def verify_email(req: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify 6-digit OTP code to activate email verification.
    """
    success = await auth_service.verify_otp(db, req)
    return {"message": "Email verified successfully", "is_verified": True}

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and issue JWT Access & Refresh Tokens.
    """
    result = await auth_service.login_user(db, req)
    return result

@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Renew access token using valid refresh token.
    """
    tokens = await auth_service.refresh_access_token(db, req.refresh_token)
    return tokens

@router.post("/logout")
async def logout(req: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Invalidate refresh token on logout.
    """
    await auth_service.logout_user(db, req.refresh_token)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve current authenticated user details.
    """
    return current_user
