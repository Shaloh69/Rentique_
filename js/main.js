// Main JavaScript file for Rentique

// Configuration
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/YourRentiquePage'; // Replace with actual Facebook page URL
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSubcategory = 'all';

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

    const cartMessage = cart.map(item => `${item.name} - ₱${item.price.toFixed(2)}`).join('\n');
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

    // Add timestamp to prevent image caching
    const timestamp = new Date().getTime();

    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="card-media">
                <img src="${product.image}?t=${timestamp}" alt="${product.name}" onerror="this.src='images/logo.png'">
            </div>
            <div class="card-body">
                <div class="product-title">${product.name}</div>
                <div class="product-price">₱${product.price.toFixed(2)}</div>
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
    currentSubcategory = 'all'; // Reset subcategory when changing main category

    // Update active category button
    document.querySelectorAll('.category-nav-center > ul:first-child li').forEach(li => {
        li.classList.remove('cat-active');
    });
    event.target.classList.add('cat-active');

    // Show/hide subcategory nav for Women
    const subcategoryNav = document.getElementById('subcategory-nav');
    if (subcategoryNav) {
        if (category === 'women') {
            subcategoryNav.style.display = 'flex';
            // Reset subcategory active state
            document.querySelectorAll('.subcategory-nav li').forEach(li => {
                li.classList.remove('subcat-active');
            });
            document.querySelector('.subcategory-nav li[data-subcategory="all"]').classList.add('subcat-active');
        } else {
            subcategoryNav.style.display = 'none';
        }
    }

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

// Filter products by subcategory
function filterBySubcategory(subcategory) {
    currentSubcategory = subcategory;

    // Update active subcategory button
    document.querySelectorAll('.subcategory-nav li').forEach(li => {
        li.classList.remove('subcat-active');
    });
    event.target.classList.add('subcat-active');

    // Filter products by category first
    let categoryFiltered = allProducts.filter(p => p.category === 'women');

    // Then filter by subcategory
    if (subcategory === 'all') {
        filteredProducts = categoryFiltered;
    } else {
        filteredProducts = categoryFiltered.filter(p => p.subcategory === subcategory);
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
        product.category.toLowerCase().includes(searchTerm) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm))
    );

    displayProducts(searchResults);
}

// Order product - redirect to Facebook
function orderProduct(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (product) {
        // Create a message to send to Facebook
        const message = `Hi! I'm interested in ordering: ${product.name} (₱${product.price.toFixed(2)})`;

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

    // Get booked dates from localStorage
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    const productBookings = bookings[productId] || [];

    // Format booked dates for display
    const bookedDatesDisplay = productBookings.length > 0
        ? productBookings.map(booking => {
            const start = new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const end = new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${start} - ${end}`;
          }).join('<br>')
        : 'None - Available for all dates!';

    const availabilityStatus = product.available && productBookings.length === 0
        ? '<span style="color: #28a745;">✓ Available</span>'
        : productBookings.length > 0
        ? '<span style="color: #ffc107;">⚠ Partially Booked</span>'
        : '<span style="color: #dc3545;">✗ Unavailable</span>';

    // Add timestamp to prevent image caching
    const timestamp = new Date().getTime();

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${product.image}?t=${timestamp}" alt="${product.name}" onerror="this.src='images/logo.png'">
                </div>
                <div class="modal-details">
                    <h2 class="modal-title">${product.name}</h2>
                    <div class="modal-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}${product.subcategory ? ' - ' + product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1) : ''}</div>
                    <div class="modal-price">₱${product.price.toFixed(2)}</div>
                    <div class="modal-availability">
                        <strong>Availability:</strong> ${availabilityStatus}
                    </div>
                    <p class="modal-description">${product.description}</p>

                    <div class="availability-section">
                        <h3>Rental Availability</h3>
                        <div class="booked-dates">
                            <strong>Currently Booked:</strong><br>
                            <small>${bookedDatesDisplay}</small>
                        </div>
                        <div class="date-picker-section">
                            <label><strong>Select Rental Dates:</strong></label>
                            <div class="date-inputs">
                                <input type="date" id="rental-start-${product.id}" class="date-input" min="${new Date().toISOString().split('T')[0]}">
                                <span>to</span>
                                <input type="date" id="rental-end-${product.id}" class="date-input" min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <button class="btn-check-availability" onclick="checkAvailability(${product.id})">
                                Check Availability
                            </button>
                            <div id="availability-result-${product.id}" class="availability-result"></div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id}); closeModal();">
                            Add to Cart
                        </button>
                        <button class="btn-add-wishlist" onclick="addToWishlist(${product.id}); closeModal();">
                            Add to Wishlist
                        </button>
                    </div>
                    <button class="btn-order-large" onclick="openContactForm(${product.id})">
                        Contact Us to Rent
                    </button>
                    <button class="btn-order-large" onclick="orderProduct(${product.id})" style="margin-top: 10px; background: #3b5998;">
                        Order on Facebook
                    </button>
                    <div class="modal-note">
                        <small>Add to cart or contact us directly to arrange rental</small>
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
    const categoryItems = document.querySelectorAll('.category-nav-center > ul:first-child li');
    categoryItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            const categories = ['all', 'women', 'men', 'kiddies'];
            filterByCategory(categories[index]);
        });
    });

    // Setup subcategory filters
    const subcategoryItems = document.querySelectorAll('.subcategory-nav li');
    subcategoryItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            const subcategory = item.getAttribute('data-subcategory');
            filterBySubcategory(subcategory);
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
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const text = item.textContent.trim().toLowerCase();

            switch(text) {
                case 'home':
                    window.location.href = 'index.html';
                    break;
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
    const timestamp = new Date().getTime();

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
                            <img src="${item.image}?t=${timestamp}" alt="${item.name}">
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-total">
                    <strong>Total: ₱${total.toFixed(2)}</strong>
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

    const timestamp = new Date().getTime();

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
                            <img src="${item.image}?t=${timestamp}" alt="${item.name}">
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
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

// Check availability for selected dates
function checkAvailability(productId) {
    const startDateInput = document.getElementById(`rental-start-${productId}`);
    const endDateInput = document.getElementById(`rental-end-${productId}`);
    const resultDiv = document.getElementById(`availability-result-${productId}`);

    if (!startDateInput || !endDateInput) return;

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    // Validation
    if (!startDateInput.value || !endDateInput.value) {
        resultDiv.innerHTML = '<p style="color: #dc3545;">Please select both start and end dates.</p>';
        return;
    }

    if (endDate <= startDate) {
        resultDiv.innerHTML = '<p style="color: #dc3545;">End date must be after start date.</p>';
        return;
    }

    // Check against existing bookings
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    const productBookings = bookings[productId] || [];

    let isAvailable = true;
    for (const booking of productBookings) {
        const bookedStart = new Date(booking.startDate);
        const bookedEnd = new Date(booking.endDate);

        // Check for overlap
        if ((startDate <= bookedEnd && endDate >= bookedStart)) {
            isAvailable = false;
            break;
        }
    }

    if (isAvailable) {
        resultDiv.innerHTML = '<p style="color: #28a745;"><strong>✓ Available!</strong> Click "Contact Us to Rent" to proceed.</p>';
    } else {
        resultDiv.innerHTML = '<p style="color: #dc3545;"><strong>✗ Not Available</strong> - These dates conflict with existing bookings.</p>';
    }
}

// Open contact form for rental inquiry
function openContactForm(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Get selected dates
    const startDateInput = document.getElementById(`rental-start-${productId}`);
    const endDateInput = document.getElementById(`rental-end-${productId}`);

    const startDate = startDateInput && startDateInput.value ? new Date(startDateInput.value).toLocaleDateString() : 'Not selected';
    const endDate = endDateInput && endDateInput.value ? new Date(endDateInput.value).toLocaleDateString() : 'Not selected';

    // Close current modal
    closeModal();

    // Open contact form modal
    const modal = document.createElement('div');
    modal.className = 'product-modal contact-form-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="contact-form-container">
                <h2>Rental Inquiry for ${product.name}</h2>
                <p><strong>Price:</strong> ₱${product.price.toFixed(2)}</p>
                <p><strong>Rental Period:</strong> ${startDate} to ${endDate}</p>

                <form id="rental-contact-form" onsubmit="submitRentalInquiry(event, ${productId})">
                    <div class="form-group">
                        <label>Your Name *</label>
                        <input type="text" id="contact-name" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address *</label>
                        <input type="email" id="contact-email" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="contact-phone">
                    </div>
                    <div class="form-group">
                        <label>Message / Special Requests</label>
                        <textarea id="contact-message" rows="4" placeholder="Please let us know any special requests or questions..."></textarea>
                    </div>
                    <button type="submit" class="btn-order-large">Submit Inquiry</button>
                    <p class="form-note"><small>We'll contact you within 24 hours via email or phone.</small></p>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Submit rental inquiry
function submitRentalInquiry(event, productId) {
    event.preventDefault();

    const product = allProducts.find(p => p.id === productId);
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('contact-message').value;

    // Get rental dates
    const startDateInput = document.getElementById(`rental-start-${productId}`);
    const endDateInput = document.getElementById(`rental-end-${productId}`);
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';

    // Save inquiry to localStorage
    const inquiries = JSON.parse(localStorage.getItem('rentique_inquiries')) || [];
    inquiries.push({
        id: Date.now(),
        productId: productId,
        productName: product.name,
        name: name,
        email: email,
        phone: phone,
        message: message,
        startDate: startDate,
        endDate: endDate,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('rentique_inquiries', JSON.stringify(inquiries));

    // Show success message
    closeModal();
    showNotification(`Thank you, ${name}! Your rental inquiry for ${product.name} has been submitted. We'll contact you soon at ${email}.`);

    // In a real application, you would send this to a backend or email service
    // For now, we're just storing it in localStorage for demo purposes
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
    const message = `Hi! I'm interested in ordering the following items:\n\n${cart.map(item => `- ${item.name} (₱${item.price.toFixed(2)})`).join('\n')}\n\nTotal: ₱${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;
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

// Load random featured products for home page
async function loadFeaturedProductsForHome() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        let products = data.products;

        // Load deleted products list
        const deletedProducts = JSON.parse(localStorage.getItem('rentique_deleted_products')) || [];

        // Filter out deleted products
        products = products.filter(p => !deletedProducts.includes(p.id));

        // Load edited products from localStorage
        const editedProducts = JSON.parse(localStorage.getItem('rentique_edited_products')) || [];

        // Replace original products with edited versions
        editedProducts.forEach(editedProduct => {
            const index = products.findIndex(p => p.id === editedProduct.id);
            if (index !== -1) {
                products[index] = editedProduct;
            }
        });

        // Load custom products from localStorage (added by admin)
        const customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];

        // Merge custom products with JSON products
        products = [...products, ...customProducts];

        // Filter for featured products
        const featuredProducts = products.filter(p => p.featured);

        // If no featured products, use all products
        const productsToUse = featuredProducts.length > 0 ? featuredProducts : products;

        if (productsToUse.length === 0) return;

        // Select random products for hero and mission sections
        const randomProduct1 = productsToUse[Math.floor(Math.random() * productsToUse.length)];
        const randomProduct2 = productsToUse[Math.floor(Math.random() * productsToUse.length)];

        // Update hero image
        const heroImage = document.getElementById('hero-featured-image');
        if (heroImage) {
            heroImage.src = randomProduct1.image;
            heroImage.alt = randomProduct1.name;
            heroImage.onerror = function() {
                this.src = 'images/logo.png';
            };
        }

        // Update mission image
        const missionImage = document.getElementById('mission-featured-image');
        if (missionImage) {
            missionImage.src = randomProduct2.image;
            missionImage.alt = randomProduct2.name;
            missionImage.onerror = function() {
                this.src = 'images/logo.png';
            };
        }

        // Update "Why Choose Us" section images with 3 random products
        const whyChooseImage1 = document.getElementById('whychoose-image-1');
        const whyChooseImage2 = document.getElementById('whychoose-image-2');
        const whyChooseImage3 = document.getElementById('whychoose-image-3');

        if (whyChooseImage1 && whyChooseImage2 && whyChooseImage3) {
            // Get 3 different random products
            const shuffled = [...productsToUse].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(3, shuffled.length));

            // Ensure we have at least 3 products (repeat if necessary)
            while (selected.length < 3) {
                selected.push(productsToUse[Math.floor(Math.random() * productsToUse.length)]);
            }

            whyChooseImage1.src = selected[0].image;
            whyChooseImage1.alt = selected[0].name;
            whyChooseImage1.onerror = function() { this.src = 'images/logo.png'; };

            whyChooseImage2.src = selected[1].image;
            whyChooseImage2.alt = selected[1].name;
            whyChooseImage2.onerror = function() { this.src = 'images/logo.png'; };

            whyChooseImage3.src = selected[2].image;
            whyChooseImage3.alt = selected[2].name;
            whyChooseImage3.onerror = function() { this.src = 'images/logo.png'; };
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Load featured products on home page load
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    loadFeaturedProductsForHome();
}
