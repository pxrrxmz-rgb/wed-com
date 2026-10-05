
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Flip animation logic
signUpButton.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove("right-panel-active");
});

// Handle Sign Up
const signUpForm = document.querySelector('.sign-up-container form');
const signUpBtn = signUpForm.querySelector('button');

signUpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const inputs = signUpForm.querySelectorAll('input');
    const name = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    if (!name || !email || !password) {
        showToast(getMsg('msg_fill_all'), true);
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, name: name, password: password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast(getMsg('msg_signup_success') || 'Account created! Logging in...');
            
            // Auto login immediately
            const userObj = {
                username: data.username || email,
                name: data.name || name || email,
                email: data.email || email,
                phone: data.phone || '',
                address: data.address || '',
                avatar: data.avatar || null,
                cart: data.cart || []
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userObj));
            localStorage.setItem('cart', JSON.stringify(data.cart || []));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(data.error || getMsg('msg_email_exist'), true);
        }
    } catch (err) {
        showToast('Error connecting to server', true);
    }
});


// Handle Login
const signInForm = document.querySelector('.sign-in-container form');
const signInActionBtn = signInForm.querySelector('button');
const rememberCheckbox = document.getElementById('rememberMe');
const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');

// Auto-fill remembered credentials if available
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('techgear_remembered');
    if (saved) {
        try {
            const creds = JSON.parse(saved);
            if (creds.username && loginUsernameInput) loginUsernameInput.value = creds.username;
            if (creds.password && loginPasswordInput) loginPasswordInput.value = creds.password;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        } catch (e) {}
    }
});

// Password Visibility Toggle
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.parentElement.querySelector('input');
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            icon.style.color = '#c02020';
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            icon.style.color = '#8c92a0';
        }
    });
});

signInActionBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const inputs = signInForm.querySelectorAll('input:not([type="checkbox"])');
    const emailOrUser = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    if (!emailOrUser || !password) {
        showToast(getMsg('msg_fill_all'), true);
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: emailOrUser, password: password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast(getMsg('msg_login_success') || 'Login successful!');
            
            // Handle Remember Me
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('techgear_remembered', JSON.stringify({
                    username: emailOrUser,
                    password: password
                }));
            } else {
                localStorage.removeItem('techgear_remembered');
            }
            
            // Map API user object to match existing frontend format
            const userObj = {
                username: data.username,
                name: data.name || data.username,
                email: data.email || data.username,
                phone: data.phone || '',
                address: data.address || '',
                avatar: data.avatar || null,
                cart: data.cart || []
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userObj));
            
            // Also overwrite local cart with DB cart
            if(data.cart && data.cart.length > 0) {
                localStorage.setItem('cart', JSON.stringify(data.cart));
            }
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(data.error || getMsg('msg_login_fail'), true);
        }
    } catch (err) {
        showToast('Error connecting to server', true);
    }
});

