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

// Fisher-Yates shuffle algorithm to randomize array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    console.log('startQuiz called'); // Debug: Check if function is triggered
    const selectedAssignment = assignmentSelect.value;
    console.log('Selected Assignment:', selectedAssignment); // Debug: Log selection
    currentQuestions = [];
    userAnswers = [];
    score = 0;
    currentQuestionIndex = 0;

    if (selectedAssignment === 'all') {
        console.log('Processing All Questions'); // Debug
        questions.forEach((assignment, index) => {
            if (assignment.length > 0) {
                currentQuestions.push(...assignment.map(q => ({
                    ...q,
                    assignment: index + 1
                })));
            }
        });
        console.log('Total Questions before shuffle:', currentQuestions.length); // Debug: Should be 120
        currentQuestions = shuffleArray(currentQuestions);
        assignmentTitle.textContent = 'All Assignments';
    } else {
        const assignmentIndex = parseInt(selectedAssignment) - 1;
        console.log('Assignment Index:', assignmentIndex); // Debug
        if (questions[assignmentIndex] && questions[assignmentIndex].length > 0) {
            currentQuestions = questions[assignmentIndex].map(q => ({
                ...q,
                assignment: assignmentIndex + 1
            }));
            console.log('Questions for Assignment:', currentQuestions.length); // Debug: Should be 10
            currentQuestions = shuffleArray(currentQuestions);
            assignmentTitle.textContent = `Assignment ${selectedAssignment}`;
        } else {
            console.error('No questions found for assignment:', selectedAssignment);
            alert('Error: No questions available for this assignment.');
            return;
        }
    }

    console.log('Current Questions after shuffle:', currentQuestions); // Debug: Log questions
    if (currentQuestions.length === 0) {
        console.error('No questions loaded');
        alert('Error: No questions loaded. Please check the questions data.');
        return;
    }

    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    displayQuestion();
}

function displayQuestion() {
    console.log('displayQuestion called, index:', currentQuestionIndex); // Debug
    if (!currentQuestions[currentQuestionIndex]) {
        console.error('No question found at index:', currentQuestionIndex);
        alert('Error: No question available.');
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    questionText.textContent = question.question || 'Question text missing';
    optionsDiv.innerHTML = '';
    feedbackDiv.style.display = 'none';
    feedbackDiv.textContent = '';

    if (!question.options || question.options.length === 0) {
        console.error('No options for question:', question);
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
    console.log('Option selected:', option); // Debug
    const question = currentQuestions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = option;

    const siblings = optionDiv.parentElement.children;
    for (let sibling of siblings) {
        sibling.classList.remove('selected', 'correct', 'wrong');
    }

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
