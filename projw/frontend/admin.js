document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Simple authentication (in production, this should be server-side)
    if (username === 'admin' && password === 'admin123') {
        // Store admin session
        sessionStorage.setItem('adminLoggedIn', 'true');
        // Redirect to admin dashboard
        window.location.href = 'dashboard.html';
    } else {
        errorMessage.textContent = 'Invalid username or password';
    }
});