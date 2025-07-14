let currentStep = 1;

function nextStep(step) {
    document.getElementById(`content-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${currentStep}`).classList.remove('step-active');
    document.getElementById(`step-${currentStep}`).classList.add('step-completed');

    currentStep = step;
    document.getElementById(`content-${currentStep}`).classList.remove('hidden');
    document.getElementById(`step-${currentStep}`).classList.add('step-active');
}

function finishOnboarding() {
    // In a real app, you would save the data to Supabase here.
    window.location.href = 'dashboard.html';
}

document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
        const plan = card.getAttribute('data-plan');
        console.log(`Selected plan: ${plan}`);
        // Add logic to handle plan selection
        nextStep(3);
    });
});
