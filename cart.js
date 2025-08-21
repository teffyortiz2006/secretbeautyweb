document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Elementos del formulario de pedido
    const orderModal = document.getElementById('order-modal');
    const closeOrder = document.querySelector('.close-order');
    const orderForm = document.getElementById('order-form');
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    
    // Elementos de la factura
    const invoiceModal = document.getElementById('invoice-modal');
    const closeInvoice = document.querySelector('.close-invoice');
    const closeInvoiceBtn = document.getElementById('close-invoice');
    const printInvoiceBtn = document.getElementById('print-invoice');
    const invoiceItems = document.getElementById('invoice-items');
    const invoiceTotal = document.getElementById('invoice-total');
    const invoiceNumber = document.getElementById('invoice-number');
    const invoiceDate = document.getElementById('invoice-date');
    
    // Elementos de notificación
    const notification = document.getElementById('notification');
    const closeNotification = document.querySelector('.close-notification');
    
    // Carrito de compras
    let cart = [];
    
    // Cargar el carrito desde localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartUI();
        }
    }
    
    // Guardar el carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Agregar un producto al carrito
    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: parseFloat(price),
                quantity: 1
            });
        }
        
        saveCart();
        updateCartUI();
        showNotification('Producto agregado al carrito');
    }
    
    // Eliminar un producto del carrito
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }
    
    // Actualizar la cantidad de un producto
    function updateQuantity(id, quantity) {
        const item = cart.find(item => item.id === id);
        
        if (item) {
            if (quantity <= 0) {
                removeFromCart(id);
            } else {
                item.quantity = quantity;
                saveCart();
                updateCartUI();
            }
        }
    }
    
    // Calcular el total del carrito
    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Actualizar la interfaz del carrito
    function updateCartUI() {
        // Actualizar contador de productos
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Actualizar lista de productos
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;
                
                cartItems.appendChild(cartItem);
            });
            
            // Agregar event listeners a los botones de cantidad y eliminación
            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    updateQuantity(id, item.quantity - 1);
                });
            });
            
            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    updateQuantity(id, item.quantity + 1);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }
        
        // Actualizar total
        const total = calculateTotal();
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Actualizar la interfaz del formulario de pedido
    function updateOrderUI() {
        // Actualizar lista de productos en el formulario de pedido
        orderItems.innerHTML = '';
        
        if (cart.length === 0) {
            orderItems.innerHTML = '<p>Tu carrito está vacío</p>';
        } else {
            cart.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('order-item');
                
                orderItem.innerHTML = `
                    <span>${item.quantity} x ${item.name}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                
                orderItems.appendChild(orderItem);
            });
        }
        
        // Actualizar total
        const total = calculateTotal();
        orderTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Mostrar una notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification-toast');
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Generar factura
    function generateInvoice() {
        // Generar número de factura aleatorio
        const invoiceNum = 'INV-' + Math.floor(Math.random() * 1000000);
        invoiceNumber.textContent = invoiceNum;
        
        // Fecha actual
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-ES');
        invoiceDate.textContent = formattedDate;
        
        // Limpiar items de factura
        invoiceItems.innerHTML = '';
        
        // Agregar items a la factura
        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.quantity}</td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            `;
            invoiceItems.appendChild(row);
        });
        
        // Actualizar total de factura
        const total = calculateTotal();
        invoiceTotal.textContent = `$${total.toFixed(2)}`;
        
        // Mostrar factura
        invoiceModal.style.display = 'flex';
        
        // Cerrar formulario de pedido
        orderModal.style.display = 'none';
    }
    
    // Event listeners para los botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            
            addToCart(id, name, price);
        });
    });
    
    // Event listeners para el carrito
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'flex';
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    // Cerrar el carrito al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // Event listener para el botón de checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            // Actualizar la interfaz del formulario de pedido
            updateOrderUI();
            
            // Mostrar formulario de pedido
            orderModal.style.display = 'flex';
            
            // Cerrar carrito
            cartModal.style.display = 'none';
        } else {
            showNotification('Tu carrito está vacío');
        }
    });
    
    // Event listeners para el formulario de pedido
    closeOrder.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });
    
    // Cerrar el formulario de pedido al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
    
    // Event listener para el envío del formulario de pedido
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recopilar datos del formulario
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postal-code').value;
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholder-name').value;
        
        // Crear objeto de pedido
        const orderData = {
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            shipping: {
                address: address,
                city: city,
                postalCode: postalCode
            },
            payment: {
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv,
                cardholderName: cardholderName
            },
            items: cart,
            total: calculateTotal()
        };
        
        // Enviar el pedido al servidor
        fetch('php/process_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar notificación de éxito
                notification.style.display = 'flex';
                
                // Generar factura
                generateInvoice();
                
                // Vaciar el carrito
                cart = [];
                saveCart();
                updateCartUI();
                
                // Resetear el formulario
                orderForm.reset();
            } else {
                showNotification('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
        });
    });
    
    // Event listeners para la factura
    closeInvoice.addEventListener('click', () => {
        invoiceModal.style.display = 'none';
    });
    
    closeInvoiceBtn.addEventListener('click', () => {
        invoiceModal.style.display = 'none';
    });
    
    // Cerrar la factura al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === invoiceModal) {
            invoiceModal.style.display = 'none';
        }
    });
    
    // Event listener para imprimir factura
    printInvoiceBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Event listener para cerrar notificación
    closeNotification.addEventListener('click', () => {
        notification.style.display = 'none';
    });
    
    // Cargar el carrito al iniciar la página
    loadCart();
});