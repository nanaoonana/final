document.addEventListener('DOMContentLoaded', () => {
    const incomeExpenseCtx = document.getElementById('income-expense-chart').getContext('2d');
    const taxCtx = document.getElementById('tax-chart').getContext('2d');
    const clientFilter = document.getElementById('client-filter');
    const exportCsvBtn = document.getElementById('export-csv');

    // --- Sample Data ---
    const sampleIncomeData = [1200, 1900, 3000, 5000, 2300, 3100];
    const sampleExpenseData = [800, 1000, 1200, 1500, 1300, 1700];
    const sampleTaxData = [300, 450, 700, 1100, 550, 750];
    const sampleLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // --- Chart Initialization ---
    const incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: sampleLabels,
            datasets: [
                {
                    label: 'Income',
                    data: sampleIncomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: sampleExpenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const taxChart = new Chart(taxCtx, {
        type: 'line',
        data: {
            labels: sampleLabels,
            datasets: [{
                label: 'Tax Owed',
                data: sampleTaxData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // --- Filter and Export Logic (Placeholders) ---
    function populateClientFilter() {
        // This will be populated from Supabase data later
        const sampleClients = ['Client A', 'Client B', 'Client C'];
        sampleClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.toLowerCase().replace(' ', '-');
            option.textContent = client;
            clientFilter.appendChild(option);
        });
    }

    exportCsvBtn.addEventListener('click', () => {
        // CSV export logic will be implemented here
        alert('Exporting CSV...');
    });

    // Initial setup
    populateClientFilter();
});
