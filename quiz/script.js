// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const assignmentSelect = document.getElementById('assignment-select');
const startQuizBtn = document.getElementById('start-quiz');
const assignmentTitle = document.getElementById('assignment-title');
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const feedbackDiv = document.getElementById('feedback');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const scoreText = document.getElementById('score');
const resultDetails = document.getElementById('result-details');
const restartQuizBtn = document.getElementById('restart-quiz');

// Quiz State
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

function startQuiz() {
    const selectedAssignment = assignmentSelect.value;
    currentQuestions = [];
    userAnswers = [];
    score = 0;
    currentQuestionIndex = 0;

    if (selectedAssignment === 'all') {
        questions.forEach((assignment, index) => {
            if (assignment.length > 0) {
                currentQuestions.push(...assignment.map(q => ({
                    ...q,
                    assignment: index + 1
                })));
            }
        });
        assignmentTitle.textContent = 'All Assignments';
    } else {
        const assignmentIndex = parseInt(selectedAssignment) - 1;
        currentQuestions = questions[assignmentIndex].map(q => ({
            ...q,
            assignment: assignmentIndex + 1
        }));
        assignmentTitle.textContent = `Assignment ${selectedAssignment}`;
    }

    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    displayQuestion();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    questionText.textContent = question.question || 'Question text missing';
    optionsDiv.innerHTML = '';
    feedbackDiv.style.display = 'none';
    feedbackDiv.textContent = '';

    if (!question.options || question.options.length === 0) {
        optionsDiv.textContent = 'Error: No options available for this question.';
        return;
    }

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        optionDiv.textContent = `(${String.fromCharCode(97 + index)}) ${option}`;
        optionDiv.addEventListener('click', () => selectOption(option, optionDiv));
        if (userAnswers[currentQuestionIndex] === option) {
            optionDiv.classList.add('selected');
            // Reapply feedback if already answered
            if (option === question.answer) {
                optionDiv.classList.add('correct');
                feedbackDiv.textContent = 'Correct!';
                feedbackDiv.classList.add('correct');
                feedbackDiv.style.display = 'block';
            } else {
                optionDiv.classList.add('wrong');
                feedbackDiv.textContent = 'Wrong!';
                feedbackDiv.classList.add('wrong');
                feedbackDiv.style.display = 'block';
            }
        }
        optionsDiv.appendChild(optionDiv);
    });

    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    nextQuestionBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Submit' : 'Next';
}

function selectOption(option, optionDiv) {
    const question = currentQuestions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = option;

    // Clear previous styles
    const siblings = optionDiv.parentElement.children;
    for (let sibling of siblings) {
        sibling.classList.remove('selected', 'correct', 'wrong');
    }

    // Apply new styles
    optionDiv.classList.add('selected');
    if (option === question.answer) {
        optionDiv.classList.add('correct');
        feedbackDiv.textContent = 'Correct!';
        feedbackDiv.classList.remove('wrong');
        feedbackDiv.classList.add('correct');
    } else {
        optionDiv.classList.add('wrong');
        feedbackDiv.textContent = 'Wrong!';
        feedbackDiv.classList.remove('correct');
        feedbackDiv.classList.add('wrong');
    }
    feedbackDiv.style.display = 'block';
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        calculateScore();
        displayResults();
    }
}

function calculateScore() {
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === currentQuestions[index].answer) {
            score++;
        }
    });
}

function displayResults() {
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    scoreText.textContent = `Your Score: ${score} out of ${currentQuestions.length}`;
    resultDetails.innerHTML = '';

    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index] || 'Not answered';
        const isCorrect = userAnswer === question.answer;
        const resultItem = document.createElement('div');
        resultItem.innerHTML = `
            <p><strong>Assignment ${question.assignment}, Question ${index + 1}:</strong> ${question.question}</p>
            <p>Your Answer: ${userAnswer} <span class="${isCorrect ? 'correct' : 'incorrect'}">(${isCorrect ? 'Correct' : 'Incorrect'})</span></p>
            ${!isCorrect ? `<p>Correct Answer: ${question.answer}</p>` : ''}
        `;
        resultDetails.appendChild(resultItem);
    });
}

function restartQuiz() {
    resultScreen.style.display = 'none';
    startScreen.style.display = 'block';
    userAnswers = [];
    score = 0;
    currentQuestionIndex = 0;
}

// Event Listeners
startQuizBtn.addEventListener('click', startQuiz);
prevQuestionBtn.addEventListener('click', prevQuestion);
nextQuestionBtn.addEventListener('click', nextQuestion);
restartQuizBtn.addEventListener('click', restartQuiz);