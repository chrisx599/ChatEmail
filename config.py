"""
Configuration loader
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Email settings
IMAP_SERVER = os.getenv("IMAP_SERVER")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# AI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Basic validation
if not all([IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD]):
    raise ValueError("Email configuration (IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD) is missing in .env file.")

if not (OPENAI_API_KEY or ANTHROPIC_API_KEY):
    raise ValueError("At least one AI provider API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) must be set in .env file.")
