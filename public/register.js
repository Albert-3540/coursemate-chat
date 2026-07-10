// Register function
async function registerUser(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, username, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Account created successfully!');
            // Redirect to login page
            window.location.href = '/login.html';
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Server error. Please try again.');
    }
}

// Attach to form submit
document.getElementById('registerForm')?.addEventListener('submit', registerUser);