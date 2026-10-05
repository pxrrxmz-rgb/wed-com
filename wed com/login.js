
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
            inputs.forEach(input => input.value = '');
            showToast(getMsg('msg_signup_success') || 'Signup success!');
            container.classList.remove("right-panel-active");
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

signInActionBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const inputs = signInForm.querySelectorAll('input:not([type="checkbox"])');
    const email = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    if (!email || !password) {
        showToast(getMsg('msg_fill_all'), true);
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast(getMsg('msg_login_success') || 'Login successful!');
            
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

// --- Google Login Simulation ---
const googleBtns = document.querySelectorAll('.btn-google');
googleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const btnText = btn.querySelector('span');
        btnText.textContent = "Connecting to Google...";
        btn.style.opacity = "0.7";
        
        setTimeout(() => {
            const googleUser = {
                id: Date.now(),
                username: "user@gmail.com",
                name: "Google User",
                email: "user@gmail.com",
                avatar: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
                cart: []
            };
            localStorage.setItem('currentUser', JSON.stringify(googleUser));
            window.location.href = 'index.html';
        }, 1500);
    });
});
