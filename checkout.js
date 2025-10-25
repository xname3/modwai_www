// Initialize Paddle
const VENDOR_ID = 40170;

// Initialize Paddle with the vendor ID
if (typeof Paddle !== 'undefined') {
    Paddle.Initialize({
        token: VENDOR_ID.toString(),
        eventCallback: function(data) {
            // Handle Paddle events
            console.log('Paddle event:', data);
            
            // Handle checkout events
            if (data.name === "checkout.completed") {
                console.log('Checkout completed successfully');
                // You can add custom success handling here
                showSuccessMessage();
            }
            
            if (data.name === "checkout.closed") {
                console.log('Checkout was closed');
            }
        }
    });
} else {
    console.error('Paddle library not loaded');
}

// Function to open Paddle checkout
function openCheckout(priceId) {
    if (typeof Paddle === 'undefined') {
        console.error('Paddle is not initialized');
        alert('Payment system is not available. Please try again later.');
        return;
    }

    try {
        // Open Paddle checkout with the selected price ID
        Paddle.Checkout.open({
            items: [{
                priceId: priceId,
                quantity: 1
            }],
            customData: {
                product: 'MODWAI',
                description: 'Oracle Database Monitoring Tool with AI Assistant'
            }
        });
    } catch (error) {
        console.error('Error opening checkout:', error);
        alert('Unable to open checkout. Please try again.');
    }
}

// Show success message after successful checkout
function showSuccessMessage() {
    // Create a success message overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const message = document.createElement('div');
    message.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
        margin: 0 20px;
    `;
    
    message.innerHTML = `
        <h2 style="color: #667eea; margin-bottom: 1rem;">Thank You!</h2>
        <p style="font-size: 1.1rem; color: #4a5568; margin-bottom: 2rem;">
            Your purchase was successful. You will receive an email with setup instructions shortly.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #667eea; color: white; border: none; padding: 1rem 2rem; 
                       font-size: 1rem; border-radius: 8px; cursor: pointer;">
            Close
        </button>
    `;
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.remove();
        }
    }, 10000);
}

// Price ID mapping for reference
const PRICE_IDS = {
    starter: 'pri_01k8dxd4qvr1wnrd1c34dhbh5y',
    professional: 'pri_01k8dxeca4wc8dwndkvaxk1xtq',
    enterprise: 'pri_01k8dxk5e3nsnq9zeatcxtjy4n',
    plan4: 'pri_01k8e7g8bgwzn80gjaakfgabfe',
    plan5: 'pri_01k8e7hqxbc8expmheydy3p8tv',
    plan6: 'pri_01k8e7kh6g9acdtr82pczkm414'
};

console.log('Paddle checkout initialized with vendor ID:', VENDOR_ID);
