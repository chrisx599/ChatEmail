"""
AI Service for processing email content.
"""
import openai
import json
import os
# import anthropic # Uncomment if you plan to use Anthropic

from config_manager import config_manager

# Use the config manager for dynamic configuration
def get_ai_config(key, default=None):
    return config_manager.get(key, default)

def get_all_ai_config():
    """Get all AI-related configuration as a dictionary."""
    return {
        'AI_PROVIDER': get_ai_config('AI_PROVIDER', 'openai'),
        'OPENAI_MODEL': get_ai_config('OPENAI_MODEL', 'gpt-4o-mini'),
        'OPENROUTER_MODEL': get_ai_config('OPENROUTER_MODEL', 'openai/gpt-4o-mini'),
        'AI_TEMPERATURE': get_ai_config('AI_TEMPERATURE', 0.5),
        'AI_MAX_TOKENS': get_ai_config('AI_MAX_TOKENS', 250),
        'AI_OUTPUT_LANGUAGE': get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')
    }

# Get current AI client from config manager
def get_current_ai_client():
    return config_manager.get_current_ai_client()

def get_openai_client():
    return config_manager.get_ai_client('openai_client')

def get_openrouter_client():
    return config_manager.get_ai_client('openrouter_client')

# Backward compatibility - get configuration values dynamically
AI_PROVIDER = get_ai_config('AI_PROVIDER', 'openai')
OPENAI_MODEL = get_ai_config('OPENAI_MODEL', 'gpt-4o-mini')
OPENROUTER_MODEL = get_ai_config('OPENROUTER_MODEL', 'openai/gpt-4o-mini')
AI_TEMPERATURE = get_ai_config('AI_TEMPERATURE', 0.5)
AI_MAX_TOKENS = get_ai_config('AI_MAX_TOKENS', 250)
AI_OUTPUT_LANGUAGE = get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')

def summarize_email_with_openai(subject: str, body: str) -> str:
    """
    Summarizes an email using the OpenAI API.

    Args:
        subject: The subject of the email.
        body: The body content of the email.

    Returns:
        A string containing the summary of the email, or an error message.
    """
    openai_client = get_openai_client()
    if not openai_client:
        return "[ERROR] OpenAI client not initialized. Please check your OPENAI_API_KEY."

    # Get current configuration values
    ai_output_language = get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')
    openai_model = get_ai_config('OPENAI_MODEL', 'gpt-4o-mini')
    ai_max_tokens = get_ai_config('AI_MAX_TOKENS', 250)
    ai_temperature = get_ai_config('AI_TEMPERATURE', 0.5)

    # Truncate body to avoid exceeding token limits, preserving the start of the email
    # A safe limit, considering token usage for prompt and response
    max_body_length = 8000 
    truncated_body = body[:max_body_length] #

    try:
        system_prompt = f"You are an efficient assistant that summarizes emails. The summary should be concise and in {ai_output_language}. Extract key information and any required actions."
        user_prompt = f"Subject: {subject}\n\nBody:\n{truncated_body}"

        response = openai_client.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=ai_temperature,
            max_tokens=ai_max_tokens,
        )
        if response.choices:
            return response.choices[0].message.content.strip()
        else:
            return "[ERROR] No summary received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenAI API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"

def summarize_email_with_openrouter(subject: str, body: str) -> str:
    """
    Summarizes an email using the OpenRouter API.

    Args:
        subject: The subject of the email.
        body: The body content of the email.

    Returns:
        A string containing the summary of the email, or an error message.
    """
    openrouter_client = get_openrouter_client()
    if not openrouter_client:
        return "[ERROR] OpenRouter client not initialized. Please check your OPENROUTER_API_KEY."

    # Get current configuration values
    ai_output_language = get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')
    openrouter_model = get_ai_config('OPENROUTER_MODEL', 'openai/gpt-4o-mini')
    ai_max_tokens = get_ai_config('AI_MAX_TOKENS', 250)
    ai_temperature = get_ai_config('AI_TEMPERATURE', 0.5)

    # Truncate body to avoid exceeding token limits, preserving the start of the email
    # A safe limit, considering token usage for prompt and response
    max_body_length = 8000 
    truncated_body = body[:max_body_length] #

    try:
        system_prompt = f"You are an efficient assistant that summarizes emails. The summary should be concise and in {ai_output_language}. Extract key information and any required actions."
        user_prompt = f"Subject: {subject}\n\nBody:\n{truncated_body}"

        response = openrouter_client.chat.completions.create(
            model=openrouter_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=ai_temperature,
            max_tokens=ai_max_tokens,
        )
        if response.choices:
            return response.choices[0].message.content.strip()
        else:
            return "[ERROR] No summary received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenRouter API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"

def generate_batch_summary_report_with_openai(emails: list) -> dict:
    """
    Generates a batch summary report for a list of emails using the OpenAI API.

    Args:
        emails: A list of dictionaries, each containing 'id', 'from', 'subject', and 'body' keys.

    Returns:
        A dictionary containing the structured report, or an error message.
    """
    openai_client = get_openai_client()
    if not openai_client:
        return {"error": "[ERROR] OpenAI client not initialized. Please check your OPENAI_API_KEY."}

    if not emails:
        return {"error": "[INFO] No emails to summarize."}

    # Prepare email data for the prompt, truncating bodies to save tokens
    max_body_length_for_batch = 2000 # Shorter truncation for batch processing
    email_summaries_for_prompt = []
    for email in emails:
        truncated_body = email['body'][:max_body_length_for_batch]
        email_summaries_for_prompt.append({
            "id": email['id'],
            "from": email['from'],
            "subject": email['subject'],
            "body_preview": truncated_body
        })

    try:
        # Get current configuration values
        ai_output_language = get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')
        openai_model = get_ai_config('OPENAI_MODEL', 'gpt-4o-mini')
        ai_max_tokens = get_ai_config('AI_MAX_TOKENS', 250)
        ai_temperature = get_ai_config('AI_TEMPERATURE', 0.5)

        # Read the prompt template from the file
        prompt_file_path = os.path.join(os.path.dirname(__file__), 'batch_summary_prompt.md')
        if os.path.exists(prompt_file_path):
            try:
                with open(prompt_file_path, 'r', encoding='utf-8') as f:
                    prompt_template = f.read()
                # Replace the placeholder with the actual language
                system_prompt = prompt_template.format(AI_OUTPUT_LANGUAGE=ai_output_language)
            except FileNotFoundError:
                return {"error": f"[ERROR] Prompt file not found at {prompt_file_path}"}
            except UnicodeDecodeError as e:
                return {"error": f"[ERROR] Error decoding prompt file: {e}"}
            except KeyError as e:
                return {"error": f"[ERROR] Missing placeholder in prompt template: {e}"}
            except Exception as e:
                return {"error": f"[ERROR] Error processing prompt template: {e}"}
        else:
            # Fallback to a simple prompt if the file is not found
            system_prompt = f"You are an expert email analyst. Create a structured, categorized report in valid JSON format in {ai_output_language}."
            
        user_prompt = f"Here is the list of email data to analyze and report on:\n\n{json.dumps(email_summaries_for_prompt, indent=2, ensure_ascii=False)}"

        # Use a reasonable limit for batch reports to avoid token limit issues
        # max_output_tokens = min(100000, AI_MAX_TOKENS)
        
        response = openai_client.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=ai_temperature,
            max_tokens=ai_max_tokens, # Reasonable limit for batch reports
        )
        
        if response.choices:
            raw_response_content = response.choices[0].message.content.strip()
            # Attempt to parse the AI's response as JSON
            # The AI is instructed to return valid JSON, but we should be robust to minor formatting issues.
            try:
                # Sometimes AI adds ```json ... ``` wrapper or other text
                # Try to extract JSON object from the response
                import re
                
                # Remove any markdown code blocks
                cleaned_response = re.sub(r'```json\s*', '', raw_response_content)
                cleaned_response = re.sub(r'```\s*$', '', cleaned_response)
                
                # Look for a JSON object in the response
                # This regex looks for a top-level JSON object
                json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
                if json_match:
                    json_content = json_match.group(0)
                    
                    # Try to fix common JSON issues
                    # 1. Fix trailing commas in arrays and objects
                    json_content = re.sub(r',\s*([}\]])', r'\1', json_content)
                    
                    # 2. Ensure proper comma separation between array/object elements
                    # This is a more complex fix - we'll try to add missing commas
                    # Split by lines and check for missing commas
                    lines = json_content.split('\n')
                    fixed_lines = []
                    
                    for i, line in enumerate(lines):
                        stripped_line = line.strip()
                        fixed_lines.append(line)
                        
                        # Check if this line ends with } or ] and the next line starts with {
                        if i < len(lines) - 1:
                            next_line = lines[i + 1].strip()
                            if (stripped_line.endswith('}') or stripped_line.endswith(']')) and \
                               (next_line.startswith('{') or next_line.startswith('[')):
                                # Add comma if missing
                                if not stripped_line.endswith(',') and not stripped_line.endswith(',}') and not stripped_line.endswith(',]'):
                                    fixed_lines[-1] = line.rstrip() + ','
                    
                    json_content = '\n'.join(fixed_lines)
                    
                    # Try to parse the fixed JSON
                    report_data = json.loads(json_content)
                    return report_data
                else:
                    return {"error": f"[ERROR] No valid JSON object found in AI response. Raw response: {raw_response_content[:500]}..."}
                    
            except json.JSONDecodeError as je:
                # If JSON parsing still fails, try a more aggressive approach
                try:
                    # Try to extract just the categories array and reconstruct the JSON
                    categories_match = re.search(r'"categories"\s*:\s*\[(.*?)\]', raw_response_content, re.DOTALL)
                    if categories_match:
                        # Return a minimal valid structure
                        return {"categories": []}
                    else:
                        return {"error": f"[ERROR] Failed to parse AI response as JSON: {je}. Raw response: {raw_response_content[:1000]}..."}
                except Exception:
                    return {"error": f"[ERROR] Failed to parse AI response as JSON: {je}. Raw response: {raw_response_content[:1000]}..."}
        else:
            return {"error": "[ERROR] No report received from AI."}

    except openai.APIError as e:
        return {"error": f"[ERROR] OpenAI API error: {e}"}
    except Exception as e:
        return {"error": f"[ERROR] An unexpected error occurred in batch processing: {e}"}

def generate_batch_summary_report_with_openrouter(emails: list) -> dict:
    """
    Generates a batch summary report for a list of emails using the OpenRouter API.

    Args:
        emails: A list of dictionaries, each containing 'id', 'from', 'subject', and 'body' keys.

    Returns:
        A dictionary containing the structured report, or an error message.
    """
    openrouter_client = get_openrouter_client()
    if not openrouter_client:
        return {"error": "[ERROR] OpenRouter client not initialized. Please check your OPENROUTER_API_KEY."}

    if not emails:
        return {"error": "[INFO] No emails to summarize."}

    # Prepare email data for the prompt, truncating bodies to save tokens
    max_body_length_for_batch = 2000 # Shorter truncation for batch processing
    email_summaries_for_prompt = []
    for email in emails:
        truncated_body = email['body'][:max_body_length_for_batch]
        email_summaries_for_prompt.append({
            "id": email['id'],
            "from": email['from'],
            "subject": email['subject'],
            "body_preview": truncated_body
        })

    try:
        # Get current configuration values
        ai_output_language = get_ai_config('AI_OUTPUT_LANGUAGE', 'Chinese')
        openrouter_model = get_ai_config('OPENROUTER_MODEL', 'openai/gpt-4o-mini')
        ai_max_tokens = get_ai_config('AI_MAX_TOKENS', 250)
        ai_temperature = get_ai_config('AI_TEMPERATURE', 0.5)

        # Read the prompt template from the file
        prompt_file_path = os.path.join(os.path.dirname(__file__), 'batch_summary_prompt.md')
        if os.path.exists(prompt_file_path):
            try:
                with open(prompt_file_path, 'r', encoding='utf-8') as f:
                    prompt_template = f.read()
                # Replace the placeholder with the actual language
                system_prompt = prompt_template.format(AI_OUTPUT_LANGUAGE=ai_output_language)
            except FileNotFoundError:
                return {"error": f"[ERROR] Prompt file not found at {prompt_file_path}"}
            except UnicodeDecodeError as e:
                return {"error": f"[ERROR] Error decoding prompt file: {e}"}
            except KeyError as e:
                return {"error": f"[ERROR] Missing placeholder in prompt template: {e}"}
            except Exception as e:
                return {"error": f"[ERROR] Error processing prompt template: {e}"}
        else:
            # Fallback to a simple prompt if the file is not found
            system_prompt = f"You are an expert email analyst. Create a structured, categorized report in valid JSON format in {ai_output_language}."
            
        user_prompt = f"Here is the list of email data to analyze and report on:\n\n{json.dumps(email_summaries_for_prompt, indent=2, ensure_ascii=False)}"

        # OpenRouter has context length limits, so we need to be more conservative
        # Most OpenRouter models have a max context of ~1M tokens, so we limit output to 50k
        max_output_tokens = min(50000, ai_max_tokens)
        
        response = openrouter_client.chat.completions.create(
            model=openrouter_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=ai_temperature,
            max_tokens=max_output_tokens, # Conservative limit for OpenRouter
        )
        
        if response.choices:
            raw_response_content = response.choices[0].message.content.strip()
            # Attempt to parse the AI's response as JSON
            # The AI is instructed to return valid JSON, but we should be robust to minor formatting issues.
            try:
                # Sometimes AI adds ```json ... ``` wrapper or other text
                # Try to extract JSON object from the response
                import re
                
                # Remove any markdown code blocks
                cleaned_response = re.sub(r'```json\s*', '', raw_response_content)
                cleaned_response = re.sub(r'```\s*$', '', cleaned_response)
                
                # Look for a JSON object in the response
                # This regex looks for a top-level JSON object
                json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
                if json_match:
                    json_content = json_match.group(0)
                    
                    # Try to fix common JSON issues
                    # 1. Fix trailing commas in arrays and objects
                    json_content = re.sub(r',\s*([}\]])', r'\1', json_content)
                    
                    # 2. Ensure proper comma separation between array/object elements
                    # This is a more complex fix - we'll try to add missing commas
                    # Split by lines and check for missing commas
                    lines = json_content.split('\n')
                    fixed_lines = []
                    
                    for i, line in enumerate(lines):
                        stripped_line = line.strip()
                        fixed_lines.append(line)
                        
                        # Check if this line ends with } or ] and the next line starts with {
                        if i < len(lines) - 1:
                            next_line = lines[i + 1].strip()
                            if (stripped_line.endswith('}') or stripped_line.endswith(']')) and \
                               (next_line.startswith('{') or next_line.startswith('[')):
                                # Add comma if missing
                                if not stripped_line.endswith(',') and not stripped_line.endswith(',}') and not stripped_line.endswith(',]'):
                                    fixed_lines[-1] = line.rstrip() + ','
                    
                    json_content = '\n'.join(fixed_lines)
                    
                    # Try to parse the fixed JSON
                    report_data = json.loads(json_content)
                    return report_data
                else:
                    return {"error": f"[ERROR] No valid JSON object found in AI response. Raw response: {raw_response_content[:500]}..."}
                    
            except json.JSONDecodeError as je:
                # If JSON parsing still fails, try a more aggressive approach
                try:
                    # Try to extract just the categories array and reconstruct the JSON
                    categories_match = re.search(r'"categories"\s*:\s*\[(.*?)\]', raw_response_content, re.DOTALL)
                    if categories_match:
                        # Return a minimal valid structure
                        return {"categories": []}
                    else:
                        return {"error": f"[ERROR] Failed to parse AI response as JSON: {je}. Raw response: {raw_response_content[:1000]}..."}
                except Exception:
                    return {"error": f"[ERROR] Failed to parse AI response as JSON: {je}. Raw response: {raw_response_content[:1000]}..."}
        else:
            return {"error": "[ERROR] No report received from AI."}

    except openai.APIError as e:
        return {"error": f"[ERROR] OpenRouter API error: {e}"}
    except Exception as e:
        return {"error": f"[ERROR] An unexpected error occurred in batch processing: {e}"}

# def summarize_email_with_anthropic(subject: str, body: str) -> str:
#     """
#     Summarizes an email using the Anthropic API.
#     (Implementation for Anthropic would go here)
#     """
#     if not anthropic_client:
#     return "[ERROR] Anthropic client not initialized. Please check your ANTHROPIC_API_KEY."
#     return "[INFO] Anthropic summarization not yet implemented."

def summarize_email(subject: str, body: str) -> str:
    """
    Dispatches the summarization request to the configured AI provider.
    """
    ai_provider = get_ai_config('AI_PROVIDER', 'openai')
    if ai_provider == 'openai':
        return summarize_email_with_openai(subject, body)
    elif ai_provider == 'openrouter':
        return summarize_email_with_openrouter(subject, body)
    # elif ai_provider == 'anthropic':
    #     return summarize_email_with_anthropic(subject, body)
    else:
        return f"[ERROR] Unsupported AI_PROVIDER: {ai_provider}"

def generate_batch_summary_report(emails: list) -> dict:
    """
    Dispatches the batch summarization request to the configured AI provider.
    """
    ai_provider = get_ai_config('AI_PROVIDER', 'openai')
    if ai_provider == 'openai':
        return generate_batch_summary_report_with_openai(emails)
    elif ai_provider == 'openrouter':
        return generate_batch_summary_report_with_openrouter(emails)
    # elif ai_provider == 'anthropic':
    #     # Implementation for Anthropic would go here
    #     pass
    else:
        return {"error": f"[ERROR] Unsupported AI_PROVIDER for batch summary: {ai_provider}"}