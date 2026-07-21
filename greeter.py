class Greeter:
    """
    A simple class to greet a person by name.
    Demonstrates basic OOP concepts: constructor (__init__) and methods.
    """
    def __init__(self, name):
        """
        Initializes the Greeter object with a given name.

        Args:
            name (str): The name of the person to greet.

        Raises:
            ValueError: If the provided name is not a non-empty string.
        """
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Name must be a non-empty string.")
        self.name = name

    def greet(self):
        """
        Generates and returns a personalized greeting message.

        Returns:
            str: The full greeting message.
        """
        return f"Hello, {self.name}! Welcome to the world of Python OOP."

# Example usage block (demonstrates how to use the class)
if __name__ == "__main__":
    print("--- Testing Greeter Class ---")
    try:
        # 1. Create an instance for 'Alice'
        alice_greeter = Greeter("Alice")
        greeting_alice = alice_greeter.greet()
        print(f"Success: {greeting_alice}")

        # 2. Create another instance for a full name
        bob_greeter = Greeter("Bob Smith")
        greeting_bob = bob_greeter.greet()
        print(f"Success: {greeting_bob}")

    except ValueError as e:
        print(f"\n[Error Caught]: Could not create greeter due to invalid input: {e}")

    print("\n--- Testing Error Handling (Empty Name) ---")
    try:
        # Test case for error handling
        invalid_greeter = Greeter("   ")
    except ValueError as e:
        print(f"Correctly handled error: {e}")