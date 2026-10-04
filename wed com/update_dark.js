const fs = require('fs');

const content = fs.readFileSync('products.js', 'utf-8');

const startStr = "container.innerHTML = `";
const endStr = "`;\n\n    const addBtn = container.querySelector('.add-to-cart-detail');";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `container.innerHTML = \`
    <style>
        .w-layout {
            display: flex;
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
            align-items: flex-start;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding-top: 50px;
            padding-bottom: 100px;
            text-align: left;
            color: #ffffff;
        }
        .w-left {
            flex: 1;
            min-width: 0;
        }
        .w-image-container {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            aspect-ratio: 16/10;
            margin-bottom: 40px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .w-pill {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(192, 32, 32, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 700;
            backdrop-filter: blur(10px);
        }
        
        .w-desc h2 {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #ffffff;
        }
        .w-desc p {
            color: #a4b0be;
            line-height: 1.7;
            margin-bottom: 20px;
            font-size: 1.05rem;
        }
        
        .w-right {
            width: 420px;
            flex-shrink: 0;
            background: rgba(15, 16, 18, 0.7);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            position: sticky;
            top: 120px;
        }
        .w-brand-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .w-brand {
            color: #8c92a0;
            font-size: 0.95rem;
            font-weight: 700;
        }
        .w-stock {
            color: #00C300;
            border: 1px solid #00C300;
            background: rgba(0, 195, 0, 0.1);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        
        .w-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        .w-subtitle {
            color: #a4b0be;
            font-size: 1.05rem;
            margin-bottom: 30px;
        }
        
        .w-price {
            font-size: 2.2rem;
            font-weight: 700;
            color: #c02020;
            margin-bottom: 25px;
        }
        
        .w-btn-add {
            width: 100%;
            background: rgba(192, 32, 32, 0.1);
            color: #c02020;
            border: 2px solid #c02020;
            padding: 16px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s;
            margin-bottom: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .w-btn-add:hover {
            background: rgba(192, 32, 32, 0.3);
            box-shadow: 0 4px 15px rgba(192,32,32,0.4);
        }
        
        .w-tax-info {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 25px 0;
            border-top: 1px solid rgba(255,255,255,0.1);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 15px;
        }
        .w-tax-flag {
            font-size: 1.8rem;
            line-height: 1;
        }
        .w-tax-text {
            flex: 1;
            font-size: 0.9rem;
            color: #8c92a0;
            line-height: 1.5;
        }
        .w-tax-btn {
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05);
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #fff;
            cursor: pointer;
            transition: 0.3s;
        }
        .w-tax-btn:hover {
            background: rgba(255,255,255,0.1);
        }
        
        .w-accordion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            color: #a4b0be;
            font-size: 0.95rem;
            cursor: pointer;
            transition: 0.3s;
        }
        .w-accordion:hover {
            color: #fff;
        }
        .w-accordion:last-child {
            border-bottom: none;
        }
        .w-accordion i {
            color: #c02020;
            font-size: 0.8rem;
        }
        
        @media (max-width: 900px) {
            .w-layout { flex-direction: column; }
            .w-right { width: 100%; position: static; }
        }
    </style>
    
    <div class="w-layout">
        <div class="w-left">
            <div class="w-image-container">
                \${mediaContent}
                <div class="w-pill">+2 more images</div>
            </div>
            
            <div class="w-desc">
                <h2>Optimum x TECH GEAR</h2>
                <p>A minimalistic, primer-gray, legendless keycap set, made for the TECH GEAR 60HE+ (Module) but compatible with all 60% keyboards. Designed with Optimum.</p>
                <p>This keycap set was especially made for Ali from Optimum Tech. We wanted to make a set that perfectly aligns with the minimalistic style Ali is after. The keycaps in this set are completely blank and primer coloured, to add to the minimalistic style.</p>
                <p>How Optimum puts it: 'Minimal branding, neutral aesthetic, with a focus on premium materials, machining, and user experience'.</p>
                \${fullDesc ? '<div style="margin-top: 30px;"><h3 style="margin-bottom:10px;font-size:1.2rem;color:#fff;">More Details</h3><p>' + fullDesc + '</p></div>' : ''}
            </div>
        </div>
        
        <div class="w-right">
            <div class="w-brand-row">
                <span class="w-brand">TECH GEAR</span>
                <span class="w-stock">In stock</span>
            </div>
            
            <h1 class="w-title">\${title}</h1>
            <div class="w-subtitle">Exclusive 60% Keycaps</div>
            
            <div class="w-price">THB \${wPriceThb}</div>
            
            <button class="w-btn-add add-to-cart-detail" data-id="\${p.id}" data-name="\${title}" data-price="\${p.price}">
                <i class="fas fa-cart-plus"></i> Add to cart
            </button>
            
            <div class="w-tax-info">
                <div class="w-tax-flag">🇹🇭</div>
                <div class="w-tax-text">Prices exclude import duties and taxes.<br>Duties and taxes are collected at checkout.</div>
                <button class="w-tax-btn">Learn more</button>
            </div>
            
            <div class="w-accordion">
                <span>2-Year Warranty</span>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="w-accordion">
                <span>Worldwide Shipping</span>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="w-accordion">
                <span>30-Day Return</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    </div>`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('products.js', newContent, 'utf-8');
console.log('Replaced successfully');
