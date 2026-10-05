document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Top Navigation Active State --- (Moved to navbar.js)

    // --- 2. Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                if (!term || title.includes(term)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --- 3. Shopping Cart Functionality ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Auto-fix any corrupted cart data from previous bug
    let cartFixed = false;
    cart.forEach(item => {
        if (item.quantity !== undefined) {
            item.qty = item.qty || item.quantity;
            delete item.quantity;
            cartFixed = true;
        }
        if (item.name && !item.title) {
            item.title = item.name;
            delete item.name;
            cartFixed = true;
        }
    });
    if (cartFixed) localStorage.setItem('cart', JSON.stringify(cart));

    const cartBadge = document.getElementById('cartBadge');
    
    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartBadge) {
            const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
            cartBadge.textContent = totalQty;
            cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
        }
    };

    window.saveCart = function() {
        localStorage.setItem('cart', JSON.stringify(cart));
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.username) {
            fetch('/api/cart/' + currentUser.username, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cart })
            }).catch(e => console.error('Cart sync failed', e));
        }
    };

    window.addToCart = function(product, qty = 1) {
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
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        const title = lang === 'th' ? product.title_th : product.title_en;
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: product.id,
                title: title,
                price: product.price,
                img: product.icon,
                qty: qty
            });
        }
        saveCart();
        updateBadge();
        
        // Show floating notification
        const notif = document.createElement('div');
        notif.style.position = 'fixed';
        notif.style.bottom = '20px';
        notif.style.right = '20px';
        notif.style.background = '#c02020';
        notif.style.color = '#fff';
        notif.style.padding = '15px 25px';
        notif.style.borderRadius = '8px';
        notif.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
        notif.style.zIndex = '9999';
        notif.style.fontFamily = "'Mitr', sans-serif";
        notif.innerHTML = `<i class="fas fa-check-circle"></i> ${lang === 'th' ? 'เพิ่มลงตะกร้าแล้ว' : 'Added to cart'}`;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.5s';
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    };

    // Render Cart in sidebar if it exists
    window.renderCart = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalEl = document.getElementById('cartTotalPrice');
        if (!cartItemsContainer || !cartTotalEl) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            cartItemsContainer.innerHTML = `<p style="text-align:center; color:#a4b0be; margin-top:20px;">${lang === 'th' ? 'ตะกร้าว่างเปล่า' : 'Cart is empty'}</p>`;
            cartTotalEl.textContent = '฿0.00';
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            
            let imgHtml = '';
            if (item.img && (item.img.startsWith('http') || item.img.startsWith('data:image') || item.img.startsWith('images/'))) {
                imgHtml = `<img src="${item.img}" style="width: 50px; height: 50px; object-fit: contain; background: rgba(255,255,255,0.05); border-radius: 8px;">`;
            } else {
                imgHtml = `<div style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items:center; justify-content:center;"><i class="${item.img || 'fas fa-box'}" style="font-size: 24px; color:#555;"></i></div>`;
            }

            const itemEl = document.createElement('div');
            itemEl.style.display = 'flex';
            itemEl.style.alignItems = 'center';
            itemEl.style.justifyContent = 'space-between';
            itemEl.style.padding = '10px 0';
            itemEl.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

            itemEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    ${imgHtml}
                    <div>
                        <div style="font-weight: 500; font-size: 0.95rem;">${item.title}</div>
                        <div style="color: #a4b0be; font-size: 0.85rem;">฿${item.price.toFixed(2)} x ${item.qty}</div>
                    </div>
                </div>
                <div style="font-weight: bold; margin-left: 10px;">฿${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" data-index="${index}" style="background: none; border: none; color: #c02020; cursor: pointer; padding: 5px 10px; margin-left: 10px;"><i class="fas fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalEl.textContent = `฿${total.toFixed(2)}`;

        // Add event listeners to remove buttons
        const removeBtns = document.querySelectorAll('.remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
                window.updateBadge();
                window.renderCart();
            });
        });
    }

    // Initialize badge on load
    window.updateBadge();

    // --- 4. Category Slider ---
    let slideInterval;
    function initCategorySlider() {
        const slidesContainer = document.querySelector('.slides');
        const dotsContainer = document.querySelector('.slider-dots');
        
        if (slidesContainer && dotsContainer) {
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
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%); z-index: 1;"></div>
                    <img src="${cat.img}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
                    
                    <div style="position: absolute; bottom: 50%; transform: translateY(50%); left: 60px; z-index: 2; padding: 25px 0; max-width: 500px; transition: 0.3s;" onmouseover="this.style.transform='translateY(50%) translateX(10px)'" onmouseout="this.style.transform='translateY(50%) translateX(0)'">
                        <div style="display: inline-block; background: #c02020; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(192,32,32,0.4);">${badge}</div>
                        <h2 style="color: white; font-family: 'Mitr', sans-serif; margin-bottom: 15px; font-size: 2.8rem; line-height: 1.2; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">${title}</h2>
                        <p style="color: #a4b0be; font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px; text-shadow: 0 2px 5px rgba(0,0,0,0.8);">${desc}</p>
                        <div style="color: white; font-weight: bold; display: flex; align-items: center; gap: 10px; font-size: 1rem;">
                            <span style="border-bottom: 2px solid #c02020; padding-bottom: 2px;">${lang === 'th' ? 'ดูสินค้าทั้งหมด' : 'Shop Now'}</span>
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
            
            // Re-bind slider controls
            const slides = document.querySelectorAll('.slide');
            const dots = document.querySelectorAll('.dot');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            let currentIndex = 0;

            function updateSlider() {
                slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                dots.forEach(dot => dot.classList.remove('active'));
                if(dots[currentIndex]) dots[currentIndex].classList.add('active');
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider();
            }

            function prevSlide() {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider();
            }

            if(nextBtn) {
                const newNext = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNext, nextBtn);
                newNext.addEventListener('click', () => { nextSlide(); resetInterval(); });
            }
            if(prevBtn) {
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
            function startInterval() {
                slideInterval = setInterval(nextSlide, 6000);
            }
            function resetInterval() {
                clearInterval(slideInterval);
                startInterval();
            }
            startInterval();
        }
    }
    initCategorySlider();
    window.addEventListener('languageChanged', initCategorySlider);

    // --- 5. Entry Popup ---
    const entryPopupOverlay = document.getElementById('entryPopupOverlay');
    const closeEntryPopup = document.getElementById('closeEntryPopup');
    
    if (entryPopupOverlay && closeEntryPopup) {
        // Show popup automatically shortly after page load
        setTimeout(() => {
            entryPopupOverlay.classList.add('active');
        }, 800);

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
