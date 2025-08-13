"""
IMAP Email Client to fetch and parse emails.
"""
import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import logging

from config import (
    IMAP_SERVER,
    IMAP_PORT,
    EMAIL_ADDRESS,
    EMAIL_PASSWORD,
    IMAP_MAILBOX,
    FETCH_CRITERIA,
    FETCH_LIMIT,
    FETCH_DAYS,
    MARK_AS_READ,
    MOVE_TO_FOLDER_ON_SUCCESS,
    LOG_LEVEL
)

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper()),
                    format='%(asctime)s - %(levelname)s - %(message)s')

class EmailClient:
    def __init__(self):
        self.mail = None

    def connect(self):
        """Connect to the IMAP server and log in."""
        try:
            self.mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
            self.mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            logging.info("Successfully connected to the email server.")
            return True
        except imaplib.IMAP4.error as e:
            logging.error(f"Could not connect to email server: {e}")
            return False
        except Exception as e:
            logging.error(f"An unexpected error occurred during connection: {e}")
            return False

    def _build_search_criteria(self):
        """Builds the IMAP search criteria based on config."""
        criteria = [FETCH_CRITERIA]

        if FETCH_DAYS > 0:
            date_n_days_ago = (datetime.now() - timedelta(days=FETCH_DAYS)).strftime("%d-%b-%Y")
            criteria.append(f'SINCE "{date_n_days_ago}" ')
        
        # IMAP search expects bytes
        return [c.encode('utf-8') for c in criteria]

    def fetch_emails(self):
        """Fetch emails based on configured criteria."""
        if not self.mail:
            logging.error("Not connected to the email server.")
            return []

        try:
            status, _ = self.mail.select(IMAP_MAILBOX)
            if status != 'OK':
                logging.error(f"Failed to select mailbox '{IMAP_MAILBOX}': {status}")
                return []

            search_criteria = self._build_search_criteria()
            logging.info(f"Searching for emails with criteria: {search_criteria}")
            status, messages = self.mail.search(None, *search_criteria)
            
            if status != 'OK':
                logging.error(f"Failed to search for emails: {status}")
                return []

            email_ids = messages[0].split()
            if not email_ids:
                logging.info("No emails found matching criteria.")
                return []
            
            # Apply FETCH_LIMIT, fetching newest first
            email_ids_to_fetch = email_ids[-FETCH_LIMIT:] if FETCH_LIMIT > 0 else email_ids
            logging.info(f"Found {len(email_ids)} emails, fetching {len(email_ids_to_fetch)}.")

            fetched_emails = []
            for email_id in reversed(email_ids_to_fetch):
                status, msg_data = self.mail.fetch(email_id, '(RFC822)')
                if status == 'OK':
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            parsed_email = self._parse_email(msg, email_id.decode())
                            fetched_emails.append(parsed_email)
                else:
                    logging.warning(f"Failed to fetch email ID {email_id.decode()}: {status}")
            return fetched_emails
        except imaplib.IMAP4.error as e:
            logging.error(f"IMAP error during email fetch: {e}")
            return []
        except Exception as e:
            logging.error(f"An unexpected error occurred during email fetch: {e}")
            return []

    def _parse_email(self, msg, email_id):
        """Parse the email message into a dictionary."""
        subject, encoding = decode_header(msg['Subject'])[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding if encoding else 'utf-8', errors='ignore')

        from_header = msg.get('From')
        body_plain = ""
        body_html = ""

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition'))

                if 'attachment' in content_disposition:
                    continue

                charset = part.get_content_charset()
                payload = part.get_payload(decode=True)
                if not payload:
                    continue
                
                try:
                    decoded_payload = payload.decode(charset if charset else 'utf-8', errors='ignore')
                except (LookupError, UnicodeDecodeError):
                    decoded_payload = payload.decode('latin-1', errors='ignore') # Fallback encoding

                if content_type == 'text/plain' and not body_plain:
                    body_plain = decoded_payload
                elif content_type == 'text/html' and not body_html:
                    body_html = decoded_payload
        else:
            # Not a multipart message, just get the payload
            charset = msg.get_content_charset()
            payload = msg.get_payload(decode=True)
            try:
                body_plain = payload.decode(charset if charset else 'utf-8', errors='ignore')
            except (LookupError, UnicodeDecodeError):
                body_plain = payload.decode('latin-1', errors='ignore')

        # Prioritize plain text, but fall back to HTML
        body = body_plain.strip() if body_plain else body_html.strip()
        
        return {
            'id': email_id,
            'from': from_header,
            'subject': subject,
            'body': body
        }

    def mark_email_as_read(self, email_id):
        """Marks an email as read (seen)."""
        if not self.mail:
            logging.error("Not connected to the email server.")
            return
        try:
            status, _ = self.mail.store(email_id, '+FLAGS', '\Seen')
            if status == 'OK':
                logging.info(f"Email ID {email_id} marked as read.")
            else:
                logging.warning(f"Failed to mark email ID {email_id} as read: {status}")
        except imaplib.IMAP4.error as e:
            logging.error(f"IMAP error marking email {email_id} as read: {e}")

    def move_email_to_folder(self, email_id, folder_name):
        """Moves an email to a specified folder."""
        if not self.mail:
            logging.error("Not connected to the email server.")
            return
        try:
            # Check if folder exists, create if not
            status, _ = self.mail.list('', folder_name)
            if not any(folder_name.encode() in f for f in _):
                logging.info(f"Folder '{folder_name}' does not exist. Creating...")
                status, _ = self.mail.create(folder_name)
                if status != 'OK':
                    logging.error(f"Failed to create folder '{folder_name}': {status}")
                    return
                logging.info(f"Folder '{folder_name}' created successfully.")

            # Copy email to new folder
            status, _ = self.mail.copy(email_id, folder_name)
            if status == 'OK':
                logging.info(f"Email ID {email_id} copied to '{folder_name}'.")
                # Mark original for deletion and expunge
                status, _ = self.mail.store(email_id, '+FLAGS', '\Deleted')
                if status == 'OK':
                    self.mail.expunge()
                    logging.info(f"Original email ID {email_id} deleted.")
                else:
                    logging.warning(f"Failed to mark original email ID {email_id} for deletion: {status}")
            else:
                logging.warning(f"Failed to copy email ID {email_id} to '{folder_name}': {status}")
        except imaplib.IMAP4.error as e:
            logging.error(f"IMAP error moving email {email_id} to {folder_name}: {e}")
        except Exception as e:
            logging.error(f"An unexpected error occurred moving email {email_id}: {e}")

    def close(self):
        """Close the connection to the IMAP server."""
        if self.mail:
            try:
                self.mail.close()
                self.mail.logout()
                logging.info("Disconnected from the email server.")
            except imaplib.IMAP4.error as e:
                logging.error(f"Error during IMAP close/logout: {e}")
            except Exception as e:
                logging.error(f"An unexpected error occurred during close: {e}")