"""
AI Service for processing email content.
"""
import openai
from typing import List
# import anthropic # Uncomment if you plan to use Anthropic

from config import (
    AI_PROVIDER,
    OPENAI_API_KEY,
    ANTHROPIC_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_MODEL,
    AI_TEMPERATURE,
    AI_MAX_TOKENS,
    AI_OUTPUT_LANGUAGE
)

# Initialize AI clients
openai_client = None
# anthropic_client = None # Uncomment if you plan to use Anthropic

if AI_PROVIDER == 'openai':
    if OPENAI_API_KEY:
        openai_client = openai.OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL if OPENAI_BASE_URL else None)
    else:
        print("[ERROR] OPENAI_API_KEY is not set, cannot initialize OpenAI client.")
# elif AI_PROVIDER == 'anthropic':
#     if ANTHROPIC_API_KEY:
#         anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
#     else:
#         print("[ERROR] ANTHROPIC_API_KEY is not set, cannot initialize Anthropic client.")

def summarize_email_with_openai(subject: str, body: str) -> str:
    """
    Summarizes an email using the OpenAI API.
    """
    if not openai_client:
        return "[ERROR] OpenAI client not initialized. Please check your OPENAI_API_KEY."

    max_body_length = 8000 
    truncated_body = body[:max_body_length]

    try:
        system_prompt = f"You are an efficient assistant that summarizes emails. The summary should be concise and in {AI_OUTPUT_LANGUAGE}. Extract key information and any required actions."
        user_prompt = f"Subject: {subject}\n\nBody:\n{truncated_body}"

        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=AI_TEMPERATURE,
            max_tokens=AI_MAX_TOKENS,
        )
        return response.choices[0].message.content.strip() if response.choices else "[ERROR] No summary received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenAI API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"

def categorize_email_with_openai(subject: str, body: str, list_names: List[str]) -> str:
    """
    Categorizes an email into one of the provided lists using OpenAI.
    """
    if not openai_client:
        return "[ERROR] OpenAI client not initialized."
    if not list_names:
        return "[ERROR] No lists provided for categorization."

    max_body_length = 4000
    truncated_body = body[:max_body_length]

    try:
        system_prompt = (
            "You are a classification assistant. Your task is to categorize an email into one of the following lists. "
            "Analyze the email content and respond with ONLY the name of the most appropriate list from the choices provided. "
            "Do not add any explanation or punctuation."
        )
        user_prompt = f"Given the lists: {list_names}\n\nCategorize this email:\n\nSubject: {subject}\n\nBody:\n{truncated_body}"

        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2, # Lower temperature for more deterministic classification
            max_tokens=50 # Max tokens for a single list name
        )
        
        if response.choices:
            suggested_list = response.choices[0].message.content.strip()
            # Basic validation to ensure the model returned a valid list name
            if suggested_list in list_names:
                return suggested_list
            else:
                # Sometimes the model might add quotes or minor variations.
                # A more robust solution would be fuzzy matching, but for now we check containment.
                for l_name in list_names:
                    if l_name in suggested_list:
                        return l_name
                return "[ERROR] AI returned an invalid list name."
        else:
            return "[ERROR] No category received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenAI API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"


def summarize_email(subject: str, body: str) -> str:
    """
    Dispatches the summarization request to the configured AI provider.
    """
    if AI_PROVIDER == 'openai':
        return summarize_email_with_openai(subject, body)
    else:
        return f"[ERROR] Unsupported AI_PROVIDER: {AI_PROVIDER}"

def categorize_email(subject: str, body: str, list_names: List[str]) -> str:
    """
    Dispatches the categorization request to the configured AI provider.
    """
    if AI_PROVIDER == 'openai':
        return categorize_email_with_openai(subject, body, list_names)
    else:
        return f"[ERROR] Unsupported AI_PROVIDER: {AI_PROVIDER}"