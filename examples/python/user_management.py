import datetime

# Global variables
users = []
current_id = 0
logged_in = False
current_user = None

# Create a user
def create_user(u_name, u_pass, u_email, u_role, u_active):
    # Validate
    if u_name == "" or u_pass == "" or u_email == "":
        print("Error: Missing required fields")
        return False
    
    # Create user object with incremented ID
    global current_id
    current_id = current_id + 1
    tmpuser = {
        "id": current_id,
        "username": u_name,
        "password": u_pass,  # Should encrypt passwords!
        "email": u_email,
        "role": u_role,
        "active": u_active,
        "created_at": datetime.datetime.now(),
        "login_attempts": 0
    }
    
    # Add to users array
    users.append(tmpuser)
    print(f"User created: {u_name}")
    return True

# Find a user by username
def find_user_by_username(username):
    for i in range(len(users)):
        if users[i]["username"] == username:
            return users[i]
    return None

# Find a user by email
def find_user_by_email(email):
    for i in range(len(users)):
        if users[i]["email"] == email:
            return users[i]
    return None

# Find a user by ID
def find_user_by_id(id):
    for i in range(len(users)):
        if users[i]["id"] == id:
            return users[i]
    return None

# Authenticate a user
def authenticate(username, password):
    global logged_in, current_user
    user = find_user_by_username(username)
    
    if not user:
        print(f"User not found: {username}")
        return False
    
    if not user["active"]:
        print(f"User account is disabled: {username}")
        user["login_attempts"] = user["login_attempts"] + 1
        return False
    
    if user["password"] == password:
        logged_in = True
        current_user = user
        user["login_attempts"] = 0
        print(f"User authenticated: {username}")
        return True
    else:
        user["login_attempts"] = user["login_attempts"] + 1
        print(f"Invalid password for: {username}")
        
        # Lock account after 3 failed attempts
        if user["login_attempts"] >= 3:
            user["active"] = False
            print(f"Account locked due to too many failed attempts: {username}")
        
        return False

# Update user profile
def update_profile(id, new_email, new_password):
    user = find_user_by_id(id)
    
    if not user:
        print(f"User not found: {id}")
        return False
    
    # Check if user is logged in
    if not logged_in or current_user["id"] != id:
        print("Unauthorized profile update attempt")
        return False
    
    # Update fields
    if new_email:
        user["email"] = new_email
    if new_password:
        user["password"] = new_password
    
    print(f"Profile updated for: {user['username']}")
    return True

# Delete user - Admin only
def delete_user(id):
    # Check if admin
    if not logged_in or current_user["role"] != 'admin':
        print("Unauthorized deletion attempt")
        return False
    
    # Find user index
    index = -1
    for i in range(len(users)):
        if users[i]["id"] == id:
            index = i
            break
    
    if index == -1:
        print(f"User not found: {id}")
        return False
    
    # Remove user
    deleted_user = users.pop(index)
    print(f"User deleted: {id}")
    return True

# Get all users - Admin only
def get_all_users():
    # Check if admin
    if not logged_in or current_user["role"] != 'admin':
        print("Unauthorized request for user list")
        return []
    
    return users

# Log out
def logout():
    global logged_in, current_user
    if logged_in:
        current_user = None
        logged_in = False
        print("User logged out")
        return True
    
    print("No user logged in")
    return False

# Function to print user info
def print_user_info(user):
    print(f"ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Role: {user['role']}, Active: {user['active']}")

# Test functionality
if __name__ == "__main__":
    create_user("admin", "admin123", "admin@example.com", "admin", True)
    create_user("john", "password123", "john@example.com", "user", True)
    create_user("jane", "secret456", "jane@example.com", "user", True)
    
    authenticate("admin", "admin123")
    print("\nAll users:")
    for user in get_all_users():
        print_user_info(user)
    
    update_profile(1, "admin@newdomain.com", None)
    logout()
    
    authenticate("john", "wrong")  # First attempt
    authenticate("john", "wrong")  # Second attempt
    authenticate("john", "wrong")  # Third attempt - account locks
    authenticate("john", "password123")  # Should fail now
    
    authenticate("admin", "admin123")
    delete_user(3)  # Delete jane
    
    print("\nRemaining users:")
    for user in get_all_users():
        print_user_info(user) 