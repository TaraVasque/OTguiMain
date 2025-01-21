// Switch sections and ensure only the selected one is visible
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section, .form-container');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById(sectionId).style.display = 'block'; // Show the selected section
}

// Fetch orders and update UI
function fetchOrders() {
    fetch('/orders')
        .then(response => response.json())
        .then(data => {
            const orderList = document.getElementById('orderList');
            orderList.innerHTML = '';
            data.forEach((order, index) => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div>
                        <p><strong>Order:</strong> ${order.name}</p>
                        <p><strong>Type:</strong> ${order.type}</p>
                        <p><strong>Price:</strong> $${order.price.toFixed(2)}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                    </div>
                    <button onclick="deleteOrder(${index})">Delete</button>
                `;
                orderList.appendChild(orderItem);
            });
        });
}

// Fetch and display total cost in a receipt-like style
function displayTotalCost() {
    fetch('/orders')
        .then(response => response.json())
        .then(data => {
            const receipt = document.getElementById('receipt');
            const totalCost = data.reduce((total, order) => total + order.price, 0);

            receipt.innerHTML = ''; // Clear previous receipt
            data.forEach(order => {
                const receiptItem = document.createElement('div');
                receiptItem.className = 'receipt-item';
                receiptItem.innerHTML = `
                    <p><strong>${order.name}</strong></p>
                    <p>$${order.price.toFixed(2)}</p>
                `;
                receipt.appendChild(receiptItem);
            });

            document.getElementById('totalCostValue').innerText = `Total Cost: $${totalCost.toFixed(2)}`;
        });
}

// Add new order
function addOrder() {
    const name = document.getElementById('orderName').value;
    const price = parseFloat(document.getElementById('orderPrice').value);
    const type = document.getElementById('orderType').value;
    const phone = document.getElementById('orderPhone').value;

    if (!name || isNaN(price) || price <= 0 || !type || !phone) {
        alert('Please fill in all fields correctly.');
        return;
    }

    fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, type, phone })
    })
    .then(response => response.json())
    .then(() => {
        alert('Order added successfully');
        fetchOrders();  // Refresh the order list
        document.getElementById('addOrderForm').reset();  // Reset form fields
    })
    .catch(error => console.error('Error:', error));
}

// Delete an order
function deleteOrder(index) {
    fetch(`/orders/${index}`, { method: 'DELETE' })
        .then(() => {
            alert('Order deleted successfully');
            fetchOrders(); // Refresh the order list
        })
        .catch(error => console.error('Error:', error));
}

// Export orders to Excel
function exportOrders() {
    fetch('/export')
        .then(response => response.json())
        .then(data => alert(data.message));
}

// Import orders from Excel
function importOrders() {
    fetch('/import', { method: 'POST' })
        .then(response => response.json())
        .then(data => alert(data.message));
}

// Initial setup
window.onload = function() {
    showSection('viewOrders');  // Show view orders by default
    fetchOrders();  // Load the list of orders
    displayTotalCost();  // Display the total cost
}
