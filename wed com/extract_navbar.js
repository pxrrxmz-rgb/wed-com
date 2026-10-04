const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf-8');

// Use regex to extract navbar and cart sections
function extractTag(content, startTag, endTag) {
    const start = content.indexOf(startTag);
    if (start === -1) return null;
    const end = content.indexOf(endTag, start);
    if (end === -1) return null;
    return content.substring(start, end + endTag.length);
}

const navbarCode = extractTag(indexHtml, '<nav class="navbar">', '</nav>');
const cartOverlayCode = '<div class="cart-overlay" id="cartOverlay"></div>';
const cartSidebarCode = extractTag(indexHtml, '<div class="cart-sidebar glass-card" id="cartSidebar">', '</div>\n    </div>'); 

// Wait, the cart sidebar has nested divs. indexOf('</div>') won't work well.
// Let's use a regex or just manual slice since I know the exact HTML of cart sidebar from index.html.

const exactCartSidebar = `
    <div class="cart-sidebar glass-card" id="cartSidebar">
        <div class="cart-header">
            <h3 data-i18n="cart_title">Your Cart</h3>
            <button id="closeCart"><i class="fas fa-times"></i></button>
        </div>
        <div class="cart-items" id="cartItems">
            <!-- Items injected by JS -->
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span data-i18n="cart_total">Total:</span>
                <span id="cartTotalPrice">$0.00</span>
            </div>
            <button class="btn-primary-pill" style="width: 100%; justify-content: center; margin-top: 15px;" data-i18n="cart_checkout">Checkout</button>
        </div>
    </div>`;

const exactNavbar = `<nav class="navbar">
        <div class="logo">
            <i class="fas fa-microchip"></i> TECH<span>GEAR</span>
        </div>
        
        <div class="nav-pill">
            <ul class="nav-links" id="mainNav">
                <li><a href="index.html" class="active" data-i18n="nav_home">Home</a></li>
                <li><a href="components.html" data-i18n="nav_components">Components</a></li>
                <li><a href="prebuilds.html" data-i18n="nav_prebuilds">Pre-builds</a></li>
                <li><a href="deals.html" data-i18n="nav_deals">Deals</a></li>
            </ul>
        </div>

        <div class="nav-actions">
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" data-i18n-placeholder="search_ph" placeholder="Search products...">
            </div>
            <a href="#" id="cartBtn" class="nav-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge" id="cartBadge">0</span>
            </a>
            <div class="lang-switch">
                <a href="#" class="lang-btn active" data-lang="en">EN</a>
                <span>|</span>
                <a href="#" class="lang-btn" data-lang="th">TH</a>
            </div>
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> <span data-i18n="nav_login">LOGIN</span></a>
        </div>
    </nav>`;

const jsContent = `
const sharedNavbarHTML = \`
${exactNavbar}
${cartOverlayCode}
${exactCartSidebar}
\`;

document.write(sharedNavbarHTML);
`;

fs.writeFileSync('navbar.js', jsContent, 'utf-8');

// Now process all HTML files
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Attempt to remove existing navbar
    let navStart = content.indexOf('<nav class="navbar">');
    if (navStart !== -1) {
        let navEnd = content.indexOf('</nav>', navStart) + 6;
        content = content.substring(0, navStart) + '<script src="navbar.js"></script>' + content.substring(navEnd);
    }
    
    // Attempt to remove existing cartOverlay and cartSidebar
    const overlayStr = '<div class="cart-overlay" id="cartOverlay"></div>';
    if (content.includes(overlayStr)) {
        content = content.replace(overlayStr, '');
    }
    
    const sidebarStart = content.indexOf('<div class="cart-sidebar glass-card" id="cartSidebar">');
    if (sidebarStart !== -1) {
        // find the end of the sidebar
        let idx = sidebarStart;
        let divCount = 0;
        let matchEnd = -1;
        while (idx < content.length) {
            let nextDivStart = content.indexOf('<div', idx);
            let nextDivEnd = content.indexOf('</div', idx);
            if (nextDivStart === -1 && nextDivEnd === -1) break;
            
            if (nextDivStart !== -1 && nextDivStart < nextDivEnd) {
                divCount++;
                idx = nextDivStart + 4;
            } else {
                divCount--;
                idx = nextDivEnd + 6;
                if (divCount === 0) {
                    matchEnd = idx;
                    break;
                }
            }
        }
        if (matchEnd !== -1) {
            content = content.substring(0, sidebarStart) + content.substring(matchEnd);
        }
    }

    fs.writeFileSync(file, content, 'utf-8');
}
console.log('Successfully extracted navbar and injected into all files.');
