document.addEventListener('DOMContentLoaded', () => {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Security check: Redirect if not logged in
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const nameInput = document.getElementById('profName');
    const emailInput = document.getElementById('profEmail');
    const phoneInput = document.getElementById('profPhone');
    const addressInput = document.getElementById('profAddress');
    const passwordInput = document.getElementById('profPassword');
    const form = document.getElementById('profileForm');

    // Handle Avatar
    let base64Avatar = currentUser.avatar || null;
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');

    if (base64Avatar) {
        avatarPreview.innerHTML = `<img src="${base64Avatar}" alt="Profile">`;
    }

    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                base64Avatar = event.target.result;
                avatarPreview.innerHTML = `<img src="${base64Avatar}" alt="Profile">`;
            }
            reader.readAsDataURL(file);
        }
    });

    // Populate current data (some might be undefined if newly registered)
    nameInput.value = currentUser.name || '';
    emailInput.value = currentUser.email || '';
    phoneInput.value = currentUser.phone || '';
    addressInput.value = currentUser.address || '';
    passwordInput.value = currentUser.password || ''; 

    // Handle profile update
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newName = nameInput.value.trim();
        const newEmail = emailInput.value.trim();
        const newPhone = phoneInput.value.trim();
        const newAddress = addressInput.value.trim();
        const newPassword = passwordInput.value.trim();

        if (!newName || !newEmail || !newPassword) {
            showToast(getMsg('msg_fill_all'), true);
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email changed and if new email already exists
        if (newEmail !== currentUser.email) {
            const emailExists = users.find(u => u.email === newEmail);
            if (emailExists) {
                showToast(getMsg('msg_email_exist'), true);
                return;
            }
        }

        // Find user index by old email to update
        const index = users.findIndex(u => u.email === currentUser.email);
        
        // Update current user object
        currentUser.name = newName;
        currentUser.email = newEmail;
        currentUser.phone = newPhone;
        currentUser.address = newAddress;
        currentUser.password = newPassword;
        currentUser.avatar = base64Avatar;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update database
        if (index !== -1) {
            users[index] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }

        showToast(getMsg('msg_prof_saved'));
    });
});
