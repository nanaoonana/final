document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                if (pane.id === target) {
                    pane.classList.remove('hidden');
                    pane.classList.add('active');
                } else {
                    pane.classList.add('hidden');
                    pane.classList.remove('active');
                }
            });
        });
    });
});
