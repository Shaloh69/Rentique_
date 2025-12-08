#!/bin/bash

# Create mission photo placeholder
cat > "images/mission-photo.jpg" << 'EOF'
<svg width="650" height="627" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-mission" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#163376;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#071032;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="650" height="627" fill="url(#grad-mission)"/>
  <text x="325" y="280" font-family="Baskervville" font-size="48" font-weight="bold" fill="white" text-anchor="middle">Rentique</text>
  <text x="325" y="330" font-family="Outfit" font-size="24" fill="#e6c36a" text-anchor="middle">Bespoke Tailoring</text>
  <text x="325" y="370" font-family="Outfit" font-size="18" fill="white" text-anchor="middle">with Love &amp; Grace</text>
</svg>
EOF

echo "Hero images created successfully!"
