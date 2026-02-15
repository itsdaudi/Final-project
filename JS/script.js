/**
 * JIPERAHA RESORT-MAIN APPLICATION LOGIC
 * Handles localstorage persistency, form validation, and dynamic display.
 */
// =====LOCAL STOAGE KEYS=====
const STORAGE_KEY = "jiperaha_resort_booking_data";

// =====INTIALISE BOOKING FORM=====
function initBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();

        //collect values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const date = document.getElementById("date").value;
        const packageVal = document.getElementById("package").value;
        const participants =document.getElementById("participants").value.trim();
        const requests = document.getElementById("requests").value.trim();
        
        //validation
        let isvalid=true;

        if (name === "") {
            showError("nameError", "Full name is required.");
            isvalid=false;
        }
        if (email === "") {
            showError("emailError", "Email address is required.");
            isvalid=false;
        }else if (!validateEmail(email)) {
            showError("emailError", "Please enter a valid email address (e.g., user@example.com).");
            isvalid=false;
        }

        if (date === "") {
            showError("dateError", "Please select your preffered date.");
            isvalid=false;
        } else if(new Date(date) < new Date().setHours(0,0,0,0)) {
            showError("dateError", "Please select a future date.");
            isvalid=false;
        }

        if (packageVal === "") {
            showError("packageError", "Please select a package.");
            isvalid=false;
        }

        if(participants === ""|| parseInt(participants) <= 0) {
            showError("participantsError", "Atleast one participant is required.");
            isvalid=false;
        }

        if (!isvalid){
            // creeate booking object
            const booking = {
                id: Date.now(),
                name,
                email,
                date,
                package: packageVal,
                participants: parseInt(participants),
                requests: requests || "None",
                timestamp: new Date().toLocaleString() 
            };

            //save to localstorage
            saveBooking(booking);

            // show sucess message
            alert("Booking successful! Thank you for choosing Jiperaha Resort.");

            //reset form
            form.reset();

            // Rediracting to bookings page after 1.5 seconds
            setTimeout(() => {
                window.location.href = "bookings.html";
            }, 1500); 
        };   
    });
}

// =====HELPER: EMAIL VALIDATION=====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// =====HELPER: SHOW ERROR=====
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
}

// =====HELPER: CLEAR ERRORS=====
function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}

//===== SHOW FORM MESSAGE=====
function showFormMessage(message,type) {
    const message = document.getElementById("formMessage");
    if (message) {
        message.textContent=message;
        message.className = type === "success" ? "success-message" : "error-message";
        message.style.display = "block";
        // Hide message after 3 seconds
        setTimeout(() => {
            message.style.display = "none";
        }, 3000);
    }
}

//===== LOCAL STORAGE: SAVE BOOKING=====
function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

// =====LOCAL STORAGE: RETRIEVE ALL BOOKINGS=====
function getAllBookings() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// =====LOCAL STORAGE: DELETE BOOKING BY ID=====
function deleteBooking(id) {
    let bookings = getAllBookings();
    bookings = bookings.filter(booking => booking.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}//refresh the display
    displayBookings();

// =====LOCAL STORAGE: CLEAR ALL BOOKINGS=====
function clearAllBookings() {
    localStorage.removeItem(STORAGE_KEY);
    displayBookings();
}

// =====DISPLAY BOOKINGS IN BOOKINGS PAGE=====
function displayBookings() {
    const bookings = getAllBookings();
    const container = document.getElementById("bookings-container");
    if (!container) return;
    container.innerHTML = "";

    if (bookings.length === 0) {
        container.innerHTML = "<p>No bookings found. Please make a reservation.</p>";
        return;
    }
    bookings.forEach(booking => {
        const bookingCard = document.createElement("div");
        bookingCard.className = "booking-card";
        bookingCard.innerHTML = `
            <h3>${booking.name}</h3>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Package:</strong> ${booking.package}</p>
            <p><strong>Participants:</strong> ${booking.participants}</p>
            <p><strong>Requests:</strong> ${booking.requests}</p>
            <button onclick="deleteBooking(${booking.id})">Delete</button>
        `;
        container.appendChild(bookingCard);
    });
}