# This file intentionally breaks as many SOLID principles and clean code practices as possible
# to serve as a stress test for code review tools in Python.

import os
import sys
import json
import time
import datetime
import random
import re
import sqlite3
from typing import Any, Dict, List, Union, Optional

# Global variables - avoiding encapsulation
g_users = []
g_products = []
g_orders = []
g_logged_in = False
g_current_user = None
g_db_connection = None
g_SECRET_KEY = "this-should-not-be-here-1234567890"

# Bad naming - single letters and unclear abbreviations
def fx(a, b, c, d, e):
    """
    What does this function do? Who knows!
    """
    # Magic numbers
    if a > 42:
        # Deep nesting - the pyramid of doom
        if b:
            if c:
                if d:
                    if e:
                        # Cryptic code without explanation
                        return (a * b) + (c / d) - e
                    else:
                        return (a * b) + (c / d)
                else:
                    return a * b
            else:
                return a
        else:
            return 0
    else:
        return -1

# Commented-out code left in the codebase
# def old_function():
#     """
#     This used to do something important
#     But now we don't need it anymore
#     Yet we're keeping it around just in case
#     """
#     return "old result"

# TODO: Fix this later
# TODO: Refactor this
# TODO: Optimize this algorithm

# God class - violates Single Responsibility Principle severely
class SuperManager:
    def __init__(self):
        self.data = []
        self.cache = {}
        self.logged_in = False
        self.retry_count = 3
        self.timeout = 1000
        self.debug_mode = True
        
        # Mixing different types in a collection
        self.settings = [
            "debug_mode",
            42,
            {"key": "value"},
            lambda x: x*2
        ]

    # Method does way too many things - violates SRP
    def process_data(self, input_data):
        # Step 1: Validate
        is_valid = True
        for item in input_data:
            if not item or len(item) < 3:
                is_valid = False
                # Error handling with print instead of proper error handling
                print(f"Invalid data found: {item}")
        
        # Step 2: Transform data (with duplicate code patterns)
        transformed_data = []
        for i, item in enumerate(input_data):
            transformed_data.append({
                'id': i + 1,
                'value': item,
                'timestamp': time.time(),
                'modified': False
            })
        
        # Step 3: Save to database
        for item in transformed_data:
            # Direct SQL in code - mixing concerns and SQL injection vulnerability
            sql = f"INSERT INTO data VALUES ({item['id']}, '{item['value']}')"
            self.execute_sql(sql)
            
            # Redundant logging
            print(f"Saved item: {item['id']}")
            print(f"With value: {item['value']}")
        
        # Step 4: Update cache
        for item in transformed_data:
            self.cache[item['id']] = item
        
        # Step 5: Generate report
        report = "Data Processing Report\n"
        report += "----------------------\n"
        report += f"Total items: {len(transformed_data)}\n"
        report += f"Valid items: {len(transformed_data) if is_valid else 'ERROR'}\n"
        report += f"Timestamp: {datetime.datetime.now().isoformat()}\n"
        
        # Step 6: Send notifications
        for user in g_users:
            if user.get('role') == 'admin':
                self.send_email(user['email'], "Data Processing Complete", report)
        
        # Return multiple different types based on condition - unpredictable
        if is_valid:
            return transformed_data
        else:
            return False
    
    # Method with side effects not clear from its name
    def get_data(self):
        # Side effect: this method name suggests it just retrieves data
        # but it also modifies the database
        self.data.append({'id': time.time(), 'value': "hidden update"})
        return self.data
    
    # Method with unnecessary complexity and poor error handling
    def update_inventory(self, order):
        try:
            for item in order.get('items', []):
                for product in g_products:
                    if product['id'] == item['product_id']:
                        product['inventory'] -= item['quantity']
                        
                        # Check if we need to reorder
                        if product['inventory'] < product.get('reorder_level', 10):
                            self.place_restock_order(product)
                        
                        break
        except Exception as error:
            # Swallowing errors and continuing silently
            print(f"Error updating inventory: {str(error)}")
    
    # Method with temporal coupling (must be called in specific order)
    def place_restock_order(self, product):
        # This method assumes certain methods have been called before it
        print(f"Placing restock order for {product['name']}")
        
        # Hard-coded email address
        self.send_email(
            "supplier@example.com",
            f"Restock Order for {product['name']}",
            f"Please send us {product.get('reorder_quantity', 50)} units of {product['name']}"
        )
    
    # Method doing database operations, logging, and error handling all in one
    def execute_sql(self, sql):
        try:
            print(f"Executing SQL: {sql}")
            
            # Pretend to execute SQL
            global g_db_connection
            if not g_db_connection:
                raise Exception("No database connection")
            
            # Database operation
            result = {'success': True, 'row_count': 1}
            
            # Logging
            print("SQL executed successfully")
            print(f"Rows affected: {result['row_count']}")
            
            return result
        except Exception as error:
            # Swallowing errors - bad practice
            print(f"Error executing SQL: {str(error)}")
            return {'success': False}
    
    # Method with boolean flag parameter - often a sign of doing too much
    def send_email(self, to, subject, body, is_html=False, cc=None, bcc=None):
        if cc is None:
            cc = []
        if bcc is None:
            bcc = []
            
        if is_html:
            # Send HTML email
            print(f"Sending HTML email to {to} with subject \"{subject}\"")
        else:
            # Send plain text email
            print(f"Sending plain text email to {to} with subject \"{subject}\"")
        
        # Actual implementation omitted
        return True
    
    # Method with different behavior based on parameters - violates SRP
    def save_data(self, data, type_):
        if type_ == 'user':
            g_users.append(data)
        elif type_ == 'product':
            g_products.append(data)
        elif type_ == 'order':
            g_orders.append(data)
            self.update_inventory(data)
            self.send_order_confirmation(data)
        else:
            self.data.append(data)
    
    # Method with completely misleading name
    def validate_input(self, input_text):
        # This doesn't actually validate anything, it transforms
        return input_text.upper()
    
    # Long method with no clear structure
    def process_order(self, order):
        # Type coercion without warning
        order_id = order.get('id', 0)
        if isinstance(order_id, str):
            order_id = int(order_id)
        
        # Validate order
        if not order.get('items') or len(order['items']) == 0:
            print("Order has no items")
            return False
        
        # Calculate total
        total = 0
        for item in order['items']:
            total += item['price'] * item['quantity']
        
        # Apply discount with duplicate code
        coupon_code = order.get('coupon_code', '')
        if coupon_code == "SAVE10":
            total = total * 0.9
        elif coupon_code == "SAVE20":
            total = total * 0.8
        elif coupon_code == "HALF":
            total = total * 0.5
        
        # Check inventory with nested loops
        for item in order['items']:
            product = None
            
            # Find product - repeating this loop for each order item is inefficient
            for p in g_products:
                if p['id'] == item['product_id']:
                    product = p
                    break
            
            if not product:
                print(f"Product not found: {item['product_id']}")
                return False
            
            if product['inventory'] < item['quantity']:
                print(f"Not enough inventory for product: {product['name']}")
                return False
        
        # Process payment
        payment_successful = self.process_payment(order.get('payment_method', 'credit_card'), total)
        if not payment_successful:
            print("Payment failed")
            return False
        
        # Update inventory - repeating the same search
        for item in order['items']:
            # Find product again - repeating the same search as above
            for p in g_products:
                if p['id'] == item['product_id']:
                    p['inventory'] -= item['quantity']
                    break
        
        # Create order record
        new_order = {
            'id': f"ORD{int(time.time())}",
            'items': order['items'],
            'total': total,
            'customer': order['customer'],
            'status': "completed",
            'date': datetime.datetime.now()
        }
        
        g_orders.append(new_order)
        
        # Send confirmation email
        self.send_email(
            order['customer']['email'],
            "Order Confirmation",
            f"Your order #{new_order['id']} has been processed. Total: ${total:.2f}"
        )
        
        # Update analytics
        self.track_event("order_completed", {
            'order_id': new_order['id'],
            'total': total,
            'items': len(order['items'])
        })
        
        print("Order processed successfully")
        return new_order['id']
    
    # Method tracking analytics - mixed responsibility
    def track_event(self, event, data):
        print(f"Tracking event: {event}")
        print(f"Event data: {data}")
        
        # Simulating analytics tracking
        analytics_data = {
            'event': event,
            'data': data,
            'timestamp': time.time(),
            'user': g_current_user['id'] if g_current_user else "anonymous"
        }
        
        # Direct HTTP request in method (fictional in this case)
        print(f"POST request to analytics API with data: {json.dumps(analytics_data)}")

    # Method that sends order confirmation with duplicate logic
    def send_order_confirmation(self, order):
        email_body = "Thank you for your order!\n\n"
        email_body += f"Order ID: {order['id']}\n"
        email_body += f"Date: {datetime.datetime.now().isoformat()}\n\n"
        email_body += "Items:\n"
        
        total = 0
        
        # Duplicated calculation logic from process_order
        for item in order['items']:
            product = None
            
            for p in g_products:
                if p['id'] == item['product_id']:
                    product = p
                    break
            
            if product:
                item_total = product['price'] * item['quantity']
                email_body += f"{product['name']} x {item['quantity']}: ${item_total:.2f}\n"
                total += item_total
        
        email_body += f"\nTotal: ${total:.2f}"
        
        self.send_email(order['customer']['email'], "Order Confirmation", email_body)


# Poor inheritance hierarchy - violates LSP
class Animal:
    def __init__(self, name):
        self.name = name
    
    def make_sound(self):
        raise NotImplementedError("This method must be implemented by subclasses")
    
    def fly(self):
        print(f"{self.name} is flying!")
    
    def swim(self):
        print(f"{self.name} is swimming!")


# Forced to implement methods that don't make sense
class Dog(Animal):
    def make_sound(self):
        print("Woof!")
    
    def fly(self):
        # Dogs can't fly, but the parent class assumes they can
        raise ValueError("Dogs can't fly")


# LSP violation - changing behavior in a harmful way
class Bird(Animal):
    def make_sound(self):
        print("Tweet!")
    
    def swim(self):
        # Some birds can swim, but this one can't
        return f"This bird can't swim"  # Violates LSP by returning instead of printing


# Interface segregation principle violation - fat interface
class Employee:
    def __init__(self, name, position):
        self.name = name
        self.position = position
    
    # Methods that not all employees will use
    def write_software(self):
        raise NotImplementedError("Not all employees write software")
    
    def design_architecture(self):
        raise NotImplementedError("Not all employees design architecture")
    
    def attend_meetings(self):
        print(f"{self.name} is attending meetings")
    
    def write_documentation(self):
        raise NotImplementedError("Not all employees write documentation")
    
    def manage_team(self):
        raise NotImplementedError("Not all employees manage teams")


# Forced to implement methods that aren't relevant
class Developer(Employee):
    def write_software(self):
        print(f"{self.name} is writing software")
    
    def design_architecture(self):
        # Not all developers design architecture
        raise ValueError("This developer doesn't design architecture")
    
    def write_documentation(self):
        print(f"{self.name} is writing documentation")
    
    def manage_team(self):
        # Most developers don't manage teams
        raise ValueError("This developer doesn't manage teams")


# Dependency inversion principle violation - high-level module depends on low-level module
class UserService:
    def __init__(self):
        # Direct dependency on concrete implementation
        self.database = SQLiteDatabase()
    
    def get_user(self, id_):
        # Direct dependency on specific implementation
        return self.database.query(f"SELECT * FROM users WHERE id = {id_}")
    
    def save_user(self, user):
        # String concatenation for SQL - SQL injection vulnerability
        sql = f"INSERT INTO users VALUES ('{user['name']}', '{user['email']}')"
        return self.database.execute(sql)


# Concrete low-level module
class SQLiteDatabase:
    def query(self, sql):
        print(f"Executing SQLite query: {sql}")
        return {'id': 1, 'name': "John", 'email': "john@example.com"}
    
    def execute(self, sql):
        print(f"Executing SQLite statement: {sql}")
        return True


# Type hints that are inconsistent or confusing
def process_data_with_weird_types(
    data: List[Dict[str, Any]], 
    options: Union[Dict[str, Any], List[str], str, int] = None,
    callback: Optional[Any] = None
) -> Union[Dict[str, Any], List[Dict[str, Any]], bool, None]:
    """Process data with confusing type annotations"""
    if options is None:
        options = {}
    
    # Type handling that's inconsistent
    if isinstance(options, str):
        options = {'mode': options}
    elif isinstance(options, int):
        options = {'limit': options}
    elif isinstance(options, list):
        options = {'filters': options}
    
    # More unnecessary conditions
    if len(data) == 0:
        return None
    
    if 'mode' in options and options['mode'] == 'count':
        return {'count': len(data)}
    
    if callback:
        try:
            # Callback could be anything
            result = callback(data)
            return result
        except Exception as e:
            print(f"Callback error: {e}")
            return False
    
    return data


# Main application code - messy and procedural
def init_app():
    print("Initializing application...")
    
    # Initialize global database connection
    global g_db_connection
    g_db_connection = {
        'connected': True,
        'server': "localhost",
        'username': "root",
        'password': "password123"  # Hard-coded credentials
    }
    
    # Create some test data
    g_users.append({'id': 1, 'name': "Admin", 'email': "admin@example.com", 'role': "admin"})
    g_users.append({'id': 2, 'name': "User", 'email': "user@example.com", 'role': "user"})
    
    g_products.append({'id': 1, 'name': "Product 1", 'price': 9.99, 'inventory': 100, 'reorder_level': 10, 'reorder_quantity': 50})
    g_products.append({'id': 2, 'name': "Product 2", 'price': 19.99, 'inventory': 50, 'reorder_level': 5, 'reorder_quantity': 20})
    
    print(f"Application initialized with {len(g_users)} users and {len(g_products)} products")
    
    # Declare and immediately set a global variable
    manager = None
    manager = SuperManager()
    
    # Unnecessary lambda
    do_nothing = lambda x: x
    do_nothing("useless call")
    
    return manager


# Redundant comments stating the obvious
# This function logs in a user
def login(username, password):
    # Check if the username exists
    user = None
    for u in g_users:
        # If the username matches
        if u['name'] == username:
            # Set the user
            user = u
            # Break out of the loop
            break
    
    # If user not found
    if not user:
        # Return false
        return False
    
    # Hardcoded password check - security issue
    if password == "password123":
        # Set global variables
        global g_logged_in, g_current_user
        g_logged_in = True
        g_current_user = user
        
        # Return true
        return True
    
    # Return false
    return False


# Mixed naming convention (snake_case and camelCase)
def processOrder(order_data):
    superManager = SuperManager()
    return superManager.process_order(order_data)


# Using a function when a class method would be appropriate
def add_product_to_order(order, product_id, quantity):
    # Finding product with redundant logic
    product = None
    for p in g_products:
        if p['id'] == product_id:
            product = p
            break
    
    if not product:
        return False
    
    if product['inventory'] < quantity:
        return False
    
    # Create an order item
    item = {
        'product_id': product_id,
        'quantity': quantity,
        'price': product['price']
    }
    
    # Add to order
    if 'items' not in order:
        order['items'] = []
    
    order['items'].append(item)
    
    return True


# Utility function that does way too much
def utility_function():
    # Generate a random password
    password = ''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(10))
    
    # Create a database file
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    
    # Create tables
    c.execute('''
    CREATE TABLE IF NOT EXISTS users
    (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)
    ''')
    
    c.execute('''
    CREATE TABLE IF NOT EXISTS products
    (id INTEGER PRIMARY KEY, name TEXT, price REAL, inventory INTEGER)
    ''')
    
    # Clean old files
    for file in os.listdir('.'):
        if file.endswith('.tmp'):
            os.remove(file)
    
    # Set environment variables
    os.environ['APP_MODE'] = 'development'
    
    conn.commit()
    conn.close()
    
    # Return multiple unrelated values
    return password, conn, True


# Initialize application
app = init_app()

# Main export with inconsistent style
__all__ = [
    'app',
    'processOrder',
    'login',
    'fx',
    'utility_function',
] 