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

// Check if questions is defined
if (typeof questions === 'undefined') {
    console.error('questions.js not loaded or questions variable undefined');
    alert('Error: Questions data not loaded. Please check if questions.js is included.');
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    console.log('startQuiz called, selected:', assignmentSelect.value);
    currentQuestions = [];
    userAnswers = [];
    score = 0;
    currentQuestionIndex = 0;

    const selectedAssignment = assignmentSelect.value;
    if (selectedAssignment === 'all') {
        // Deduplicate questions to ensure no repeats
        const seenQuestions = new Set();
        questions.forEach((assignment, index) => {
            if (assignment && assignment.length > 0) {
                assignment.forEach(q => {
                    if (!seenQuestions.has(q.question)) {
                        seenQuestions.add(q.question);
                        currentQuestions.push({ ...q, assignment: index + 1 });
                    }
                });
            }
        });
        console.log('All Questions loaded (deduplicated):', currentQuestions.length); // Should be 110
        currentQuestions = shuffleArray(currentQuestions); // Shuffle once to avoid repetition
        assignmentTitle.textContent = 'All Assignments';
    } else {
        const assignmentIndex = parseInt(selectedAssignment) - 1;
        if (questions[assignmentIndex] && questions[assignmentIndex].length > 0) {
            currentQuestions = questions[assignmentIndex].map(q => ({
                ...q,
                assignment: assignmentIndex + 1
            }));
            console.log(`Assignment ${selectedAssignment} loaded:`, currentQuestions.length);
            currentQuestions = shuffleArray(currentQuestions); // Shuffle once
            assignmentTitle.textContent = `Assignment ${selectedAssignment}`;
        } else {
            console.error(`No questions for Assignment ${selectedAssignment}`);
            alert(`Error: No questions found for Assignment ${selectedAssignment}.`);
            return;
        }
    }

    if (currentQuestions.length === 0) {
        console.error('No questions loaded');
        alert('Error: No questions available. Please check questions.js.');
        return;
    }

    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    console.log('Switching to quiz screen, next button visible:', nextQuestionBtn.offsetParent !== null);
    displayQuestion();
}

function displayQuestion() {
    console.log('displayQuestion called, index:', currentQuestionIndex);
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        console.error('No question at index:', currentQuestionIndex);
        alert('Error: Question not found.');
        return;
    }

    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    questionText.textContent = question.question || 'Question text missing';
    optionsDiv.innerHTML = '';
    feedbackDiv.style.display = 'none';
    feedbackDiv.textContent = '';

    if (!question.options || question.options.length === 0) {
        console.error('No options for question:', question);
        optionsDiv.textContent = 'Error: No options available.';
        return;
    }

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        optionDiv.textContent = `(${String.fromCharCode(97 + index)}) ${option}`;
        optionDiv.addEventListener('click', () => selectOption(option, optionDiv));
        if (userAnswers[currentQuestionIndex] === option) {
            optionDiv.classList.add('selected');
        }
        optionsDiv.appendChild(optionDiv);
    });

    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    nextQuestionBtn.style.display = 'inline-block'; // Ensure Next button is visible
    nextQuestionBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Submit' : 'Next';
    console.log('Next button text:', nextQuestionBtn.textContent);
}

function selectOption(option, optionDiv) {
    console.log('Selected option:', option);
    const question = currentQuestions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = option;

    Array.from(optionDiv.parentElement.children).forEach(sibling => {
        sibling.classList.remove('selected', 'correct', 'wrong');
    });

    optionDiv.classList.add('selected');
    if (option === question.answer) {
        optionDiv.classList.add('correct');
        feedbackDiv.textContent = 'Correct!';
        feedbackDiv.classList.remove('wrong');
        feedbackDiv.classList.add('correct');
    } else {
        optionDiv.classList.add('wrong');
        feedbackDiv.textContent = `Wrong! Correct answer: ${question.answer}`;
        feedbackDiv.classList.remove('correct');
        feedbackDiv.classList.add('wrong');
    }
    feedbackDiv.style.display = 'block';

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            calculateScore();
            displayResults();
        }
    }, 2000);
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
