import os
from typing import Optional, Dict

class AuthManager:
    """
    Manages authentication credentials loaded from environment variables.

    This class provides a centralized way to load and access sensitive
    information required for interacting with various services
    (e.g., APIs, databases). Credentials are expected to be set in the
    environment before usage (e.g., export API_KEY='your_secret').
    """

    def __init__(self):
        # A dictionary to hold loaded credentials
        self._credentials: Dict[str, str] = {}
        print("AuthManager initialized. Checking for required environment variables...")
        self._load_from_env()

    def _load_from_env(self) -> None:
        """
        Loads predefined expected credentials from os.environ.
        Extensible by adding checks for other necessary ENV vars.
        """
        # --- Required Credentials Check (Example: OpenAI API Key) ---
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self._credentials["openai"] = api_key
            print("✅ Successfully loaded 'OPENAI_API_KEY'.")
        else:
            print("⚠️ Warning: OPENAI_API_KEY environment variable not found.")

        # --- Optional/Additional Credentials Check (Example: Database User) ---
        db_user = os.getenv("DB_USERNAME")
        if db_user:
            self._credentials["database_user"] = db_user
            print(f"✅ Successfully loaded 'DB_USERNAME': {db_user[:3]}***.")
        else:
             print("⚠️ Warning: DB_USERNAME environment variable not found.")


    def get_api_key(self, service: str) -> Optional[str]:
        """
        Retrieves an API key for a specified service if available.

        Args:
            service (str): The name of the service (e.g., 'openai').

        Returns:
            Optional[str]: The API key string or None if not found.
        """
        if service in self._credentials and self._credentials[service]:
            key = self._credentials[service]
            print(f"🔑 Retrieved {service} credentials.")
            return key
        else:
            print(f"❌ Error: Credentials for '{service}' not found or empty.")
            return None

    def get_all_loaded_services(self) -> list[str]:
        """Returns a list of all services for which credentials were loaded."""
        return list(self._credentials.keys())


# --- Example Usage ---
if __name__ == "__main__":
    print("=============================")
    print("   Running AuthManager Demo    ")
    print("=============================\n")

    # 1. Instantiate the manager - this automatically loads from environment variables
    auth_manager = AuthManager()

    # 2. Check which services were successfully loaded
    services = auth_manager.get_all_loaded_services()
    print(f"\n[Summary] The manager was configured with {len(services)} services.")
    print("Available Services:", ", ".join(services))


    # 3. Attempt to retrieve specific keys (The demonstration will fail gracefully if ENV vars are not set)
    print("\n--- Testing Credential Retrieval ---")

    openai_key = auth_manager.get_api_key("openai")
    if openai_key:
        # In a real application, you would pass this key to an API client here.
        print(f"Success: Using the first 4 chars of OpenAI Key for demonstration.")
        # print(f"Key: {openai_key[:4]}...") # Avoid printing full keys
    else:
        print("Test skipped: Cannot demonstrate API call without a valid key.")

    db_user = auth_manager.get_api_key("database_user")
    if db_user:
         # Simulate using the credential
         print(f"Successfully retrieved database username: {db_user}")
    else:
        print("Test skipped: Cannot demonstrate DB connection without a valid user.")

    print("\n=============================")