// Check if admin is logged in
if (!sessionStorage.getItem('adminLoggedIn')) {
    window.location.href = 'admin-login.html';
}

// Sample data storage (in production, this would be in a database)
let menuItems = [
    { id: 1, name: 'Americano', category: 'espresso', price: 4.15, status: 'active', description: 'Classic espresso with hot water' },
    { id: 2, name: 'Cafe Latte', category: 'espresso', price: 6.25, status: 'active', description: 'Espresso with steamed milk' },
    { id: 3, name: 'Cappuccino', category: 'espresso', price: 6.25, status: 'active', description: 'Espresso with foamed milk' },
    { id: 4, name: 'Flat White', category: 'espresso', price: 6.25, status: 'active', description: 'Espresso with microfoam' },
    { id: 5, name: 'Green Tea', category: 'tea', price: 3.50, status: 'active', description: 'Premium green tea' },
    { id: 6, name: 'Chai Latte', category: 'tea', price: 5.25, status: 'active', description: 'Spiced tea with milk' },
    { id: 7, name: 'Iced Coffee', category: 'iced', price: 4.50, status: 'active', description: 'Cold brewed coffee' },
    { id: 8, name: 'Iced Latte', category: 'iced', price: 5.75, status: 'active', description: 'Espresso with cold milk' },
    { id: 9, name: 'Berry Smoothie', category: 'smoothies', price: 6.50, status: 'active', description: 'Mixed berries smoothie' },
    { id: 10, name: 'Mango Smoothie', category: 'smoothies', price: 6.50, status: 'active', description: 'Fresh mango smoothie' },
    { id: 11, name: 'Club Sandwich', category: 'savory', price: 8.99, status: 'active', description: 'Triple decker sandwich' },
    { id: 12, name: 'Chicken Panini', category: 'savory', price: 9.50, status: 'active', description: 'Grilled chicken panini' },
    { id: 13, name: 'Chocolate Croissant', category: 'sweet', price: 4.25, status: 'active', description: 'Butter croissant with chocolate' },
    { id: 14, name: 'Blueberry Muffin', category: 'sweet', price: 3.75, status: 'active', description: 'Fresh baked muffin' }
];

let orders = [
    {
        id: 1001,
        customer: 'John Smith',
        date: '2025-01-30',
        items: [
            { name: 'Americano', quantity: 2, price: 4.15 },
            { name: 'Chocolate Croissant', quantity: 1, price: 4.25 }
        ],
        total: 12.55,
        status: 'completed'
    },
    {
        id: 1002,
        customer: 'Sarah Johnson',
        date: '2025-01-30',
        items: [
            { name: 'Cafe Latte', quantity: 1, price: 6.25 },
            { name: 'Blueberry Muffin', quantity: 2, price: 3.75 }
        ],
        total: 13.75,
        status: 'completed'
    },
    {
        id: 1003,
        customer: 'Mike Davis',
        date: '2025-01-29',
        items: [
            { name: 'Berry Smoothie', quantity: 1, price: 6.50 },
            { name: 'Club Sandwich', quantity: 1, price: 8.99 }
        ],
        total: 15.49,
        status: 'pending'
    },
    {
        id: 1004,
        customer: 'Emily Brown',
        date: '2025-01-29',
        items: [
            { name: 'Iced Coffee', quantity: 3, price: 4.50 },
            { name: 'Chicken Panini', quantity: 2, price: 9.50 }
        ],
        total: 32.50,
        status: 'completed'
    },
    {
        id: 1005,
        customer: 'Tom Wilson',
        date: '2025-01-28',
        items: [
            { name: 'Cappuccino', quantity: 1, price: 6.25 }
        ],
        total: 6.25,
        status: 'cancelled'
    }
];

// Load from localStorage if available
const storedItems = localStorage.getItem('cafeMenuItems');
const storedOrders = localStorage.getItem('cafeOrders');
if (storedItems) menuItems = JSON.parse(storedItems);
if (storedOrders) orders = JSON.parse(storedOrders);

// Tab Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.id === 'logoutBtn') {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
            return;
        }

        e.preventDefault();
        const tab = this.getAttribute('data-tab');
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding tab
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tab + 'Tab').classList.add('active');
        
        // Load data for the tab
        if (tab === 'menu') {
            loadMenuItems();
        } else if (tab === 'orders') {
            loadOrders();
            updateStats();
        }
    });
});

// Menu Management Functions
function loadMenuItems(filter = 'all') {
    const tbody = document.getElementById('menuItemsTable');
    tbody.innerHTML = '';
    
    const filtered = filter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filter);
    
    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.name}</td>
            <td>${getCategoryName(item.category)}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getCategoryName(category) {
    const names = {
        'espresso': 'Espresso & Coffee',
        'tea': 'Tea',
        'iced': 'Iced Drinks',
        'smoothies': 'Smoothies',
        'savory': 'Savory',
        'sweet': 'Sweet'
    };
    return names[category] || category;
}

// Category Filter
document.getElementById('categoryFilter').addEventListener('change', function() {
    loadMenuItems(this.value);
});

// Add Item Button
document.getElementById('addItemBtn').addEventListener('click', function() {
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemModal').classList.add('active');
});

// Close Modal
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('itemModal').classList.remove('active');
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('itemModal').classList.remove('active');
});

// Submit Item Form
document.getElementById('itemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('itemId').value;
    const item = {
        id: id ? parseInt(id) : menuItems.length + 1,
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        status: document.getElementById('itemStatus').value,
        description: document.getElementById('itemDescription').value
    };
    
    if (id) {
        // Update existing item
        const index = menuItems.findIndex(i => i.id === parseInt(id));
        menuItems[index] = item;
    } else {
        // Add new item
        menuItems.push(item);
    }
    
    // Save to localStorage
    localStorage.setItem('cafeMenuItems', JSON.stringify(menuItems));
    
    // Reload table
    loadMenuItems(document.getElementById('categoryFilter').value);
    
    // Close modal
    document.getElementById('itemModal').classList.remove('active');
    
    alert(id ? 'Item updated successfully!' : 'Item added successfully!');
});

// Edit Item
function editItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemStatus').value = item.status;
    document.getElementById('itemDescription').value = item.description || '';
    
    document.getElementById('itemModal').classList.add('active');
}

// Delete Item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        localStorage.setItem('cafeMenuItems', JSON.stringify(menuItems));
        loadMenuItems(document.getElementById('categoryFilter').value);
        alert('Item deleted successfully!');
    }
}

// Order Management Functions
function loadOrders(statusFilter = 'all', dateFilter = '') {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    
    let filtered = orders;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter) {
        filtered = filtered.filter(order => order.date === dateFilter);
    }
    
    filtered.forEach(order => {
        const row = document.createElement('tr');
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${itemCount} item(s)</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <button class="btn btn-info" onclick="viewOrderDetails(${order.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Order Filters
document.getElementById('orderStatusFilter').addEventListener('change', function() {
    loadOrders(this.value, document.getElementById('orderDateFilter').value);
});

document.getElementById('orderDateFilter').addEventListener('change', function() {
    loadOrders(document.getElementById('orderStatusFilter').value, this.value);
});

// View Order Details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const detailsHtml = `
        <div class="order-info">
            <div class="order-info-row">
                <strong>Order ID:</strong>
                <span>#${order.id}</span>
            </div>
            <div class="order-info-row">
                <strong>Customer:</strong>
                <span>${order.customer}</span>
            </div>
            <div class="order-info-row">
                <strong>Date:</strong>
                <span>${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-info-row">
                <strong>Status:</strong>
                <span class="status-badge ${order.status}">${order.status}</span>
            </div>
        </div>
        <div class="order-items">
            <h3>Order Items:</h3>
            ${order.items.map(item => `
                <div class="order-item">
                    <div>
                        <strong>${item.name}</strong>
                        <div style="font-size: 13px; color: #666;">Qty: ${item.quantity}</div>
                    </div>
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            `).join('')}
            <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #dee2e6;">
                <strong style="font-size: 18px;">Total: $${order.total.toFixed(2)}</strong>
            </div>
        </div>
    `;
    
    document.getElementById('orderDetails').innerHTML = detailsHtml;
    document.getElementById('orderModal').classList.add('active');
}

// Close Order Modal
document.getElementById('closeOrderModal').addEventListener('click', function() {
    document.getElementById('orderModal').classList.remove('active');
});

// Update Stats
function updateStats() {
    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
    
    const totalOrders = orders.length;
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgOrderValue').textContent = '$' + avgOrderValue.toFixed(2);
}

// Initialize
loadMenuItems();
loadOrders();
updateStats();