/**
 * notifications.js
 * Handles toast messages and notification dropdowns.
 */

// --- Toast Notification System ---
let toastContainer = null;

function createToastContainer() {
    if (document.getElementById('toast-container')) return;

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[100] space-y-3 w-full max-w-xs sm:max-w-sm';
    // Tailwind classes for positioning and styling.
    // z-[100] to ensure it's above most other content.
    document.body.appendChild(container);
    toastContainer = container;
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - Type of toast: 'success', 'error', 'info', 'warning'. Default is 'info'.
 * @param {number} duration - Duration in milliseconds for the toast to be visible. Default is 3000ms.
 */
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        createToastContainer();
    }

    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `p-4 rounded-lg shadow-xl flex items-start space-x-3 text-sm transition-all duration-300 ease-in-out transform translate-x-full opacity-0 animate-toast-in`;
    // Base classes, specific type classes will be added.

    let bgColor, textColor, iconSVG;

    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            iconSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            iconSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
            break;
        case 'warning':
            bgColor = 'bg-yellow-400';
            textColor = 'text-gray-800'; // Darker text for yellow bg
            iconSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>`;
            break;
        case 'info':
        default:
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            iconSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
            break;
    }

    toast.classList.add(bgColor, textColor);

    toast.innerHTML = `
        <div class="flex-shrink-0">${iconSVG}</div>
        <div class="flex-grow">${message}</div>
        <button class="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex items-center justify-center hover:bg-white hover:bg-opacity-20 focus:outline-none" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    `;

    const closeButton = toast.querySelector('button');
    let timeoutId;

    const removeToast = () => {
        clearTimeout(timeoutId); // Clear timeout if closed manually
        toast.classList.remove('animate-toast-in');
        toast.classList.add('animate-toast-out'); // Add outro animation class
        // Wait for animation to finish before removing
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) { // Check if still in DOM
                toast.remove();
            }
        }, { once: true });
         // Fallback if animationend doesn't fire (e.g. if display:none is set too early)
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 350); // slightly longer than animation
    };

    closeButton.addEventListener('click', removeToast);

    // Add custom Tailwind animations if not already defined globally
    // This requires Tailwind JIT or adding these to your tailwind.config.js
    // For simplicity, we'll use a style tag here if needed, or assume global definition.
    if (!document.getElementById('toast-animations-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animations-style';
        style.innerHTML = `
            @keyframes toast-in-animation {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            .animate-toast-in { animation: toast-in-animation 0.3s ease-out forwards; }

            @keyframes toast-out-animation {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            .animate-toast-out { animation: toast-out-animation 0.3s ease-in forwards; }
        `;
        document.head.appendChild(style);
    }
    
    toastContainer.appendChild(toast);

    // Trigger reflow to apply initial animation state correctly
    void toast.offsetWidth; 
    toast.classList.remove('translate-x-full', 'opacity-0');


    if (duration > 0) {
        timeoutId = setTimeout(removeToast, duration);
    }
}

// --- Notification Dropdown System ---
// This is a placeholder. A full implementation would involve:
// - HTML structure for the bell icon and dropdown panel (likely in the main layout/top bar).
// - Fetching notifications (e.g., from storage.js or an API).
// - Rendering notifications in the dropdown.
// - Handling "mark as read", "view all", etc.

let notificationDropdown = null;
let notificationBell = null;
let notificationCountBadge = null;
let notifications = []; // Array to store notification objects

/**
 * Initializes the notification dropdown system.
 * Looks for elements with specific IDs: 'notificationBell', 'notificationDropdown', 'notificationCountBadge'.
 */
function initNotificationDropdown() {
    notificationBell = document.getElementById('notificationBell'); // Expected ID for the bell icon/button
    notificationDropdown = document.getElementById('notificationDropdown'); // Expected ID for the dropdown panel
    notificationCountBadge = document.getElementById('notificationCountBadge'); // Expected ID for the count badge

    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', toggleNotificationDropdown);
        // Close dropdown if clicking outside
        document.addEventListener('click', (event) => {
            if (!notificationBell.contains(event.target) && !notificationDropdown.contains(event.target)) {
                if (!notificationDropdown.classList.contains('hidden')) {
                    hideNotificationDropdown();
                }
            }
        });
        
        // Load initial notifications (example)
        // loadNotifications(); // This would fetch from storage.js
        // renderNotifications();
    } else {
        // console.warn("Notification bell or dropdown element not found. Dropdown system not initialized.");
        // It's okay if these elements are not on every page.
    }
}

function toggleNotificationDropdown() {
    if (!notificationDropdown) return;
    notificationDropdown.classList.toggle('hidden');
    if (!notificationDropdown.classList.contains('hidden')) {
        // Optional: Mark notifications as seen or perform other actions when opened
        // clearNotificationBadge();
    }
}

function hideNotificationDropdown() {
     if (!notificationDropdown) return;
     notificationDropdown.classList.add('hidden');
}

/**
 * Adds a new notification to the list and updates the UI.
 * @param {object} notification - Notification object (e.g., { id: string, message: string, type: 'info'|'alert', timestamp: Date, read: boolean, link?: string })
 */
function addNotification(notification) {
    if (!notificationBell) return; // Don't add if no UI elements

    notifications.unshift(notification); // Add to the beginning
    // Limit number of notifications stored/displayed if needed
    if (notifications.length > 20) {
        notifications.pop();
    }
    renderNotifications();
    updateNotificationBadge();
}

function renderNotifications() {
    if (!notificationDropdown) return;

    const listElement = notificationDropdown.querySelector('ul'); // Assuming dropdown has a <ul>
    if (!listElement) {
        // console.warn("Notification dropdown list element (ul) not found.");
        // Create one if it doesn't exist, or ensure your HTML has it.
        // For this example, we'll assume it exists or this function won't do much.
        return;
    }
    
    listElement.innerHTML = ''; // Clear existing notifications

    if (notifications.length === 0) {
        listElement.innerHTML = '<li class="p-3 text-sm text-gray-500 text-center">No new notifications.</li>';
        return;
    }

    notifications.forEach(notif => {
        const listItem = document.createElement('li');
        listItem.className = `p-3 border-b border-gray-100 hover:bg-gray-50 ${notif.read ? 'opacity-70' : ''}`;
        
        let typeIcon = '';
        if (notif.type === 'alert') typeIcon = '<span class="text-red-500 mr-1">&#9888;</span>'; // Warning symbol
        else if (notif.type === 'success') typeIcon = '<span class="text-green-500 mr-1">&#10003;</span>'; // Checkmark

        listItem.innerHTML = `
            <div class="text-sm text-gray-700">${typeIcon}${notif.message}</div>
            <div class="text-xs text-gray-400 mt-1">${new Date(notif.timestamp).toLocaleString()}</div>
            ${notif.link ? `<a href="${notif.link}" class="text-xs text-blue-500 hover:underline">View Details</a>` : ''}
        `;
        listItem.addEventListener('click', () => {
            markNotificationAsRead(notif.id);
            if (notif.link) window.location.href = notif.link;
            // hideNotificationDropdown(); // Optionally close dropdown on click
        });
        listElement.appendChild(listItem);
    });
}

function markNotificationAsRead(notificationId) {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.read) {
        notif.read = true;
        renderNotifications(); // Re-render to update visual state
        updateNotificationBadge();
        // TODO: Persist this change in storage.js
    }
}

function updateNotificationBadge() {
    if (!notificationCountBadge) return;

    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        notificationCountBadge.textContent = unreadCount > 9 ? '9+' : unreadCount.toString();
        notificationCountBadge.classList.remove('hidden');
    } else {
        notificationCountBadge.classList.add('hidden');
    }
}

function clearNotificationBadge() {
    if (!notificationCountBadge) return;
    notificationCountBadge.classList.add('hidden');
    // This is purely visual; actual "read" status is per notification.
    // You might want to mark all as read when dropdown is opened:
    // notifications.forEach(n => n.read = true); renderNotifications(); updateNotificationBadge();
}


// Initialize systems on DOMContentLoaded
// The actual call to initNotificationDropdown might be better placed in main.js
// or after the relevant HTML for the bell icon is confirmed to be loaded.
// For now, we'll ensure the toast container can be created on demand.
document.addEventListener('DOMContentLoaded', () => {
    createToastContainer(); // Ensure container is ready if not already created by a toast call
    // initNotificationDropdown(); // This should be called where the bell icon HTML exists.
});


// Example Usage (can be called from other JS files or inline scripts):
// showToast('Invoice INV-001 sent successfully!', 'success');
// showToast('Failed to save client data.', 'error', 5000);
// showToast('Your settings have been updated.', 'info');
// showToast('Low stock for item XYZ.', 'warning');

// addNotification({ 
//   id: 'notif1', 
//   message: 'Payment received for INV-002.', 
//   type: 'success', 
//   timestamp: new Date(), 
//   read: false,
//   link: 'invoices.html?id=INV-002' 
// });
// addNotification({ 
//   id: 'notif2', 
//   message: 'Client "ABC Corp" added.', 
//   type: 'info', 
//   timestamp: new Date(Date.now() - 3600000), // 1 hour ago 
//   read: true 
// });

// Make functions available globally if needed, or use ES6 modules.
// For simplicity in a single file project, they are global.
window.InvoicifyNotifications = {
    showToast,
    initNotificationDropdown, // Expose init for calling from main.js or specific pages
    addNotification,
    markNotificationAsRead
};
