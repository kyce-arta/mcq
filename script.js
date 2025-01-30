let currentQuestionIndex = 0;
let questions = [];
let selectedQuestions = [];
let correctAnswers = 0;
let totalQuestions = 0;
let selectedOption = null; // Track the selected option
let userAnswers = []; // Track user's answers for each question

// Fetch questions from the JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
  })
  .catch(error => console.error('Error loading questions:', error));

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to display the current question
function showQuestion() {
  const questionContainer = document.getElementById('question');
  const optionsContainer = document.getElementById('options-container');
  const feedbackContainer = document.getElementById('feedback');
  const currentQuestion = selectedQuestions[currentQuestionIndex];

  questionContainer.textContent = currentQuestion.question;
  optionsContainer.innerHTML = '';
  feedbackContainer.classList.add('hidden'); // Hide feedback initially
  selectedOption = null; // Reset the selected option for the new question

  // Randomize the order of choices
  const shuffledOptions = [...currentQuestion.options];
  shuffleArray(shuffledOptions);

  shuffledOptions.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('option');
    button.addEventListener('click', () => selectAnswer(option, button));
    optionsContainer.appendChild(button);
  });
}

// Function to handle option selection
function selectAnswer(option, button) {
  // Deselect all options
  const options = document.querySelectorAll('.option');
  options.forEach(opt => opt.classList.remove('selected'));

  // Select the clicked option
  button.classList.add('selected');
  selectedOption = option;
}

// Function to check the selected answer
function checkAnswer() {
  if (selectedOption === null) {
    alert('Please select an answer before proceeding.');
    return false; // Return false if no answer is selected
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQuestion.answer;

  // Track the user's answer
  userAnswers.push({
    question: currentQuestion.question,
    userAnswer: selectedOption,
    correctAnswer: currentQuestion.answer,
    isCorrect: isCorrect
  });

  if (isCorrect) {
    correctAnswers++; // Increment correct answers
  }

  updateScore(); // Update the score display
  return true; // Return true if an answer was checked
}

// Function to update the score display
function updateScore() {
  const scoreContainer = document.getElementById('score');
  scoreContainer.textContent = `Correct Answers: ${correctAnswers} / ${totalQuestions}`;
}

// Function to save the attempt to localStorage
function saveAttempt(correct, total) {
  const attempts = JSON.parse(localStorage.getItem('attempts')) || [];
  const percentage = ((correct / total) * 100).toFixed(2);
  attempts.push({ correct, total, percentage, timestamp: new Date().toLocaleString() });
  localStorage.setItem('attempts', JSON.stringify(attempts));
}

// Function to display previous attempts in the modal
function displayHistory() {
  const historyList = document.getElementById('history-list');
  const attempts = JSON.parse(localStorage.getItem('attempts')) || [];
  historyList.innerHTML = '';

  attempts.forEach(attempt => {
    const li = document.createElement('li');
    li.textContent = `Correct: ${attempt.correct}/${attempt.total} (${attempt.percentage}%) - ${attempt.timestamp}`;
    historyList.appendChild(li);
  });
}

// Function to display the review section
function displayReview() {
  const reviewContainer = document.getElementById('review-container');
  const reviewQuestionsContainer = document.getElementById('review-questions');
  reviewQuestionsContainer.innerHTML = '';

  userAnswers.forEach((answer, index) => {
    if (!answer.isCorrect) {
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('review-question');

      // Display the question
      const questionText = document.createElement('p');
      questionText.textContent = `${index + 1}. ${answer.question}`;
      questionDiv.appendChild(questionText);

      // Display the correct answer
      const correctOption = document.createElement('div');
      correctOption.classList.add('review-option', 'correct');
      correctOption.textContent = `Correct Answer: ${answer.correctAnswer}`;
      questionDiv.appendChild(correctOption);

      // Display the user's incorrect answer
      const userOption = document.createElement('div');
      userOption.classList.add('review-option', 'incorrect');
      userOption.textContent = `Your Answer: ${answer.userAnswer}`;
      questionDiv.appendChild(userOption);

      reviewQuestionsContainer.appendChild(questionDiv);
    }
  });

  // Show the review container
  reviewContainer.classList.remove('hidden');
}

// Function to start the exam
document.getElementById('start-button').addEventListener('click', () => {
  const numQuestions = parseInt(document.getElementById('num-questions').value, 10);
  if (numQuestions > questions.length) {
    alert(`You can only take up to ${questions.length} questions.`);
    return;
  }

  // Reset counters
  currentQuestionIndex = 0;
  correctAnswers = 0;
  totalQuestions = numQuestions;
  selectedOption = null;
  userAnswers = []; // Reset user answers

  // Randomize and select the specified number of questions
  shuffleArray(questions);
  selectedQuestions = questions.slice(0, numQuestions);

  // Hide the start container and show the question container
  document.getElementById('start-container').style.display = 'none';
  document.getElementById('question-container').classList.remove('hidden');
  document.getElementById('review-container').classList.add('hidden'); // Hide review initially

  // Show the first question
  showQuestion();
  updateScore(); // Initialize score display
});

// Function to move to the next question
document.getElementById('next-button').addEventListener('click', () => {
  // Check the answer before moving to the next question
  const isAnswerChecked = checkAnswer();
  if (!isAnswerChecked) return; // Stop if no answer was selected

  currentQuestionIndex++;
  if (currentQuestionIndex < selectedQuestions.length) {
    showQuestion();
  } else {
    // Save the attempt and display history
    saveAttempt(correctAnswers, totalQuestions);
    displayHistory();

    // Show completion message and review section
    alert(`You have completed the exam! Correct Answers: ${correctAnswers}/${totalQuestions}`);
    document.getElementById('question-container').classList.add('hidden'); // Hide the question container
    displayReview(); // Show the review section
  }
});

// Function to restart the exam
document.getElementById('restart-button').addEventListener('click', () => {
  document.getElementById('review-container').classList.add('hidden'); // Hide the review section
  document.getElementById('start-container').style.display = 'flex'; // Show the start container
});

// Function to show/hide the history modal
document.getElementById('history-button').addEventListener('click', () => {
  displayHistory(); // Refresh the history list
  document.getElementById('history-modal').classList.add('visible'); // Show the modal
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('history-modal').classList.remove('visible'); // Hide the modal
});