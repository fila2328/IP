// DOM Elements
const screenContent = document.getElementById('screenContent');
const modeIndicator = document.querySelector('.mode-indicator');
const modeButtons = document.querySelectorAll('.mode-btn');
const authForms = document.querySelectorAll('.auth-form');
const switchLinks = document.querySelectorAll('.switch-link');
const loadingOverlay = document.querySelector('.loading-overlay');

// Form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Current mode state
let currentMode = 'login';
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show initial loading animation
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        initializeScreenContent();
        initializeEventListeners();
    }, 2000);
});

// Initialize screen content
async function initializeScreenContent() {
    let userCount = 0;
    try {
        const stats = await apiRequest('/api/stats');
        userCount = stats.userCount || 0;
    } catch (error) {
        console.warn('Could not fetch stats:', error.message);
    }

    const welcomeContent = `
        <div class="screen-welcome">
            <h3>School Feedback System</h3>
            <p>Student feedback portal for evaluating teachers and courses.</p>
            <div class="system-status">
                <p><i class="fas fa-circle" style="color: #00ff00; margin-right: 8px;"></i> System Status: Online</p>
                <p><i class="fas fa-users" style="color: #1a2980; margin-right: 8px;"></i> Active Users: ${userCount}</p>
            </div>
        </div>
    `;
    
    screenContent.innerHTML = welcomeContent;
    
    // Animate screen content
    setTimeout(() => {
        screenContent.classList.add('active');
    }, 500);
}

// Initialize all event listeners
function initializeEventListeners() {
    // Mode switcher buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.dataset.mode;
            switchMode(mode);
        });
    });
    
    // Switch links in forms
    switchLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetMode = this.dataset.target;
            switchMode(targetMode);
        });
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLoginSubmit);
    registerForm.addEventListener('submit', handleRegisterSubmit);
    
    // Forgot password link
    document.querySelector('.forgot-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotPasswordModal();
    });
}

// Switch between login and register modes
function switchMode(mode) {
    if (mode === currentMode) return;
    
    // Update current mode
    currentMode = mode;
    
    // Animate mode indicator
    modeIndicator.classList.toggle('register-mode', mode === 'register');
    
    // Update active button
    modeButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.mode === mode);
    });
    
    // Animate forms with slow motion transition
    authForms.forEach(form => {
        if (form.id === `${mode}Form`) {
            form.classList.add('active');
            animateFormIn(form);
        } else {
            form.classList.remove('active');
            animateFormOut(form);
        }
    });
    
    // Update screen content
    updateScreenContent(mode);
}

// Animate form in with slow motion
function animateFormIn(form) {
    form.style.opacity = '0';
    form.style.transform = 'translateX(30px)';
    
    requestAnimationFrame(() => {
        form.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.opacity = '1';
        form.style.transform = 'translateX(0)';
    });
}

// Animate form out with slow motion
function animateFormOut(form) {
    form.style.opacity = '1';
    form.style.transform = 'translateX(0)';
    
    requestAnimationFrame(() => {
        form.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.opacity = '0';
        form.style.transform = 'translateX(-30px)';
    });
}

// Update screen content based on mode
function updateScreenContent(mode) {
    screenContent.classList.remove('active');
    
    setTimeout(() => {
        let content;
        if (mode === 'login') {
            content = `
                <div class="screen-welcome">
                    <h3>Student Login Portal</h3>
                    <p>Access your personalized dashboard to provide feedback for teachers.</p>
                    <div class="system-status">
                        <p><i class="fas fa-circle" style="color: #00ff00; margin-right: 8px;"></i> System Status: Online</p>
                        <p><i class="fas fa-users" style="color: #1a2980; margin-right: 8px;"></i> Active Users: 0</p>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="screen-welcome">
                    <h3>Student Registration</h3>
                    <p>Create your account to participate in the feedback system.</p>
                    <div class="system-status">
                        <p><i class="fas fa-user-graduate" style="color: #26d0ce; margin-right: 8px;"></i> Register to get started</p>
                        <p><i class="fas fa-shield-alt" style="color: #1a2980; margin-right: 8px;"></i> Your data is secured</p>
                    </div>
                </div>
            `;
        }
        
        screenContent.innerHTML = content;
        
        setTimeout(() => {
            screenContent.classList.add('active');
        }, 300);
    }, 300);
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('remember').checked;
    
    // Clear previous errors
    clearErrors('login');
    
    // Validate inputs
    let isValid = true;
    
    // Exception for admin email (ddu.edu.et doesn't need @)
    const isAdminEmail = email === 'ddu.edu.et';
    
    if (!isAdminEmail && !validateEmail(email)) {
        showError('loginEmailError', 'Please enter a valid school email');
        isValid = false;
    }
    
    // Password validation - exception for admin
    if (!isAdminEmail && password.length < 6) {
        showError('loginPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    let user;
    try {
        user = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    } catch (error) {
        showError('loginEmailError', error.message || 'Invalid email or password');
        return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = 'Authenticating...';
    submitBtn.disabled = true;
    
    // Simulate API call with slow motion
    await simulateAPICall(1500);
    
    // Save current user to session
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Save remember me preference
    if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'DashBoard.html';
    }, 1000);
}

// Handle register form submission
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const department = document.getElementById('department').value;
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const terms = document.getElementById('terms').checked;
    
    // Clear previous errors
    clearErrors('register');
    
    // Validate inputs
    let isValid = true;
    
    if (name.length < 2) {
        showError('registerNameError', 'Please enter your full name');
        isValid = false;
    }
    
    if (!studentId.match(/^[A-Za-z0-9]{7,10}$/)) {
        showError('studentIdError', 'Please enter a valid student ID (7-10 alphanumeric characters)');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('registerEmailError', 'Please enter a valid school email');
        isValid = false;
    }
    
    if (!department) {
        showError('departmentError', 'Please select your department');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('registerPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    if (!terms) {
        showError('termsError', 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const submitBtn = registerForm.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    // Simulate API call with slow motion
    await simulateAPICall(2000);
    
    let createdUser;
    try {
        createdUser = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, studentId, email, department, password })
        });
    } catch (error) {
        submitBtn.querySelector('.btn-text').textContent = originalText;
        submitBtn.disabled = false;
        if (error.message.toLowerCase().includes('student id')) {
            showError('studentIdError', error.message);
        } else if (error.message.toLowerCase().includes('email')) {
            showError('registerEmailError', error.message);
        } else {
            showError('registerEmailError', error.message);
        }
        return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(createdUser));
    
    // Show success message
    showSuccessMessage('Registration Successful', `Welcome ${name}! Your account has been created successfully.`);
    
    // Redirect to dashboard after delay
    setTimeout(() => {
        window.location.href = 'DashBoard.html';
    }, 2000);
}

// Validation helpers
function validateEmail(email) {
    // Exception for admin email
    if (email === 'ddu.edu.et') {
        return true;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function clearErrors(formType) {
    const errorElements = document.querySelectorAll(`#${formType}Form .error-message`);
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('show');
    });
}

// Simulate API call with slow motion
function simulateAPICall(duration) {
    return new Promise(resolve => {
        // Update screen with loading animation
        screenContent.classList.remove('active');
        
        setTimeout(() => {
            const loadingContent = `
                <div class="screen-welcome">
                    <h3>Processing Request</h3>
                    <p>Connecting to school server...</p>
                    <div class="loading-animation">
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                    </div>
                </div>
            `;
            
            screenContent.innerHTML = loadingContent;
            
            // Animate progress bar
            const progressBar = screenContent.querySelector('.loading-progress');
            progressBar.style.width = '0%';
            progressBar.style.height = '4px';
            progressBar.style.background = 'linear-gradient(90deg, #1a2980, #26d0ce)';
            progressBar.style.borderRadius = '2px';
            progressBar.style.transition = `width ${duration}ms ease-in-out`;
            
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
            
            setTimeout(() => {
                screenContent.classList.add('active');
                resolve();
            }, 300);
        }, 300);
    });
}

// Show success message with slow motion animation
function showSuccessMessage(title, message) {
    const successModal = document.createElement('div');
    successModal.className = 'success-message';
    successModal.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    
    document.body.appendChild(successModal);
    
    // Add progress bar animation
    const progressFill = successModal.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    progressFill.style.height = '4px';
    progressFill.style.background = 'linear-gradient(90deg, #1a2980, #26d0ce)';
    progressFill.style.borderRadius = '2px';
    progressFill.style.transition = 'width 2s linear';
    
    // Show modal with animation
    requestAnimationFrame(() => {
        successModal.classList.add('show');
        
        // Animate progress bar
        setTimeout(() => {
            progressFill.style.width = '100%';
        }, 100);
        
        // Hide modal after animation
        setTimeout(() => {
            successModal.classList.remove('show');
            setTimeout(() => {
                if (successModal.parentNode) {
                    successModal.parentNode.removeChild(successModal);
                }
            }, 1000);
        }, 2000);
    });
}

// Show forgot password modal
function showForgotPasswordModal() {
    const email = document.getElementById('loginEmail').value.trim();
    const modalMessage = email 
        ? `Password reset instructions have been sent to ${email}`
        : 'Please enter your email address in the login form first';
    
    showSuccessMessage('Password Reset', modalMessage);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + L for login mode
    if (e.altKey && e.key === 'l') {
        e.preventDefault();
        switchMode('login');
    }
    
    // Alt + R for register mode
    if (e.altKey && e.key === 'r') {
        e.preventDefault();
        switchMode('register');
    }
    
    // Escape to clear forms
    if (e.key === 'Escape') {
        loginForm.reset();
        registerForm.reset();
        clearErrors('login');
        clearErrors('register');
    }
});

// Check for remembered user
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const user = JSON.parse(rememberedUser);
        document.getElementById('loginEmail').value = user.email;
        document.getElementById('loginPassword').value = user.password;
        document.getElementById('remember').checked = true;
    }
});