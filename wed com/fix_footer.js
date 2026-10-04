const fs = require('fs');
const path = require('path');
const base = 'C:/Users/MARCHlnwza/Desktop/wed com';

// 1. Insert footer HTML into index.html before </body>
let indexHtml = fs.readFileSync(path.join(base, 'index.html'), 'utf-8');
const footerHtml = `
    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-left">
                <p>&copy; 2026 TechGear. All rights reserved.</p>
            </div>
            <div class="footer-center">
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
                <a href="privacy.html">Privacy Policy</a>
            </div>
            <div class="footer-right">
                <a href="https://facebook.com" target="_blank" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com" target="_blank" class="social-icon"><i class="fab fa-twitter"></i></a>
                <a href="https://instagram.com" target="_blank" class="social-icon"><i class="fab fa-instagram"></i></a>
                <a href="https://discord.com" target="_blank" class="social-icon"><i class="fab fa-discord"></i></a>
            </div>
        </div>
    </footer>
`;
if (!indexHtml.includes('site-footer')) {
    indexHtml = indexHtml.replace('</body>', footerHtml + '\n</body>');
    fs.writeFileSync(path.join(base, 'index.html'), indexHtml);
    console.log('Footer HTML inserted into index.html');
} else {
    console.log('Footer already present');
}

// 2. Add CSS for the footer into home.css (or create new footer.css)
let homeCssPath = path.join(base, 'home.css');
let homeCss = fs.readFileSync(homeCssPath, 'utf-8');
const footerCss = `
/* Footer Styles */
.site-footer {
    background: rgba(15,16,18,0.8);
    backdrop-filter: blur(12px);
    color: #a4b0be;
    padding: 20px 0;
    font-family: 'Mitr', sans-serif;
    border-top: 1px solid rgba(255,255,255,0.1);
}
.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
}
.footer-left p {
    margin: 0;
    font-size: 0.9rem;
}
.footer-center a {
    margin: 0 10px;
    color: #a4b0be;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
}
.footer-center a:hover {
    color: #fff;
}
.social-icon {
    color: #a4b0be;
    margin: 0 5px;
    font-size: 1.2rem;
    transition: color 0.3s;
}
.social-icon:hover {
    color: #fff;
}
`;
if (!homeCss.includes('.site-footer')) {
    homeCss += '\n' + footerCss;
    fs.writeFileSync(homeCssPath, homeCss);
    console.log('Footer CSS appended to home.css');
} else {
    console.log('Footer CSS already present');
}
