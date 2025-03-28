document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const submitFeedbackBtn = document.getElementById('submit-feedback');

    if (startBtn) startBtn.addEventListener('click', startTrivia);
    if (restartBtn) restartBtn.addEventListener('click', startTrivia);
    if (submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;

    function saveQuizState() {
        const quizState = {
            currentQuestionIndex,
            score,
            remainingTime: document.getElementById('timer').textContent,
            questions
        };
        localStorage.setItem('quizState', JSON.stringify(quizState));
    }

    function loadQuizState() {
        const savedState = JSON.parse(localStorage.getItem('quizState'));
        if (savedState) {
            questions = savedState.questions;
            currentQuestionIndex = savedState.currentQuestionIndex;
            score = savedState.score;
            document.getElementById('score').textContent = score;
            startTimer(parseInt(savedState.remainingTime));
            displayQuestion();
        }
    }

    async function fetchQuestions() {
        try {
            const response = await fetch('http://triviabackend-kxd1.onrender.com/api/questions');
            if (!response.ok) throw new Error('Failed to fetch questions.');
            questions = await response.json();
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert('Failed to load questions. Please try again later.');
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

    function startTimer(timeLeft = 60) {
        document.getElementById('timer').textContent = timeLeft;

        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            saveQuizState();

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
            button.addEventListener('click', () => checkAnswer(option, questionData.answer));
            optionsContainer.appendChild(button);
        });
    }

    async function checkAnswer(selected, correctAnswer) {
        if (selected === correctAnswer) {
            score++;
            document.getElementById('score').textContent = score;
            await fetch(`http://triviabackend-kxd1.onrender.com/api/score/1`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });
        }

        currentQuestionIndex++;
        saveQuizState();

        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endTrivia();
        }
    }

    async function endTrivia() {
        clearInterval(timer);
        localStorage.removeItem('quizState');
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        document.getElementById('final-score').textContent = score;
        loadLatestFeedback();
    }

    async function submitFeedback(event) {
        event.preventDefault();

        const name = document.getElementById('user-name').value.trim();
        const feedback = document.getElementById('user-feedback').value.trim();
        if (!name || !feedback) return alert('Please provide your name and feedback.');

        try {
            await fetch('http://https://triviabackend-kxd1.onrender.com/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, feedback, date: new Date().toLocaleString() })
            });

            alert('Thank you for your feedback!');

            document.getElementById('user-name').value = '';
            document.getElementById('user-feedback').value = '';
        } catch (error) {
            console.error('Error posting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
        }
    }

    loadQuizState();
});
