// main.js - FRONTEND ONLY

// MODAL FUNCTIONS
function openModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'flex';
        const form = document.getElementById('popupSignupForm');
        if (form) form.reset();
        const responseMsg = document.getElementById('responseMessage');
        if (responseMsg) responseMsg.innerHTML = '';
        const pwMsg = document.getElementById('seekerPwMsg');
        if (pwMsg) pwMsg.innerHTML = '';
    }
}

function closeModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openProviderModal() {
    const modal = document.getElementById('providerModal');
    if (modal) {
        modal.style.display = 'flex';
        const form = document.getElementById('popupProviderForm');
        if (form) form.reset();
        const responseMsg = document.getElementById('providerResponseMessage');
        if (responseMsg) responseMsg.innerHTML = '';
        const pwMsg = document.getElementById('providerPwMsg');
        if (pwMsg) pwMsg.innerHTML = '';
    }
}

function closeProviderModal() {
    const modal = document.getElementById('providerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const signupModal = document.getElementById('signupModal');
    const providerModal = document.getElementById('providerModal');
    
    if (event.target === signupModal) {
        closeModal();
    }
    if (event.target === providerModal) {
        closeProviderModal();
    }
}

// PASSWORD VALIDATION
document.addEventListener('DOMContentLoaded', function() {
    // Seeker password confirmation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirm = this.value;
            const msgDiv = document.getElementById('seekerPwMsg');
            
            if (msgDiv) {
                if (password !== confirm) {
                    msgDiv.innerHTML = '❌ Passwords do not match';
                    msgDiv.style.color = 'red';
                } else if (confirm.length > 0) {
                    msgDiv.innerHTML = '✅ Passwords match';
                    msgDiv.style.color = 'green';
                } else {
                    msgDiv.innerHTML = '';
                }
            }
        });
    }
    
    // Provider password confirmation
    const providerConfirmPassword = document.getElementById('providerConfirmPassword');
    if (providerConfirmPassword) {
        providerConfirmPassword.addEventListener('input', function() {
            const password = document.getElementById('providerPassword').value;
            const confirm = this.value;
            const msgDiv = document.getElementById('providerPwMsg');
            
            if (msgDiv) {
                if (password !== confirm) {
                    msgDiv.innerHTML = '❌ Passwords do not match';
                    msgDiv.style.color = 'red';
                } else if (confirm.length > 0) {
                    msgDiv.innerHTML = '✅ Passwords match';
                    msgDiv.style.color = 'green';
                } else {
                    msgDiv.innerHTML = '';
                }
            }
        });
    }
});

// SERVICE SEEKER SIGNUP
const signupForm = document.getElementById('popupSignupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            const responseMsg = document.getElementById('responseMessage');
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: red;">❌ Passwords do not match!</span>';
            }
            return;
        }
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            surname: document.getElementById('surname').value,
            email: document.getElementById('email').value,
            password: password,
            studentNumber: document.getElementById('studentNumber').value,
            servicesNeeded: document.getElementById('servicesNeeded').value
        };
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            const responseMsg = document.getElementById('responseMessage');
            
            if (result.success) {
                if (responseMsg) {
                    responseMsg.innerHTML = '<span style="color: green;">✅ ' + result.message + ' Redirecting to dashboard...</span>';
                }
                // Store user email for auto-login
                localStorage.setItem('userEmail', formData.email);
                setTimeout(() => {
                    closeModal();
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                if (responseMsg) {
                    responseMsg.innerHTML = '<span style="color: red;">❌ ' + result.message + '</span>';
                }
            }
        } catch (error) {
            const responseMsg = document.getElementById('responseMessage');
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: red;">❌ Error: ' + error.message + '</span>';
            }
        }
    });
}

// SERVICE PROVIDER SIGNUP
const providerForm = document.getElementById('popupProviderForm');
if (providerForm) {
    providerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = document.getElementById('providerPassword').value;
        const confirmPassword = document.getElementById('providerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            const responseMsg = document.getElementById('providerResponseMessage');
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: red;">❌ Passwords do not match!</span>';
            }
            return;
        }
        
        const formData = {
            fullName: document.getElementById('providerFullName').value,
            surname: document.getElementById('providerSurname').value,
            email: document.getElementById('providerEmail').value,
            studentNumber: document.getElementById('providerStudentNumber').value,
            password: password,
            serviceType: document.getElementById('serviceType').value,
            bio: document.getElementById('bio').value,
            hourlyRate: document.getElementById('hourlyRate').value,
            campus: document.getElementById('providerCampus').value,
            availability: document.getElementById('providerAvailability').value
        };
        
        try {
            const response = await fetch('/provider/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            const responseMsg = document.getElementById('providerResponseMessage');
            
            if (result.success) {
                if (responseMsg) {
                    responseMsg.innerHTML = '<span style="color: green;">✅ ' + result.message + ' Redirecting to provider dashboard...</span>';
                }
                // Store provider email for auto-login
                localStorage.setItem('providerEmail', formData.email);
                setTimeout(() => {
                    closeProviderModal();
                    window.location.href = 'providerDashboard.html';
                }, 2000);
            } else {
                if (responseMsg) {
                    responseMsg.innerHTML = '<span style="color: red;">❌ ' + result.message + '</span>';
                }
            }
        } catch (error) {
            const responseMsg = document.getElementById('providerResponseMessage');
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: red;">❌ Error: ' + error.message + '</span>';
            }
        }
    });
}

// CHATBOT FUNCTIONS
function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.classList.toggle('minimized');
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToChat(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch('/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        addMessageToChat(data.response, 'bot');
    } catch (error) {
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function sendQuickMessage(message) {
    addMessageToChat(message, 'user');
    
    fetch('/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        addMessageToChat(data.response, 'bot');
    })
    .catch(error => {
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    });
}

function addMessageToChat(message, sender) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="fas ${sender === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.openProviderModal = openProviderModal;
window.closeProviderModal = closeProviderModal;
window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.sendQuickMessage = sendQuickMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.toggleMenu = toggleMenu;

console.log("✅ main.js loaded successfully");