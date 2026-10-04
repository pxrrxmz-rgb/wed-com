const fs = require('fs');

const file = 'products.js';
let content = fs.readFileSync(file, 'utf8');

const newProducts = `,
    {
        id: 'p7',
        category: 'prebuilds',
        price: 1299.00,
        icon: 'fas fa-desktop',
        title_en: 'Starter Gaming PC',
        title_th: 'พีซีเกมมิ่งระดับเริ่มต้น',
        desc_en: 'RTX 3060, i5-12400F, 16GB RAM',
        desc_th: 'RTX 3060, i5-12400F, แรม 16GB'
    },
    {
        id: 'p8',
        category: 'prebuilds',
        price: 3499.00,
        icon: 'fas fa-desktop',
        title_en: 'Ultimate Creator PC',
        title_th: 'พีซีสำหรับครีเอเตอร์',
        desc_en: 'RTX 4090, i9-14900K, 64GB DDR5',
        desc_th: 'RTX 4090, i9-14900K, แรม 64GB DDR5'
    },
    {
        id: 'p9',
        category: 'deals',
        price: 199.99,
        icon: 'fas fa-headphones',
        title_en: 'Pro Gaming Headset',
        title_th: 'หูฟังเกมมิ่งระดับโปร',
        desc_en: '7.1 Surround, Wireless',
        desc_th: 'ระบบเสียง 7.1 รอบทิศทาง, ไร้สาย'
    }
];`;

content = content.replace('}\n];', '}' + newProducts);

fs.writeFileSync(file, content, 'utf8');
console.log('Added dummy products successfully.');
