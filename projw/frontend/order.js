  document.addEventListener('DOMContentLoaded', function() {
            updateCartCount();
            
           
            const items = document.querySelectorAll(".menu-item, .menu-item-right");
            
            items.forEach(item => {
                item.style.cursor = "pointer";
                
                item.addEventListener("click", function(e) {
                    e.preventDefault();
                    const name = this.getAttribute('data-name');
                    const price = parseFloat(this.getAttribute('data-price'));
                    
                    if (name && price) {
                        addToCart(name, price, 1);
                        
                        
                        this.style.backgroundColor = '#4CAF50';
                        this.style.transform = 'scale(1.05)';
                        
                        setTimeout(() => {
                            this.style.backgroundColor = '';
                            this.style.transform = '';
                        }, 300);
                        
                       
                        showNotification(`${name} added to cart!`);
                    }
                });
            });
        });

        function showNotification(message) {
           
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
           
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }