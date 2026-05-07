class QuizManager {
            constructor() {
                this.questions = [
                    {
                        question: "What is the capital of France?",
                        options: ["London", "Berlin", "Paris", "Madrid"],
                        correct: 2,
                        time: 30// seconds
                    },
                    {
                        question: "Which planet is known as the Red Planet?",
                        options: ["Venus", "Mars", "Jupiter", "Saturn"],
                        correct: 1,
                        time: 30
                    },
                    {
                        question: "What is 15 + 27?",
                        options: ["40", "42", "44", "45"],
                        correct: 1,
                        time: 30
                    },
                    {
                        question: "Who wrote 'Romeo and Juliet'?",
                        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                        correct: 1,
                        time: 30
                    },
                    {
                        question: "What is the largest ocean on Earth?",
                        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                        correct: 3,
                        time: 30
                    }
                ];

                this.currentQuestion = 0;
                this.userAnswers = [];
                this.skipsLeft = 2;
                this.timer = null;
                this.timeLeft = 30;
                this.selectedAnswer = null;

                this.init();
            }

            init() {
                this.renderQuestion();
                this.startTimer();
                this.attachEventListeners();
            }

            renderQuestion() {
                const question = this.questions[this.currentQuestion];
                const container = document.getElementById('quizContent');
                
                container.innerHTML = `
                    <div class="question">${question.question}</div>
                    <div class="options" id="options">
                        ${question.options.map((option, index) => `
                            <div class="option" data-index="${index}">${String.fromCharCode(65 + index)}. ${option}</div>
                        `).join('')}
                    </div>
                    <div class="controls">
                        <div class="skip-info">
                            Skips left: <span id="skipsDisplay">${this.skipsLeft}</span>
                        </div>
                        <div>
                            ${this.currentQuestion > 0 ? `<button class="btn btn-secondary" id="prevBtn">Previous</button>` : ''}
                            <button class="btn btn-primary" id="nextBtn" ${!this.selectedAnswer ? 'disabled' : ''}>${this.isLastQuestion() ? 'Finish' : 'Next'}</button>
                            ${this.skipsLeft > 0 ? `<button class="btn btn-secondary" id="skipBtn">Skip</button>` : ''}
                        </div>
                    </div>
                `;

                this.updateProgress();
                this.updateQuestionNumber();
                this.updateSkipsDisplay();
                this.attachEventListeners();
            }

            attachEventListeners() {
                // Option selection
                document.querySelectorAll('.option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                        e.currentTarget.classList.add('selected');
                        this.selectedAnswer = parseInt(e.currentTarget.dataset.index);
                        document.getElementById('nextBtn').disabled = false;
                    });
                });

                // Next button
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        if (this.selectedAnswer !== null || this.isLastQuestion()) {
                            this.saveAnswer();
                            this.nextQuestion();
                        }
                    });
                }

                // Previous button
                const prevBtn = document.getElementById('prevBtn');
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        this.prevQuestion();
                    });
                }

                // Skip button
                const skipBtn = document.getElementById('skipBtn');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.skipQuestion();
                    });
                }
            }

            startTimer() {
                this.timeLeft = this.questions[this.currentQuestion].time;
                this.updateTimerDisplay();

                this.timer = setInterval(() => {
                    this.timeLeft--;
                    this.updateTimerDisplay();

                    if (this.timeLeft <= 0) {
                        clearInterval(this.timer);
                        this.saveAnswer(); // Save null answer (time up)
                        this.nextQuestion();
                    }
                }, 1000);
            }

            updateTimerDisplay() {
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            updateProgress() {
                const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
                document.getElementById('progressBar').style.width = `${progress}%`;
            }

            updateQuestionNumber() {
                document.getElementById('questionNumber').textContent = 
                    `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
            }

            updateSkipsDisplay() {
                document.getElementById('skipsDisplay').textContent = this.skipsLeft;
            }

            saveAnswer() {
                this.userAnswers[this.currentQuestion] = this.selectedAnswer;
            }

            nextQuestion() {
                clearInterval(this.timer);
                
                if (!this.isLastQuestion()) {
                    this.currentQuestion++;
                    this.selectedAnswer = null;
                    this.renderQuestion();
                    this.startTimer();
                } else {
                    this.showResults();
                }
            }

            prevQuestion() {
                clearInterval(this.timer);
                this.currentQuestion--;
                this.selectedAnswer = this.userAnswers[this.currentQuestion] || null;
                this.renderQuestion();
                this.startTimer();
            }

            skipQuestion() {
                clearInterval(this.timer);
                this.userAnswers[this.currentQuestion] = null;
                this.skipsLeft--;
                this.nextQuestion();
            }

            isLastQuestion() {
                return this.currentQuestion === this.questions.length - 1;
            }

            showResults() {
                const container = document.getElementById('quizContent');
                const score = this.userAnswers.reduce((acc, answer, index) => {
                    return answer === this.questions[index].correct ? acc + 1 : acc;
                }, 0);

                const scoreClass = score === 5 ? 'perfect' : score >= 3 ? 'good' : 'poor';

                container.innerHTML = `
                    <div class="results">
                        <div class="score score-${scoreClass}">${score}/${this.questions.length}</div>
                        <h2>${score === 5 ? 'Perfect!' : score >= 3 ? 'Great Job!' : 'Try Again!'}</h2>
                        <div class="answers-table">
                            <div class="table-header">
                                <div>Q#</div>
                                <div>Your Answer</div>
                                <div>Correct Answer</div>
                                <div>Status</div>
                            </div>
                            ${this.questions.map((question, index) => {
                                const userAns = this.userAnswers[index];
                                const correctAns = question.correct;
                                const userOption = userAns !== null ? question.options[userAns] : 'Skipped';
                                const correctOption = question.options[correctAns];
                                const status = userAns === correctAns ? '✅ Correct' : 
                                             userAns === null ? '⏭️ Skipped' : '❌ Wrong';
                                const rowClass = userAns === correctAns ? 'correct' : 
                                               userAns === null ? '' : 'wrong';
                                
                                return `
                                    <div class="table-row ${rowClass}">
                                        <div>${index + 1}</div>
                                        <div>${userOption}</div>
                                        <div>${correctOption}</div>
                                        <div>${status}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button class="btn btn-primary restart-btn" id="restartBtn">Restart Quiz</button>
                    </div>
                `;

                // Restart button
                document.getElementById('restartBtn').addEventListener('click', () => {
                    this.restart();
                });
            }

            restart() {
                this.currentQuestion = 0;
                this.userAnswers = [];
                this.skipsLeft = 2;
                this.selectedAnswer = null;
                document.getElementById('quizContainer').scrollTop = 0;
                this.init();
            }
        }
function loadQuiz(subject) {
    console.log("Loading " + subject);
}
        // Initialize the quiz when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new QuizManager();
        });