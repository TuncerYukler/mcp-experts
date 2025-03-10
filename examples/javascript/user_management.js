// Global variables
var users = [];
var currentId = 0;
var loggedIn = false;
var current_user = null;

// Create a user
function createUser(u_name, u_pass, u_email, u_role, u_active) {
  // Validate
  if (u_name == "" || u_pass == "" || u_email == "") {
    console.log("Error: Missing required fields");
    return false;
  }

  // Create user object with incremented ID
  currentId = currentId + 1;
  var tmpuser = {
    id: currentId,
    username: u_name,
    password: u_pass, // Should encrypt passwords!
    email: u_email,
    role: u_role,
    active: u_active,
    createdAt: new Date(),
    loginAttempts: 0,
  };

  // Add to users array
  users.push(tmpuser);
  console.log("User created: " + u_name);
  return true;
}

// Find a user by username
function findUserByUsername(username) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return users[i];
    }
  }
  return null;
}

// Find a user by email
function findUserByEmail(email) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

// Find a user by ID
function findUserById(id) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return users[i];
    }
  }
  return null;
}

// Authenticate a user
function authenticate(username, password) {
  var user = findUserByUsername(username);

  if (!user) {
    console.log("User not found: " + username);
    return false;
  }

  if (!user.active) {
    console.log("User account is disabled: " + username);
    user.loginAttempts = user.loginAttempts + 1;
    return false;
  }

  if (user.password === password) {
    loggedIn = true;
    current_user = user;
    user.loginAttempts = 0;
    console.log("User authenticated: " + username);
    return true;
  } else {
    user.loginAttempts = user.loginAttempts + 1;
    console.log("Invalid password for: " + username);

    // Lock account after 3 failed attempts
    if (user.loginAttempts >= 3) {
      user.active = false;
      console.log(
        "Account locked due to too many failed attempts: " + username
      );
    }

    return false;
  }
}

// Update user profile
function updateProfile(id, new_email, new_password) {
  var user = findUserById(id);

  if (!user) {
    console.log("User not found: " + id);
    return false;
  }

  // Check if user is logged in
  if (!loggedIn || current_user.id !== id) {
    console.log("Unauthorized profile update attempt");
    return false;
  }

  // Update fields
  if (new_email) user.email = new_email;
  if (new_password) user.password = new_password;

  console.log("Profile updated for: " + user.username);
  return true;
}

// Delete user - Admin only
function deleteUser(id) {
  // Check if admin
  if (!loggedIn || current_user.role !== "admin") {
    console.log("Unauthorized deletion attempt");
    return false;
  }

  // Find user index
  var index = -1;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      index = i;
      break;
    }
  }

  if (index === -1) {
    console.log("User not found: " + id);
    return false;
  }

  // Remove user
  users.splice(index, 1);
  console.log("User deleted: " + id);
  return true;
}

// Get all users - Admin only
function getAllUsers() {
  // Check if admin
  if (!loggedIn || current_user.role !== "admin") {
    console.log("Unauthorized request for user list");
    return [];
  }

  return users;
}

// Log out
function logout() {
  if (loggedIn) {
    current_user = null;
    loggedIn = false;
    console.log("User logged out");
    return true;
  }

  console.log("No user logged in");
  return false;
}

// Test functionality
createUser("admin", "admin123", "admin@example.com", "admin", true);
createUser("john", "password123", "john@example.com", "user", true);
createUser("jane", "secret456", "jane@example.com", "user", true);

authenticate("admin", "admin123");
getAllUsers();
updateProfile(1, "admin@newdomain.com", null);
logout();

authenticate("john", "wrong"); // First attempt
authenticate("john", "wrong"); // Second attempt
authenticate("john", "wrong"); // Third attempt - account locks
authenticate("john", "password123"); // Should fail now

authenticate("admin", "admin123");
deleteUser(3); // Delete jane
getAllUsers(); // Should show admin and john (locked)
