document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expensesList = document.getElementById('expenses-list');
    const expenseReceiptInput = document.getElementById('expense-receipt');

    let sampleExpenses = [
        { id: 1, description: 'Office Supplies', amount: 75.50, date: '2024-07-27', receipt: null },
        { id: 2, description: 'Team Lunch', amount: 120.00, date: '2024-07-26', receipt: 'receipt-placeholder.png' }
    ];

    function renderExpenses() {
        expensesList.innerHTML = '';
        sampleExpenses.forEach(expense => {
            const expenseCard = document.createElement('div');
            expenseCard.className = 'p-4 bg-gray-50 rounded-lg shadow flex items-center justify-between';

            const receiptPreview = expense.receipt
                ? `<img src="${expense.receipt}" alt="Receipt" class="w-16 h-16 object-cover rounded-md">`
                : `<div class="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Receipt</div>`;

            expenseCard.innerHTML = `
                <div class="flex items-center space-x-4">
                    ${receiptPreview}
                    <div>
                        <p class="font-semibold text-gray-800">${expense.description}</p>
                        <p class="text-sm text-gray-600">$${expense.amount.toFixed(2)} on ${expense.date}</p>
                    </div>
                </div>
                <div class="text-sm font-medium">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                    <a href="#" class="text-red-600 hover:text-red-900 ml-4">Delete</a>
                    <a href="#" class="text-green-600 hover:text-green-900 ml-4">Add to Invoice</a>
                </div>
            `;
            expensesList.appendChild(expenseCard);
        });
    }

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            description: document.getElementById('expense-description').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            date: document.getElementById('expense-date').value,
            receipt: null
        };

        const receiptFile = expenseReceiptInput.files[0];
        if (receiptFile) {
            // For now, just using a placeholder. Supabase will handle actual upload.
            newExpense.receipt = URL.createObjectURL(receiptFile);
        }

        sampleExpenses.unshift(newExpense);
        renderExpenses();
        expenseForm.reset();
    });

    // Initial render
    renderExpenses();
});
