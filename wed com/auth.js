function getMsg(key) {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    return (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) ? translations[lang][key] : key;
}

function showToast(message, isError = false) {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}" style="margin-right:8px;"></i>${message}`;

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${isError ? 'rgba(192, 32, 32, 0.95)' : 'rgba(39, 174, 96, 0.95)'};
        color: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        z-index: 100000;
        font-family: 'Mitr', sans-serif;
        font-size: 0.95rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navActions = document.querySelector('.nav-actions');

    if (currentUser && navActions) {
        const loginBtn = navActions.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.remove();

            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.className = 'btn-login';
            profileLink.style.background = 'rgba(255,255,255,0.08)';
            profileLink.style.border = '1px solid rgba(255,255,255,0.18)';

            let userIcon = '<i class="fas fa-user-circle"></i>';
            if (currentUser.avatar) {
                userIcon = `<img src="${currentUser.avatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1px solid #ffffff;">`;
            }

            const displayName = (currentUser.name || currentUser.username || 'User').split(' ')[0];
            profileLink.innerHTML = `${userIcon} <span><span data-i18n="greeting">${getMsg('greeting')}</span>${displayName}</span>`;

            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'btn-login';
            logoutBtn.style.background = 'transparent';
            logoutBtn.style.padding = '9px 12px';
            logoutBtn.title = 'Logout';
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