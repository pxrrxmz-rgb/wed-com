
const sharedNavbarHTML = `
<nav class="navbar">
        <div class="logo" onclick="window.location.href='index.html'" style="cursor: pointer;">
            <i class="fas fa-microchip"></i> TECH<span>GEAR</span>
        </div>
        
        <div class="nav-pill">
            <ul class="nav-links" id="mainNav">
                <li><a href="index.html" class="active" data-i18n="nav_home">Home</a></li>
                <li><a href="laptops.html" data-i18n="nav_laptops">Laptops</a></li>
                <li><a href="components.html" data-i18n="nav_components">Components</a></li>
                <li><a href="prebuilds.html" data-i18n="nav_prebuilds">Pre-builds</a></li>
                <li><a href="deals.html" data-i18n="nav_deals">Deals</a></li>
            </ul>
        </div>

        <div class="nav-actions">
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" data-i18n-placeholder="search_ph" placeholder="Search products...">
                <div id="searchSuggestions" style="display: none; position: absolute; top: calc(100% + 10px); left: -50px; width: 350px; max-height: 400px; overflow-y: auto; z-index: 9999; border-radius: 12px; padding: 10px; flex-direction: column; gap: 10px; background: rgba(15, 16, 18, 0.95); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 15px 40px rgba(0,0,0,0.7); font-family: 'Mitr', sans-serif;"></div>
            </div>
            <a href="#" id="cartBtn" class="nav-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge" id="cartBadge" style="display: none;">0</span>
            </a>
            <div class="lang-switch">
                <a href="#" class="lang-btn active" data-lang="en">EN</a>
                <span>|</span>
                <a href="#" class="lang-btn" data-lang="th">TH</a>
            </div>
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> <span data-i18n="nav_login">LOGIN</span></a>
        </div>
    </nav>
<div class="cart-overlay" id="cartOverlay"></div>

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
                <span id="cartTotalPrice">฿0.00</span>
            </div>
            <button id="checkoutBtn" class="btn-primary-pill" style="width: 100%; justify-content: center; margin-top: 15px;" data-i18n="cart_checkout">Checkout</button>
        </div>
    </div>
`;

document.write(sharedNavbarHTML);

document.write('<script src="checkout.js"><\/script>');

// --- Top Navigation Active State (Moved from shop.js to be shared globally) ---
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#mainNav a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});


// --- Autocomplete Search Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchSuggestions.innerHTML = '';
            
            if (query.length === 0) {
                searchSuggestions.style.display = 'none';
                return;
            }
            
            if (typeof getProducts !== 'function') return;
            
            const products = getProducts();
            const matched = products.filter(p => {
                return (p.title_en && p.title_en.toLowerCase().includes(query)) ||
                       (p.title_th && p.title_th.toLowerCase().includes(query)) ||
                       (p.category && p.category.toLowerCase().includes(query)) ||
                       (p.desc_en && p.desc_en.toLowerCase().includes(query)) ||
                       (p.desc_th && p.desc_th.toLowerCase().includes(query));
            });

            if (matched.length === 0) {
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                const noFoundTxt = lang === 'th' ? 'ไม่พบสินค้า' : 'No products found';
                searchSuggestions.innerHTML = `<div style="padding: 10px; color: #a4b0be; text-align: center;">${noFoundTxt}</div>`;
                searchSuggestions.style.display = 'flex';
                return;
            }

            // Show top 6 results
            const topResults = matched.slice(0, 6);
            const lang = localStorage.getItem('preferredLanguage') || 'en';

            topResults.forEach(p => {
                const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
                let priceHtml = '';
                if (p.category === 'deals') {
                    priceHtml = `<span style="color: #c02020; font-weight: bold; font-size: 0.95rem;">฿${p.price.toFixed(2)}</span>`;
                } else {
                    priceHtml = `<span style="color: #a4b0be; font-weight: 500; font-size: 0.95rem;">฿${p.price.toFixed(2)}</span>`;
                }

                let imgHtml = '';
                if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image') || p.icon.startsWith('images/'))) {
                    imgHtml = `<img src="${p.icon}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.05); padding: 5px;">`;
                } else {
                    imgHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 8px;"><i class="${p.icon || 'fas fa-box'}" style="font-size: 24px; color: #555;"></i></div>`;
                }

                const item = document.createElement('div');
                item.style.cssText = "display: flex; align-items: center; gap: 12px; padding: 10px; cursor: pointer; border-radius: 8px; transition: 0.2s;";
                item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.1)';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => {
                    window.location.href = 'product.html?id=' + p.id;
                };

                item.innerHTML = `
                    ${imgHtml}
                    <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
                        <span style="color: #fff; font-size: 0.95rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</span>
                        ${priceHtml}
                    </div>
                `;
                searchSuggestions.appendChild(item);
            });
            
            searchSuggestions.style.display = 'flex';
        });

        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            const searchBar = searchInput.parentElement;
            if (!searchBar.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
        
        // Show again when focusing input if there's text
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                searchInput.dispatchEvent(new Event('input'));
            }
        });

        // Re-trigger search when language changes to update languages in suggestions
        window.addEventListener('languageChanged', () => {
            if(searchInput.value) {
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // --- Cart Sidebar Toggle Logic ---
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn && cartSidebar && cartOverlay && closeCart) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check login before opening cart if needed? No, let them open empty cart.
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                if (typeof showToast === 'function') {
                    showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.', true);
                } else {
                    alert(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'Please login first.');
                }
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            if(typeof window.renderCart === 'function') window.renderCart();
        });

        const closeCartFn = () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        };

        closeCart.addEventListener('click', closeCartFn);
        cartOverlay.addEventListener('click', closeCartFn);
    }
});
