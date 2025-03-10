// Shopping Cart implementation
var items = [];
var total = 0;

// Add an item to the cart
function addItem(name, price, quantity) {
  if (!name || price <= 0 || quantity <= 0) {
    console.log("Invalid item parameters");
    return false;
  }

  // Create item object
  var item = {
    id: generateId(),
    name: name,
    price: price,
    quantity: quantity,
    subtotal: calculateSubtotal(price, quantity),
  };

  // Add to items array
  items.push(item);

  // Update total
  total = calculateCartTotal();

  console.log("Item added: " + name);
  return true;
}

// Generate a unique ID for items
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Calculate subtotal for an item
function calculateSubtotal(price, quantity) {
  return price * quantity;
}

// Calculate total for all items
function calculateCartTotal() {
  var newTotal = 0;
  for (var i = 0; i < items.length; i++) {
    newTotal += items[i].subtotal;
  }
  return newTotal;
}

// Remove an item from the cart
function removeItem(id) {
  // Find item index
  var index = -1;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      index = i;
      break;
    }
  }

  // Remove item if found
  if (index !== -1) {
    console.log("Removing: " + items[index].name);
    items.splice(index, 1);

    // Update total
    total = calculateCartTotal();
    return true;
  } else {
    console.log("Item not found");
    return false;
  }
}

// Apply discount
function applyDiscount(code) {
  if (code === "SAVE10") {
    total = total * 0.9;
    console.log("10% discount applied");
    return true;
  } else if (code === "SAVE20") {
    total = total * 0.8;
    console.log("20% discount applied");
    return true;
  } else {
    console.log("Invalid discount code");
    return false;
  }
}

// Display cart contents
function displayCart() {
  console.log("Cart Contents:");
  for (var i = 0; i < items.length; i++) {
    console.log(
      items[i].name +
        " - $" +
        items[i].price +
        " x " +
        items[i].quantity +
        " = $" +
        items[i].subtotal
    );
  }
  console.log("Total: $" + total);
}

// Test functionality
addItem("Book", 12.99, 2);
addItem("Pen", 1.99, 5);
displayCart();
applyDiscount("SAVE10");
displayCart();
