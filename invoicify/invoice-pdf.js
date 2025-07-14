/**
 * invoice-pdf.js
 * Handles the invoice PDF generation logic.
 * Uses jsPDF and jsPDF-AutoTable for creating PDF documents from invoice data.
 *
 * Requires jsPDF and jsPDF-AutoTable to be loaded in the HTML:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
 *
 * Alternatively, html2pdf.js can be used if a direct HTML-to-canvas-to-PDF approach is preferred for visual fidelity,
 * but jsPDF offers more control over the document structure programmatically. This implementation uses jsPDF.
 */

// Ensure jsPDF and autoTable are loaded (check for their existence on the window object)
// if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
//     console.error("jsPDF library is not loaded. PDF generation will not work.");
// }
// if (typeof window.jspdf.autoTable === 'undefined' && window.jspdf.jsPDF.autoTable === 'undefined') {
//     console.error("jsPDF-AutoTable plugin is not loaded. PDF table generation will not work.");
// }


/**
 * Generates a PDF for the given invoice data.
 * @param {object} invoiceData - The full invoice data object.
 *                               Expected structure similar to `invoice-preview.html`'s sample data.
 *                               Includes company, client, items, totals, notes etc.
 */
async function generateInvoicePdf(invoiceData) {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        alert("PDF generation library (jsPDF) is not available. Please try printing instead.");
        console.error("jsPDF library is not loaded.");
        return;
    }
    if (typeof window.jspdf.jsPDF.autoTable === 'undefined') { // autoTable is a plugin on jsPDF constructor
        alert("PDF table generation library (jsPDF-AutoTable) is not available. Please try printing instead.");
        console.error("jsPDF-AutoTable plugin is not loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- Document Settings ---
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15; // mm
    let currentY = margin; // Tracks the current Y position on the page

    // --- Helper Functions ---
    const addText = (text, x, y, options = {}) => {
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.setFontSize(options.size || 10);
        doc.setTextColor(options.color || '#000000');
        doc.text(text, x, y, { align: options.align || 'left', maxWidth: options.maxWidth });
        if (options.lineHeightFactor) {
            currentY += (options.size || 10) * (options.lineHeightFactor || 0.5); // Approximate line height
        }
    };
    
    const addMultiLineText = (text, x, y, options = {}) => {
        const fontSize = options.size || 10;
        const lineHeight = fontSize * (options.lineHeightFactor || 0.45); // Adjusted factor
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(options.color || '#000000');

        const lines = doc.splitTextToSize(text || '', options.maxWidth || (pageWidth - x - margin));
        lines.forEach((line, index) => {
            doc.text(line, x, y + (index * lineHeight));
        });
        return y + (lines.length * lineHeight); // Return new Y position
    };


    // --- Load Logo (if available and valid) ---
    let logoImage = null;
    if (invoiceData.company && invoiceData.company.logo) {
        try {
            // This is a simplified version. Real CORS handling for images from different domains is complex.
            // For local/same-origin images or base64, this can work.
            // Consider converting logo to base64 in storage or settings if cross-origin issues arise.
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Attempt to handle CORS for external images
            img.src = invoiceData.company.logo;

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    logoImage = img;
                    resolve();
                };
                img.onerror = (err) => {
                    console.warn("Failed to load logo for PDF:", err, "URL:", invoiceData.company.logo);
                    resolve(); // Resolve anyway, just without a logo
                };
                // Timeout if image loading takes too long
                setTimeout(() => {
                    console.warn("Logo loading timed out for PDF.");
                    resolve();
                }, 3000);
            });
        } catch (e) {
            console.warn("Error processing logo for PDF:", e);
        }
    }

    // --- Invoice Header ---
    // Company Logo
    if (logoImage) {
        const logoWidth = 30; // mm
        const logoHeight = (logoImage.height * logoWidth) / logoImage.width;
        try {
             doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, logoHeight); // Use PNG for transparency if any
        } catch(e) {
            console.error("Error adding logo image to PDF:", e);
            // Try JPEG as fallback if PNG fails (though source type should be known)
            try { doc.addImage(logoImage, 'JPEG', margin, currentY, logoWidth, logoHeight); }
            catch (e2) { console.error("Error adding logo image as JPEG to PDF:", e2); }
        }
       
        currentY += logoHeight + 5; // Space after logo
    }
    
    // Company Details
    if (invoiceData.company) {
        currentY = addMultiLineText(invoiceData.company.name || "Your Company", margin, currentY, { size: 16, style: 'bold', lineHeightFactor: 0.6 });
        if (invoiceData.company.address) {
            currentY = addMultiLineText(invoiceData.company.address, margin, currentY, { size: 9, color: '#555555', maxWidth: 80, lineHeightFactor: 0.5 });
        }
        if (invoiceData.company.contact) {
            currentY = addMultiLineText(invoiceData.company.contact, margin, currentY, { size: 9, color: '#555555', maxWidth: 80, lineHeightFactor: 0.5 });
        }
    }
    currentY += 5; // Space after company details

    // Invoice Title & Details (Right Aligned)
    const rightColX = pageWidth - margin - 70; // X position for right column
    let tempY = margin + (logoImage ? (logoImage.height * 30 / logoImage.width) / 2 - 10 : 10) ; // Align with mid-logo or top

    addText("INVOICE", rightColX, tempY, { size: 22, style: 'bold', color: '#2563EB', align: 'left' }); // blue-600
    tempY += 10;
    addText(`Invoice #: ${invoiceData.id || 'N/A'}`, rightColX, tempY, { size: 10 });
    tempY += 5;
    addText(`Issue Date: ${invoiceData.issueDate || 'N/A'}`, rightColX, tempY, { size: 10 });
    tempY += 5;
    addText(`Due Date: ${invoiceData.dueDate || 'N/A'}`, rightColX, tempY, { size: 10 });
    tempY += 6;
    if (invoiceData.status) {
        doc.setFillColor(getStatusColor(invoiceData.status).bg); // Approximate color
        doc.setTextColor(getStatusColor(invoiceData.status).text);
        doc.setFontSize(9);
        doc.roundedRect(rightColX -1, tempY - 3.5, 25, 5, 1.5, 1.5, 'FD'); // FD for Fill then Draw border
        doc.text(invoiceData.status.toUpperCase(), rightColX + 12.5, tempY, {align: 'center'});
    }
    doc.setTextColor('#000000'); // Reset text color


    // Ensure currentY is below the header block
    currentY = Math.max(currentY, tempY + 10);


    // --- Bill To Section ---
    doc.setDrawColor('#DDDDDD');
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2); // Horizontal line
    currentY += 5;
    addText("BILL TO:", margin, currentY, { size: 9, style: 'bold', color: '#555555' });
    currentY += 5;
    if (invoiceData.client) {
        currentY = addMultiLineText(invoiceData.client.name || "Client Name", margin, currentY, { size: 11, style: 'bold', lineHeightFactor: 0.6 });
        if (invoiceData.client.address) {
            currentY = addMultiLineText(invoiceData.client.address, margin, currentY, { size: 9, color: '#555555', maxWidth: 80, lineHeightFactor: 0.5 });
        }
        if (invoiceData.client.email) {
            currentY = addMultiLineText(invoiceData.client.email, margin, currentY, { size: 9, color: '#555555', lineHeightFactor: 0.5 });
        }
    }
    currentY += 10; // Space before items table


    // --- Items Table ---
    const tableHeaders = [["Description", "Qty", "Unit Price", "Total"]];
    const tableData = invoiceData.items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrencyForPdf(item.price, invoiceData.currency),
        formatCurrencyForPdf(item.quantity * item.price, invoiceData.currency)
    ]);

    doc.autoTable({
        startY: currentY,
        head: tableHeaders,
        body: tableData,
        theme: 'striped', // 'striped', 'grid', 'plain'
        headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], fontSize: 9 }, // Dark blue-gray like
        bodyStyles: { fontSize: 9, cellPadding: 1.5 },
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Light gray
        columnStyles: {
            0: { cellWidth: 'auto' }, // Description
            1: { cellWidth: 15, halign: 'right' },  // Qty
            2: { cellWidth: 25, halign: 'right' }, // Unit Price
            3: { cellWidth: 25, halign: 'right' }  // Total
        },
        margin: { left: margin, right: margin },
        didDrawPage: function (data) {
            // Footer for each page if table spans multiple pages (optional)
            // addText(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right', size: 8 });
        }
    });
    currentY = doc.autoTable.previous.finalY + 10; // Update Y after table


    // --- Totals Section ---
    const totalsX = pageWidth - margin - 60; // X position for totals labels
    const amountsX = pageWidth - margin;      // X position for total amounts (right aligned)

    if (currentY > pageHeight - 50) { // Check if space for totals, add new page if not
        doc.addPage();
        currentY = margin;
    }

    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    addText("Subtotal:", totalsX, currentY, { size: 10, align: 'right' });
    addText(formatCurrencyForPdf(subtotal, invoiceData.currency), amountsX, currentY, { size: 10, align: 'right' });
    currentY += 6;

    const discountPercent = invoiceData.discountPercent || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    if (discountPercent > 0) {
        addText(`Discount (${discountPercent}%):`, totalsX, currentY, { size: 10, align: 'right' });
        addText(`-${formatCurrencyForPdf(discountAmount, invoiceData.currency)}`, amountsX, currentY, { size: 10, align: 'right' });
        currentY += 6;
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxPercent = invoiceData.taxPercent || 0;
    const taxAmount = subtotalAfterDiscount * (taxPercent / 100);
     if (taxPercent > 0) {
        addText(`Tax (${taxPercent}%):`, totalsX, currentY, { size: 10, align: 'right' });
        addText(`+${formatCurrencyForPdf(taxAmount, invoiceData.currency)}`, amountsX, currentY, { size: 10, align: 'right' });
        currentY += 6;
    }
    
    doc.setDrawColor('#333333');
    doc.line(totalsX - 5, currentY, amountsX, currentY); // Separator line
    currentY += 2; // Small space after line
    currentY += 5;

    const total = subtotalAfterDiscount + taxAmount;
    addText("Total:", totalsX, currentY, { size: 12, style: 'bold', align: 'right' });
    addText(formatCurrencyForPdf(total, invoiceData.currency), amountsX, currentY, { size: 12, style: 'bold', align: 'right' });
    currentY += 10;


    // --- Notes Section ---
    if (invoiceData.notes) {
        if (currentY > pageHeight - 40) { doc.addPage(); currentY = margin; }
        addText("Notes:", margin, currentY, { size: 10, style: 'bold' });
        currentY += 5;
        currentY = addMultiLineText(invoiceData.notes, margin, currentY, { size: 9, color: '#333333', maxWidth: pageWidth - margin * 2, lineHeightFactor: 0.5 });
        currentY += 10;
    }

    // --- Footer ---
    if (currentY > pageHeight - 20) { doc.addPage(); currentY = margin; }
    const footerText = (invoiceData.company && invoiceData.company.name) ?
        `Thank you for your business! | ${invoiceData.company.name}` :
        "Thank you for your business!";
    // Center footer text at bottom
    const footerY = pageHeight - 10;
    addText(footerText, pageWidth / 2, footerY, { size: 8, color: '#777777', align: 'center' });


    // --- Save the PDF ---
    const filename = `Invoice-${invoiceData.id || 'Untitled'}.pdf`;
    doc.save(filename);

    if (window.InvoicifyNotifications && window.InvoicifyNotifications.showToast) {
        window.InvoicifyNotifications.showToast(`PDF "${filename}" generated.`, 'success');
    }
}

// Helper to format currency for PDF (basic)
function formatCurrencyForPdf(amount, currencyCode = 'USD') {
    // jsPDF doesn't have Intl built-in, so basic formatting
    const symbols = { USD: '$', GHS: '₵', EUR: '€', GBP: '£' };
    const symbol = symbols[currencyCode] || currencyCode + " "; // Fallback to code
    return `${symbol}${amount.toFixed(2)}`;
}

// Helper for status badge colors (simplified)
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'paid': return { bg: [76, 175, 80], text: [255,255,255] }; // Green
        case 'unpaid': return { bg: [33, 150, 243], text: [255,255,255] }; // Blue
        case 'overdue': return { bg: [244, 67, 54], text: [255,255,255] }; // Red
        case 'draft': return { bg: [158, 158, 158], text: [0,0,0] }; // Grey
        default: return { bg: [200, 200, 200], text: [0,0,0] };
    }
}


// Expose the function to be callable from other scripts (e.g., invoice-preview.html)
window.InvoicifyPdfGenerator = {
    generateInvoicePdf
};

// Example Usage (from another file, assuming invoiceData is available):
// if (window.InvoicifyPdfGenerator && currentInvoiceData) {
//     window.InvoicifyPdfGenerator.generateInvoicePdf(currentInvoiceData);
// }
// Make sure to load jsPDF and jsPDF-AutoTable in the HTML page that calls this.
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
// <script src="invoice-pdf.js"></script>
//
// Then, in invoice-preview.html, the "Download PDF" button's event listener would be:
// document.getElementById('downloadPdfBtn').addEventListener('click', () => {
//   if (window.InvoicifyPdfGenerator && currentInvoiceDataLoadedFromStorage) { // currentInvoiceData needs to be populated
//     window.InvoicifyPdfGenerator.generateInvoicePdf(currentInvoiceDataLoadedFromStorage);
//   } else {
//     alert('PDF generator or invoice data is not ready.');
//   }
// });
//
// The `html2pdf.js` approach in invoice-preview.html is an alternative if this programmatic one is too complex
// or doesn't match visual styling closely enough. This jsPDF approach gives more structural control.
```
