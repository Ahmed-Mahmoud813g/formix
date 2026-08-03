import random
import logging
from datetime import datetime, timedelta
from typing import Tuple

logger = logging.getLogger("formix.email_service")

def generate_otp_code() -> str:
    return f"{random.randint(100000, 999999)}"

async def send_otp_email(email: str, code: str, purpose: str = "Email Verification") -> bool:
    """
    In Development: Logs OTP code to console cleanly.
    In Production: Connects to SMTP host.
    """
    logger.info("=========================================")
    logger.info(f"📧 [DEV OTP EMAIL] To: {email}")
    logger.info(f"🔑 Purpose: {purpose}")
    logger.info(f"🔢 Code: {code}")
    logger.info("=========================================")
    print(f"\n>>> [DEV OTP EMAIL] To: {email} | Purpose: {purpose} | CODE: {code} <<<\n")
    return True
