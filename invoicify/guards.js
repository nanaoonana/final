// --- Mock User Data ---
// In a real application, this would be fetched from Supabase
const MOCK_USER = {
    isLoggedIn: true, // Set to false to simulate a logged-out user
    plan: 'free' // 'free', 'pro', or 'business'
};

function checkAuth() {
    if (!MOCK_USER.isLoggedIn) {
        window.location.href = 'login.html';
    }
}

function checkPlan(requiredPlan) {
    const planHierarchy = {
        'free': 0,
        'pro': 1,
        'business': 2
    };

    const userPlanLevel = planHierarchy[MOCK_USER.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
        // Redirect to an upgrade page or show a modal
        alert('You need to upgrade your plan to access this feature.');
        window.location.href = 'billing.html';
    }
}

// --- Route-specific guards ---
function protectDashboard() {
    checkAuth();
}

function protectInvoices() {
    checkAuth();
}

function protectClients() {
    checkAuth();
}

function protectTimeLogs() {
    checkAuth();
    checkPlan('pro');
}

function protectExpenses() {
    checkAuth();
    checkPlan('pro');
}

function protectReports() {
    checkAuth();
    checkPlan('business');
}

function protectSettings() {
    checkAuth();
}

function protectBilling() {
    checkAuth();
}

// --- Initialize guards based on the current page ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();

    switch (path) {
        case 'dashboard.html':
            protectDashboard();
            break;
        case 'invoices.html':
        case 'invoice-new.html':
        case 'invoice-preview.html':
            protectInvoices();
            break;
        case 'clients.html':
        case 'client-new.html':
            protectClients();
            break;
        case 'time-logs.html':
            protectTimeLogs();
            break;
        case 'expenses.html':
            protectExpenses();
            break;
        case 'reports.html':
            protectReports();
            break;
        case 'settings.html':
            protectSettings();
            break;
        case 'billing.html':
            protectBilling();
            break;
    }
});
