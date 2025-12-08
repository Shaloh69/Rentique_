#!/bin/bash

# Create SVG placeholders for dress products

create_svg() {
    local filename=$1
    local color=$2
    local text=$3

    cat > "images/products/$filename" << EOF
<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad$filename" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="$color"/>
  <rect width="400" height="500" fill="url(#grad$filename)"/>
  <text x="200" y="250" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle">$text</text>
</svg>
EOF
}

# Women's dresses
create_svg "dress-1.jpg" "#8B4789" "Evening Gown"
create_svg "dress-2.jpg" "#FF6B9D" "Summer Dress"
create_svg "dress-3.jpg" "#1A1A1A" "Cocktail Dress"
create_svg "dress-4.jpg" "#D4A76A" "Boho Maxi"
create_svg "dress-5.jpg" "#FFB6C1" "Wedding Guest"
create_svg "dress-6.jpg" "#DC143C" "Red Carpet"
create_svg "dress-7.jpg" "#E6E6FA" "Lace Party"
create_svg "dress-8.jpg" "#4A5568" "Satin Slip"

# Men's attire
create_svg "men-1.jpg" "#000000" "Tuxedo"
create_svg "men-2.jpg" "#1E3A8A" "Navy Suit"
create_svg "men-3.jpg" "#374151" "Grey Suit"
create_svg "men-4.jpg" "#7C2D2D" "Burgundy"
create_svg "men-5.jpg" "#F5F5DC" "Linen Suit"
create_svg "men-6.jpg" "#4B0082" "Velvet"

# Kids
create_svg "kids-1.jpg" "#FFB6D9" "Princess"
create_svg "kids-2.jpg" "#2C5F8D" "Gentleman"
create_svg "kids-3.jpg" "#FADADD" "Flower Girl"
create_svg "kids-4.jpg" "#1C1C1C" "Tuxedo"
create_svg "kids-5.jpg" "#FF69B4" "Party Dress"
create_svg "kids-6.jpg" "#36454F" "Vest Set"

echo "Placeholder images created successfully!"
