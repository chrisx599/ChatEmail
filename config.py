"""
Configuration loader for all application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_config(name, default=None, type_cast=None):
    """Helper function to get a config value, with optional type casting."""
    value = os.getenv(name)
    if value is None or value == '':
        value = default
    if type_cast and value is not None:
        try:
            return type_cast(value)
        except (ValueError, TypeError):
            return default
    return value

def get_bool_config(name, default=False):
    """Helper function to get a boolean config value."""
    value = os.getenv(name, str(default)).lower()
    return value in ['true', '1', 't', 'y', 'yes']

# Email Account Settings
IMAP_SERVER = get_config("IMAP_SERVER", "imap.example.com")
IMAP_PORT = get_config("IMAP_PORT", 993, int)
EMAIL_ADDRESS = get_config("EMAIL_ADDRESS")
EMAIL_PASSWORD = get_config("EMAIL_PASSWORD")

# Email Fetching Rules
IMAP_MAILBOX = get_config("IMAP_MAILBOX", "INBOX")
FETCH_CRITERIA = get_config("FETCH_CRITERIA", "UNSEEN")
FETCH_LIMIT = get_config("FETCH_LIMIT", 10, int)
FETCH_DAYS = get_config("FETCH_DAYS", 0, int)

# Email Actions
MARK_AS_READ = get_bool_config("MARK_AS_READ", True)
MOVE_TO_FOLDER_ON_SUCCESS = get_config("MOVE_TO_FOLDER_ON_SUCCESS")

# AI Provider Settings
AI_PROVIDER = get_config("AI_PROVIDER", "openai")
OPENAI_API_KEY = get_config("OPENAI_API_KEY")
ANTHROPIC_API_KEY = get_config("ANTHROPIC_API_KEY")
OPENAI_BASE_URL = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")

# AI Behavior Settings
OPENAI_MODEL = get_config("OPENAI_MODEL", "gpt-4o-mini")
AI_OUTPUT_LANGUAGE = get_config("AI_OUTPUT_LANGUAGE", "Chinese")
AI_TEMPERATURE = get_config("AI_TEMPERATURE", 0.5, float)
AI_MAX_TOKENS = get_config("AI_MAX_TOKENS", 250, int)

# Application Settings
LOG_LEVEL = get_config("LOG_LEVEL", "INFO")

# --- Basic Validation ---
def validate_config():
    if not all([IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD]):
        raise ValueError("Email connection settings (IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD) are missing.")
    
    if AI_PROVIDER == 'openai' and not OPENAI_API_KEY:
        raise ValueError("AI_PROVIDER is set to 'openai', but OPENAI_API_KEY is missing.")
    
    if AI_PROVIDER == 'anthropic' and not ANTHROPIC_API_KEY:
        raise ValueError("AI_PROVIDER is set to 'anthropic', but ANTHROPIC_API_KEY is missing.")

# Run validation when the module is imported
validate_config()