# Rentique - Dress Ordering Promotional Website

A beautiful, responsive promotional website for ordering dresses and formal wear. This is a client-side only website that uses JSON for data storage and redirects orders to a Facebook page.

## Features

### ✨ Core Functionality
- **Dynamic Product Loading**: Products loaded from JSON data
- **Category Filtering**: Filter by Women, Men, and Kiddies categories
- **Search Functionality**: Real-time search across product names and descriptions
- **Product Details Modal**: Click any product to view detailed information
- **Shopping Cart & Wishlist**: Save items for later or add to cart
- **Facebook Integration**: "Order Now" buttons redirect to your Facebook page
- **User Authentication**: Email-based login/logout system
- **Admin Panel**: Admin users can add and manage products
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🎨 Design Elements
- Elegant gold and navy color scheme
- Smooth animations and transitions
- Loading states and notifications
- Professional typography (Baskervville, Outfit, Inter fonts)
- Interactive hover effects
- Accessible UI with focus states

## Project Structure

```
Rentique_/
├── index.html              # Home page with brand story
├── products.html           # Products catalog page
├── style.css              # All styling
├── js/
│   ├── auth.js            # Authentication system
│   └── main.js            # All JavaScript functionality
├── data/
│   ├── products.json      # Product data (20 products)
│   └── users.json         # User accounts (admin & demo user)
├── images/
│   ├── logo.png           # Rentique logo
│   ├── pngegg.png         # Search icon
│   ├── facebook-icon.png  # Social media icons
│   ├── instagram-icon.png
│   ├── twitter-icon.png
│   ├── tiktok-icon.png
│   └── products/          # Product images (SVG placeholders)
│       ├── dress-1.jpg through dress-8.jpg
│       ├── men-1.jpg through men-6.jpg
│       └── kids-1.jpg through kids-6.jpg
└── README.md              # This file
```

## Setup Instructions

### 1. Login Credentials

The website includes a built-in authentication system with demo accounts:

**Admin Account:**
- Email: `admin@rentique.com`
- Password: `admin123`
- Can add/delete products via Admin Panel

**Demo User Account:**
- Email: `user@rentique.com`
- Password: `user123`
- Can browse and order products

You can modify these credentials in `data/users.json`.

### 2. Configure Facebook Page URL

Open `js/main.js` and update line 4 with your Facebook page URL:

```javascript
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/YourRentiquePage';
```

Replace `YourRentiquePage` with your actual Facebook page URL.

### 3. Add Your Product Images

The website includes SVG placeholder images. To add your actual dress photos:

1. Replace files in `images/products/` with your dress photos
2. Keep the same filenames OR update the paths in `data/products.json`
3. Recommended image size: 400x500 pixels (4:5 aspect ratio)
4. Supported formats: JPG, PNG, SVG

### 4. Customize Product Data

Edit `data/products.json` to update:
- Product names
- Prices
- Descriptions
- Categories
- Featured status

Example product entry:
```json
{
  "id": 1,
  "name": "Elegant Evening Gown",
  "category": "women",
  "price": 299.99,
  "image": "images/products/dress-1.jpg",
  "description": "Beautiful evening gown description...",
  "featured": true
}
```

### 5. Update Homepage Images

Replace placeholder images in the home page:
- Hero section dress image: Update the placeholder in `index.html` line 53-56
- Mission section photo: Add `images/mission-photo.jpg`
- Why Choose Us images: Add images and update placeholders on lines 96-98

### 6. Deploy

This is a static website with no server requirements. Deploy options:

**Option 1: GitHub Pages**
1. Push code to GitHub
2. Go to Settings > Pages
3. Select branch and save
4. Your site will be live at `https://yourusername.github.io/Rentique_/`

**Option 2: Netlify/Vercel**
1. Connect your repository
2. Deploy automatically

**Option 3: Traditional Web Hosting**
1. Upload all files via FTP
2. Ensure `index.html` is in the root directory

## How It Works

### Product Ordering Flow

1. User browses products on the products page
2. User can filter by category or search
3. Click on a product to see details in a modal
4. Click "Order Now" button
5. User is redirected to your Facebook page
6. Customer contacts you through Facebook to complete the order

### Category Filtering

Click on category buttons (View All, Women, Men, Kiddies) to filter products. The filtering happens instantly on the client-side.

### Search Functionality

Type in the search bar to search across:
- Product names
- Product descriptions
- Category names

Results update in real-time as you type.

### User Authentication

The website includes a complete authentication system:

**Login:**
1. Click the login icon in the navigation bar
2. Enter your email and password
3. System validates against `data/users.json`
4. Session stored in localStorage

**Logout:**
1. Click your profile icon
2. Select "Logout" from dropdown
3. Session cleared, redirected to home page

**Session Persistence:**
- Login state saved in localStorage
- Stays logged in across page refreshes
- Logout required to switch accounts

### Admin Panel (Admin Only)

Admin users have access to a powerful product management panel:

**Accessing Admin Panel:**
1. Login with admin credentials
2. Click your profile icon
3. Select "Admin Panel"

**Adding Products:**
1. Go to "Add Product" tab
2. Fill in product details:
   - Name
   - Category (Women/Men/Kiddies)
   - Price
   - Image URL
   - Description
   - Featured status
3. Click "Add Product"
4. Product saved to localStorage
5. Appears immediately on products page

**Managing Products:**
1. Go to "Manage Products" tab
2. View all custom products
3. Delete products with "Delete" button
4. Changes reflect immediately

**How Custom Products Work:**
- Stored in localStorage as `rentique_custom_products`
- Merged with JSON products on page load
- Persist across sessions
- Can be exported/imported for backup

## Customization Guide

### Colors

Edit the CSS variables in `style.css` (lines 1-7):

```css
:root {
  --nav-h: 72px;
  --nav-bg: #fff;
  --nav-border: #0b233a;
  --accent: #e6c36a;        /* Gold accent color */
  --navy: #071032;          /* Navy background */
}
```

### Typography

The website uses three font families:
- **Baskervville**: Headlines and branding (serif)
- **Outfit**: Body text and UI elements (sans-serif)
- **Inter**: Navigation and metadata (sans-serif)

Change fonts by updating the Google Fonts link in the HTML files.

### Adding More Products

1. Open `data/products.json`
2. Add new product objects to the `products` array
3. Ensure each product has a unique `id`
4. Add corresponding product images to `images/products/`

### Social Media Links

Update social media links in the footer of both HTML files (currently placeholder links).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks or dependencies
- **JSON**: Data storage
- **SVG**: Scalable graphics for icons and placeholders

## No Server Required

This website is 100% client-side:
- ✅ No backend server needed
- ✅ No database required
- ✅ No build process necessary
- ✅ Just open `index.html` in a browser or deploy to any static host

## Performance

- Lightweight: Total page size < 1MB
- Fast loading: No external dependencies except Google Fonts
- Efficient: Images lazy-load and products render dynamically
- Mobile-optimized: Responsive images and touch-friendly UI

## Future Enhancements (Optional)

If you want to add more features later:

1. **Contact Form**: Add a form that sends emails via a service like Formspree
2. **Shopping Cart**: Store selections in localStorage before Facebook redirect
3. **Image Gallery**: Add multiple images per product
4. **Customer Reviews**: Add testimonials section
5. **Newsletter**: Integrate with Mailchimp or similar service
6. **WhatsApp Integration**: Alternative to Facebook for orders
7. **Analytics**: Add Google Analytics to track visitors

## Support

For questions or issues:
1. Check this README first
2. Review the code comments in `js/main.js`
3. Ensure your Facebook page URL is correct

## License

This is a custom promotional website. Customize and use as needed for your business.

---

**Made with ❤️ for Rentique - Love in every detail**
