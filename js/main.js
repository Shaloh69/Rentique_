// Main JavaScript file for Rentique

// Configuration
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/YourRentiquePage'; // Replace with actual Facebook page URL
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

// Display products in the grid
function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');

    if (!productGrid) return;

    if (products.length === 0) {
        productGrid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="card-media">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/logo.png'">
            </div>
            <div class="card-body">
                <div class="product-title">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn-order" onclick="orderProduct(${product.id})">Order Now</button>
            </div>
        </div>
    `).join('');

    // Add click event to product cards for modal
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-order')) {
                const productId = parseInt(card.dataset.id);
                showProductModal(productId);
            }
        });
    });
}

// Filter products by category
function filterByCategory(category) {
    currentCategory = category;

    // Update active category button
    document.querySelectorAll('.category-nav li').forEach(li => {
        li.classList.remove('cat-active');
    });
    event.target.classList.add('cat-active');

    // Filter products
    if (category === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(p => p.category === category.toLowerCase());
    }

    // Apply search filter if active
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value.trim()) {
        searchProducts(searchInput.value);
    } else {
        displayProducts(filteredProducts);
    }
}

// Search products
function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
        displayProducts(filteredProducts);
        return;
    }

    const searchResults = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    displayProducts(searchResults);
}

// Order product - redirect to Facebook
function orderProduct(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (product) {
        // Create a message to send to Facebook
        const message = `Hi! I'm interested in ordering: ${product.name} ($${product.price.toFixed(2)})`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);

        // Redirect to Facebook page with pre-filled message
        // If the user wants to use Facebook Messenger, use this format:
        window.open(`${FACEBOOK_PAGE_URL}`, '_blank');

        // Show confirmation
        showNotification(`Redirecting to Facebook to complete your order for ${product.name}`);
    }
}

// Show product detail modal
function showProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/logo.png'">
                </div>
                <div class="modal-details">
                    <h2 class="modal-title">${product.name}</h2>
                    <div class="modal-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
                    <div class="modal-price">$${product.price.toFixed(2)}</div>
                    <p class="modal-description">${product.description}</p>
                    <button class="btn-order-large" onclick="orderProduct(${product.id})">
                        Order on Facebook
                    </button>
                    <div class="modal-note">
                        <small>Click "Order on Facebook" to connect with us and place your order</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animate in
    setTimeout(() => modal.classList.add('active'), 10);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show error
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.innerHTML = '';
        productGrid.appendChild(errorDiv);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load products if on products page
    if (document.querySelector('.product-grid')) {
        loadProducts();
    }

    // Setup category filters
    const categoryItems = document.querySelectorAll('.category-nav li');
    categoryItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            const categories = ['all', 'women', 'men', 'kiddies'];
            filterByCategory(categories[index]);
        });
    });

    // Setup search
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts(e.target.value);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchProducts(searchInput.value);
            }
        });
    }

    // Setup navigation links
    setupNavigation();

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Setup navigation
function setupNavigation() {
    // Get all navigation items
    const navItems = document.querySelectorAll('.topnav li');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const text = item.textContent.trim().toLowerCase();

            switch(text) {
                case 'products':
                    window.location.href = 'products.html';
                    break;
                case 'about':
                case 'my rents':
                    window.location.href = 'index.html';
                    break;
                case 'pricing':
                case 'contact':
                    // Scroll to footer for contact
                    document.querySelector('.footer')?.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        });
    });

    // Logo click
    const logoWrap = document.querySelector('.logo-wrap');
    if (logoWrap) {
        logoWrap.style.cursor = 'pointer';
        logoWrap.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Hero buttons
    const exploreBtn = document.querySelector('.btn-outline');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }

    const viewServicesLink = document.querySelector('.link-cta');
    if (viewServicesLink) {
        viewServicesLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'products.html';
        });
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
