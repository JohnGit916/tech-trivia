document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://triviabackend-1.onrender.com/api/';

    const startBtn = document.getElementById('start-btn');
    const quizSection = document.getElementById('quiz-section');
    const startScreen = document.getElementById('start-screen');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const finalScoreDisplay = document.getElementById('final-score');
    const resultSection = document.getElementById('result-section');
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    const feedbackList = document.getElementById('feedback-list');
    const restartBtn = document.getElementById('restart-btn');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 60;

    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        quizSection.classList.remove('hidden');
        loadQuestions();
        startTimer();
    });

    function startTimer() {
        timerDisplay.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                endTrivia();
            }
        }, 1000);
    }

    function loadQuestions() {
        fetch(`${API_BASE_URL}/questions`)
            .then(response => response.json())
            .then(data => {
                questions = data;
                displayQuestion();
            })
            .catch(error => console.error('Error fetching questions:', error));
    }

    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            questionText.textContent = currentQuestion.question;
            optionsContainer.innerHTML = '';

            currentQuestion.options.forEach(option => {
                const optionBtn = document.createElement('button');
                optionBtn.textContent = option;
                optionBtn.classList.add('option-btn');

                optionBtn.addEventListener('click', () => {
                    if (option === currentQuestion.answer) {
                        score++;
                        scoreDisplay.textContent = score;
                    }
                    currentQuestionIndex++;
                    displayQuestion();
                });

                optionsContainer.appendChild(optionBtn);
            });
        } else {
            endTrivia();
        }
    }

    function endTrivia() {
        quizSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        finalScoreDisplay.textContent = `${score} / 15`;
        restartBtn.classList.remove('hidden')
    }

    restartBtn.addEventListener('click', () => {
        score = 0;
        currentQuestionIndex = 0;
        timeLeft = 60;
        
        scoreDisplay.textContent = score;
        quizSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
    
        loadQuestions();
        startTimer();
    });

    // Submit Feedback Functionality
    submitFeedbackBtn.addEventListener('click', () => {
        const userName = document.getElementById('user-name').value.trim();
        const userFeedback = document.getElementById('user-feedback').value.trim();

        if (!userName || !userFeedback) {
            alert('Please provide both your name and feedback.');
            return;
        }

        fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userName,
                feedback: userFeedback,
                date: new Date().toLocaleString()
            })
        })
        .then(response => response.json())
        .then(newFeedback => {
            displayFeedback(newFeedback);
            alert('Thank you for your feedback!');
        })
        .catch(error => console.error('Error posting feedback:', error));
    });

    function displayFeedback(feedback) {
        const listItem = document.createElement('li');
        listItem.textContent = `${feedback.name}: ${feedback.feedback}`;
        feedbackList.appendChild(listItem);
    }
});
