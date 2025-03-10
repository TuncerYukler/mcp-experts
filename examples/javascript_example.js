/**
 * A simple shopping cart implementation for demonstration purposes
 */
function ShoppingCart() {
  this.items = [];
  this.total = 0;
}

ShoppingCart.prototype.addItem = function (item) {
  if (!item.id || !item.name || item.price === undefined) {
    console.log("Invalid item");
    return false;
  }

  this.items.push(item);
  this.calculateTotal();
  return true;
};

ShoppingCart.prototype.removeItem = function (itemId) {
  var initialLength = this.items.length;
  this.items = this.items.filter(function (item) {
    return item.id !== itemId;
  });

  if (this.items.length === initialLength) {
    console.log("Item not found: " + itemId);
    return false;
  }

  this.calculateTotal();
  return true;
};

ShoppingCart.prototype.calculateTotal = function () {
  var total = 0;
  for (var i = 0; i < this.items.length; i++) {
    total += this.items[i].price;
  }
  this.total = total;
};

ShoppingCart.prototype.checkout = function () {
  if (this.items.length === 0) {
    console.log("Cannot checkout an empty cart");
    return false;
  }

  // Process payment
  console.log("Processing payment for: $" + this.total);

  // Clear cart
  this.items = [];
  this.total = 0;

  return true;
};

// Example usage
var cart = new ShoppingCart();
cart.addItem({ id: 1, name: "Product 1", price: 10.99 });
cart.addItem({ id: 2, name: "Product 2", price: 5.99 });
cart.removeItem(1);
cart.checkout();
