// Main JavaScript file for Rentique

// Configuration
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/YourRentiquePage'; // Replace with actual Facebook page URL
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Cart and Wishlist (stored in localStorage)
let cart = JSON.parse(localStorage.getItem('rentique_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('rentique_wishlist')) || [];

// Update cart and wishlist counts
function updateCounts() {
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');

    if (cartCount) cartCount.textContent = cart.length;
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && !cart.find(item => item.id === productId)) {
        cart.push(product);
        localStorage.setItem('rentique_cart', JSON.stringify(cart));
        updateCounts();
        showNotification(`${product.name} added to cart`);
    }
}

// Add to wishlist
function addToWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && !wishlist.find(item => item.id === productId)) {
        wishlist.push(product);
        localStorage.setItem('rentique_wishlist', JSON.stringify(wishlist));
        updateCounts();
        showNotification(`${product.name} added to wishlist`);
    }
}

// View cart
function viewCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    const cartMessage = cart.map(item => `${item.name} - $${item.price.toFixed(2)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    showCartModal();
}

// View wishlist
function viewWishlist() {
    if (wishlist.length === 0) {
        showNotification('Your wishlist is empty');
        return;
    }

    showWishlistModal();
}

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;

        // Load deleted products list
        const deletedProducts = JSON.parse(localStorage.getItem('rentique_deleted_products')) || [];

        // Filter out deleted products
        allProducts = allProducts.filter(p => !deletedProducts.includes(p.id));

        // Load edited products from localStorage
        const editedProducts = JSON.parse(localStorage.getItem('rentique_edited_products')) || [];

        // Replace original products with edited versions
        editedProducts.forEach(editedProduct => {
            const index = allProducts.findIndex(p => p.id === editedProduct.id);
            if (index !== -1) {
                allProducts[index] = editedProduct;
            }
        });

        // Load custom products from localStorage (added by admin)
        const customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];

        // Merge custom products with JSON products
        allProducts = [...allProducts, ...customProducts];

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
                    <div class="modal-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id}); closeModal();">
                            Add to Cart
                        </button>
                        <button class="btn-add-wishlist" onclick="addToWishlist(${product.id}); closeModal();">
                            Add to Wishlist
                        </button>
                    </div>
                    <button class="btn-order-large" onclick="orderProduct(${product.id})">
                        Order on Facebook
                    </button>
                    <div class="modal-note">
                        <small>Add to cart or order directly on Facebook</small>
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

    // Update counts on load
    updateCounts();

    // Setup mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    // Mobile nav items
    const mobileNavItems = document.querySelectorAll('.mobile-nav li');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    // Cart and wishlist buttons
    const cartBtn = document.querySelector('.cart-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');

    if (cartBtn) {
        cartBtn.addEventListener('click', viewCart);
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', viewWishlist);
    }
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

// Navigate to page function
function navigateToPage(page) {
    switch(page) {
        case 'index':
            window.location.href = 'index.html';
            break;
        case 'products':
            window.location.href = 'products.html';
            break;
        case 'about':
            window.location.href = 'index.html#mission';
            break;
        case 'contact':
            window.location.href = 'index.html#footer';
            break;
    }
}

// Show Cart Modal
function showCartModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="cart-modal">
                <h2 class="modal-title">Your Cart</h2>
                <div class="cart-items">
                    ${cart.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-total">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
                <button class="btn-order-large" onclick="orderCart()">
                    Order via Facebook
                </button>
                <button class="btn-clear-cart" onclick="clearCart()">Clear Cart</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Show Wishlist Modal
function showWishlistModal() {
    if (wishlist.length === 0) {
        showNotification('Your wishlist is empty');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="cart-modal">
                <h2 class="modal-title">Your Wishlist</h2>
                <div class="cart-items">
                    ${wishlist.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            </div>
                            <button class="add-to-cart-btn" onclick="moveToCart(${item.id})">Add to Cart</button>
                            <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-clear-cart" onclick="clearWishlist()">Clear Wishlist</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('rentique_cart', JSON.stringify(cart));
    updateCounts();
    closeModal();
    showNotification('Item removed from cart');
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('rentique_wishlist', JSON.stringify(wishlist));
    updateCounts();
    closeModal();
    showNotification('Item removed from wishlist');
}

// Move from wishlist to cart
function moveToCart(productId) {
    addToCart(productId);
    removeFromWishlist(productId);
    closeModal();
}

// Clear cart
function clearCart() {
    cart = [];
    localStorage.setItem('rentique_cart', JSON.stringify(cart));
    updateCounts();
    closeModal();
    showNotification('Cart cleared');
}

// Clear wishlist
function clearWishlist() {
    wishlist = [];
    localStorage.setItem('rentique_wishlist', JSON.stringify(wishlist));
    updateCounts();
    closeModal();
    showNotification('Wishlist cleared');
}

// Order entire cart
function orderCart() {
    const message = `Hi! I'm interested in ordering the following items:\n\n${cart.map(item => `- ${item.name} ($${item.price.toFixed(2)})`).join('\n')}\n\nTotal: $${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;
    window.open(`${FACEBOOK_PAGE_URL}`, '_blank');
    showNotification('Redirecting to Facebook to complete your order');
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
