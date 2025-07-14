function showSessionExpiredModal() {
    const modalHTML = `
        <div id="session-expired-modal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
                <h2 class="text-2xl font-bold mb-4">Session Expired</h2>
                <p class="text-gray-600 mb-6">Your session has expired. Please log in again to continue.</p>
                <a href="login.html" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded w-full inline-block">
                    Go to Login
                </a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Example of how to trigger the modal
// In a real app, this would be called when a Supabase API call returns a 401 Unauthorized error.
// For demonstration, we can call it after a timeout.
// setTimeout(showSessionExpiredModal, 5000);
