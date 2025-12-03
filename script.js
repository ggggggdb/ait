// Инициализация прогресса
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем прогресс из localStorage
    loadProgress();
    
    // Подсчитываем общее количество вопросов
    updateTotalQuestions();
    
    // Инициализация кнопок ответов
    initAnswerButtons();
    
    // Инициализация навигации
    initNavigation();
});

// Загрузка прогресса
function loadProgress() {
    const progressBars = document.querySelectorAll('.progress');
    
    progressBars.forEach(bar => {
        const section = bar.closest('.section-card');
        const link = section.querySelector('a');
        const sectionName = link.getAttribute('href');
        
        // Получаем прогресс из localStorage
        const progress = localStorage.getItem(sectionName) || 0;
        
        // Устанавливаем ширину прогресс-бара
        bar.style.setProperty('--progress-width', `${progress}%`);
        bar.setAttribute('data-progress', progress);
    });
}

// Обновление прогресса
function updateProgress(section, percentage) {
    const progress = Math.min(100, Math.max(0, percentage));
    
    // Сохраняем в localStorage
    localStorage.setItem(section, progress.toString());
    
    // Обновляем все прогресс-бары для этого раздела
    document.querySelectorAll(`a[href="${section}"]`).forEach(link => {
        const progressBar = link.closest('.section-card').querySelector('.progress');
        progressBar.style.setProperty('--progress-width', `${progress}%`);
        progressBar.setAttribute('data-progress', progress);
    });
    
    // Обновляем статистику
    updateTotalQuestions();
}

// Подсчет общего количества вопросов
function updateTotalQuestions() {
    let totalAnswered = 0;
    let totalQuestions = 0;
    
    // Собираем статистику по всем разделам
    for (let i = 1; i <= 6; i++) {
        const progress = parseInt(localStorage.getItem(`sections/section${i}.html`) || 0);
        totalAnswered += progress;
        totalQuestions += 100; // Каждый раздел имеет 100% максимум
    }
    
    const totalPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
    const questionCount = Math.round(totalAnswered / 100 * 30); // Примерно 30 вопросов на раздел
    
    // Обновляем отображение
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = `${questionCount} вопросов`;
    }
}

// Инициализация кнопок ответов
function initAnswerButtons() {
    document.querySelectorAll('.answer-btn').forEach(button => {
        button.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isVisible = answer.style.display === 'block';
            
            if (isVisible) {
                answer.style.display = 'none';
                this.textContent = 'Показать ответ';
            } else {
                answer.style.display = 'block';
                this.textContent = 'Скрыть ответ';
                
                // Обновляем прогресс
                const section = window.location.pathname;
                const currentProgress = parseInt(localStorage.getItem(section) || 0);
                const questionItem = this.closest('.question-item');
                const allQuestions = questionItem.closest('.questions-section').querySelectorAll('.question-item');
                
                // Каждый вопрос увеличивает прогресс на 100/n%, где n - количество вопросов
                const progressIncrement = 100 / allQuestions.length;
                const newProgress = Math.min(100, currentProgress + progressIncrement);
                
                updateProgress(section, newProgress);
            }
        });
    });
}

// Инициализация навигации
function initNavigation() {
    // Сохраняем текущую позицию прокрутки при переходе
    document.querySelectorAll('a[href^="sections/"]').forEach(link => {
        link.addEventListener('click', function() {
            localStorage.setItem('scrollPosition', window.pageYOffset);
        });
    });
    
    // Восстанавливаем позицию при загрузке
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        localStorage.removeItem('scrollPosition');
    }
}

// Симуляция времени изучения
function simulateStudyTime() {
    const timeElement = document.getElementById('total-time');
    if (timeElement) {
        let totalMinutes = 0;
        
        for (let i = 1; i <= 6; i++) {
            const progress = parseInt(localStorage.getItem(`sections/section${i}.html`) || 0);
            totalMinutes += (progress / 100) * 60; // Каждый раздел ≈ 60 минут
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        
        timeElement.textContent = `~${hours} ч ${minutes} мин`;
    }
}

// Экспорт прогресса
function exportProgress() {
    const progress = {};
    
    for (let i = 1; i <= 6; i++) {
        const key = `section${i}`;
        progress[key] = localStorage.getItem(`sections/section${i}.html`) || 0;
    }
    
    const dataStr = JSON.stringify(progress, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'progress.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
