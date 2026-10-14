document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (typeof renderProductGrid === 'function' && document.getElementById('productGrid')) {
                renderProductGrid('productGrid', typeof activeCategoryFilter !== 'undefined' ? activeCategoryFilter : 'all');
            }
        });
    }

    // --- 2. Shopping Cart Functionality ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.getElementById('cartBadge');

    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartBadge) {
            const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
            cartBadge.textContent = totalQty;
            cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
        }
    };

    window.saveCart = function() {
        localStorage.setItem('cart', JSON.stringify(cart));
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && (currentUser.username || currentUser.email)) {
            const u = currentUser.username || currentUser.email;
            fetch('/api/cart/' + encodeURIComponent(u), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cart })
            }).catch(e => console.error('Cart sync failed', e));
        }
    };

    window.addToCart = function(product, qty = 1) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        if (!currentUser) {
            if (typeof showToast === 'function') {
                showToast(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า' : 'Please login first.', true);
            }
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const title = (lang === 'th' && product.title_th) ? product.title_th : (product.title_en || product.title || 'Product');

        const existingItem = cart.find(item => String(item.id) === String(product.id));
        if (existingItem) {
            existingItem.qty = (Number(existingItem.qty) || 1) + qty;
            if (!existingItem.img && product.icon) existingItem.img = product.icon;
        } else {
            cart.push({
                id: String(product.id),
                title: title,
                price: Number(product.price) || 0,
                img: product.icon || product.img || '',
                qty: qty
            });
        }

        saveCart();
        updateBadge();
        if (typeof window.renderCart === 'function') window.renderCart();

        if (typeof showToast === 'function') {
            showToast(lang === 'th' ? `เพิ่ม ${title} ลงตะกร้าแล้ว!` : `Added ${title} to cart!`);
        }
    };

    // Render Cart in sidebar
    window.renderCart = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalEl = document.getElementById('cartTotalPrice');
        if (!cartItemsContainer || !cartTotalEl) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; color:#8c92a0; margin-top:50px;">
                    <i class="fas fa-shopping-basket" style="font-size:2.8rem; color:#2f3542; margin-bottom:12px;"></i>
                    <p>${lang === 'th' ? 'ตะกร้าสินค้าของคุณยังว่างเปล่า' : 'Your cart is empty'}</p>
                </div>`;
            cartTotalEl.textContent = '฿0.00';
            return;
        }

        const allProducts = typeof getProducts === 'function' ? getProducts() : [];

        cart.forEach((item, index) => {
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.qty) || 1;
            const itemTotal = itemPrice * itemQty;
            total += itemTotal;

            // Fallback lookup if item.img was missing from older cart data
            let imgSrc = item.img;
            if (!imgSrc && allProducts.length > 0) {
                const matchedProd = allProducts.find(p => String(p.id) === String(item.id));
                if (matchedProd && matchedProd.icon) {
                    imgSrc = matchedProd.icon;
                    item.img = imgSrc;
                }
            }

            let imgHtml = '';
            if (imgSrc && (imgSrc.startsWith('http') || imgSrc.startsWith('data:image') || imgSrc.startsWith('images/'))) {
                imgHtml = `<img src="${imgSrc}" style="width: 52px; height: 52px; object-fit: contain; background: #fff; padding: 4px; border-radius: 8px; flex-shrink: 0;">`;
            } else {
                imgHtml = `<div style="width: 52px; height: 52px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items:center; justify-content:center; flex-shrink: 0;"><i class="${imgSrc || 'fas fa-microchip'}" style="font-size: 22px; color:#c02020;"></i></div>`;
            }

            const itemEl = document.createElement('div');
            itemEl.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px;';

            itemEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                    ${imgHtml}
                    <div style="min-width: 0; flex: 1;">
                        <div style="font-weight: 500; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${item.title}</div>
                        <div style="color: #a4b0be; font-size: 0.8rem; margin-bottom: 6px;">฿${itemPrice.toLocaleString('en-US')}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="qty-btn dec-qty" data-index="${index}">-</button>
                            <span style="font-size: 0.88rem; min-width: 18px; text-align: center;">${itemQty}</span>
                            <button class="qty-btn inc-qty" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                    <div style="font-weight: 600; font-size: 0.95rem; color:#2ecc71;">฿${itemTotal.toLocaleString('en-US')}</div>
                    <button class="remove-btn" data-index="${index}" style="background: none; border: none; color: #8c92a0; cursor: pointer; font-size:0.9rem;" title="Remove"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalEl.textContent = `฿${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        cartItemsContainer.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                cart[idx].qty = (Number(cart[idx].qty) || 1) + 1;
                saveCart();
                window.updateBadge();
                window.renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                if ((Number(cart[idx].qty) || 1) > 1) {
                    cart[idx].qty -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
                window.updateBadge();
                window.renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                cart.splice(idx, 1);
                saveCart();
                window.updateBadge();
                window.renderCart();
            });
        });
    };

    window.updateBadge();

    // --- 3. Category Slider ---
    let slideInterval;
    function initCategorySlider() {
        const slidesContainer = document.querySelector('.slides');
        const dotsContainer = document.querySelector('.slider-dots');
        if (!slidesContainer || !dotsContainer) return;

        const sliderCategories = [
            {
                title_en: "PC Components",
                title_th: "ชิ้นส่วนคอมพิวเตอร์",
                desc_en: "Processors, Graphics Cards, RAM, and more to build your ultimate rig.",
                desc_th: "ซีพียู การ์ดจอ แรม และอุปกรณ์ต่างๆ สำหรับประกอบคอมแรงของคุณ",
                url: "components.html",
                img: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80",
                badge_en: "Build Your PC",
                badge_th: "จัดสเปคคอม"
            },
            {
                title_en: "Gaming Laptops",
                title_th: "เกมมิ่งแล็ปท็อป",
                desc_en: "High-performance notebooks for gaming and working on the go.",
                desc_th: "โน้ตบุ๊กสเปคสูงเพื่อการเล่นเกมและการทำงานทุกที่ทุกเวลา",
                url: "laptops.html",
                img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80",
                badge_en: "Portable Power",
                badge_th: "ทรงพลังพกพาง่าย"
            },
            {
                title_en: "Gaming Gear & Deals",
                title_th: "อุปกรณ์เกมมิ่งเกียร์",
                desc_en: "Monitors, Mechanical Keyboards, Mice and exclusive discounts.",
                desc_th: "จอมอนิเตอร์ คีย์บอร์ด เมาส์ และโปรโมชั่นราคาสุดพิเศษ",
                url: "deals.html",
                img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
                badge_en: "Special Offers",
                badge_th: "โปรโมชั่นพิเศษ"
            }
        ];

        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';
        const lang = localStorage.getItem('preferredLanguage') || 'en';

        sliderCategories.forEach((cat, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide' + (index === 0 ? ' active' : '');
            slide.style.cursor = 'pointer';
            slide.style.position = 'relative';
            slide.style.background = '#000';
            slide.onclick = () => window.location.href = cat.url;

            const title = lang === 'th' ? cat.title_th : cat.title_en;
            const desc = lang === 'th' ? cat.desc_th : cat.desc_en;
            const badge = lang === 'th' ? cat.badge_th : cat.badge_en;

            slide.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%); z-index: 1;"></div>
                <img src="${cat.img}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                <div style="position: absolute; bottom: 50%; transform: translateY(50%); left: 60px; z-index: 2; padding: 25px 0; max-width: 500px;">
                    <div style="display: inline-block; background: #c02020; color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 12px; font-size: 0.85rem; text-transform: uppercase;">${badge}</div>
                    <h2 style="color: white; font-family: 'Mitr', sans-serif; margin-bottom: 12px; font-size: 2.5rem; line-height: 1.2;">${title}</h2>
                    <p style="color: #d1d8e0; font-size: 1.05rem; line-height: 1.6; margin-bottom: 20px;">${desc}</p>
                    <div style="color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 10px; font-size: 0.98rem; border-bottom: 2px solid #c02020; padding-bottom: 3px;">
                        <span>${lang === 'th' ? 'ดูสินค้าทั้งหมด' : 'Explore Now'}</span>
                        <i class="fas fa-arrow-right" style="color: #c02020;"></i>
                    </div>
                </div>
            `;
            slidesContainer.appendChild(slide);

            const dot = document.createElement('span');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('data-index', index);
            dotsContainer.appendChild(dot);
        });

        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let currentIndex = 0;

        function updateSlider() {
            slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        }

        if (nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.addEventListener('click', () => { nextSlide(); resetInterval(); });
        }
        if (prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.addEventListener('click', () => { prevSlide(); resetInterval(); });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateSlider();
                resetInterval();
            });
        });

        if (slideInterval) clearInterval(slideInterval);
        function startInterval() { slideInterval = setInterval(nextSlide, 6000); }
        function resetInterval() { clearInterval(slideInterval); startInterval(); }
        startInterval();
    }

    initCategorySlider();
    window.addEventListener('languageChanged', initCategorySlider);

    // --- 4. Entry Popup (Show only once per session) ---
    const entryPopupOverlay = document.getElementById('entryPopupOverlay');
    const closeEntryPopup = document.getElementById('closeEntryPopup');

    if (entryPopupOverlay && closeEntryPopup) {
        if (!sessionStorage.getItem('techgear_popup_shown')) {
            setTimeout(() => {
                entryPopupOverlay.classList.add('active');
                sessionStorage.setItem('techgear_popup_shown', 'true');
            }, 800);
        }

        closeEntryPopup.addEventListener('click', () => {
            entryPopupOverlay.classList.remove('active');
        });
        entryPopupOverlay.addEventListener('click', (e) => {
            if (e.target === entryPopupOverlay) {
                entryPopupOverlay.classList.remove('active');
            }
        });
    }
});