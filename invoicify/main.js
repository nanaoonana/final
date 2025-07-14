/**
 * main.js
 * Global JavaScript file for common interactions across multiple pages.
 * Manages navigation toggles, sidebar actions, button states,
 * and simple DOM interactions not specific to invoices, clients, or settings forms.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Sidebar Toggle ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle'); // Hamburger button in top bar
    const mainContentOverlay = document.getElementById('mainContentOverlay'); // Optional: an overlay for main content when sidebar is open on mobile

    if (sidebar && sidebarToggleBtn) {
        // Function to toggle sidebar visibility
        const toggleSidebar = () => {
            sidebar.classList.toggle('-translate-x-full'); // For Tailwind based sliding sidebar
            sidebar.classList.toggle('translate-x-0'); // Or 'transform-none' if that's the open state
            if (mainContentOverlay) {
                mainContentOverlay.classList.toggle('hidden'); // Show/hide overlay
            }
        };

        sidebarToggleBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling to document if overlay is used
            toggleSidebar();
        });

        // Close sidebar if user clicks outside of it on mobile (using an overlay or document click)
        if (mainContentOverlay) {
            mainContentOverlay.addEventListener('click', toggleSidebar);
        } else {
            // Fallback if no dedicated overlay: close on document click if sidebar is open and click is outside
            document.addEventListener('click', (event) => {
                if (!sidebar.classList.contains('-translate-x-full') && // If sidebar is open
                    !sidebar.contains(event.target) && // And click is not inside sidebar
                    !sidebarToggleBtn.contains(event.target)) { // And click is not the toggle button itself
                    // toggleSidebar(); // This might be too aggressive, consider if needed
                }
            });
        }
        
        // Ensure correct sidebar state on resize (e.g., hide on mobile, show on desktop)
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint in Tailwind
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0'); // Ensure it's visible on desktop
                if (mainContentOverlay) mainContentOverlay.classList.add('hidden');
            } else {
                // On mobile, keep current state unless explicitly closed or opened
                // Or, force close on resize to mobile if preferred:
                // sidebar.classList.add('-translate-x-full');
                // sidebar.classList.remove('translate-x-0');
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
    }


    // --- Active Navigation Link Styling ---
    // Highlights the current page's link in the sidebar.
    const currentPath = window.location.pathname.split("/").pop(); // Gets "dashboard.html", "invoices.html", etc.
    const navLinks = document.querySelectorAll('#sidebar nav a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentPath) {
            // Remove active classes from all first (if any were pre-set, e.g. from server-side rendering)
            navLinks.forEach(l => l.classList.remove('bg-slate-700', 'text-white'));
            // Add active classes to the current link
            link.classList.add('bg-slate-700', 'text-white'); // Active classes from dashboard.html example
        } else {
            // Ensure non-active links have default styling (Tailwind handles this well by default)
             link.classList.remove('bg-slate-700', 'text-white'); // Ensure it's removed
        }
    });
    // Special case for index.html or root path if sidebar is on those pages (not typical for this app structure)
    if (currentPath === '' || currentPath === 'index.html') {
        const dashboardLink = document.querySelector('#sidebar nav a[href="dashboard.html"]');
        // if (dashboardLink) dashboardLink.classList.add('bg-slate-700', 'text-white'); // Or appropriate link
    }


    // --- User Profile Dropdown (Placeholder) ---
    const userProfileButton = document.querySelector('#topBarUserMenuButton'); // Example ID for a button
    const userProfileDropdown = document.querySelector('#topBarUserMenuDropdown'); // Example ID for its dropdown

    if (userProfileButton && userProfileDropdown) {
        userProfileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            userProfileDropdown.classList.toggle('hidden');
        });

        // Close dropdown if clicking outside
        document.addEventListener('click', (event) => {
            if (!userProfileDropdown.classList.contains('hidden') &&
                !userProfileButton.contains(event.target) &&
                !userProfileDropdown.contains(event.target)) {
                userProfileDropdown.classList.add('hidden');
            }
        });
    }
    
    // --- Notification Dropdown Initialization ---
    // Assumes notificationBell and notificationDropdown elements exist in the top bar HTML
    // and notifications.js is loaded.
    if (window.InvoicifyNotifications && typeof window.InvoicifyNotifications.initNotificationDropdown === 'function') {
        window.InvoicifyNotifications.initNotificationDropdown();
        
        // Example: Load persisted notifications if any
        if (window.InvoicifyStorage && typeof window.InvoicifyStorage.getAllPersistedNotifications === 'function') {
            const persistedNotifs = window.InvoicifyStorage.getAllPersistedNotifications();
            persistedNotifs.forEach(notif => {
                // Add to UI without re-persisting, as they are already stored.
                // The addNotification function in notifications.js needs to handle this,
                // or we need a separate function to just render pre-loaded notifications.
                // For now, let's assume addNotification can be used if it checks for duplicates or is idempotent for UI.
                if (window.InvoicifyNotifications.addNotification) { // Check if function exists
                   // window.InvoicifyNotifications.addNotification(notif, false); // `false` could mean "don't persist again"
                }
            });
            // The notifications.js `addNotification` currently always adds to its internal `notifications` array.
            // A better approach:
            // 1. `notifications.js` loads from `InvoicifyStorage.getAllPersistedNotifications()` during its own init.
            // 2. `InvoicifyStorage.addPersistedNotification` calls `InvoicifyNotifications.addNotificationToUI` (new func).
            // This keeps concerns separate. For now, this is a basic link.
        }
    }


    // --- Generic Button Loading States ---
    // Add a class 'btn-loading' to a button to show a spinner and disable it.
    // Example:
    // <button class="btn btn-primary" onclick="this.classList.add('btn-loading'); setTimeout(()=>this.classList.remove('btn-loading'), 2000)">Submit</button>
    // CSS would be needed:
    // .btn-loading { cursor: not-allowed; position: relative; }
    // .btn-loading::after { content: ''; /* ... spinner styles ... */ }
    // Tailwind makes this easier by adding/removing classes for spinner visibility and button disabling.
    // This is more of a pattern than a generic script here, as specifics vary.


    // --- Smooth Scroll for Anchor Links (if any) ---
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //     anchor.addEventListener('click', function (e) {
    //         const hrefAttribute = this.getAttribute('href');
    //         // Ensure it's a valid selector and not just "#" or "#!"
    //         if (hrefAttribute && hrefAttribute.length > 1 && document.querySelector(hrefAttribute)) {
    //             e.preventDefault();
    //             document.querySelector(hrefAttribute).scrollIntoView({
    //                 behavior: 'smooth'
    //             });
    //         }
    //     });
    // });
    
    // --- Initialize Sample Data if First Load ---
    // This is a good place to call it once the DOM is ready and storage.js is loaded.
    // Ensure storage.js is loaded before main.js in your HTML.
    if (window.InvoicifyStorage && typeof window.InvoicifyStorage.initializeWithSampleData === 'function') {
        // Check a flag to ensure it only runs once ever per user/browser, not just if storage is empty.
        if (!localStorage.getItem('invoicifySampleDataInitialized')) {
            window.InvoicifyStorage.initializeWithSampleData();
            localStorage.setItem('invoicifySampleDataInitialized', 'true');
        }
    }


    console.log("main.js loaded and initialized.");
});
