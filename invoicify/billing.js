document.addEventListener('DOMContentLoaded', () => {
    const billingHistoryTable = document.getElementById('billing-history-table');

    const sampleBillingHistory = [
        { date: '2024-07-01', amount: 15.00, status: 'Paid', invoice: 'INV-2024-07-001' },
        { date: '2024-06-01', amount: 15.00, status: 'Paid', invoice: 'INV-2024-06-001' },
        { date: '2024-05-01', amount: 15.00, status: 'Paid', invoice: 'INV-2024-05-001' }
    ];

    function renderBillingHistory() {
        billingHistoryTable.innerHTML = '';
        sampleBillingHistory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">$${item.amount.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${item.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <a href="#">${item.invoice}</a>
                </td>
            `;
            billingHistoryTable.appendChild(row);
        });
    }

    renderBillingHistory();
});
