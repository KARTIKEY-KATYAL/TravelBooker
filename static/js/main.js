// Custom JavaScript for Travel Booking System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Form validation
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Search functionality
    initializeSearch();
    
    // Booking form enhancements
    initializeBookingForm();
    
    // Dashboard enhancements
    initializeDashboard();
});

// Search functionality
function initializeSearch() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        // Add loading state to search button
        searchForm.addEventListener('submit', function() {
            const submitBtn = searchForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Searching...';
                submitBtn.disabled = true;
            }
        });
    }

    // Auto-complete for city names
    const sourceInput = document.querySelector('input[name="source"]');
    const destinationInput = document.querySelector('input[name="destination"]');
    
    if (sourceInput || destinationInput) {
        const cities = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
            'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
            'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
            'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
            'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
            'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
            'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
            'Kansas City', 'Mesa', 'Atlanta', 'Colorado Springs', 'Omaha'
        ];

        [sourceInput, destinationInput].forEach(input => {
            if (input) {
                setupAutoComplete(input, cities);
            }
        });
    }
}

// Auto-complete setup
function setupAutoComplete(input, suggestions) {
    let currentFocus = -1;
    
    input.addEventListener('input', function() {
        const value = this.value;
        closeAllLists();
        
        if (!value) return false;
        
        const listContainer = document.createElement('div');
        listContainer.setAttribute('id', this.id + '-autocomplete-list');
        listContainer.setAttribute('class', 'autocomplete-items');
        this.parentNode.appendChild(listContainer);
        
        suggestions.forEach(suggestion => {
            if (suggestion.toLowerCase().includes(value.toLowerCase())) {
                const item = document.createElement('div');
                item.innerHTML = suggestion.replace(new RegExp(value, 'gi'), '<strong>$&</strong>');
                item.addEventListener('click', function() {
                    input.value = suggestion;
                    closeAllLists();
                });
                listContainer.appendChild(item);
            }
        });
    });
    
    input.addEventListener('keydown', function(e) {
        const list = document.getElementById(this.id + '-autocomplete-list');
        if (list) {
            const items = list.getElementsByTagName('div');
            if (e.keyCode === 40) { // Down arrow
                currentFocus++;
                addActive(items);
            } else if (e.keyCode === 38) { // Up arrow
                currentFocus--;
                addActive(items);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                if (currentFocus > -1 && items[currentFocus]) {
                    items[currentFocus].click();
                }
            }
        }
    });
    
    function addActive(items) {
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        if (items[currentFocus]) {
            items[currentFocus].classList.add('autocomplete-active');
        }
    }
    
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('autocomplete-active');
        }
    }
    
    function closeAllLists(except) {
        const lists = document.getElementsByClassName('autocomplete-items');
        for (let i = 0; i < lists.length; i++) {
            if (except !== lists[i] && except !== input) {
                lists[i].parentNode.removeChild(lists[i]);
            }
        }
    }
    
    document.addEventListener('click', function(e) {
        closeAllLists(e.target);
    });
}

// Booking form enhancements
function initializeBookingForm() {
    const seatsInput = document.querySelector('input[name="number_of_seats"]');
    const totalPriceElement = document.getElementById('totalPrice');
    const summarySeats = document.getElementById('summarySeats');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (seatsInput && totalPriceElement) {
        const pricePerSeat = parseFloat(totalPriceElement.dataset.price || totalPriceElement.textContent.replace(/[^0-9.]/g, ''));
        
        function updateTotal() {
            const seats = parseInt(seatsInput.value) || 1;
            const total = seats * pricePerSeat;
            
            if (totalPriceElement) {
                totalPriceElement.textContent = '$' + total.toFixed(2);
            }
            if (summarySeats) {
                summarySeats.textContent = seats;
            }
            if (summaryTotal) {
                summaryTotal.textContent = '$' + total.toFixed(2);
            }
        }
        
        seatsInput.addEventListener('input', updateTotal);
        updateTotal(); // Initialize
    }

    // Booking form validation
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            const termsCheck = document.getElementById('termsCheck');
            if (termsCheck && !termsCheck.checked) {
                e.preventDefault();
                alert('Please accept the Terms and Conditions to proceed.');
                return false;
            }
            
            // Add loading state
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing...';
                submitBtn.disabled = true;
            }
        });
    }
}

// Dashboard enhancements
function initializeDashboard() {
    // Animate statistics cards
    const statCards = document.querySelectorAll('.stats-card, .card-body h3');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });

    // Add click tracking for quick actions
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Quick action clicked:', this.textContent.trim());
        });
    });
}

// Utility functions
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border spinner-border-sm me-2';
        spinner.setAttribute('role', 'status');
        element.prepend(spinner);
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner-border');
        if (spinner) {
            spinner.remove();
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// AJAX helper function
function ajaxRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    };
    
    // Add CSRF token for POST requests
    if (options.method === 'POST') {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        if (csrfToken) {
            defaultOptions.headers['X-CSRFToken'] = csrfToken;
        }
    }
    
    return fetch(url, {...defaultOptions, ...options})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('AJAX request failed:', error);
            showNotification('An error occurred. Please try again.', 'danger');
            throw error;
        });
}

// Share functionality
function shareContent(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Unable to copy link. Please copy it manually.', 'warning');
        });
    }
}

// Form data serialization
function serializeForm(form) {
    const formData = new FormData(form);
    const serialized = {};
    
    for (let [key, value] of formData.entries()) {
        if (serialized[key]) {
            if (Array.isArray(serialized[key])) {
                serialized[key].push(value);
            } else {
                serialized[key] = [serialized[key], value];
            }
        } else {
            serialized[key] = value;
        }
    }
    
    return serialized;
}

// Debounce function for search inputs
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// CSS for autocomplete
const autoCompleteCSS = `
.autocomplete-items {
    position: absolute;
    border: 1px solid #d4d4d4;
    border-bottom: none;
    border-top: none;
    z-index: 99;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.autocomplete-items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;
}

.autocomplete-items div:hover {
    background-color: #e9e9e9;
}

.autocomplete-active {
    background-color: #007bff !important;
    color: #ffffff;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = autoCompleteCSS;
document.head.appendChild(style);
