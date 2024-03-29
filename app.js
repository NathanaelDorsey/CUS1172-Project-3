let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let startTime;
let elapsedInterval;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuizzes();
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
});

async function fetchQuizzes() {
    try {
        console.log('Fetching quizzes...');
        document.getElementById('loading-indicator').style.display = 'block';

        const response = await fetch('https://my-json-server.typicode.com/NathanaelDorsey/CUS1172-Project-3/quizzes');
        const quizzes = await response.json();
        console.log('Quizzes:', quizzes);

        const selectElement = document.getElementById('quiz-selection');
        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.name;
            selectElement.appendChild(option);
        });

        document.getElementById('loading-indicator').style.display = 'none';
    } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        document.getElementById('quiz-error').textContent = 'Failed to load quizzes. Please try again later.';
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

async function startQuiz() {
    const studentName = document.getElementById('student-name').value.trim();
    if (!studentName) {
        alert('Please enter your name.');
        return;
    }
    const quizId = document.getElementById('quiz-selection').value;
    if (!quizId) return;

    await fetchQuizQuestions(quizId);

    document.getElementById('quiz-intro').style.display = 'none';
    startTimer();
}

async function fetchQuizQuestions(quizId) {
    try {
        console.log('Fetching quiz questions...');
        const response = await fetch(`https://my-json-server.typicode.com/NathanaelDorsey/CUS1172-Project-3/quizzes/${quizId}`);
        const quizData = await response.json();
        questions = quizData.questions;
        currentQuestionIndex = 0;
        score = 0;

        if (questions.length !== 0) {
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            console.log("No questions found for the selected quiz.");
        }
    } catch (error) {
        console.error('Failed to fetch questions:', error);
    }
}

function displayQuestion(question) {
    console.log("Displaying question:", question);  // Debugging output

    let html = compileTemplate(question);
    console.log("Generated HTML:", html);  // Debugging output

    let quizQuestionsDiv = document.getElementById('quiz-questions');
    quizQuestionsDiv.innerHTML = html;  // Ensure this updates the content

    if (question.type === "narrative") {
        document.getElementById('submit-narrative-answer').addEventListener('click', () => {
            const narrativeAnswer = document.getElementById('narrative-answer').value.trim();
            checkAnswer(narrativeAnswer);
        });
    }
}

function compileTemplate(question) {
    let htmlContent = `<div><h2>${question.question}</h2>`;  // Ensure question text is displayed
    switch (question.type) {
        case 'narrative':
            htmlContent += `<textarea id="narrative-answer"></textarea>`;
            htmlContent += `<button id="submit-narrative-answer">Submit</button>`;
            break;
        case 'multiple-choice':
            question.options.forEach((option, index) => {
                htmlContent += `<button class="answer-btn">${option}</button>`;
            });
            break;
        case 'image-selection':
            htmlContent += '<div class="image-options">';
            question.options.forEach((option, index) => {
                // Ensure option contains the URL to the image
                htmlContent += `<img src="${option}" alt="Image option ${index}" class="image-option" data-answer="${index}">`;
            });
            htmlContent += '</div>';
            break;
        // Add other case handlers for different question types if needed
    }
    htmlContent += `</div>`;
    return htmlContent;
}

function checkAnswer(selectedAnswer) {
    const correctAnswer = questions[currentQuestionIndex].answer;
    const feedbackElement = document.getElementById('quiz-feedback'); // Ensure this element exists in your HTML
    feedbackElement.innerHTML = ''; // Clear previous feedback

    if (selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        score++;
        feedbackElement.innerHTML = `<div class="alert alert-success">Good work!</div>`;
        setTimeout(() => {
            feedbackElement.innerHTML = '';
            moveToNextQuestion();
        }, 1000); // Wait for 1 second then move to the next question
    } else {
        feedbackElement.innerHTML = `
            <div class="alert alert-danger">
                Incorrect. The correct answer was: ${correctAnswer}.
                <p>Explanation of the correct answer...</p>
                <button id="got-it-button">Got it</button>
            </div>
        `;
        document.getElementById('got-it-button').addEventListener('click', () => {
            feedbackElement.innerHTML = '';
            moveToNextQuestion();
        });
    }
}

function moveToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
        updateScoreboard();
    } else {
        updateScoreboard();
        displayResults();
        stopTimer();
    }
}

function displayResults() {
    const studentName = document.getElementById('student-name').value;
    const scorePercentage = (score / questions.length) * 100;
    let resultMessage = scorePercentage >= 80 ?
        `Congratulations ${studentName}! You pass the quiz` :
        `Sorry ${studentName}, you fail the quiz`;

    document.getElementById('quiz-questions').innerHTML = `
        <div id="result-view">
            <p>${resultMessage}</p>
            <button id="retake-quiz">Retake Quiz</button>
            <button id="return-main">Return to Main Page</button>
        </div>
    `;
    document.getElementById('retake-quiz').addEventListener('click', retakeQuiz);
    document.getElementById('return-main').addEventListener('click', returnToMain);
}
function returnToMain() {
    document.location.reload(); // or navigate to the main view as needed
}
function startTimer() {
    startTime = Date.now();
    elapsedInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('elapsed-time').textContent = elapsedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(elapsedInterval);
}

function updateScoreboard() {
    document.getElementById('answered-count').textContent = currentQuestionIndex;
    document.getElementById('total-count').textContent = questions.length;
    document.getElementById('current-score').textContent = score;
}
function retakeQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('quiz-intro').style.display = 'none'; // Hide intro if not needed
    document.getElementById('quiz-questions').style.display = 'block';
    updateScoreboard(); // Update the scoreboard with the reset values
    displayQuestion(questions[currentQuestionIndex]); // Display the first question again
}
document.getElementById('quiz-questions').addEventListener('click', (event) => {
    if (event.target.classList.contains('answer-btn')) {
        // For multiple-choice questions
        checkAnswer(event.target.textContent);
    } else if (event.target.classList.contains('image-option')) {
        // For image-selection questions
        const selectedImageIndex = event.target.getAttribute('data-answer');
        const selectedAnswer = questions[currentQuestionIndex].options[selectedImageIndex];
        checkAnswer(selectedAnswer);
    }
});