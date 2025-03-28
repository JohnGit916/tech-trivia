document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');

    if (startBtn) startBtn.addEventListener('click', startTrivia);
    if (restartBtn) restartBtn.addEventListener('click', startTrivia);
    if (submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startTrivia();
        }
    });

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;

    async function fetchQuestions() {
        try {
            const response = await fetch('https://triviabackend-kxd1.onrender.com/api/questions');
            if (!response.ok) throw new Error('Failed to fetch questions.');
            questions = await response.json();
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert('Failed to load questions. Please try again later.');
        }
    }

    async function fetchFeedback() {
        try {
            const response = await fetch('https://triviabackend-kxd1.onrender.com/api/feedback');
            const feedbackData = await response.json();
            const feedbackContainer = document.getElementById('feedback-container');
            feedbackContainer.innerHTML = feedbackData.map(feedback => `
                <p><strong>${feedback.name}:</strong> ${feedback.comment}</p>
            `).join('');
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    }

    async function startTrivia() {
        await fetchQuestions();
        if (!questions.length) return;

        score = 0;
        currentQuestionIndex = 0;
        document.getElementById('score').textContent = score;

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('quiz-section').classList.remove('hidden');
        document.getElementById('result-section').classList.add('hidden');

        startTimer();
        displayQuestion();
    }

    function startTimer() {
        let timeLeft = 60;
        document.getElementById('timer').textContent = timeLeft;

        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                endTrivia();
            }
        }, 1000);
    }

    function displayQuestion() {
        const questionData = questions[currentQuestionIndex];
        if (!questionData) return endTrivia();

        document.getElementById('question-text').textContent = questionData.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        questionData.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('mouseover', () => button.classList.add('hover-effect'));
            button.addEventListener('mouseout', () => button.classList.remove('hover-effect'));
            button.addEventListener('click', () => checkAnswer(option, questionData.answer));
            optionsContainer.appendChild(button);
        });
    }

    function checkAnswer(selected, correctAnswer) {
        if (selected === correctAnswer) {
            score++;
            document.getElementById('score').textContent = score;
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endTrivia();
        }
    }

    async function endTrivia() {
        clearInterval(timer);

        try {
            await fetch('https://triviabackend-kxd1.onrender.com/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: score, date: new Date().toLocaleString() })
            });
        } catch (error) {
            console.error('Error posting score:', error);
            alert('Failed to save your score. Please try again later.');
        }

        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        document.getElementById('final-score').textContent = score;

        await fetchFeedback();
    }

    async function submitFeedback() {
        const name = document.getElementById('feedback-name').value;
        const comment = document.getElementById('feedback-comment').value;

        if (!name || !comment) {
            alert('Please fill in both name and comment.');
            return;
        }

        try {
            await fetch('https://triviabackend-kxd1.onrender.com/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, comment })
            });

            document.getElementById('feedback-name').value = '';
            document.getElementById('feedback-comment').value = '';

            await fetchFeedback();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
        }
    }

    fetchFeedback();
});
