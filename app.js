let currentQuestionIndex = 0;
let score = 0;
let questions = [];

async function fetchQuizzes() {
    try {
        console.log('Fetching quizzes...');
        document.getElementById('loading-indicator').style.display = 'block';

        const response = await fetch('https://my-json-server.typicode.com/NathanaelDorsey/CUS1172-Project-3/quizzes');
        const quizzes = await response.json();
        console.log('Quizzes:', quizzes); // Log the response to see if data is received
        const selectElement = document.getElementById('quiz-selection');
        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.name;
            selectElement.appendChild(option);
        });
        document.getElementById('loading-indicator').style.display = 'none';
        console.log('Quizzes fetched successfully.');
    } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        // Display an error message to the user
        document.getElementById('quiz-error').textContent = 'Failed to load quizzes. Please try again later.';
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded.');
    fetchQuizzes();
});

document.getElementById('start-quiz').addEventListener('click', async () => {
    console.log('Start quiz button clicked.');
    const quizId = document.getElementById('quiz-selection').value;
    if (!quizId) return;
    await fetchQuizQuestions(quizId);
    document.getElementById('quiz-intro').style.display = 'none';
});

async function fetchQuizQuestions(quizId) {
    try {
        console.log('Fetching quiz questions...');
        const response = await fetch(`https://my-json-server.typicode.com/NathanaelDorsey/CUS1172-Project-3/quizzes/${quizId}`);
        const quizData = await response.json();
        console.log('Quiz questions:', quizData); // Log the questions data
        questions = quizData.questions;
        currentQuestionIndex = 0;
        score = 0;

        if (questions.length > 0) {
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            console.log("No questions found for the selected quiz.");
        }
    } catch (error) {
        console.error('Failed to fetch questions:', error);
    }
}

function displayQuestion(question) {
    console.log('Displaying question:', question);
    const compileTemplate = window.getQuestionTemplate();
    const html = compileTemplate(question);
    document.getElementById('quiz-questions').innerHTML = html;

    if (question.type === "narrative") {
        console.log('Narrative question detected.');
        document.getElementById('submit-narrative-answer').addEventListener('click', () => {
            const narrativeAnswer = document.getElementById('narrative-answer').value.trim();
            checkAnswer(narrativeAnswer);
        });
    }
}

function checkAnswer(selectedAnswer) {
    const correctAnswer = questions[currentQuestionIndex].answer;
    const selectedAnswerNormalized = selectedAnswer.trim().toLowerCase();
    const correctAnswerNormalized = correctAnswer.trim().toLowerCase();
    if (selectedAnswerNormalized === correctAnswerNormalized) {
        score++;
        alert("Correct!");
    } else {
        alert("Incorrect. The correct answer was: " + correctAnswer);
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(currentQuestionIndex);
    } else {
        displayResults();
    }
}

function displayResults() {
    const resultsHTML = `<h2>Quiz Completed!</h2><p>Your score is ${score} out of ${questions.length}.</p>`;
    document.getElementById('quiz-questions').innerHTML = resultsHTML;
}

document.getElementById('quiz-questions').addEventListener('click', (event) => {
    console.log('Clicked element:', event.target);
    if (event.target.classList.contains('answer-btn')) {
        const selectedAnswer = event.target.textContent.trim();
        checkAnswer(selectedAnswer);
    } else if (event.target.classList.contains('image-option')) {
        const selectedImageIndex = event.target.getAttribute('data-answer');
        checkAnswer(questions[currentQuestionIndex].options[selectedImageIndex]);
    }
});