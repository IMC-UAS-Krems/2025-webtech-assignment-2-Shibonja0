// listProductHTML = where product cards will be inserted
// listCartHTML = where cart items will be shown
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');

// listProducts: array will fill from products.json
// carts: array of items user added to the shopping cart
let listProducts = [];
let carts = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    listProductHTML.innerHTML = '';
    if (listProducts.length > 0) {
        listProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add to Cart</button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};

listProductHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
        let product_id = event.target.parentElement.dataset.id;
        addToCart(product_id);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex(value => value.product_id == product_id);
    if (positionThisProductInCart < 0) {
        carts.push({ product_id: product_id, quantity: 1 });
    } else {
        carts[positionThisProductInCart].quantity++;
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (carts.length > 0) {
        carts.forEach(cartItem => {
            totalQuantity += cartItem.quantity;
            let positionProduct = listProducts.findIndex(product => product.id == cartItem.product_id);
            let productInfo = listProducts[positionProduct];
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = cartItem.product_id;
            newItem.innerHTML = `
                <div class="image">
                    <img src="${productInfo.image}" alt="${productInfo.name}">
                </div>
                <div class="name">${productInfo.name}</div>
                <div class="totalPrice">$${productInfo.price * cartItem.quantity}</div>
                <div class="quantity">
                    <span class="minus">‹</span>
                    <span>${cartItem.quantity}</span>
                    <span class="plus">›</span>
                </div>
            `;
            listCartHTML.appendChild(newItem);
        });
    }
    iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('minus') || event.target.classList.contains('plus')) {
        let product_id = event.target.parentElement.parentElement.dataset.id;
        let type = event.target.classList.contains('plus') ? 'plus' : 'minus';
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = carts.findIndex(value => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        if (type === 'plus') {
            carts[positionItemInCart].quantity++;
        } else {
            carts[positionItemInCart].quantity--;
            if (carts[positionItemInCart].quantity <= 0) {
                carts.splice(positionItemInCart, 1);
            }
        }
    }
    addCartToHTML();
    addCartToMemory();
};

const initApp = () => {
    // initApp: load product data from JSON and render page
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            listProducts = data;
            addDataToHTML();

            // restore cart from localStorage if present
            if (localStorage.getItem('cart')) {
                carts = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        });
}

initApp();

// --- Checkout form & validation ---
// Checkout & validation: simple checks so data looks realistic
const checkOutBtn = document.querySelector('.checkOut');
const checkoutModal = document.querySelector('.checkoutModal');
const closeCheckout = document.querySelector('.closeCheckout');
const cancelCheckout = document.querySelector('.cancelCheckout');
const checkoutForm = document.querySelector('#checkoutForm');
const confirmation = document.querySelector('.confirmation');
const confirmationBody = document.querySelector('.confirmationBody');
const closeConfirmation = document.querySelector('.closeConfirmation');

checkOutBtn.addEventListener('click', () => {
    if (carts.length === 0) {
        alert('Your cart is empty. Add items before checking out.');
        return;
    }
    // show form
    checkoutForm.classList.remove('hidden');
    confirmation.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
});

closeCheckout.addEventListener('click', () => checkoutModal.classList.add('hidden'));
cancelCheckout.addEventListener('click', () => checkoutModal.classList.add('hidden'));

// simple validators
const isNumeric = s => /^[0-9]+$/.test(s);
const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // clear errors
    checkoutForm.querySelectorAll('.error').forEach(el => el.innerText = '');

    const name = checkoutForm.name.value.trim();
    const email = checkoutForm.email.value.trim();
    const phone = checkoutForm.phone.value.trim();
    const address = checkoutForm.address.value.trim();
    const zip = checkoutForm.zip.value.trim();

    let hasError = false;
    if (name.length < 2) { checkoutForm.querySelector('#name + .error').innerText = 'Enter your name'; hasError = true; }
    if (!isEmail(email)) { checkoutForm.querySelector('#email + .error').innerText = 'Enter a valid email'; hasError = true; }
    if (!isNumeric(phone)) { checkoutForm.querySelector('#phone + .error').innerText = 'Phone must be numbers only'; hasError = true; }
    if (address.length < 6) { checkoutForm.querySelector('#address + .error').innerText = 'Enter a valid address'; hasError = true; }
    if (!isNumeric(zip) || zip.length > 6) { checkoutForm.querySelector('#zip + .error').innerText = 'ZIP must be numeric, max 6 chars'; hasError = true; }

    if (hasError) return;

    // compute summary
    let subtotal = 0;
    let totalItems = 0;
    const items = carts.map(cartItem => {
        const pIndex = listProducts.findIndex(p => p.id == cartItem.product_id);
        const p = listProducts[pIndex];
        const line = p.price * cartItem.quantity;
        subtotal += line;
        totalItems += cartItem.quantity;
        return { name: p.name, qty: cartItem.quantity, price: p.price, line };
    });

    const DISCOUNT_RATE = totalItems >= 3 ? 0.10 : 0; // 10% discount for 3+ items
    const TAX_RATE = 0.07; // 7% tax
    const discount = +(subtotal * DISCOUNT_RATE).toFixed(2);
    const tax = +((subtotal - discount) * TAX_RATE).toFixed(2);
    const total = +(subtotal - discount + tax).toFixed(2);

    // build confirmation HTML
    let html = '<strong>Buyer</strong><br>' +
        `${name}<br>${address}<br>${email}<br>Phone: ${phone}<hr>`;
    html += '<strong>Items</strong><br><table><thead><tr><th>Item</th><th>Qty</th><th>Line</th></tr></thead><tbody>';
    items.forEach(it => {
        html += `<tr><td>${it.name}</td><td>${it.qty}</td><td>$${(it.line).toFixed(2)}</td></tr>`;
    });
    html += `</tbody></table>`;
    html += `<hr><table><tbody>`;
    html += `<tr><td>Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>`;
    html += `<tr><td>Discount${DISCOUNT_RATE > 0 ? ` (${(DISCOUNT_RATE * 100).toFixed(0)}%)` : ''}</td><td style="text-align:right">-$${discount.toFixed(2)}</td></tr>`;
    html += `<tr><td>Tax</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>`;
    html += `<tr><th>Total</th><th style="text-align:right">$${total.toFixed(2)}</th></tr>`;
    html += `</tbody></table>`;

    confirmationBody.innerHTML = html;
    // show confirmation
    checkoutForm.classList.add('hidden');
    confirmation.classList.remove('hidden');

    // clear cart (purchase complete)
    carts = [];
    addCartToHTML();
    addCartToMemory();
});

closeConfirmation.addEventListener('click', () => {
    confirmation.classList.add('hidden');
    checkoutModal.classList.add('hidden');
});
