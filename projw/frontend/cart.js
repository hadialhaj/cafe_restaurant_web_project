let isValid = false;
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cafeCristalCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cafeCristalCart', JSON.stringify(this.cart));
    }

    addToCart(name, price, quantity = 1) {
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: Date.now() + Math.random(),
                name: name,
                price: price,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        return this.cart;
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        return this.cart;
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(0, parseInt(quantity) || 0);
            if (item.quantity === 0) {
                this.removeFromCart(itemId);
            } else {
                this.saveCart();
            }
        }
        return this.cart;
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    calculateTax(subtotal) {
        return subtotal * 0.08;
    }

    calculateShipping(subtotal) {
        return subtotal > 0 && subtotal < 50 ? 5.00 : 0;
    }

    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax(subtotal);
        const shipping = this.calculateShipping(subtotal);
        return subtotal + tax + shipping;
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'block' : 'none';
        });
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        return this.cart;
    }

    getCart() {
        return this.cart;
    }
}

const cartManager = new CartManager();

function addToCart(name, price, quantity = 1) {
    return cartManager.addToCart(name, price, quantity);
}

function removeFromCart(itemId) {
    return cartManager.removeFromCart(itemId);
}

function updateQuantity(itemId, quantity) {
    return cartManager.updateQuantity(itemId, quantity);
}

function updateCartCount() {
    return cartManager.updateCartCount();
}

function getCart() {
    return cartManager.getCart();
}

function calculateTotals() {
    const subtotal = cartManager.calculateSubtotal();
    const tax = cartManager.calculateTax(subtotal);
    const shipping = cartManager.calculateShipping(subtotal);
    const total = cartManager.calculateTotal();
    
    return { subtotal, tax, shipping, total };
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    }).format(value);
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    updateTotals();
    updateCartCount();
    
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        // SINGLE SUBMIT EVENT LISTENER
        checkoutForm.addEventListener('submit', function(e) {
            const cart = getCart();
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty!');
                return;
            }
            
            
            document.getElementById('cartData').value = JSON.stringify(cart);
            document.getElementById('jsValidated').value = 'true';
            document.getElementById('logined').value = 'true';
            console.log('Submitting form with cart data:', cart);
        });
    }
    
    const proceedBtn = document.getElementById('proceedCheckout');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            if (checkoutForm) {
                checkoutForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItemsContainer');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        container.innerHTML = '';
        emptyCart.style.display = 'block';
        return;
    }
    
    emptyCart.style.display = 'none';
    
    container.innerHTML = cart.map(item => `
        <div class="item-row" data-item-id="${item.id}" data-price="${item.price}">
            <div class="item-thumb">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84'%3E%3Crect fill='%23d4a574' width='84' height='84'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dy='.3em' fill='%23fff' font-family='Arial'%3E${item.name.substring(0, 8)}%3C/text%3E%3C/svg%3E" alt="${item.name}">
            </div>
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-meta">$${item.price.toFixed(2)} each</div>
            </div>
            <div class="item-actions">
                <div class="qty-control">
                    <button type="button" data-action="decrease" data-item-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="0" data-item-id="${item.id}">
                    <button type="button" data-action="increase" data-item-id="${item.id}">+</button>
                </div>
                <div class="item-line-total" id="lineTotal-${item.id}">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-btn" type="button" data-item-id="${item.id}">Remove</button>
            </div>
        </div>
    `).join('');
    
    attachCartEventListeners();
}

function attachCartEventListeners() {
    document.querySelectorAll('.qty-control button').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseFloat(this.getAttribute('data-item-id'));
            const action = this.getAttribute('data-action');
            const input = this.parentElement.querySelector('input');
            let currentValue = parseInt(input.value) || 0;
            
            if (action === 'increase') {
                currentValue++;
            } else if (action === 'decrease') {
                currentValue = Math.max(0, currentValue - 1);
            }
            
            updateQuantity(itemId, currentValue);
            renderCart();
            updateTotals();
            updateCartCount();
        });
    });
    
    document.querySelectorAll('.qty-control input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseFloat(this.getAttribute('data-item-id'));
            const value = parseInt(this.value) || 0;
            updateQuantity(itemId, value);
            renderCart();
            updateTotals();
            updateCartCount();
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseFloat(this.getAttribute('data-item-id'));
            removeFromCart(itemId);
            renderCart();
            updateTotals();
            updateCartCount();
        });
    });
}

function updateTotals() {
    const { subtotal, tax, shipping, total } = calculateTotals();
    
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTax = document.getElementById('summaryTax');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summarySubtotal) summarySubtotal.textContent = formatCurrency(subtotal);
    if (summaryTax) summaryTax.textContent = formatCurrency(tax);
    if (summaryShipping) summaryShipping.textContent = formatCurrency(shipping);
    if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
}