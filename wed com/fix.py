import re

with open(r'C:\Users\MARCHlnwza\Desktop\wed com\products.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'let mediaHtml = ''.*?\}', re.DOTALL)
match = pattern.search(content)

# Actually, the file ends after window.openProductDetail = openProductDetail;
# We can replace everything from "let mediaHtml =" to "window.openProductDetail"

pattern = re.compile(r'let mediaHtml = \'''\s*if.*?window\.openProductDetail = openProductDetail;', re.DOTALL)

replacement = r'''let mediaHtml = '';
    if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image'))) {
        mediaHtml = <img src="" style="width: 100%; aspect-ratio: 1/1; object-fit: contain; border-radius: 12px; background: rgba(255,255,255,0.02); padding: 10px;">;
    } else {
        mediaHtml = <div style="text-align:center; font-size: 8rem; color: #c02020; margin: 0; background: rgba(255,255,255,0.02); padding: 50px; border-radius: 12px; aspect-ratio: 1/1; display:flex; align-items:center; justify-content:center;"><i class=""></i></div>;
    }

    let thumbsHtml = 
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 2px solid #c02020; overflow:hidden; background: rgba(255,255,255,0.02); padding:5px;">
                
            </div>
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow:hidden; background: rgba(255,255,255,0.02); padding:5px; opacity: 0.6; cursor: pointer;">
                
            </div>
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow:hidden; background: rgba(255,255,255,0.02); padding:5px; opacity: 0.6; cursor: pointer;">
                
            </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top: 20px; align-items: center;">
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="color:#a4b0be; font-size:0.9rem;">Share:</span>
                <i class="fab fa-facebook" style="color: #1877F2; font-size: 1.2rem; cursor:pointer;"></i>
                <i class="fab fa-twitter" style="color: #1DA1F2; font-size: 1.2rem; cursor:pointer;"></i>
                <i class="fab fa-line" style="color: #00C300; font-size: 1.2rem; cursor:pointer;"></i>
            </div>
            <div style="color: #c02020; cursor:pointer; font-size: 1.1rem;">
                <i class="far fa-heart"></i> Favorite (1.2k)
            </div>
        </div>
    ;

    let fullDescHtml = fullDesc ? <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);"><h4 style="margin-bottom: 15px; color: #fff;">Product Details</h4><p style="color: #a4b0be; line-height: 1.8; white-space: pre-wrap; font-size: 0.95rem;"></p></div> : '';

    const oldPrice = (p.price * 1.4).toFixed(2);

    modal.innerHTML = 
        <div class="entry-popup-content glass-card" style="background: rgba(15,16,18,0.7); backdrop-filter: blur(25px); padding: 40px; border-radius: 20px; max-width: 1000px; width: 95%; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.8); max-height: 90vh; overflow-y: auto;">
            <button class="close-popup" onclick="document.getElementById('productDetailModal').classList.remove('active')"><i class="fas fa-times"></i></button>
            <div style="display: flex; gap: 40px; flex-wrap: wrap;">
                
                <div style="flex: 1; min-width: 320px;">
                    
                    
                </div>
                
                <div style="flex: 1.5; min-width: 320px; display: flex; flex-direction: column; justify-content: flex-start;">
                    
                    <div style="margin-bottom: 10px;">
                        <span style="background: #c02020; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-right: 10px;">ร้านแนะนำ</span>
                        <h2 style="font-size: 1.6rem; display: inline; color: #fff;"></h2>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 0.9rem;">
                        <div style="color: #FFD700;">
                            4.8 <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                        </div>
                        <div style="color: #a4b0be; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 15px;">
                            <span style="color: #fff; border-bottom: 1px solid #fff;">1,245</span> Ratings
                        </div>
                        <div style="color: #a4b0be; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 15px;">
                            <span style="color: #fff;">4,500</span> Sold
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="text-decoration: line-through; color: #8c92a0; font-size: 1rem; margin-bottom: 5px;">{oldPrice}</div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h3 style="font-size: 2.2rem; color: #c02020; margin: 0;">{p.price.toFixed(2)}</h3>
                            <span style="background: rgba(192, 32, 32, 0.2); color: #c02020; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">28% OFF</span>
                        </div>
                    </div>

                    <p style="color: #a4b0be; line-height: 1.6; margin-bottom: 20px; font-size: 1rem;"></p>

                    <div style="margin-bottom: 25px;">
                        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <span style="color: #8c92a0; width: 70px;">Shipping</span>
                            <div style="color: #a4b0be;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 5px;">
                                    <i class="fas fa-truck" style="color: #00C300;"></i> 
                                    <span style="color: #fff;">Free Shipping</span>
                                </div>
                                <div style="font-size: 0.9rem;">Estimated Delivery: 3-5 Business Days</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <span style="color: #8c92a0; width: 70px;">Quantity</span>
                            <div style="display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden;">
                                <button style="background: rgba(255,255,255,0.05); border: none; color: white; padding: 5px 15px; cursor: pointer;">-</button>
                                <input type="text" value="1" style="width: 40px; text-align: center; background: transparent; border: none; color: white; border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2); outline: none;">
                                <button style="background: rgba(255,255,255,0.05); border: none; color: white; padding: 5px 15px; cursor: pointer;">+</button>
                            </div>
                            <span style="color: #8c92a0; font-size: 0.9rem;">890 pieces available</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                        <button class="add-to-cart-detail" data-id="" data-name="" data-price="" style="flex: 1; background: rgba(192, 32, 32, 0.1); border: 1px solid #c02020; color: #c02020; padding: 12px; border-radius: 5px; font-size: 1rem; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition: 0.3s;">
                            <i class="fas fa-cart-plus"></i> Add To Cart
                        </button>
                        <button style="flex: 1; background: #c02020; border: none; color: white; padding: 12px; border-radius: 5px; font-size: 1rem; cursor: pointer; transition: 0.3s;">
                            Buy Now
                        </button>
                    </div>
                    
                    <style>
                        .add-to-cart-detail:hover { background: rgba(192, 32, 32, 0.2) !important; }
                    </style>
                    
                    
                </div>
            </div>
        </div>
    ;

    modal.onclick = (e) => {
        if(e.target === modal) modal.classList.remove('active');
    };

    requestAnimationFrame(() => {
        modal.classList.add('active');
        const addBtn = modal.querySelector('.add-to-cart-detail');
        if (addBtn && typeof bindAddToCart === 'function') {
            addBtn.addEventListener('click', (e) => {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = {
                    id: e.currentTarget.getAttribute('data-id'),
                    name: e.currentTarget.getAttribute('data-name'),
                    price: parseFloat(e.currentTarget.getAttribute('data-price')),
                    quantity: 1
                };
                const existing = cart.find(x => x.id === item.id);
                if(existing) existing.quantity++;
                else cart.push(item);
                localStorage.setItem('cart', JSON.stringify(cart));
                if (typeof updateCartUI === 'function') updateCartUI();
                const toast = document.getElementById('toastNotification');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
            });
        }
    });
}
window.openProductDetail = openProductDetail;
'''

new_content = pattern.sub(replacement, content)

with open(r'C:\Users\MARCHlnwza\Desktop\wed com\products.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
