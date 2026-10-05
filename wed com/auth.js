// Get translations helper
function getMsg(key) {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    return translations[lang][key] || key;
}

// Show a simple toast notification
function showToast(message, isError = false) {
    // Remove existing toast if any
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    
    // Style the toast
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.background = isError ? 'rgba(192, 32, 32, 0.9)' : 'rgba(46, 204, 113, 0.9)';
    toast.style.color = '#fff';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "San Francisco", "Sukhumvit Set", "Thonburi", sans-serif';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.border = '1px solid rgba(255,255,255,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => { toast.style.opacity = '1'; }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize user session UI
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navActions = document.querySelector('.nav-actions');

    if (currentUser && navActions) {
        // If logged in, replace Login button with Profile & Logout
        const loginBtn = navActions.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.remove();
            
            // Add Profile link
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.className = 'btn-login'; // reuse style
            profileLink.style.background = 'rgba(255,255,255,0.1)';
            profileLink.style.border = '1px solid rgba(255,255,255,0.2)';
            
            let userIcon = '<i class="fas fa-user-circle"></i>';
            if (currentUser.avatar) {
                userIcon = `<img src="${currentUser.avatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1px solid #ffffff;">`;
            }

            const displayName = (currentUser.name || currentUser.username || 'User').split(' ')[0];
            profileLink.innerHTML = `${userIcon} <span>${getMsg('greeting')} ${displayName}</span>`;
            
            // Add Logout button
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'btn-login';
            logoutBtn.style.background = 'transparent';
            logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> <span data-i18n="nav_logout">${getMsg('nav_logout')}</span>`;
            
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                localStorage.setItem('cart', '[]');
                window.location.reload();
            });

            navActions.appendChild(profileLink);
            navActions.appendChild(logoutBtn);
        }
    }
});
