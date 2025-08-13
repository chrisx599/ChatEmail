"""Dynamic Configuration Manager for hot-swappable configuration updates."""
import os
import threading
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import openai

class ConfigManager:
    """
    Singleton configuration manager that supports hot-swappable configuration updates.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ConfigManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self._config = {}
            self._ai_clients = {
                'openai_client': None,
                'openrouter_client': None,
                'anthropic_client': None
            }
            self.load_config()
            self.initialize_ai_clients()
    
    def get_config(self, name: str, default=None, type_cast=None):
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
    
    def get_bool_config(self, name: str, default=False):
        """Helper function to get a boolean config value."""
        value = os.getenv(name, str(default)).lower()
        return value in ['true', '1', 't', 'y', 'yes']
    
    def load_config(self):
        """Load configuration from environment variables."""
        # Load environment variables from .env file
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        load_dotenv(dotenv_path=dotenv_path, override=True)
        
        # Email Account Settings
        self._config.update({
            'IMAP_SERVER': self.get_config("IMAP_SERVER", "imap.example.com"),
            'IMAP_PORT': self.get_config("IMAP_PORT", 993, int),
            'EMAIL_ADDRESS': self.get_config("EMAIL_ADDRESS"),
            'EMAIL_PASSWORD': self.get_config("EMAIL_PASSWORD"),
            
            # Email Fetching Rules
            'IMAP_MAILBOX': self.get_config("IMAP_MAILBOX", "INBOX"),
            'FETCH_CRITERIA': self.get_config("FETCH_CRITERIA", "UNSEEN"),
            'FETCH_LIMIT': self.get_config("FETCH_LIMIT", 10, int),
            'FETCH_DAYS': self.get_config("FETCH_DAYS", 0, int),
            
            # Email Actions
            'MARK_AS_READ': self.get_bool_config("MARK_AS_READ", True),
            'MOVE_TO_FOLDER_ON_SUCCESS': self.get_config("MOVE_TO_FOLDER_ON_SUCCESS"),
            
            # AI Provider Settings
            'AI_PROVIDER': self.get_config("AI_PROVIDER", "openai"),
            'OPENAI_API_KEY': self.get_config("OPENAI_API_KEY"),
            'ANTHROPIC_API_KEY': self.get_config("ANTHROPIC_API_KEY"),
            'OPENROUTER_API_KEY': self.get_config("OPENROUTER_API_KEY"),
            'OPENAI_BASE_URL': self.get_config("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            'OPENROUTER_BASE_URL': self.get_config("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            
            # AI Behavior Settings
            'OPENAI_MODEL': self.get_config("OPENAI_MODEL", "gpt-4o-mini"),
            'OPENROUTER_MODEL': self.get_config("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
            'AI_OUTPUT_LANGUAGE': self.get_config("AI_OUTPUT_LANGUAGE", "Chinese"),
            'AI_TEMPERATURE': self.get_config("AI_TEMPERATURE", 0.5, float),
            'AI_MAX_TOKENS': self.get_config("AI_MAX_TOKENS", 250, int),
            
            # Application Settings
            'LOG_LEVEL': self.get_config("LOG_LEVEL", "INFO")
        })
    
    def initialize_ai_clients(self):
        """Initialize AI clients based on current configuration."""
        # Reset all clients
        self._ai_clients = {
            'openai_client': None,
            'openrouter_client': None,
            'anthropic_client': None
        }
        
        ai_provider = self._config.get('AI_PROVIDER', 'openai')
        
        if ai_provider == 'openai':
            openai_api_key = self._config.get('OPENAI_API_KEY')
            if openai_api_key:
                openai_base_url = self._config.get('OPENAI_BASE_URL')
                self._ai_clients['openai_client'] = openai.OpenAI(
                    api_key=openai_api_key,
                    base_url=openai_base_url if openai_base_url else None
                )
                print(f"[INFO] OpenAI client initialized with base URL: {openai_base_url}")
            else:
                print("[ERROR] OPENAI_API_KEY is not set, cannot initialize OpenAI client.")
        
        elif ai_provider == 'openrouter':
            openrouter_api_key = self._config.get('OPENROUTER_API_KEY')
            if openrouter_api_key:
                openrouter_base_url = self._config.get('OPENROUTER_BASE_URL')
                self._ai_clients['openrouter_client'] = openai.OpenAI(
                    api_key=openrouter_api_key,
                    base_url=openrouter_base_url
                )
                print(f"[INFO] OpenRouter client initialized with base URL: {openrouter_base_url}")
            else:
                print("[ERROR] OPENROUTER_API_KEY is not set, cannot initialize OpenRouter client.")
    
    def reload_config(self):
        """Reload configuration and reinitialize AI clients."""
        with self._lock:
            print("[INFO] Reloading configuration...")
            self.load_config()
            self.initialize_ai_clients()
            print("[INFO] Configuration reloaded successfully")
    
    def get(self, key: str, default=None):
        """Get a configuration value."""
        return self._config.get(key, default)
    
    def get_all_config(self):
        """Get all configuration as a simple object."""
        class ConfigObject:
            def __init__(self, config_dict):
                for key, value in config_dict.items():
                    setattr(self, key, value)
        
        return ConfigObject(self._config)
    
    def get_ai_client(self, client_type: str):
        """Get an AI client by type."""
        return self._ai_clients.get(client_type)
    
    def get_current_ai_client(self):
        """Get the current AI client based on AI_PROVIDER setting."""
        ai_provider = self._config.get('AI_PROVIDER', 'openai')
        if ai_provider == 'openai':
            return self._ai_clients.get('openai_client')
        elif ai_provider == 'openrouter':
            return self._ai_clients.get('openrouter_client')
        elif ai_provider == 'anthropic':
            return self._ai_clients.get('anthropic_client')
        return None
    
    def validate_config(self):
        """Validate current configuration."""
        if not all([self._config.get('IMAP_SERVER'), self._config.get('EMAIL_ADDRESS'), self._config.get('EMAIL_PASSWORD')]):
            raise ValueError("Email connection settings (IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD) are missing.")
        
        ai_provider = self._config.get('AI_PROVIDER')
        if ai_provider == 'openai' and not self._config.get('OPENAI_API_KEY'):
            raise ValueError("AI_PROVIDER is set to 'openai', but OPENAI_API_KEY is missing.")
        
        if ai_provider == 'anthropic' and not self._config.get('ANTHROPIC_API_KEY'):
            raise ValueError("AI_PROVIDER is set to 'anthropic', but ANTHROPIC_API_KEY is missing.")
        
        if ai_provider == 'openrouter' and not self._config.get('OPENROUTER_API_KEY'):
            raise ValueError("AI_PROVIDER is set to 'openrouter', but OPENROUTER_API_KEY is missing.")


# Global instance
config_manager = ConfigManager()


# Backward compatibility - expose configuration values as module-level variables
def _get_config_value(key, default=None):
    return config_manager.get(key, default)


# Email Account Settings
IMAP_SERVER = _get_config_value('IMAP_SERVER')
IMAP_PORT = _get_config_value('IMAP_PORT')
EMAIL_ADDRESS = _get_config_value('EMAIL_ADDRESS')
EMAIL_PASSWORD = _get_config_value('EMAIL_PASSWORD')

# Email Fetching Rules
IMAP_MAILBOX = _get_config_value('IMAP_MAILBOX')
FETCH_CRITERIA = _get_config_value('FETCH_CRITERIA')
FETCH_LIMIT = _get_config_value('FETCH_LIMIT')
FETCH_DAYS = _get_config_value('FETCH_DAYS')

# Email Actions
MARK_AS_READ = _get_config_value('MARK_AS_READ')
MOVE_TO_FOLDER_ON_SUCCESS = _get_config_value('MOVE_TO_FOLDER_ON_SUCCESS')

# AI Provider Settings
AI_PROVIDER = _get_config_value('AI_PROVIDER')
OPENAI_API_KEY = _get_config_value('OPENAI_API_KEY')
ANTHROPIC_API_KEY = _get_config_value('ANTHROPIC_API_KEY')
OPENROUTER_API_KEY = _get_config_value('OPENROUTER_API_KEY')
OPENAI_BASE_URL = _get_config_value('OPENAI_BASE_URL')
OPENROUTER_BASE_URL = _get_config_value('OPENROUTER_BASE_URL')

# AI Behavior Settings
OPENAI_MODEL = _get_config_value('OPENAI_MODEL')
OPENROUTER_MODEL = _get_config_value('OPENROUTER_MODEL')
AI_OUTPUT_LANGUAGE = _get_config_value('AI_OUTPUT_LANGUAGE')
AI_TEMPERATURE = _get_config_value('AI_TEMPERATURE')
AI_MAX_TOKENS = _get_config_value('AI_MAX_TOKENS')

# Application Settings
LOG_LEVEL = _get_config_value('LOG_LEVEL')