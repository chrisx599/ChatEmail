"""
IMAP Email Client to fetch and parse emails.
"""
import imaplib
import email
from email.header import decode_header
from config import IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD

class EmailClient:
    def __init__(self):
        self.mail = None

    def connect(self):
        """Connect to the IMAP server and log in."""
        try:
            self.mail = imaplib.IMAP4_SSL(IMAP_SERVER)
            self.mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            print("Successfully connected to the email server.")
            return True
        except imaplib.IMAP4.error as e:
            print(f"[ERROR] Could not connect to email server: {e}")
            return False

    def fetch_unread_emails(self, limit=5):
        """Fetch a limited number of unread emails."""
        if not self.mail:
            print("[ERROR] Not connected to the email server.")
            return []

        try:
            self.mail.select('inbox')
            status, messages = self.mail.search(None, '(UNSEEN)')
            if status != 'OK':
                print("[ERROR] Failed to search for emails.")
                return []

            email_ids = messages[0].split()
            if not email_ids:
                print("No unread emails found.")
                return []
            
            # Fetch the latest emails up to the limit
            fetched_emails = []
            for email_id in reversed(email_ids[:limit]):
                status, msg_data = self.mail.fetch(email_id, '(RFC822)')
                if status == 'OK':
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            parsed_email = self._parse_email(msg)
                            fetched_emails.append(parsed_email)
            return fetched_emails
        except imaplib.IMAP4.error as e:
            print(f"[ERROR] Could not fetch emails: {e}")
            return []

    def _parse_email(self, msg):
        """Parse the email message into a dictionary."""
        subject, encoding = decode_header(msg['Subject'])[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding if encoding else 'utf-8')

        from_ = msg.get('From')
        body = ""

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition'))

                if content_type == 'text/plain' and 'attachment' not in content_disposition:
                    charset = part.get_content_charset()
                    payload = part.get_payload(decode=True)
                    body = payload.decode(charset if charset else 'utf-8')
                    break
        else:
            charset = msg.get_content_charset()
            payload = msg.get_payload(decode=True)
            body = payload.decode(charset if charset else 'utf-8')
        
        return {
            'from': from_,
            'subject': subject,
            'body': body.strip()
        }

    def close(self):
        """Close the connection to the IMAP server."""
        if self.mail:
            self.mail.close()
            self.mail.logout()
            print("Disconnected from the email server.")
