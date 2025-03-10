// Types
type UserRole = "admin" | "user";

interface User {
  id: number;
  username: string;
  password: string; // Should encrypt passwords!
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  loginAttempts: number;
}

// Global variables
let users: User[] = [];
let currentId: number = 0;
let loggedIn: boolean = false;
let currentUser: User | null = null;

// Create a user
function createUser(
  uName: string,
  uPass: string,
  uEmail: string,
  uRole: UserRole,
  uActive: boolean
): boolean {
  // Validate
  if (uName === "" || uPass === "" || uEmail === "") {
    console.log("Error: Missing required fields");
    return false;
  }

  // Create user object with incremented ID
  currentId = currentId + 1;
  const tmpUser: User = {
    id: currentId,
    username: uName,
    password: uPass, // Should encrypt passwords!
    email: uEmail,
    role: uRole,
    active: uActive,
    createdAt: new Date(),
    loginAttempts: 0,
  };

  // Add to users array
  users.push(tmpUser);
  console.log("User created: " + uName);
  return true;
}

// Find a user by username
function findUserByUsername(username: string): User | null {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return users[i];
    }
  }
  return null;
}

// Find a user by email
function findUserByEmail(email: string): User | null {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

// Find a user by ID
function findUserById(id: number): User | null {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return users[i];
    }
  }
  return null;
}

// Authenticate a user
function authenticate(username: string, password: string): boolean {
  const user = findUserByUsername(username);

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
    currentUser = user;
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
function updateProfile(
  id: number,
  newEmail?: string,
  newPassword?: string
): boolean {
  const user = findUserById(id);

  if (!user) {
    console.log("User not found: " + id);
    return false;
  }

  // Check if user is logged in
  if (!loggedIn || !currentUser || currentUser.id !== id) {
    console.log("Unauthorized profile update attempt");
    return false;
  }

  // Update fields
  if (newEmail) user.email = newEmail;
  if (newPassword) user.password = newPassword;

  console.log("Profile updated for: " + user.username);
  return true;
}

// Delete user - Admin only
function deleteUser(id: number): boolean {
  // Check if admin
  if (!loggedIn || !currentUser || currentUser.role !== "admin") {
    console.log("Unauthorized deletion attempt");
    return false;
  }

  // Find user index
  let index = -1;
  for (let i = 0; i < users.length; i++) {
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
function getAllUsers(): User[] {
  // Check if admin
  if (!loggedIn || !currentUser || currentUser.role !== "admin") {
    console.log("Unauthorized request for user list");
    return [];
  }

  return users;
}

// Log out
function logout(): boolean {
  if (loggedIn && currentUser) {
    currentUser = null;
    loggedIn = false;
    console.log("User logged out");
    return true;
  }

  console.log("No user logged in");
  return false;
}

// Function to print users
function printUserInfo(user: User): void {
  console.log(
    `ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.active}`
  );
}

// Test functionality
function runTest(): void {
  createUser("admin", "admin123", "admin@example.com", "admin", true);
  createUser("john", "password123", "john@example.com", "user", true);
  createUser("jane", "secret456", "jane@example.com", "user", true);

  authenticate("admin", "admin123");
  console.log("\nAll users:");
  getAllUsers().forEach((user) => printUserInfo(user));

  updateProfile(1, "admin@newdomain.com");
  logout();

  authenticate("john", "wrong"); // First attempt
  authenticate("john", "wrong"); // Second attempt
  authenticate("john", "wrong"); // Third attempt - account locks
  authenticate("john", "password123"); // Should fail now

  authenticate("admin", "admin123");
  deleteUser(3); // Delete jane

  console.log("\nRemaining users:");
  getAllUsers().forEach((user) => printUserInfo(user));
}

// Run the test
runTest();
