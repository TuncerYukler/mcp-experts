// This file intentionally breaks as many SOLID principles and clean code practices as possible
// to serve as a stress test for code review tools.

// Global variables - avoiding encapsulation
var g_users = [];
var g_products = [];
var g_orders = [];
var g_loggedIn = false;
var g_currentUser = null;
var g_dbConnection = null;
var g_SECRET_KEY = "this-should-not-be-here-1234567890";

// Bad naming - single letters and unclear abbreviations
function fx(a, b, c, d, e) {
  // Magic numbers
  if (a > 42) {
    // Deep nesting - the pyramid of doom
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            // Cryptic code without explanation
            return a * b + c / d - e;
          } else {
            return a * b + c / d;
          }
        } else {
          return a * b;
        }
      } else {
        return a;
      }
    } else {
      return 0;
    }
  } else {
    return -1;
  }
}

// Commented-out code left in the codebase
// function oldFunction() {
//   // This used to do something important
//   // But now we don't need it anymore
//   // Yet we're keeping it around just in case
//   return "old result";
// }

// TODO: Fix this later
// TODO: Refactor this
// TODO: Optimize this algorithm

// God class - violates Single Responsibility Principle severely
class SuperManager {
  constructor() {
    this.data = [];
    this.cache = {};
    this.loggedIn = false;
    this.retryCount = 3;
    this.timeout = 1000;
    this.debugMode = true;
  }

  // Method does way too many things - violates SRP
  processData(inputData) {
    // Step 1: Validate
    var isValid = true;
    for (var i = 0; i < inputData.length; i++) {
      if (!inputData[i] || inputData[i].length < 3) {
        isValid = false;
        // Error handling with console.log instead of proper error handling
        console.log("Invalid data found:", inputData[i]);
      }
    }

    // Step 2: Transform data (with duplicate code patterns)
    var transformedData = [];
    for (var i = 0; i < inputData.length; i++) {
      transformedData.push({
        id: i + 1,
        value: inputData[i],
        timestamp: Date.now(),
        modified: false,
      });
    }

    // Step 3: Save to database
    for (var i = 0; i < transformedData.length; i++) {
      // Direct SQL in code - mixing concerns
      var sql =
        "INSERT INTO data VALUES (" +
        transformedData[i].id +
        ", '" +
        transformedData[i].value +
        "')";
      this.executeSql(sql);

      // Redundant logging
      console.log("Saved item: " + transformedData[i].id);
      console.log("With value: " + transformedData[i].value);
    }

    // Step 4: Update cache
    for (var i = 0; i < transformedData.length; i++) {
      this.cache[transformedData[i].id] = transformedData[i];
    }

    // Step 5: Generate report
    var report = "Data Processing Report\n";
    report += "----------------------\n";
    report += "Total items: " + transformedData.length + "\n";
    report +=
      "Valid items: " + (isValid ? transformedData.length : "ERROR") + "\n";
    report += "Timestamp: " + new Date().toISOString() + "\n";

    // Step 6: Send notifications
    for (var i = 0; i < g_users.length; i++) {
      if (g_users[i].role === "admin") {
        this.sendEmail(g_users[i].email, "Data Processing Complete", report);
      }
    }

    // Return multiple different types based on condition - unpredictable
    if (isValid) {
      return transformedData;
    } else {
      return false;
    }
  }

  // Method with side effects not clear from its name
  getData() {
    // Side effect: this method name suggests it just retrieves data
    // but it also modifies the database
    this.data.push({ id: Date.now(), value: "hidden update" });
    return this.data;
  }

  // Mixing UI and business logic - violating separation of concerns
  displayUserData(userId) {
    var user;
    // Duplicated code from the getUserById method
    for (var i = 0; i < g_users.length; i++) {
      if (g_users[i].id === userId) {
        user = g_users[i];
        break;
      }
    }

    if (!user) {
      document.getElementById("error-message").innerHTML = "User not found";
      return;
    }

    // HTML generation mixed with business logic
    var html = '<div class="user-card">';
    html += "<h2>" + user.name + "</h2>";
    html += "<p>Email: " + user.email + "</p>";
    html += "<p>Role: " + user.role + "</p>";
    html += "</div>";

    document.getElementById("user-container").innerHTML = html;

    // Direct DOM manipulation
    document.getElementById("loading-indicator").style.display = "none";

    // Analytics tracking mixed in
    this.trackEvent("user_viewed", { userId: user.id });
  }

  // Duplicate code - this functionality exists in the displayUserData method
  getUserById(userId) {
    for (var i = 0; i < g_users.length; i++) {
      if (g_users[i].id === userId) {
        return g_users[i];
      }
    }
    return null;
  }

  // Method doing database operations, logging, and error handling all in one
  executeSql(sql) {
    try {
      console.log("Executing SQL:", sql);

      // Pretend to execute SQL
      if (!g_dbConnection) {
        throw new Error("No database connection");
      }

      // Database operation
      var result = { success: true, rowCount: 1 };

      // Logging
      console.log("SQL executed successfully");
      console.log("Rows affected:", result.rowCount);

      return result;
    } catch (error) {
      // Swallowing errors - bad practice
      console.log("Error executing SQL: " + error.message);
      return { success: false };
    }
  }

  // Method with boolean flag parameter - often a sign of doing too much
  sendEmail(to, subject, body, isHtml = false, cc = [], bcc = []) {
    if (isHtml) {
      // Send HTML email
      console.log(`Sending HTML email to ${to} with subject "${subject}"`);
    } else {
      // Send plain text email
      console.log(
        `Sending plain text email to ${to} with subject "${subject}"`
      );
    }

    // Actual implementation omitted
    return true;
  }

  // Method with different behavior based on parameters - violates SRP
  saveData(data, type) {
    switch (type) {
      case "user":
        g_users.push(data);
        break;
      case "product":
        g_products.push(data);
        break;
      case "order":
        g_orders.push(data);
        this.updateInventory(data);
        this.sendOrderConfirmation(data);
        break;
      default:
        this.data.push(data);
    }
  }

  // Method with completely misleading name
  validateInput(input) {
    // This doesn't actually validate anything, it transforms
    return input.toUpperCase();
  }

  // Long method with no clear structure
  processOrder(order) {
    // Validate order
    if (!order.items || order.items.length === 0) {
      console.log("Order has no items");
      return false;
    }

    // Calculate total
    var total = 0;
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      total += item.price * item.quantity;
    }

    // Apply discount
    if (order.couponCode === "SAVE10") {
      total = total * 0.9;
    } else if (order.couponCode === "SAVE20") {
      total = total * 0.8;
    } else if (order.couponCode === "HALF") {
      total = total * 0.5;
    }

    // Check inventory
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      var product = null;

      // Find product - repeating this loop for each order item is inefficient
      for (var j = 0; j < g_products.length; j++) {
        if (g_products[j].id === item.productId) {
          product = g_products[j];
          break;
        }
      }

      if (!product) {
        console.log("Product not found: " + item.productId);
        return false;
      }

      if (product.inventory < item.quantity) {
        console.log("Not enough inventory for product: " + product.name);
        return false;
      }
    }

    // Process payment
    var paymentSuccessful = this.processPayment(order.paymentMethod, total);
    if (!paymentSuccessful) {
      console.log("Payment failed");
      return false;
    }

    // Update inventory
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];

      // Find product again - repeating the same search as above
      for (var j = 0; j < g_products.length; j++) {
        if (g_products[j].id === item.productId) {
          g_products[j].inventory -= item.quantity;
          break;
        }
      }
    }

    // Create order record
    var newOrder = {
      id: "ORD" + Date.now(),
      items: order.items,
      total: total,
      customer: order.customer,
      status: "completed",
      date: new Date(),
    };

    g_orders.push(newOrder);

    // Send confirmation email
    this.sendEmail(
      order.customer.email,
      "Order Confirmation",
      "Your order #" +
        newOrder.id +
        " has been processed. Total: $" +
        total.toFixed(2)
    );

    // Update analytics
    this.trackEvent("order_completed", {
      orderId: newOrder.id,
      total: total,
      items: order.items.length,
    });

    console.log("Order processed successfully");
    return newOrder.id;
  }

  // Poorly abstracted method with mixed responsibilities
  processPayment(method, amount) {
    console.log("Processing payment of $" + amount + " via " + method);

    // Simulating payment processing with different providers
    if (method === "credit_card") {
      // Credit card processing logic
      console.log("Validating credit card...");
      console.log("Charging credit card...");

      // Direct handling of sensitive data
      var cardData = {
        number: "1234-5678-9012-3456", // Hard-coded sensitive data
        expiry: "12/25",
        cvv: "123",
      };

      console.log("Credit card processed");
      return true;
    } else if (method === "paypal") {
      // PayPal processing logic
      console.log("Redirecting to PayPal...");
      console.log("Processing PayPal payment...");
      console.log("PayPal payment processed");
      return true;
    } else if (method === "bitcoin") {
      // Bitcoin processing logic
      console.log("Generating Bitcoin address...");
      console.log("Waiting for Bitcoin transaction...");
      console.log("Bitcoin payment received");
      return true;
    } else {
      console.log("Unsupported payment method");
      return false;
    }
  }

  // Method tracking analytics - mixed responsibility
  trackEvent(event, data) {
    console.log("Tracking event: " + event);
    console.log("Event data: ", data);

    // Simulating analytics tracking
    var analyticsData = {
      event: event,
      data: data,
      timestamp: Date.now(),
      user: g_currentUser ? g_currentUser.id : "anonymous",
    };

    // Direct API call in method
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://analytics.example.com/track", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(analyticsData));
  }

  // Method with unnecessary complexity and poor error handling
  updateInventory(order) {
    try {
      for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        for (var j = 0; j < g_products.length; j++) {
          if (g_products[j].id === item.productId) {
            g_products[j].inventory -= item.quantity;

            // Check if we need to reorder
            if (g_products[j].inventory < g_products[j].reorderLevel) {
              this.placeRestockOrder(g_products[j]);
            }

            break;
          }
        }
      }
    } catch (error) {
      // Swallowing errors and continuing silently
      console.log("Error updating inventory: " + error.message);
    }
  }

  // Method with temporal coupling (must be called in specific order)
  placeRestockOrder(product) {
    // This method assumes certain methods have been called before it
    console.log("Placing restock order for " + product.name);

    // Hard-coded email address
    this.sendEmail(
      "supplier@example.com",
      "Restock Order for " + product.name,
      "Please send us " + product.reorderQuantity + " units of " + product.name
    );
  }

  // Method that sends order confirmation
  sendOrderConfirmation(order) {
    var emailBody = "Thank you for your order!\n\n";
    emailBody += "Order ID: " + order.id + "\n";
    emailBody += "Date: " + new Date().toISOString() + "\n\n";
    emailBody += "Items:\n";

    var total = 0;

    // Duplicated calculation logic from processOrder
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      var product = null;

      for (var j = 0; j < g_products.length; j++) {
        if (g_products[j].id === item.productId) {
          product = g_products[j];
          break;
        }
      }

      if (product) {
        emailBody +=
          product.name +
          " x " +
          item.quantity +
          ": $" +
          (product.price * item.quantity).toFixed(2) +
          "\n";
        total += product.price * item.quantity;
      }
    }

    emailBody += "\nTotal: $" + total.toFixed(2);

    this.sendEmail(order.customer.email, "Order Confirmation", emailBody);
  }
}

// Poor inheritance hierarchy - violates LSP
class Animal {
  constructor(name) {
    this.name = name;
  }

  makeSound() {
    throw new Error("This method must be implemented by subclasses");
  }

  fly() {
    console.log(this.name + " is flying!");
  }

  swim() {
    console.log(this.name + " is swimming!");
  }
}

// Forced to implement methods that don't make sense
class Dog extends Animal {
  makeSound() {
    console.log("Woof!");
  }

  fly() {
    // Dogs can't fly, but the parent class assumes they can
    throw new Error("Dogs can't fly");
  }
}

// LSP violation - changing behavior in a harmful way
class Bird extends Animal {
  makeSound() {
    console.log("Tweet!");
  }

  swim() {
    // Some birds can swim, but this one can't
    return "This bird can't swim"; // Violates LSP by returning instead of logging
  }
}

// Interface segregation principle violation - fat interface
class Employee {
  constructor(name, position) {
    this.name = name;
    this.position = position;
  }

  // Methods that not all employees will use
  writeSoftware() {
    throw new Error("Not all employees write software");
  }

  designArchitecture() {
    throw new Error("Not all employees design architecture");
  }

  attendMeetings() {
    console.log(this.name + " is attending meetings");
  }

  writeDocumentation() {
    throw new Error("Not all employees write documentation");
  }

  manageTeam() {
    throw new Error("Not all employees manage teams");
  }
}

// Forced to implement methods that aren't relevant
class Developer extends Employee {
  writeSoftware() {
    console.log(this.name + " is writing software");
  }

  designArchitecture() {
    // Not all developers design architecture
    throw new Error("This developer doesn't design architecture");
  }

  writeDocumentation() {
    console.log(this.name + " is writing documentation");
  }

  manageTeam() {
    // Most developers don't manage teams
    throw new Error("This developer doesn't manage teams");
  }
}

// Dependency inversion principle violation - high-level module depends on low-level module
class UserService {
  constructor() {
    // Direct dependency on concrete implementation
    this.database = new MySQLDatabase();
  }

  getUser(id) {
    // Direct dependency on specific implementation
    return this.database.query("SELECT * FROM users WHERE id = " + id);
  }

  saveUser(user) {
    // String concatenation for SQL - SQL injection vulnerability
    const sql =
      "INSERT INTO users VALUES ('" + user.name + "', '" + user.email + "')";
    return this.database.execute(sql);
  }
}

// Concrete low-level module
class MySQLDatabase {
  query(sql) {
    console.log("Executing MySQL query: " + sql);
    return { id: 1, name: "John", email: "john@example.com" };
  }

  execute(sql) {
    console.log("Executing MySQL statement: " + sql);
    return true;
  }
}

// Main application code - messy and procedural
function initApp() {
  console.log("Initializing application...");

  // Initialize global database connection
  g_dbConnection = {
    connected: true,
    server: "localhost",
    username: "root",
    password: "password123", // Hard-coded credentials
  };

  // Create some test data
  g_users.push({
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  });
  g_users.push({
    id: 2,
    name: "User",
    email: "user@example.com",
    role: "user",
  });

  g_products.push({
    id: 1,
    name: "Product 1",
    price: 9.99,
    inventory: 100,
    reorderLevel: 10,
    reorderQuantity: 50,
  });
  g_products.push({
    id: 2,
    name: "Product 2",
    price: 19.99,
    inventory: 50,
    reorderLevel: 5,
    reorderQuantity: 20,
  });

  console.log(
    "Application initialized with " +
      g_users.length +
      " users and " +
      g_products.length +
      " products"
  );

  // Declare and immediately set a global variable
  var manager;
  manager = new SuperManager();

  // Unnecessary IIFE
  (function () {
    console.log("Anonymous function executed");
  })();

  return manager;
}

// Redundant comments stating the obvious
// This function logs in a user
function login(username, password) {
  // Check if the username exists
  var user = null;
  for (var i = 0; i < g_users.length; i++) {
    // If the username matches
    if (g_users[i].name === username) {
      // Set the user
      user = g_users[i];
      // Break out of the loop
      break;
    }
  }

  // If user not found
  if (!user) {
    // Return false
    return false;
  }

  // Hardcoded password check - security issue
  if (password === "password123") {
    // Set global variables
    g_loggedIn = true;
    g_currentUser = user;

    // Return true
    return true;
  }

  // Return false
  return false;
}

// Inconsistent naming convention (camelCase vs snake_case)
function process_order(order_data) {
  var superManager = new SuperManager();
  return superManager.processOrder(order_data);
}

// Initialize application
var app = initApp();

// Main export with inconsistent style
module.exports = {
  app: app,
  process_order: process_order,
  login: login,
  fx: fx,
};
