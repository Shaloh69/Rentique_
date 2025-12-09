// Authentication Module for Rentique

// Current user session
let currentUser = JSON.parse(localStorage.getItem('rentique_user')) || null;
let allUsers = [];

// Load users from JSON
async function loadUsers() {
    try {
        const response = await fetch('data/users.json');
        const data = await response.json();
        allUsers = data.users;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Initialize auth on page load
loadUsers();

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Login function
async function login(email, password) {
    // Ensure users are loaded
    if (allUsers.length === 0) {
        await loadUsers();
    }

    const user = allUsers.find(u => u.email === email && u.password === password);

    if (user) {
        // Store user info (without password)
        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        currentUser = userSession;
        localStorage.setItem('rentique_user', JSON.stringify(userSession));

        return { success: true, user: userSession };
    } else {
        return { success: false, message: 'Invalid email or password' };
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('rentique_user');

    // Redirect to home page
    window.location.href = 'index.html';
}

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.id = 'login-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeLoginModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeLoginModal()">&times;</button>
            <div class="login-modal">
                <h2 class="modal-title">Login to Rentique</h2>
                <form class="login-form" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="login-email">Email Address</label>
                        <input
                            type="email"
                            id="login-email"
                            class="form-input"
                            placeholder="Enter your email"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            class="form-input"
                            placeholder="Enter your password"
                            required
                        >
                    </div>
                    <div id="login-error" class="login-error"></div>
                    <button type="submit" class="btn-order-large">Login</button>
                    <div class="login-demo-info">
                        <p><strong>Demo Credentials:</strong></p>
                        <p>Admin: admin@rentique.com / admin123</p>
                        <p>User: user@rentique.com / user123</p>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = await login(email, password);

    if (result.success) {
        closeLoginModal();
        showNotification(`Welcome back, ${result.user.name}!`);

        // Reload page to update UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        errorDiv.textContent = result.message;
        errorDiv.style.display = 'block';
    }
}

// Update navigation based on login status
function updateNavigation() {
    // Update desktop navigation
    const authDiv = document.querySelector('.nav-actions');

    if (!authDiv) return;

    // Check if auth buttons already exist
    let authButtonsContainer = document.querySelector('.auth-buttons');

    if (!authButtonsContainer) {
        authButtonsContainer = document.createElement('div');
        authButtonsContainer.className = 'auth-buttons';
        authDiv.insertBefore(authButtonsContainer, authDiv.firstChild);
    }

    if (isLoggedIn()) {
        authButtonsContainer.innerHTML = `
            <div class="user-menu">
                <button class="icon-btn user-btn" onclick="toggleUserMenu()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="user-info">
                        <strong>${currentUser.name}</strong>
                        <small>${currentUser.email}</small>
                        ${currentUser.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                    </div>
                    ${currentUser.role === 'admin' ? '<button onclick="showAdminPanel()" class="dropdown-item">Admin Panel</button>' : ''}
                    <button onclick="logout()" class="dropdown-item logout-btn">Logout</button>
                </div>
            </div>
        `;
    } else {
        authButtonsContainer.innerHTML = `
            <button class="icon-btn login-btn" onclick="showLoginModal()" title="Login">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
            </button>
        `;
    }
}

// Toggle user dropdown menu
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');

    if (dropdown && userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Show admin panel
function showAdminPanel() {
    if (!isAdmin()) {
        showNotification('Access denied. Admin only.');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.id = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeAdminPanel()"></div>
        <div class="modal-content admin-panel-content">
            <button class="modal-close" onclick="closeAdminPanel()">&times;</button>
            <div class="admin-panel">
                <h2 class="modal-title">Admin Panel</h2>

                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="showAdminTab('add-product')">Add Product</button>
                    <button class="admin-tab" onclick="showAdminTab('manage-products')">Manage Products</button>
                </div>

                <!-- Add Product Form -->
                <div id="add-product-tab" class="admin-tab-content active">
                    <h3>Add New Product</h3>
                    <form class="admin-form" onsubmit="handleAddProduct(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-name">Product Name *</label>
                                <input type="text" id="product-name" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="product-category">Category *</label>
                                <select id="product-category" class="form-input" required>
                                    <option value="women">Women</option>
                                    <option value="men">Men</option>
                                    <option value="kiddies">Kiddies</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-price">Price ($) *</label>
                                <input type="number" id="product-price" class="form-input" step="0.01" min="0" required>
                            </div>
                            <div class="form-group">
                                <label for="product-image">Image URL *</label>
                                <input type="text" id="product-image" class="form-input" placeholder="images/products/..." required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description *</label>
                            <textarea id="product-description" class="form-input" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="product-featured"> Featured Product
                            </label>
                        </div>
                        <button type="submit" class="btn-order-large">Add Product</button>
                    </form>
                </div>

                <!-- Manage Products Tab -->
                <div id="manage-products-tab" class="admin-tab-content">
                    <h3>Manage Products</h3>
                    <div id="admin-products-list" class="admin-products-list">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);

    // Load products into manage tab
    loadAdminProducts();
}

// Close admin panel
function closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Show admin tab
function showAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Handle add product
function handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const description = document.getElementById('product-description').value;
    const featured = document.getElementById('product-featured').checked;

    // Get custom products from localStorage
    let customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];

    // Generate new ID
    const newId = Math.max(...allProducts.map(p => p.id), ...customProducts.map(p => p.id), 0) + 1;

    const newProduct = {
        id: newId,
        name,
        category,
        price,
        image,
        description,
        featured,
        custom: true // Mark as custom product
    };

    customProducts.push(newProduct);
    localStorage.setItem('rentique_custom_products', JSON.stringify(customProducts));

    // Add to allProducts array
    allProducts.push(newProduct);

    showNotification(`Product "${name}" added successfully!`);

    // Reset form
    event.target.reset();

    // Reload products if on products page
    if (document.querySelector('.product-grid')) {
        loadProducts();
    }
}

// Load admin products list
function loadAdminProducts() {
    const customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];
    const productsList = document.getElementById('admin-products-list');

    if (!productsList) return;

    if (customProducts.length === 0) {
        productsList.innerHTML = '<p class="no-products-msg">No custom products added yet.</p>';
        return;
    }

    productsList.innerHTML = customProducts.map(product => `
        <div class="admin-product-item">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/logo.png'">
            <div class="admin-product-details">
                <h4>${product.name}</h4>
                <p>${product.category} - $${product.price.toFixed(2)}</p>
                <small>${product.description}</small>
            </div>
            <button class="btn-remove" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
    `).join('');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    let customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];
    customProducts = customProducts.filter(p => p.id !== productId);
    localStorage.setItem('rentique_custom_products', JSON.stringify(customProducts));

    // Remove from allProducts
    allProducts = allProducts.filter(p => p.id !== productId);

    showNotification('Product deleted successfully');

    // Reload admin products list
    loadAdminProducts();

    // Reload products if on products page
    if (document.querySelector('.product-grid')) {
        loadProducts();
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});
