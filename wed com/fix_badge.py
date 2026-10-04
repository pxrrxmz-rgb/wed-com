import re

with open("shop.js", "r", encoding="utf-8") as f:
    content = f.read()

old_badge = """    function updateBadge() {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = count;
    }"""

new_badge = """    window.updateBadge = function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (typeof cartBadge !== 'undefined' && cartBadge) cartBadge.textContent = count;
    }"""

content = content.replace(old_badge, new_badge)
content = content.replace("updateBadge();", "window.updateBadge();")

with open("shop.js", "w", encoding="utf-8") as f:
    f.write(content)
print("updateBadge fixed")
