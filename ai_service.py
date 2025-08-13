"""
AI Service for processing email content.
"""
import openai
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

    Args:
        subject: The subject of the email.
        body: The body content of the email.

    Returns:
        A string containing the summary of the email, or an error message.
    """
    if not openai_client:
        return "[ERROR] OpenAI client not initialized. Please check your OPENAI_API_KEY."

    # Truncate body to avoid exceeding token limits, preserving the start of the email
    # A safe limit, considering token usage for prompt and response
    max_body_length = 8000 
    truncated_body = body[:max_body_length] #

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
        if response.choices:
            return response.choices[0].message.content.strip()
        else:
            return "[ERROR] No summary received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenAI API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"

# def summarize_email_with_anthropic(subject: str, body: str) -> str:
#     """
#     Summarizes an email using the Anthropic API.
#     (Implementation for Anthropic would go here)
#     """
#     if not anthropic_client:
#         return "[ERROR] Anthropic client not initialized. Please check your ANTHROPIC_API_KEY."
#     return "[INFO] Anthropic summarization not yet implemented."

def summarize_email(subject: str, body: str) -> str:
    """
    Dispatches the summarization request to the configured AI provider.
    """
    if AI_PROVIDER == 'openai':
        return summarize_email_with_openai(subject, body)
    # elif AI_PROVIDER == 'anthropic':
    #     return summarize_email_with_anthropic(subject, body)
    else:
        return f"[ERROR] Unsupported AI_PROVIDER: {AI_PROVIDER}"
