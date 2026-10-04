const fs = require('fs');

// 1. Read index.html to copy the navbar and footer.
const indexHtml = fs.readFileSync('index.html', 'utf8');

const navStart = indexHtml.indexOf('<nav class="navbar">');
const navEnd = indexHtml.indexOf('</nav>') + 6;
const navbar = indexHtml.substring(navStart, navEnd);

const footerStart = indexHtml.indexOf('<footer');
const footerEnd = indexHtml.indexOf('</footer>') + 9;
const footer = indexHtml.substring(footerStart, footerEnd);

// 2. Create product.html
const productPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Detail - TechGEAR</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="home.css">
    <link rel="stylesheet" href="login.css">
</head>
<body class="dark-mode glass-theme">

    \${navbar}

    <main class="container" style="margin-top: 120px; margin-bottom: 50px; min-height: 60vh;" id="productContainer">
        <!-- Product Details will be injected here -->
    </main>

    \${footer}

    <div id="toastNotification" class="toast">
        <i class="fas fa-check-circle"></i> Item added to cart!
    </div>

    <script src="lang.js"></script>
    <script src="login.js"></script>
    <script src="products.js"></script>
    <script src="shop.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (id) {
                renderSingleProductPage(id);
            } else {
                document.getElementById('productContainer').innerHTML = '<div style="text-align:center; padding:100px; color:white;"><h1>Product Not Found</h1><a href="index.html" class="btn-primary-pill" style="margin-top:20px; display:inline-block;">Go Back Home</a></div>';
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync('product.html', productPageHtml, 'utf8');

// 3. Modify products.js to redirect and to have renderSingleProductPage
let productsJs = fs.readFileSync('products.js', 'utf8');

const replacement = `function openProductDetail(id) {
    window.location.href = 'product.html?id=' + id;
}

function renderSingleProductPage(id) {
    const products = getProducts();
    const p = products.find(x => x.id === id);
    const container = document.getElementById('productContainer');
    
    if(!p) {
        container.innerHTML = '<div style="text-align:center; padding:100px; color:white;"><h1>Product Not Found</h1><a href="index.html" class="btn-primary-pill" style="margin-top:20px; display:inline-block;">Go Back Home</a></div>';
        return;
    }
    
    const lang = localStorage.getItem('language') || 'en';
    const title = lang === 'th' && p.title_th ? p.title_th : p.title_en;
    const desc = lang === 'th' && p.desc_th ? p.desc_th : p.desc_en;
    const fullDesc = lang === 'th' && p.full_th ? p.full_th : (p.full_en || '');
    
    let mediaHtml = '';
    if (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:image'))) {
        mediaHtml = \\\`<img src="\${p.icon}" style="width: 100%; aspect-ratio: 1/1; object-fit: contain; border-radius: 12px; background: rgba(255,255,255,0.02); padding: 10px;">\\\`;
    } else {
        mediaHtml = \\\`<div style="text-align:center; font-size: 8rem; color: #c02020; margin: 0; background: rgba(255,255,255,0.02); padding: 50px; border-radius: 12px; aspect-ratio: 1/1; display:flex; align-items:center; justify-content:center;"><i class="\${p.icon || 'fas fa-box'}"></i></div>\\\`;
    }

    let thumbsHtml = \\\`
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 2px solid #c02020; overflow:hidden; background: rgba(255,255,255,0.02); padding:5px;">
                \\\${mediaHtml.replace('width: 100%; aspect-ratio: 1/1;', 'width: 100%; height:100%;').replace('font-size: 8rem;', 'font-size: 2rem;')}
            </div>
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow:hidden; background: rgba(255,255,255,0.02); padding:5px; opacity: 0.6; cursor: pointer;">
                \\\${mediaHtml.replace('width: 100%; aspect-ratio: 1/1;', 'width: 100%; height:100%;').replace('font-size: 8rem;', 'font-size: 2rem;')}
            </div>
            <div style="width: 20%; aspect-ratio: 1/1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow:hidden; background: rgba(255,255,255,0.02); padding:5px; opacity: 0.6; cursor: pointer;">
                \\\${mediaHtml.replace('width: 100%; aspect-ratio: 1/1;', 'width: 100%; height:100%;').replace('font-size: 8rem;', 'font-size: 2rem;')}
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
    \\\`;

    let fullDescHtml = fullDesc ? \\\`<div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);"><h3 style="margin-bottom: 20px; color: #fff; font-size: 1.5rem;">Product Details</h3><p style="color: #a4b0be; line-height: 1.8; white-space: pre-wrap; font-size: 1.05rem;">\\\${fullDesc}</p></div>\\\` : '';

    const oldPrice = (p.price * 1.4).toFixed(2);

    container.innerHTML = \\\`
        <div class="glass-card" style="background: rgba(15,16,18,0.7); backdrop-filter: blur(25px); padding: 50px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <div style="display: flex; gap: 60px; flex-wrap: wrap;">
                
                <div style="flex: 1; min-width: 350px;">
                    \\\${mediaHtml}
                    \\\${thumbsHtml}
                </div>
                
                <div style="flex: 1.2; min-width: 350px; display: flex; flex-direction: column; justify-content: flex-start;">
                    
                    <div style="margin-bottom: 15px;">
                        <span style="background: #c02020; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; margin-right: 15px; font-weight: bold; letter-spacing: 1px;">ร้านแนะนำ</span>
                        <h1 style="font-size: 2.2rem; display: inline; color: #fff;">\\\${title}</h1>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; font-size: 1rem;">
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
                    
                    <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="text-decoration: line-through; color: #8c92a0; font-size: 1.2rem; margin-bottom: 5px;">$\\\${oldPrice}</div>
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <h2 style="font-size: 3.5rem; color: #c02020; margin: 0; line-height: 1;">$\\\${p.price.toFixed(2)}</h2>
                            <span style="background: rgba(192, 32, 32, 0.2); color: #c02020; padding: 4px 10px; border-radius: 4px; font-size: 1rem; font-weight: bold;">28% OFF</span>
                        </div>
                    </div>

                    <p style="color: #a4b0be; line-height: 1.7; margin-bottom: 30px; font-size: 1.1rem;">\\\${desc}</p>

                    <div style="margin-bottom: 35px;">
                        <div style="display: flex; gap: 25px; margin-bottom: 20px;">
                            <span style="color: #8c92a0; width: 80px; font-size: 1.05rem;">Shipping</span>
                            <div style="color: #a4b0be;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 8px;">
                                    <i class="fas fa-truck" style="color: #00C300; font-size: 1.2rem;"></i> 
                                    <span style="color: #fff; font-size: 1.05rem;">Free Shipping</span>
                                </div>
                                <div style="font-size: 0.95rem;">Estimated Delivery: 3-5 Business Days</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 25px; align-items: center;">
                            <span style="color: #8c92a0; width: 80px; font-size: 1.05rem;">Quantity</span>
                            <div style="display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; overflow: hidden;">
                                <button style="background: rgba(255,255,255,0.05); border: none; color: white; padding: 10px 20px; font-size: 1.2rem; cursor: pointer;">-</button>
                                <input type="text" value="1" style="width: 50px; font-size: 1.1rem; text-align: center; background: transparent; border: none; color: white; border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2); outline: none;">
                                <button style="background: rgba(255,255,255,0.05); border: none; color: white; padding: 10px 20px; font-size: 1.2rem; cursor: pointer;">+</button>
                            </div>
                            <span style="color: #8c92a0; font-size: 1rem;">890 pieces available</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <button class="add-to-cart-detail" data-id="\\\${p.id}" data-name="\\\${title}" data-price="\\\${p.price}" style="flex: 1; background: rgba(192, 32, 32, 0.1); border: 2px solid #c02020; color: #c02020; padding: 18px; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:12px; transition: 0.3s;">
                            <i class="fas fa-cart-plus"></i> Add To Cart
                        </button>
                        <button style="flex: 1; background: #c02020; border: none; color: white; padding: 18px; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(192,32,32,0.4);">
                            Buy Now
                        </button>
                    </div>
                    
                    <style>
                        .add-to-cart-detail:hover { background: rgba(192, 32, 32, 0.2) !important; }
                    </style>
                    
                    \\\${fullDescHtml}
                </div>
            </div>
        </div>
    \\\`;

    const addBtn = container.querySelector('.add-to-cart-detail');
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
}
window.openProductDetail = openProductDetail;
window.renderSingleProductPage = renderSingleProductPage;`;

// Replace from function openProductDetail(id) { to window.openProductDetail = openProductDetail;
const startIdx = productsJs.indexOf('function openProductDetail(id) {');
const endIdx = productsJs.indexOf('window.openProductDetail = openProductDetail;') + 45;

productsJs = productsJs.substring(0, startIdx) + replacement + productsJs.substring(endIdx);
fs.writeFileSync('products.js', productsJs, 'utf8');

console.log("Success");
