/**
 * storage.js
 * Manages all localStorage or JSON-based data logic for invoices, clients, and settings.
 * Provides a consistent API for CRUD operations on app data.
 */

const SETTINGS_KEY = 'invoicifySettings';
const INVOICES_KEY = 'invoicifyInvoices';
const CLIENTS_KEY = 'invoicifyClients';
const NOTIFICATIONS_KEY = 'invoicifyUserNotifications'; // For persisting notifications

// --- Utility Functions ---

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any} The parsed JSON data, or null if not found or error.
 */
function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item "${key}" from localStorage:`, error);
        return null;
    }
}

/**
 * Stores an item in localStorage after serializing it to JSON.
 * @param {string} key - The key under which to store the item.
 * @param {any} value - The value to store.
 */
function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item "${key}" in localStorage:`, error);
    }
}

// --- Settings Management ---

/**
 * Retrieves all application settings.
 * @returns {object} The settings object, or a default object if none found.
 */
function getSettings() {
    const defaultSettings = {
        businessName: "Your Company",
        businessLogo: "",
        businessAddress: "",
        businessContact: "",
        defaultCurrency: "USD",
        invoiceNumberFormat: "INV-{YYYY}-{NNNN}", // {YYYY}, {MM}, {DD}, {NNNN} (sequential)
        nextInvoiceNumber: 1, // For {NNNN} placeholder
        defaultNotes: "Thank you for your business!",
        notifyPayment: true,
        notifyClientInvoiceSent: true,
        autoOverdueReminders: false,
        // Add any other settings your app needs
    };
    const savedSettings = getItem(SETTINGS_KEY);
    return { ...defaultSettings, ...savedSettings };
}

/**
 * Saves application settings.
 * @param {object} settingsData - The settings object to save.
 */
function saveSettings(settingsData) {
    const currentSettings = getSettings();
    // Ensure nextInvoiceNumber is preserved or handled correctly if format changes
    if (settingsData.invoiceNumberFormat !== currentSettings.invoiceNumberFormat) {
        // If format changes, might need to reset or re-evaluate nextInvoiceNumber
        // For simplicity, we'll keep it unless explicitly changed by a more complex UI.
        settingsData.nextInvoiceNumber = settingsData.nextInvoiceNumber || currentSettings.nextInvoiceNumber || 1;
    } else {
         settingsData.nextInvoiceNumber = currentSettings.nextInvoiceNumber; // Preserve if format is same
    }
    setItem(SETTINGS_KEY, settingsData);
    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        window.InvoicifyNotifications.showToast('Settings saved successfully!', 'success');
    }
}

/**
 * Generates the next invoice number based on format and sequence.
 * @returns {string} The generated invoice number.
 */
function getNextInvoiceNumber() {
    const settings = getSettings();
    let format = settings.invoiceNumberFormat || "INV-{NNNN}";
    const now = new Date();

    format = format.replace("{YYYY}", now.getFullYear().toString());
    format = format.replace("{YY}", now.getFullYear().toString().slice(-2));
    format = format.replace("{MM}", (now.getMonth() + 1).toString().padStart(2, '0'));
    format = format.replace("{DD}", now.getDate().toString().padStart(2, '0'));
    
    const numberMatch = format.match(/{N+}/);
    if (numberMatch) {
        const numDigits = numberMatch[0].length - 2; // e.g. {NNNN} -> 4
        const nextNum = (settings.nextInvoiceNumber || 1).toString().padStart(numDigits, '0');
        format = format.replace(numberMatch[0], nextNum);
    }
    return format;
}

/**
 * Increments the invoice number sequence after an invoice is saved.
 */
function incrementInvoiceNumberSequence() {
    const settings = getSettings();
    settings.nextInvoiceNumber = (settings.nextInvoiceNumber || 1) + 1;
    setItem(SETTINGS_KEY, settings); // Save updated settings
}


// --- Invoice Management ---

/**
 * Retrieves all invoices.
 * @returns {Array<object>} An array of invoice objects.
 */
function getAllInvoices() {
    return getItem(INVOICES_KEY) || [];
}

/**
 * Retrieves a single invoice by its ID.
 * @param {string} invoiceId - The ID of the invoice to retrieve.
 * @returns {object|null} The invoice object, or null if not found.
 */
function getInvoiceById(invoiceId) {
    const invoices = getAllInvoices();
    return invoices.find(inv => inv.id === invoiceId) || null;
}

/**
 * Saves an invoice (adds if new, updates if exists).
 * @param {object} invoiceData - The invoice object to save. It must have an 'id' property.
 * @returns {boolean} True if save was successful, false otherwise.
 */
function saveInvoice(invoiceData) {
    if (!invoiceData || !invoiceData.id) {
        console.error("Invoice data must have an ID to be saved.");
        if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
             window.InvoicifyNotifications.showToast('Error: Invoice data is missing an ID.', 'error');
        }
        return false;
    }

    let invoices = getAllInvoices();
    const existingInvoiceIndex = invoices.findIndex(inv => inv.id === invoiceData.id);

    let isNewInvoice = false;
    if (existingInvoiceIndex > -1) {
        // Update existing invoice
        invoices[existingInvoiceIndex] = { ...invoices[existingInvoiceIndex], ...invoiceData };
    } else {
        // Add new invoice
        invoices.unshift(invoiceData); // Add to the beginning for chronological order (newest first)
        isNewInvoice = true;
    }

    setItem(INVOICES_KEY, invoices);
    
    // If it's a new, non-draft invoice, increment the global invoice number sequence.
    // This check ensures drafts or edits don't increment the main sequence unnecessarily.
    // The invoice ID should be generated using getNextInvoiceNumber() BEFORE calling saveInvoice for new invoices.
    if (isNewInvoice && invoiceData.status !== 'draft' && invoiceData.id.startsWith(getSettings().invoiceNumberFormat.split('{')[0])) {
        // Check if the ID matches the current prefix to ensure it's from the main sequence
        incrementInvoiceNumberSequence();
    }

    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        const message = existingInvoiceIndex > -1 ? 'Invoice updated successfully!' : 'Invoice saved successfully!';
        window.InvoicifyNotifications.showToast(message, 'success');
    }
    return true;
}

/**
 * Deletes an invoice by its ID.
 * @param {string} invoiceId - The ID of the invoice to delete.
 */
function deleteInvoice(invoiceId) {
    let invoices = getAllInvoices();
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);

    if (invoices.length === updatedInvoices.length) {
        console.warn(`Invoice with ID "${invoiceId}" not found for deletion.`);
         if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast(`Error: Invoice ${invoiceId} not found.`, 'error');
        }
        return;
    }

    setItem(INVOICES_KEY, updatedInvoices);
    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        window.InvoicifyNotifications.showToast(`Invoice ${invoiceId} deleted.`, 'success');
    }
}

// --- Client Management ---

/**
 * Retrieves all clients.
 * @returns {Array<object>} An array of client objects.
 */
function getAllClients() {
    return getItem(CLIENTS_KEY) || [];
}

/**
 * Retrieves a single client by its ID.
 * @param {string} clientId - The ID of the client to retrieve.
 * @returns {object|null} The client object, or null if not found.
 */
function getClientById(clientId) {
    const clients = getAllClients();
    return clients.find(client => client.id === clientId) || null;
}

/**
 * Saves a client (adds if new, updates if exists).
 * @param {object} clientData - The client object to save. It must have an 'id' property.
 *                               If no 'id' is provided, a new one will be generated.
 * @returns {object|null} The saved client data (with ID), or null on error.
 */
function saveClient(clientData) {
    if (!clientData) {
        console.error("Client data cannot be empty.");
        return null;
    }

    let clients = getAllClients();
    
    if (!clientData.id) { // If it's a new client without an ID
        clientData.id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        clientData.dateAdded = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        clients.unshift(clientData); // Add new client to the beginning
        setItem(CLIENTS_KEY, clients);
        if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast('Client added successfully!', 'success');
        }
        return clientData;
    }

    // If an ID is provided, it's an update or an explicit add with ID
    const existingClientIndex = clients.findIndex(client => client.id === clientData.id);
    if (existingClientIndex > -1) {
        // Update existing client
        clients[existingClientIndex] = { ...clients[existingClientIndex], ...clientData };
    } else {
        // Add new client (with a provided ID)
        if (!clientData.dateAdded) clientData.dateAdded = new Date().toISOString().split('T')[0];
        clients.unshift(clientData);
    }
    
    setItem(CLIENTS_KEY, clients);
    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        const message = existingClientIndex > -1 ? 'Client updated successfully!' : 'Client added successfully!';
         window.InvoicifyNotifications.showToast(message, 'success');
    }
    return clientData;
}

/**
 * Deletes a client by its ID.
 * @param {string} clientId - The ID of the client to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
function deleteClient(clientId) {
    let clients = getAllClients();
    const initialLength = clients.length;
    clients = clients.filter(client => client.id !== clientId);

    if (clients.length === initialLength) {
        console.warn(`Client with ID "${clientId}" not found for deletion.`);
        if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast(`Error: Client ${clientId} not found.`, 'error');
        }
        return false;
    }
    
    setItem(CLIENTS_KEY, clients);
    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        window.InvoicifyNotifications.showToast(`Client deleted successfully.`, 'success');
    }
    return true;
}

// --- User Notifications Management (Persisted) ---

/**
 * Retrieves all persisted user notifications.
 * @returns {Array<object>} An array of notification objects.
 */
function getAllPersistedNotifications() {
    return getItem(NOTIFICATIONS_KEY) || [];
}

/**
 * Saves all user notifications.
 * @param {Array<object>} notificationsArray - The array of notification objects to save.
 */
function saveAllPersistedNotifications(notificationsArray) {
    setItem(NOTIFICATIONS_KEY, notificationsArray);
}

/**
 * Adds a single notification to the persisted list.
 * @param {object} notification - The notification object to add.
 */
function addPersistedNotification(notification) {
    let notifications = getAllPersistedNotifications();
    notifications.unshift(notification); // Add to the beginning
    // Optional: Limit the number of stored notifications
    if (notifications.length > 50) { // Example limit
        notifications = notifications.slice(0, 50);
    }
    saveAllPersistedNotifications(notifications);
    // Also update the live notification system if it's initialized
    if (window.InvoicifyNotifications && window.InvoicifyNotifications.addNotification) {
        window.InvoicifyNotifications.addNotification(notification);
    }
}

/**
 * Marks a persisted notification as read.
 * @param {string} notificationId - The ID of the notification to mark as read.
 */
function markPersistedNotificationAsRead(notificationId) {
    let notifications = getAllPersistedNotifications();
    const notifIndex = notifications.findIndex(n => n.id === notificationId);
    if (notifIndex > -1 && !notifications[notifIndex].read) {
        notifications[notifIndex].read = true;
        saveAllPersistedNotifications(notifications);
    }
}

// --- Data Export/Import (Basic JSON) ---

/**
 * Exports all application data as a JSON string.
 * @returns {string} JSON string of all data.
 */
function exportAllDataToJson() {
    const data = {
        settings: getSettings(),
        invoices: getAllInvoices(),
        clients: getAllClients(),
        notifications: getAllPersistedNotifications()
    };
    return JSON.stringify(data, null, 2); // Pretty print JSON
}

/**
 * Imports data from a JSON string, overwriting existing data.
 * Use with caution.
 * @param {string} jsonString - The JSON string containing application data.
 * @returns {boolean} True if import was successful, false otherwise.
 */
function importAllDataFromJson(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.settings) saveSettings(data.settings); // Use saveSettings to handle defaults and structure
        if (data.invoices) setItem(INVOICES_KEY, data.invoices);
        if (data.clients) setItem(CLIENTS_KEY, data.clients);
        if (data.notifications) setItem(NOTIFICATIONS_KEY, data.notifications);
        
        if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast('Data imported successfully!', 'success');
        }
        // It's a good idea to reload the page or re-initialize components after import
        // window.location.reload(); // Or trigger a custom event
        return true;
    } catch (error) {
        console.error("Error importing data from JSON:", error);
         if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast('Error importing data. Invalid JSON format.', 'error');
        }
        return false;
    }
}


// --- Initialize with Sample Data (if localStorage is empty) ---
function initializeWithSampleData() {
    if (!getItem(SETTINGS_KEY) && !getItem(INVOICES_KEY) && !getItem(CLIENTS_KEY)) {
        console.log("No existing data found. Initializing with sample data...");

        // Sample Settings
        saveSettings({
            businessName: "Invoicify Demo Co.",
            businessLogo: "https://via.placeholder.com/180x60.png?text=Invoicify+Demo",
            businessAddress: "123 Demo Street\nTechville, DEMO 12345",
            businessContact: "demo@invoicify.app | (555) DEMO-APP",
            defaultCurrency: "USD",
            invoiceNumberFormat: "DEMO-{YYYY}-{NNNN}",
            nextInvoiceNumber: 4, // Start after sample invoices
            defaultNotes: "Thank you for choosing Invoicify Demo!",
            notifyPayment: true,
            notifyClientInvoiceSent: true,
            autoOverdueReminders: false
        });
        
        // Sample Clients
        const sampleClients = [
            { id: "client_sample_1", name: "Tech Solutions Inc.", contactPerson: "John Doe", email: "billing@techsolutions.dev", phone: "(555) 123-4567", companyName: "Tech Solutions Inc.", industry: "Technology", address: "789 Client St, Innovation Park, CA 90210", tags: ["Corporate", "Priority"], notes: "Long-term client.", dateAdded: "2024-01-15" },
            { id: "client_sample_2", name: "Creative Designs LLC", contactPerson: "Jane Smith", email: "accounts@creativedesigns.com", phone: "(555) 987-6543", companyName: "Creative Designs LLC", industry: "Design", address: "1 Art Way, Design District, FL 33000", tags: ["SMB"], notes: "Needs quick turnarounds.", dateAdded: "2024-03-22" },
            { id: "client_sample_3", name: "WebWorks Co.", contactPerson: "Peter Pan", email: "info@webworks.co", phone: "(555) 111-2222", companyName: "WebWorks Co.", industry: "Web Development", address: "101 Binary Rd, Server City, WA 98001", tags: ["Startup", "Retainer"], notes: "", dateAdded: "2023-11-05" }
        ];
        sampleClients.forEach(client => saveClient(client)); // Use saveClient to ensure correct structure

        // Sample Invoices
        const sampleInvoices = [
            { 
                id: "DEMO-2024-0001", clientId: "client_sample_1", clientName: "Tech Solutions Inc.", 
                issueDate: "2024-07-01", dueDate: "2024-07-15", currency: "USD", 
                items: [{ description: "Premium Web Hosting (1 Year)", quantity: 1, price: 300.00 }, { description: "Support Hours (5 hours)", quantity: 5, price: 40.00 }],
                subtotal: 500.00, discountPercent: 0, taxPercent: 0, total: 500.00, 
                notes: "Payment due upon receipt.", status: "paid",
                companyDetails: getSettings() // Capture current settings for this invoice
            },
            { 
                id: "DEMO-2024-0002", clientId: "client_sample_2", clientName: "Creative Designs LLC",
                issueDate: "2024-07-05", dueDate: "2024-07-20", currency: "USD",
                items: [{ description: "Logo Design Package", quantity: 1, price: 650.00 }, { description: "Business Card Design (250ct)", quantity: 1, price: 150.50 }],
                subtotal: 800.50, discountPercent: 10, taxPercent: 5, total: ((800.50 * 0.9) * 1.05).toFixed(2), // Calculated total
                notes: "10% early bird discount applied.", status: "unpaid",
                companyDetails: getSettings()
            },
            { 
                id: "DEMO-2024-0003", clientId: "client_sample_3", clientName: "WebWorks Co.",
                issueDate: "2024-06-10", dueDate: "2024-06-25", currency: "USD",
                items: [{ description: "Website Maintenance Retainer", quantity: 1, price: 2100.00 }],
                subtotal: 2100.00, discountPercent: 0, taxPercent: 0, total: 2100.00,
                notes: "Monthly retainer.", status: "overdue",
                companyDetails: getSettings()
            }
        ];
        sampleInvoices.forEach(invoice => saveInvoice(invoice)); // Use saveInvoice to ensure correct structure
        // Note: saveInvoice will try to increment nextInvoiceNumber. For samples, it's okay.

        console.log("Sample data initialized.");
        if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
            window.InvoicifyNotifications.showToast('Welcome! Sample data has been loaded.', 'info', 5000);
        }
    }
}

// Call initialization (e.g., on app load)
// This should ideally be called from a main app initialization script.
// initializeWithSampleData(); // Uncomment to auto-populate if empty on first load.


// Expose public API
window.InvoicifyStorage = {
    getSettings,
    saveSettings,
    getNextInvoiceNumber,
    // incrementInvoiceNumberSequence, // Usually internal, called by saveInvoice

    getAllInvoices,
    getInvoiceById,
    saveInvoice,
    deleteInvoice,

    getAllClients,
    getClientById,
    saveClient,
    deleteClient,

    getAllPersistedNotifications,
    addPersistedNotification,
    markPersistedNotificationAsRead,
    // saveAllPersistedNotifications, // Usually internal

    exportAllDataToJson,
    importAllDataFromJson,
    initializeWithSampleData // Expose for manual reset or first-time setup
};
