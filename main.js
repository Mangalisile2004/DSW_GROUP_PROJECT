// main.js - FRONTEND ONLY
const SUPABASE_URL = 'https://ncahfkosefyrvhbyjdlr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYWhma29zZWZ5cnZoYnlqZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI5OTAwOSwiZXhwIjoyMDk0ODc1MDA5fQ.6MZEqMZrQxqi9W1Ulck1itE2xvXfTCRYKWe5wHhWdZ8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// SERVICE SEEKER SIGNUP (Using Supabase Auth)
const signupForm = document.getElementById('popupSignupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value;
        const surname = document.getElementById('surname').value;
        const studentNumber = document.getElementById('studentNumber').value;
        const servicesNeeded = document.getElementById('servicesNeeded').value;
        
        const responseMsg = document.getElementById('responseMessage');
        
        try {
            // 1. Sign up the user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: `${fullName} ${surname}`,
                        user_type: 'seeker',
                        student_number: studentNumber
                    }
                }
            });
            
            if (authError) {
                console.error('Signup Error:', authError);
                if (responseMsg) {
                    responseMsg.innerHTML = `<span style="color: red;">❌ ${authError.message}</span>`;
                }
                return;
            }
            
            // 2. Store extra profile info in 'profiles' table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    full_name: `${fullName} ${surname}`,
                    email: email,
                    student_number: studentNumber,
                    services_needed: servicesNeeded,
                    user_type: 'seeker',
                    created_at: new Date()
                }]);
            
            if (profileError) {
                console.warn('Profile insert warning:', profileError);
            }
            
            // 3. Show success and redirect
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: green;">✅ Signup successful! Redirecting to dashboard...</span>';
            }
            
            setTimeout(() => {
                closeModal();
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            if (responseMsg) {
                responseMsg.innerHTML = `<span style="color: red;">❌ Error: ${error.message}</span>`;
            }
        }
    });
}

// SERVICE PROVIDER SIGNUP (Using Supabase Auth)
const providerForm = document.getElementById('popupProviderForm');
if (providerForm) {
    providerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('providerEmail').value;
        const password = document.getElementById('providerPassword').value;
        const confirmPassword = document.getElementById('providerConfirmPassword').value;
        const fullName = document.getElementById('providerFullName').value;
        const surname = document.getElementById('providerSurname').value;
        const studentNumber = document.getElementById('providerStudentNumber').value;
        const serviceType = document.getElementById('serviceType').value;
        const bio = document.getElementById('bio').value;
        const hourlyRate = document.getElementById('hourlyRate').value;
        const campus = document.getElementById('providerCampus').value;
        const availability = document.getElementById('providerAvailability').value;
        
        const responseMsg = document.getElementById('providerResponseMessage');
        
        if (password !== confirmPassword) {
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: red;">❌ Passwords do not match!</span>';
            }
            return;
        }
        
        try {
            // 1. Sign up provider with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: `${fullName} ${surname}`,
                        user_type: 'provider',
                        student_number: studentNumber,
                        service_type: serviceType
                    }
                }
            });
            
            if (authError) {
                console.error('Signup Error:', authError);
                if (responseMsg) {
                    responseMsg.innerHTML = `<span style="color: red;">❌ ${authError.message}</span>`;
                }
                return;
            }
            
            // 2. Store provider details in 'providers' table
            const { error: providerError } = await supabase
                .from('providers')
                .insert([{
                    id: authData.user.id,
                    full_name: `${fullName} ${surname}`,
                    email: email,
                    student_number: studentNumber,
                    service_type: serviceType,
                    bio: bio,
                    hourly_rate: hourlyRate,
                    campus: campus,
                    availability: availability,
                    rating: 0,
                    created_at: new Date()
                }]);
            
            if (providerError) {
                console.warn('Provider insert warning:', providerError);
            }
            
            // 3. Show success and redirect
            if (responseMsg) {
                responseMsg.innerHTML = '<span style="color: green;">✅ Signup successful! Redirecting to provider dashboard...</span>';
            }
            
            setTimeout(() => {
                closeProviderModal();
                window.location.href = 'providerDashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            if (responseMsg) {
                responseMsg.innerHTML = `<span style="color: red;">❌ Error: ${error.message}</span>`;
            }
        }
    });
}

// ... (rest of your chatbot functions remain the same)

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