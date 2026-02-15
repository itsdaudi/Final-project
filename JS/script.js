/**
 * RAHAJIPE RESORT - MAIN APPLICATION
 * Final Project: HTML, CSS, JavaScript with localStorage
 * Meets all project requirements
 */

// ===== CONSTANTS =====
const STORAGE_KEY = 'rahajipe_resort_bookings';
const MAX_PARTICIPANTS = 10;
const MIN_NAME_LENGTH = 2;

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ERROR HANDLING =====
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    const inputId = elementId.replace('Error', '');
    const input = document.getElementById(inputId);
    if (input) input.classList.add('error');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.remove('error');
    });
}

function showFormMessage(message, type = 'success') {
    const messageElement = document.getElementById('form-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// ===== VALIDATION =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateField(fieldName, value) {
    // Required check
    if (!value || value.toString().trim() === '') {
        return { isValid: false, message: `${fieldName} is required.` };
    }

    // Field-specific validation
    switch(fieldName) {
        case 'name':
            if (value.length < MIN_NAME_LENGTH) {
                return { isValid: false, message: `Name must be at least ${MIN_NAME_LENGTH} characters.` };
            }
            break;

        case 'email':
            if (!validateEmail(value)) {
                return { isValid: false, message: 'Please enter a valid email address.' };
            }
            break;

        case 'date':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                return { isValid: false, message: 'Please select a future date.' };
            }
            break;

        case 'participants':
            const num = parseInt(value);
            if (num < 1) {
                return { isValid: false, message: 'At least one participant is required.' };
            }
            if (num > MAX_PARTICIPANTS) {
                return { isValid: false, message: `Maximum ${MAX_PARTICIPANTS} participants allowed.` };
            }
            break;
    }

    return { isValid: true };
}

// ===== LOCAL STORAGE OPERATIONS =====
function getBookings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function saveBooking(booking) {
    try {
        const bookings = getBookings();
        bookings.push(booking);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return false;
    
    try {
        let bookings = getBookings();
        bookings = bookings.filter(booking => booking.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        showFormMessage('Booking deleted successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting booking:', error);
        showFormMessage('Error deleting booking.', 'error');
        return false;
    }
}

function clearAllBookings() {
    if (!confirm('Delete ALL bookings? This cannot be undone.')) return false;
    
    try {
        localStorage.removeItem(STORAGE_KEY);
        showFormMessage('All bookings cleared!', 'success');
        return true;
    } catch (error) {
        console.error('Error clearing bookings:', error);
        showFormMessage('Error clearing bookings.', 'error');
        return false;
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayBookings() {
    const container = document.getElementById('bookings-list-container');
    if (!container) return;

    const bookings = getBookings();
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-bookings">
                <p>No bookings found. Please make a reservation.</p>
                <a href="booking.html" class="btn btn-primary">Book Now</a>
            </div>
        `;
        return;
    }

    // Clear all button
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            if (clearAllBookings()) {
                displayBookings();
                displayRecentBooking();
            }
        };
    }

    // Display bookings (newest first)
    bookings.reverse().forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <h3>${escapeHtml(booking.name)}</h3>
            <p><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
            <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
            <p><strong>Package:</strong> ${escapeHtml(booking.package)}</p>
            <p><strong>Guests:</strong> ${booking.participants}</p>
            <p><strong>Requests:</strong> ${escapeHtml(booking.requests)}</p>
            <p><small>Booked: ${booking.timestamp}</small></p>
            <div class="booking-actions">
                <button class="btn btn-outline btn-small delete-btn" data-id="${booking.id}">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = parseInt(this.dataset.id);
            if (deleteBooking(id)) {
                displayBookings();
                displayRecentBooking();
            }
        });
    });
}

function displayRecentBooking() {
    const container = document.getElementById('recent-booking');
    if (!container) return;

    const bookings = getBookings();
    
    if (bookings.length > 0) {
        const latest = bookings[bookings.length - 1];
        container.innerHTML = `
            <div class="recent-booking-card">
                <h3>${escapeHtml(latest.name)}</h3>
                <p><strong>Package:</strong> ${escapeHtml(latest.package)}</p>
                <p><strong>Date:</strong> ${formatDate(latest.date)}</p>
                <p><strong>Guests:</strong> ${latest.participants}</p>
                <a href="bookings.html" class="btn btn-outline btn-small">View All</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="recent-booking-card">
                <p>No bookings yet. Start your adventure today!</p>
                <a href="booking.html" class="btn btn-primary btn-small">Book Now</a>
            </div>
        `;
    }
}

// ===== FORM HANDLING =====
function initBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        // Get form data
        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            date: document.getElementById('date')?.value || '',
            package: document.getElementById('package')?.value || '',
            participants: document.getElementById('participants')?.value.trim() || '',
            requests: document.getElementById('requests')?.value.trim() || ''
        };

        // Validate all fields
        let isValid = true;
        
        // Name validation
        if (!formData.name) {
            showError('nameError', 'Full name is required.');
            isValid = false;
        } else if (formData.name.length < MIN_NAME_LENGTH) {
            showError('nameError', `Name must be at least ${MIN_NAME_LENGTH} characters.`);
            isValid = false;
        }

        // Email validation
        if (!formData.email) {
            showError('emailError', 'Email address is required.');
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            showError('emailError', 'Please enter a valid email address.');
            isValid = false;
        }

        // Date validation
        if (!formData.date) {
            showError('dateError', 'Please select your preferred date.');
            isValid = false;
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showError('dateError', 'Please select a future date.');
                isValid = false;
            }
        }

        // Package validation
        if (!formData.package) {
            showError('packageError', 'Please select a package.');
            isValid = false;
        }

        // Participants validation
        if (!formData.participants) {
            showError('participantsError', 'Number of participants is required.');
            isValid = false;
        } else {
            const num = parseInt(formData.participants);
            if (num < 1) {
                showError('participantsError', 'At least one participant is required.');
                isValid = false;
            } else if (num > MAX_PARTICIPANTS) {
                showError('participantsError', `Maximum ${MAX_PARTICIPANTS} participants allowed.`);
                isValid = false;
            }
        }

        if (isValid) {
            // Create booking object
            const booking = {
                id: Date.now(),
                name: formData.name,
                email: formData.email,
                date: formData.date,
                package: formData.package,
                participants: parseInt(formData.participants),
                requests: formData.requests || 'None',
                timestamp: new Date().toLocaleString()
            };

            // Save to localStorage
            if (saveBooking(booking)) {
                showFormMessage('Booking successful! Thank you for choosing Rahajipe Resort.', 'success');
                form.reset();
                
                setTimeout(() => {
                    window.location.href = 'bookings.html';
                }, 1500);
            } else {
                showFormMessage('Error saving booking. Please try again.', 'error');
            }
        } else {
            showFormMessage('Please fix the errors in the form.', 'error');
        }
    });

    // Real-time validation
    document.getElementById('name')?.addEventListener('blur', function() {
        const result = validateField('name', this.value);
        if (!result.isValid) {
            showError('nameError', result.message);
        }
    });

    document.getElementById('email')?.addEventListener('blur', function() {
        const result = validateField('email', this.value);
        if (!result.isValid) {
            showError('emailError', result.message);
        }
    });

    document.getElementById('date')?.addEventListener('blur', function() {
        const result = validateField('date', this.value);
        if (!result.isValid) {
            showError('dateError', result.message);
        }
    });

    document.getElementById('participants')?.addEventListener('blur', function() {
        const result = validateField('participants', this.value);
        if (!result.isValid) {
            showError('participantsError', result.message);
        }
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    const navList = nav?.querySelector('.nav-list');
    
    if (toggle && navList) {
        toggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('nav') && !e.target.closest('.menu-toggle')) {
                navList.classList.remove('active');
                toggle.classList.remove('active');
            }
        });
    }
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initBookingForm();
    displayRecentBooking();
    displayBookings();
});