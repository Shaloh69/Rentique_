// Admin JavaScript for Rentique

// Check if user is admin on page load
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if not admin
    if (!isAdmin()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }

    // Initialize admin panel
    initializeAdmin();
});

// Initialize admin functionality
function initializeAdmin() {
    loadAdminProducts();
    loadInquiries();
    loadBookings();

    // Setup form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Toggle subcategory visibility
    toggleSubcategory();
}

// Show admin section
function showAdminSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Load data for the section
    if (sectionName === 'inquiries') {
        loadInquiries();
    } else if (sectionName === 'bookings') {
        loadBookings();
    }
}

// Switch tabs within a section
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load products if switching to manage tab
    if (tabName === 'manage-products') {
        loadAdminProducts();
    }
}

// Handle add product
async function handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const subcategory = document.getElementById('product-subcategory').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const description = document.getElementById('product-description').value;
    const featured = document.getElementById('product-featured').checked;
    const available = document.getElementById('product-available').checked;

    // Get custom products from localStorage
    let customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];

    // Load all products to get max ID
    await loadProducts();

    // Generate new ID
    const newId = Math.max(...allProducts.map(p => p.id), ...customProducts.map(p => p.id), 0) + 1;

    const newProduct = {
        id: newId,
        name,
        category: 'women', // Always women's category
        subcategory,
        price,
        image,
        description,
        featured,
        available,
        bookedDates: []
    };

    customProducts.push(newProduct);
    localStorage.setItem('rentique_custom_products', JSON.stringify(customProducts));

    showNotification(`Product "${name}" added successfully!`);

    // Reset form
    event.target.reset();

    // Reload products list
    loadAdminProducts();
}

// Load products for admin management
async function loadAdminProducts() {
    await loadProducts();

    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    if (allProducts.length === 0) {
        productsList.innerHTML = '<p>No products found.</p>';
        return;
    }

    const productsHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${allProducts.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                        <td>${product.name}</td>
                        <td>${product.category}${product.subcategory ? ' - ' + product.subcategory : ''}</td>
                        <td>₱${product.price.toFixed(2)}</td>
                        <td><span class="status-badge ${product.available ? 'status-available' : 'status-unavailable'}">${product.available ? 'Available' : 'Unavailable'}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editProduct(${product.id})" title="Edit">✏️</button>
                            <button class="btn-icon" onclick="deleteProduct(${product.id})" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    productsList.innerHTML = productsHTML;
}

// Edit product
async function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Get existing bookings for this product
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    const productBookings = bookings[productId] || [];

    const bookingsHTML = productBookings.length > 0 ? productBookings.map((booking, index) => `
        <div class="booking-item" style="padding: 8px; margin-bottom: 8px; background: #f5f5f5; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</span>
            <button type="button" class="btn-icon" onclick="removeBooking(${productId}, ${index}); event.stopPropagation();" title="Remove" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
        </div>
    `).join('') : '<p style="color: #666; font-size: 14px;">No unavailable dates set</p>';

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeEditModal()"></div>
        <div class="modal-content" style="max-width: 700px;">
            <button class="modal-close" onclick="closeEditModal()">&times;</button>
            <div class="contact-form-container">
                <h2>Edit Product</h2>
                <form id="edit-product-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Product Name *</label>
                            <input type="text" id="edit-name" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Subcategory *</label>
                            <select id="edit-subcategory" required>
                                <option value="evening" ${product.subcategory === 'evening' ? 'selected' : ''}>Evening</option>
                                <option value="cocktail" ${product.subcategory === 'cocktail' ? 'selected' : ''}>Cocktail</option>
                                <option value="casual" ${product.subcategory === 'casual' ? 'selected' : ''}>Casual</option>
                                <option value="wedding" ${product.subcategory === 'wedding' ? 'selected' : ''}>Wedding</option>
                                <option value="party" ${product.subcategory === 'party' ? 'selected' : ''}>Party</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Price (₱) *</label>
                            <input type="number" id="edit-price" value="${product.price}" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <input type="text" value="Women" disabled style="opacity: 0.6;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Image URL *</label>
                        <input type="text" id="edit-image" value="${product.image}" required>
                    </div>

                    <div class="form-group">
                        <label>Description *</label>
                        <textarea id="edit-description" rows="4" required>${product.description}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="edit-featured" ${product.featured ? 'checked' : ''}>
                                <span>Featured Product</span>
                            </label>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="edit-available" ${product.available ? 'checked' : ''}>
                                <span>Available for Rental</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                        <h3 style="margin-top: 0;">Unavailable Dates</h3>
                        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Mark specific date ranges when this product cannot be rented (e.g., already booked, maintenance, etc.)</p>

                        <div id="bookings-list-${productId}" style="margin-bottom: 15px;">
                            ${bookingsHTML}
                        </div>

                        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
                            <h4 style="margin-top: 0; font-size: 16px;">Add Unavailable Period</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Start Date</label>
                                    <input type="date" id="booking-start-${productId}" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>End Date</label>
                                    <input type="date" id="booking-end-${productId}" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <button type="button" class="btn-primary" onclick="addBooking(${productId})" style="background: #28a745; margin-top: 10px;">Add Unavailable Period</button>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary" style="margin-top: 20px;">Update Product</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('active'), 10);

    // Handle form submission
    document.getElementById('edit-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProductEdit(productId);
    });
}

// Save product edit
function saveProductEdit(productId) {
    const name = document.getElementById('edit-name').value;
    const subcategory = document.getElementById('edit-subcategory').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const image = document.getElementById('edit-image').value;
    const description = document.getElementById('edit-description').value;
    const featured = document.getElementById('edit-featured').checked;
    const available = document.getElementById('edit-available').checked;

    const product = allProducts.find(p => p.id === productId);

    const updatedProduct = {
        ...product,
        name,
        category: 'women', // Always women's category
        subcategory,
        price,
        image,
        description,
        featured,
        available
    };

    // Check if product is from JSON or custom
    const customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];
    const customIndex = customProducts.findIndex(p => p.id === productId);

    if (customIndex !== -1) {
        // Update custom product
        customProducts[customIndex] = updatedProduct;
        localStorage.setItem('rentique_custom_products', JSON.stringify(customProducts));
    } else {
        // Update original product in edited products list
        let editedProducts = JSON.parse(localStorage.getItem('rentique_edited_products')) || [];
        const editedIndex = editedProducts.findIndex(p => p.id === productId);

        if (editedIndex !== -1) {
            editedProducts[editedIndex] = updatedProduct;
        } else {
            editedProducts.push(updatedProduct);
        }

        localStorage.setItem('rentique_edited_products', JSON.stringify(editedProducts));
    }

    showNotification('Product updated successfully!');
    closeEditModal();
    loadAdminProducts();
}

// Close edit modal
function closeEditModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Check if it's a custom product
    let customProducts = JSON.parse(localStorage.getItem('rentique_custom_products')) || [];
    const customIndex = customProducts.findIndex(p => p.id === productId);

    if (customIndex !== -1) {
        // Remove from custom products
        customProducts.splice(customIndex, 1);
        localStorage.setItem('rentique_custom_products', JSON.stringify(customProducts));
    } else {
        // Add to deleted products list (for JSON products)
        let deletedProducts = JSON.parse(localStorage.getItem('rentique_deleted_products')) || [];
        deletedProducts.push(productId);
        localStorage.setItem('rentique_deleted_products', JSON.stringify(deletedProducts));
    }

    showNotification(`Product "${product.name}" deleted successfully!`);
    loadAdminProducts();
}

// Load inquiries
function loadInquiries() {
    const inquiries = JSON.parse(localStorage.getItem('rentique_inquiries')) || [];
    const inquiriesList = document.getElementById('inquiries-list');

    if (!inquiriesList) return;

    if (inquiries.length === 0) {
        inquiriesList.innerHTML = '<p>No rental inquiries yet.</p>';
        return;
    }

    const inquiriesHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Product</th>
                    <th>Rental Period</th>
                    <th>Message</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(inquiry => `
                    <tr>
                        <td>${new Date(inquiry.timestamp).toLocaleDateString()}</td>
                        <td>${inquiry.name}</td>
                        <td>
                            ${inquiry.email}<br>
                            ${inquiry.phone || 'N/A'}
                        </td>
                        <td>${inquiry.productName}</td>
                        <td>${inquiry.startDate && inquiry.endDate ? `${new Date(inquiry.startDate).toLocaleDateString()} - ${new Date(inquiry.endDate).toLocaleDateString()}` : 'Not specified'}</td>
                        <td>${inquiry.message || 'No message'}</td>
                        <td>
                            <button class="btn-icon" onclick="deleteInquiry(${inquiry.id})" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    inquiriesList.innerHTML = inquiriesHTML;
}

// Delete inquiry
function deleteInquiry(inquiryId) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    let inquiries = JSON.parse(localStorage.getItem('rentique_inquiries')) || [];
    inquiries = inquiries.filter(i => i.id !== inquiryId);
    localStorage.setItem('rentique_inquiries', JSON.stringify(inquiries));

    showNotification('Inquiry deleted successfully!');
    loadInquiries();
}

// Load bookings
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    const bookingsList = document.getElementById('bookings-list');

    if (!bookingsList) return;

    // Convert bookings object to array
    const bookingsArray = [];
    for (const productId in bookings) {
        bookings[productId].forEach(booking => {
            const product = allProducts.find(p => p.id === parseInt(productId));
            bookingsArray.push({
                ...booking,
                productId: parseInt(productId),
                productName: product ? product.name : 'Unknown Product'
            });
        });
    }

    if (bookingsArray.length === 0) {
        bookingsList.innerHTML = '<p>No bookings yet.</p>';
        return;
    }

    const bookingsHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Customer</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookingsArray.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map((booking, index) => `
                    <tr>
                        <td>${booking.productName}</td>
                        <td>${new Date(booking.startDate).toLocaleDateString()}</td>
                        <td>${new Date(booking.endDate).toLocaleDateString()}</td>
                        <td>${booking.customer || 'N/A'}</td>
                        <td>
                            <button class="btn-icon" onclick="deleteBooking(${booking.productId}, ${index})" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    bookingsList.innerHTML = bookingsHTML;
}

// Delete booking
function deleteBooking(productId, bookingIndex) {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    if (bookings[productId] && bookings[productId][bookingIndex]) {
        bookings[productId].splice(bookingIndex, 1);
        if (bookings[productId].length === 0) {
            delete bookings[productId];
        }
        localStorage.setItem('rentique_bookings', JSON.stringify(bookings));
        showNotification('Booking deleted successfully!');
        loadBookings();
    }
}

// Add booking (mark dates as unavailable) - from edit product modal
function addBooking(productId) {
    const startDateInput = document.getElementById(`booking-start-${productId}`);
    const endDateInput = document.getElementById(`booking-end-${productId}`);

    if (!startDateInput || !endDateInput) return;

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Validation
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates.');
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        showNotification('End date must be after start date.');
        return;
    }

    // Add booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    if (!bookings[productId]) {
        bookings[productId] = [];
    }

    bookings[productId].push({
        startDate: startDate,
        endDate: endDate,
        customer: 'Admin Reserved',
        addedBy: 'admin',
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('rentique_bookings', JSON.stringify(bookings));
    showNotification('Unavailable period added successfully!');

    // Clear inputs
    startDateInput.value = '';
    endDateInput.value = '';

    // Refresh the bookings list
    refreshBookingsList(productId);
}

// Remove booking from edit modal
function removeBooking(productId, bookingIndex) {
    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};

    if (bookings[productId] && bookings[productId][bookingIndex] !== undefined) {
        bookings[productId].splice(bookingIndex, 1);

        if (bookings[productId].length === 0) {
            delete bookings[productId];
        }

        localStorage.setItem('rentique_bookings', JSON.stringify(bookings));
        showNotification('Unavailable period removed successfully!');

        // Refresh the bookings list
        refreshBookingsList(productId);
    }
}

// Refresh bookings list in edit modal
function refreshBookingsList(productId) {
    const bookingsListDiv = document.getElementById(`bookings-list-${productId}`);
    if (!bookingsListDiv) return;

    const bookings = JSON.parse(localStorage.getItem('rentique_bookings')) || {};
    const productBookings = bookings[productId] || [];

    if (productBookings.length > 0) {
        bookingsListDiv.innerHTML = productBookings.map((booking, index) => `
            <div class="booking-item" style="padding: 8px; margin-bottom: 8px; background: #f5f5f5; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span>${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</span>
                <button type="button" class="btn-icon" onclick="removeBooking(${productId}, ${index}); event.stopPropagation();" title="Remove" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </div>
        `).join('');
    } else {
        bookingsListDiv.innerHTML = '<p style="color: #666; font-size: 14px;">No unavailable dates set</p>';
    }
}

// Save Facebook URL
function saveFacebookUrl() {
    const url = document.getElementById('facebook-url').value;
    localStorage.setItem('rentique_facebook_url', url);
    showNotification('Facebook URL saved successfully!');
}

// Save contact email
function saveContactEmail() {
    const email = document.getElementById('contact-email').value;
    localStorage.setItem('rentique_contact_email', email);
    showNotification('Contact email saved successfully!');
}

// Export data
function exportData() {
    const data = {
        products: {
            custom: JSON.parse(localStorage.getItem('rentique_custom_products')) || [],
            edited: JSON.parse(localStorage.getItem('rentique_edited_products')) || [],
            deleted: JSON.parse(localStorage.getItem('rentique_deleted_products')) || []
        },
        inquiries: JSON.parse(localStorage.getItem('rentique_inquiries')) || [],
        bookings: JSON.parse(localStorage.getItem('rentique_bookings')) || {},
        cart: JSON.parse(localStorage.getItem('rentique_cart')) || [],
        wishlist: JSON.parse(localStorage.getItem('rentique_wishlist')) || []
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rentique-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('Data exported successfully!');
}

// Clear all data
function clearAllData() {
    if (!confirm('WARNING: This will delete ALL custom products, inquiries, bookings, and other data. Are you absolutely sure?')) return;
    if (!confirm('This action cannot be undone. Click OK to proceed.')) return;

    localStorage.removeItem('rentique_custom_products');
    localStorage.removeItem('rentique_edited_products');
    localStorage.removeItem('rentique_deleted_products');
    localStorage.removeItem('rentique_inquiries');
    localStorage.removeItem('rentique_bookings');
    localStorage.removeItem('rentique_cart');
    localStorage.removeItem('rentique_wishlist');

    showNotification('All data cleared successfully!');
    loadAdminProducts();
    loadInquiries();
    loadBookings();
}
