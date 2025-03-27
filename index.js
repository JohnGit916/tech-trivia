document.getElementById('start-btn').addEventListener('click', startTrivia);
document.getElementById('restart-btn').addEventListener('click', startTrivia);

// Keyboard Support for Start/Restart
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
    const response = await fetch('http://localhost:3000/questions');
    questions = await response.json();
}

async function startTrivia() {
    await fetchQuestions();
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
    document.getElementById('question-text').textContent = questionData.question;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;

        // Mouseover Effect
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

    await fetch('http://localhost:3000/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score, date: new Date().toLocaleString() })
    });

    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
}
