// Ждем загрузку страницы
document.addEventListener('DOMContentLoaded', function() {
    // ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
    let infectionActive = false;
    let outbreakCount = 0;
    const MAX_OUTBREAKS = 3;
    let hyphae = [];          // активная грибница (ОСНОВНОЙ МАССИВ)
    let hyphaeBg = [];  
    let savedHyphae = []; // сюда сохраним эталонный рост
    let isFirstOutbreak = true;      // фоновая грибница
    const bootScreen = document.getElementById('bootScreen');
    const mainContent = document.getElementById('mainContent');
    const typingLine = document.getElementById('typingLine');
    const bootCommand = document.getElementById('bootCommand');
    

    // === ТЕСТОВЫЙ РЕЖИМ (убрать после проверки) ===
const TEST_MODE = true;
if (TEST_MODE) {
    // Переопределяем таймеры на секунды
    window.originalSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, ms) {
        if (ms === 1200000) ms = 2000;   // 20 минут → 2 секунды
        if (ms === 10000) ms = 1000;      // 10 секунд → 1 секунда
        if (ms === 3000) ms = 500;        // 3 секунды → 0.5 секунды
        return originalSetTimeout(fn, ms);
    };
    console.log('⚠ ТЕСТОВЫЙ РЕЖИМ ВКЛЮЧЕН — выбросы каждые 2 секунды');
}

    
    // --- 1. ЗАГРУЗОЧНЫЙ ЭКРАН ---
    // Эффект печатающегося текста
    const text = "> ОБНАРУЖЕНО ПОВРЕЖДЕНИЕ: МИЦЕЛИЙ ПРОНИК В АРХИВ.";
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            typingLine.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Запускаем печать через небольшую задержку
    setTimeout(typeWriter, 500);
    
    // Функция входа на сайт
    function enterSite() {
        if (bootScreen && mainContent) {
            bootScreen.style.opacity = '0';
            setTimeout(function() {
                bootScreen.style.display = 'none';
                mainContent.classList.add('visible');
            }, 1000);
        }
    }
    
    // Обработчик нажатия клавиши для выхода с загрузочного экрана
    document.addEventListener('keydown', function() {
        if (bootScreen.style.display !== 'none') {
            enterSite();
        }
    });
    
    // Клик по загрузочному экрану тоже работает
    if (bootScreen) {
        bootScreen.addEventListener('click', enterSite);
    }
    
    // --- 2. НАВИГАЦИЯ (ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ) ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    if (navItems.length > 0 && sections.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                
                // Убираем активный класс у всех
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Добавляем активный класс текущим
                this.classList.add('active');
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }
    
    const integritySpan = document.getElementById('integrity');
if (integritySpan) {
    let integrity = 84;
    setInterval(function() {
        integrity -= 0.1;
        
        // Убираем ограничение — теперь может упасть до 0
        if (integrity < 0) {
            integrity = 0; // Останавливаемся на нуле
        }
        
        integritySpan.textContent = integrity.toFixed(1) + '%';
    }, 5000);
}
    
    const timerSpan = document.getElementById('timer');
    if (timerSpan) {
        let seconds = 4*60*60 + 4*60 + 37; // 4:04:37
        setInterval(function() {
            seconds++;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            timerSpan.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // ========== 4. ТЕСТ НА ЗАРАЖЕНИЕ ==========
const testContainer = document.getElementById('testContainer');

if (testContainer) {
    console.log('Тест найден, инициализация...');
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const restartBtn = document.getElementById('restartTest');
    const testResult = document.getElementById('testResult');
    const resultPercentage = document.getElementById('resultPercentage');
    const resultMessage = document.getElementById('resultMessage');
    const resultGlitch = document.getElementById('resultGlitch');

    let currentQuestion = 1;
    const totalQuestions = 5;
    let answers = {};

    // Функция для сохранения ответа
    function saveAnswer(num) {
        const selected = document.querySelector(`input[name="q${num}"]:checked`);
        if (selected) {
            answers[num] = parseInt(selected.value);
            console.log(`Ответ на вопрос ${num} сохранён:`, answers[num]);
            return true;
        } else {
            console.log(`На вопрос ${num} ещё не ответили`);
            return false;
        }
    }

    // Функция для показа вопроса
    function showQuestion(num) {
        console.log('Показываем вопрос:', num);
        
        // Скрываем все вопросы
        document.querySelectorAll('.test-question').forEach(q => {
            q.style.display = 'none';
        });
        
        // Показываем нужный вопрос
        const questionToShow = document.querySelector(`.test-question[data-question="${num}"]`);
        if (questionToShow) {
            questionToShow.style.display = 'block';
        }

        // Управление кнопками
        if (prevBtn) {
            prevBtn.style.display = num === 1 ? 'none' : 'inline-block';
        }
        
        if (nextBtn) {
            nextBtn.style.display = num === totalQuestions ? 'none' : 'inline-block';
        }
        
        if (submitBtn) {
            submitBtn.style.display = num === totalQuestions ? 'inline-block' : 'none';
        }
    }

    // Функция подсчёта результата
    function calculateResult() {
        let total = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            total += answers[i] || 0;
        }
        console.log('Сумма баллов:', total);
        
        const maxPossible = 22;
        let percentage = Math.min(99, Math.round((total / maxPossible) * 100));
        if (percentage < 5) percentage = 5; // Минимум 5% для атмосферы
        return percentage;
    }

    // Функция показа результата
    function showResult(percentage) {
        if (testContainer) testContainer.style.display = 'none';
        if (testResult) {
            testResult.style.display = 'block';

            let currentPercent = 0;
            const interval = setInterval(() => {
                currentPercent += 1;
                if (resultPercentage) {
                    resultPercentage.textContent = currentPercent + '%';
                }
                
                if (currentPercent >= percentage) {
                    clearInterval(interval);

                    let message = '';
                    let glitch = '';

                    if (percentage < 20) {
                        message = 'Стадия: Здоров. Пока.';
                        glitch = 'Но они уже знают, что вы здесь. Не оборачивайтесь.';
                    } else if (percentage < 40) {
                        message = 'Стадия: Аносмик (ранняя). Вы теряете связь с реальностью.';
                        glitch = 'Вас мучает жажда? Вода больше не спасет.';
                    } else if (percentage < 60) {
                        message = 'Стадия: Дермадон. Кожа шелушится. Вы этого не замечаете?';
                        glitch = 'Попробуйте оторвать кусочек. Вам не больно.';
                    } else if (percentage < 80) {
                        message = 'Стадия: Фригор. Вам постоянно холодно.';
                        glitch = 'Вы ищете тепло. Вы рядом с кем-то сейчас?';
                    } else {
                        message = 'Стадия: Спорарий. Вы уже почти не двигаетесь.';
                        glitch = 'Споры выходят из вас. Они ищут нового носителя.';
                    }

                    if (resultMessage) resultMessage.textContent = message;
                    if (resultGlitch) resultGlitch.textContent = glitch;
                }
            }, 30);
        }
    }

    // --- Обработчики кнопок ---
    
    // Кнопка "ДАЛЕЕ"
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Нажата кнопка ДАЛЕЕ');
            
            // Сохраняем ответ на текущий вопрос
            saveAnswer(currentQuestion);
            
            // Переходим к следующему вопросу
            if (currentQuestion < totalQuestions) {
                currentQuestion++;
                showQuestion(currentQuestion);
            }
        });
    }

    // Кнопка "НАЗАД"
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Нажата кнопка НАЗАД');
            
            if (currentQuestion > 1) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        });
    }

    // Кнопка "ЗАВЕРШИТЬ"
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            console.log('Нажата кнопка ЗАВЕРШИТЬ');
            
            // Сохраняем ответ на последний вопрос
            saveAnswer(currentQuestion);
            
            // Считаем и показываем результат
            const percentage = calculateResult();
            showResult(percentage);
        });
    }

    // Кнопка "ПРОЙТИ СНОВА"
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            console.log('Нажат ПРОЙТИ СНОВА');
            
            // Сбрасываем всё
            answers = {};
            currentQuestion = 1;
            
            if (testContainer) testContainer.style.display = 'block';
            if (testResult) testResult.style.display = 'none';
            
            showQuestion(1);
            
            // Сбрасываем все радио-кнопки
            document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        });
    }

    // Показываем первый вопрос при старте
    showQuestion(1);
}
// =========== КОНЕЦ БЛОКА ТЕСТА ===========
// ========== СИСТЕМА ИМЕНИ С ГЛЮЧНЫМИ СООБЩЕНИЯМИ ==========
const nameInput = document.getElementById('userNameInput');
const submitNameBtn = document.getElementById('submitNameBtn');
const glitchMessage = document.getElementById('glitchMessage');

// Массив жутких сообщений (чем страшнее, тем лучше)
const glitchMessages = [
    "ИМЯ ПРИНЯТО. ДОБРО ПОЖАЛОВАТЬ, {name}. МЫ СЛЕДИМ ЗА ТОБОЙ.",
    "ТЫ УВЕРЕН, ЧТО ЭТО ТВОЁ ИМЯ, {name}? ОНО УЖЕ В АРХИВЕ.",
    "НОСИТЕЛЬ ИДЕНТИФИЦИРОВАН: {name}. НЕ ДВИГАЙСЯ.",
    "{name}... МЫ ДАВНО ТЕБЯ ЖДАЛИ.",
    "НОВЫЙ ОБРАЗЕЦ: {name}. ДОБАВЛЕН В КОЛЛЕКЦИЮ.",
    "ТЫ ДУМАЕШЬ, ЧТО ТЫ {name}? ОНИ ТОЖЕ ТАК ДУМАЛИ.",
    "СИГНАЛ ПРИНЯТ. {name}, ТЫ БОЛЬШЕ НЕ ОДИН.",
    "ИДЕНТИФИКАЦИЯ: {name}. СТАТУС: ОБНАРУЖЕН.",
    "{name}, ТВОЁ ИМЯ УЖЕ ЗНАЧИТСЯ В СПИСКАХ.",
    "АРХИВ ПОПОЛНЕН. {name}, ТЕПЕРЬ ТЫ ЧАСТЬ НАС."
];

function showGlitchMessage(userName) {
    console.log('Показываем сообщение для:', userName);
    
    if (!glitchMessage) {
        console.error('Блок glitchMessage не найден!');
        return;
    }
    
    // Массив сообщений с разной степенью "красноты"
    const messages = [
        { 
            text: "> СИГНАЛ ПРИВЯЗАН. {name} ТЕПЕРЬ ЧАСТЬ СИСТЕМЫ",
            importance: "normal"
        },
        { 
            text: "> {name} ДОБАВЛЕН В АРХИВ. СТАТУС: <span class='warning-word'>ПОД НАБЛЮДЕНИЕМ</span>",
            importance: "warning"
        },
        { 
            text: "> ИДЕНТИФИКАЦИЯ: {name}. <span class='warning-word'>НОСИТЕЛЬ ОБНАРУЖЕН</span>",
            importance: "warning"
        },
        { 
            text: "> {name}... <span class='critical'>МЫ ВАС ВИДИМ</span>",
            importance: "critical"
        },
        { 
            text: "> БИОМАТЕРИАЛ ПРИНЯТ. {name} - <span class='warning-word'>ОБРАЗЕЦ #</span>" + Math.floor(Math.random() * 1000),
            importance: "normal"
        },
        { 
            text: "> {name}, ВАШ СИГНАЛ ПРИНЯТ. <span class='warning-word'>НЕ ПЕРЕМЕЩАЙТЕСЬ</span>",
            importance: "warning"
        },
        { 
            text: "> НОВАЯ ЗАПИСЬ: {name}. <span class='critical'>АРХИВ АКТИВИРОВАН</span>",
            importance: "critical"
        },
        { 
            text: "> {name} - <span class='warning-word'>НОСИТЕЛЬ</span>. СТАТУС: АКТИВЕН",
            importance: "warning"
        }
    ];
    
    // Выбираем случайное сообщение
    const randomIndex = Math.floor(Math.random() * messages.length);
    const selected = messages[randomIndex];
    let message = selected.text.replace('{name}', `<strong>${userName}</strong>`);
    
    // Очищаем старые классы
    glitchMessage.className = 'glitch-message';
    
    // Добавляем классы в зависимости от важности
    if (selected.importance === 'warning') {
        glitchMessage.classList.add('important');
        // Иногда добавляем красную точку
        if (Math.random() > 0.5) {
            glitchMessage.classList.add('red-dot');
        }
    } else if (selected.importance === 'critical') {
        glitchMessage.classList.add('important');
        glitchMessage.classList.add('red-dot');
    }
    
    // Иногда добавляем глитч-символ (редко)
    if (Math.random() < 0.15) {
        const glitchSymbols = ['⏋', '⏌', '⎾', '⏊', '░', '▒', '▓'];
        const symbol = glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
        message += ` <span class='warning-word'>${symbol}</span>`;
    }
    
    glitchMessage.innerHTML = message;
    glitchMessage.style.display = 'block';
    
    // Очень редкий микро-глитч (3% chance)
    if (Math.random() < 0.03) {
        setTimeout(() => {
            glitchMessage.classList.add('glitch-effect');
            setTimeout(() => {
                glitchMessage.classList.remove('glitch-effect');
            }, 200);
        }, 100);
    }
    
    localStorage.setItem('userName', userName);
}

// Функция обработки ввода имени
function handleNameSubmit() {
    if (nameInput) {
        const inputValue = nameInput.value.trim();
        if (inputValue !== '') {
            showGlitchMessage(inputValue);
            
            // Очищаем поле после ввода (опционально)
            // nameInput.value = '';
        } else {
            // Если имя пустое - показываем предупреждение
            if (glitchMessage) {
                glitchMessage.textContent = '[ ОШИБКА: ИМЯ НЕ МОЖЕТ БЫТЬ ПУСТЫМ ]';
                glitchMessage.style.display = 'block';
                glitchMessage.style.borderColor = '#ff0000';
                
                // Исчезает через 3 секунды
                setTimeout(() => {
                    glitchMessage.style.display = 'none';
                }, 5000);
            }
        }
    }
}

// Обработчик кнопки "ПРИНЯТЬ"
if (submitNameBtn) {
    submitNameBtn.addEventListener('click', handleNameSubmit);
}

// Обработчик нажатия Enter в поле ввода
if (nameInput) {
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNameSubmit();
        }
    });
}

// Проверяем, есть ли уже сохранённое имя
const savedName = localStorage.getItem('userName');
if (savedName && nameInput) {
    nameInput.value = savedName;
    nameInput.placeholder = savedName;
    
    // Показываем приветственное сообщение при загрузке (опционально)
    setTimeout(() => {
        if (glitchMessage) {
            glitchMessage.textContent = `С ВОЗВРАЩЕНИЕМ, ${savedName}. АРХИВ НЕ ИЗМЕНИЛСЯ.`;
            glitchMessage.style.display = 'block';
            
            // Исчезает через 4 секунды
            setTimeout(() => {
                glitchMessage.style.display = 'none';
            }, 4000);
        }
    }, 2000);
}
// ========== КОНЕЦ СИСТЕМЫ ИМЕНИ ==========


// ===== УПРАВЛЕНИЕ АКТИВНОЙ ГРИБНИЦЕЙ =====
  // флаг: рисовать или нет




setTimeout(() => {
    showDiscaimer();
}, 180000);

setTimeout(() => {
    window.startTime = Date.now();
    infectionActive = true;
    document.getElementById('cleanseButton').classList.add('outbreak-active');
    outbreakCount = 1;
    console.log('Выброс 1 из 3');
}, 210000);


function showDiscaimer() {
    const frame = document.createElement('div');
    frame.className = 'infection-frame';
    frame.innerHTML = `
        <div class="title">⚠ ВНИМАНИЕ ⚠</div>
        <div class="content">
            > ЧЕРЕЗ 10 СЕКУНД НАЧНЁТСЯ ВЫБРОС.<br>
            > ГРИБНИЦА АКТИВИРУЕТСЯ.<br>
            > СПОРЫ ЗАПОЛНЯТ ЭКРАН.<br>
            > РЕКОМЕНДУЕТСЯ ПОДГОТОВИТЬСЯ.<br>
            > ОЧИЩЕНИЕ БУДЕТ ДОСТУПНО В РАЗДЕЛЕ «ПРАВИЛА».<br>
        </div>
        <div class="warning">НАЖМИТЕ ЛЮБУЮ КЛАВИШУ, ЧТОБЫ ЗАКРЫТЬ</div>
    `;
    document.body.appendChild(frame);

    function closeFrame() {
        frame.remove();
        document.removeEventListener('keydown', closeFrame);
    }

    document.addEventListener('keydown', closeFrame);
}


// ===== ГРИБНИЦА ТОЛЬКО С ЛЕВОГО И ПРАВОГО КРАЯ =====
const canvas = document.getElementById('myceliumCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const MAX_HYPHAE = 350;
    const GROWTH_TIME = 180000; // 25 минут
    window.startTime = Date.now();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const colors = [
        'rgba(30, 60, 25, 0.4)',
        'rgba(45, 75, 35, 0.35)',
        'rgba(35, 65, 30, 0.4)',
        'rgba(55, 85, 40, 0.3)',
        'rgba(25, 55, 20, 0.45)'
    ];
    
    function createHypha() {
        const edge = Math.floor(Math.random() * 2); // ТОЛЬКО лево/право
        let x, y, angle;
        
        switch(edge) {
            case 0: // левый край
                x = 2 + Math.random() * 40;
                y = Math.random() * canvas.height;
                angle = (Math.random() * 100 - 50) * Math.PI / 180;
                break;
            case 1: // правый край
                x = canvas.width - 2 - Math.random() * 40;
                y = Math.random() * canvas.height;
                angle = Math.PI + (Math.random() * 100 - 50) * Math.PI / 180;
                break;
        }
        
        return {
            points: [{x, y}],
            angle: angle,
            length: 0,
            maxLength: 80 + Math.random() * 150,
            thickness: 1.5 + Math.random() * 3,
            branchChance: 0.04,
            color: colors[Math.floor(Math.random() * colors.length)],
            nodes: []
        };
    }
    
    function growHypha(h, progress) {
        if (h.length >= h.maxLength) return;
        
        const last = h.points[h.points.length - 1];
        
        if (progress > 0.5) {
            let closestDist = 100;
            let closestAngle = null;
            
            hyphae.forEach(other => {
                if (other === h) return;
                const otherLast = other.points[other.points.length - 1];
                const dx = otherLast.x - last.x;
                const dy = otherLast.y - last.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < closestDist && dist > 20) {
                    closestDist = dist;
                    closestAngle = Math.atan2(dy, dx);
                }
            });
            
            if (closestAngle !== null) {
                h.angle += (closestAngle - h.angle) * 0.02;
            } else {
                const dx = centerX - last.x;
                const dy = centerY - last.y;
                const targetAngle = Math.atan2(dy, dx);
                h.angle += (targetAngle - h.angle) * 0.01;
            }
        }
        
        h.angle += (Math.random() - 0.5) * 0.4;
        
        const step = 1 + Math.random() * 3;
        const newX = last.x + Math.cos(h.angle) * step;
        const newY = last.y + Math.sin(h.angle) * step;

        // Проверка на выход за границы
        if (newX < 0 || newX > canvas.width || newY < 0 || newY > canvas.height) {
            h.length = h.maxLength; // останавливаем рост
            return;
        }
        
        h.points.push({x: newX, y: newY});
        h.length += step;
        
        if (Math.random() < 0.03) {
            h.nodes.push({
                x: newX,
                y: newY,
                size: h.thickness * (1.5 + Math.random() * 3)
            });
        }
        
        if (Math.random() < h.branchChance * (progress * 1.5) && hyphae.length < MAX_HYPHAE) {
            hyphae.push({
                points: [{x: newX, y: newY}],
                angle: h.angle + (Math.random() - 0.5) * 1.5,
                length: 0,
                maxLength: h.maxLength * (0.5 + Math.random() * 0.4),
                thickness: h.thickness * 0.7,
                branchChance: 0.06,
                color: h.color,
                nodes: []
            });
        }
    }
    
    function drawHyphae() {
        if (!infectionActive) {
        requestAnimationFrame(drawHyphae);
        return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const elapsed = Date.now() - window.startTime;
        const progress = Math.min(elapsed / GROWTH_TIME, 1);
        
        const targetCount = Math.floor(progress * MAX_HYPHAE);
        while (hyphae.length < targetCount) {
            for (let i = 0; i < 3; i++) {
                if (hyphae.length < targetCount) {
                    hyphae.push(createHypha());
                }
            }
        }
        
        hyphae.forEach(h => growHypha(h, progress));
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        hyphae.forEach(h => {
            if (h.points.length < 2) return;
            
            ctx.beginPath();
            ctx.strokeStyle = h.color;
            ctx.lineWidth = h.thickness;
            
            ctx.moveTo(h.points[0].x, h.points[0].y);
            for (let i = 1; i < h.points.length; i++) {
                ctx.lineTo(h.points[i].x, h.points[i].y);
            }
            ctx.stroke();
            
            h.nodes.forEach(node => {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(30, 70, 25, 0.95)';
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        
        if (progress > 0.9) {
            ctx.fillStyle = `rgba(25, 55, 20, ${(progress - 0.9) * 0.8})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Сохраняем эталонный рост после полного завершения (100%)
        if (progress >= 1 && isFirstOutbreak) {
            isFirstOutbreak = false;
            savedHyphae = JSON.parse(JSON.stringify(hyphae));
            console.log('Эталонный рост сохранён, нитей:', savedHyphae.length);
        }
        
        requestAnimationFrame(drawHyphae);
    }
    
    drawHyphae();
}



//фон грибница 

// ===== ФОНОВАЯ ГРИБНИЦА (ХОРРОР-ВЕРСИЯ) =====
const canvasBg = document.getElementById('myceliumCanvasBackground');
if (canvasBg) {
    const ctxBg = canvasBg.getContext('2d');
    
    function resizeCanvasBg() {
        canvasBg.width = window.innerWidth;
        canvasBg.height = window.innerHeight;
    }
    resizeCanvasBg();
    window.addEventListener('resize', resizeCanvasBg);
    const MAX_HYPHAE_BG = 350;
    const GROWTH_TIME_BG = 300000; // 5 минут
    const startTimeBg = Date.now();
    
    const centerX = canvasBg.width / 2;
    const centerY = canvasBg.height / 2;
    
    // Цвета — тусклые, но с оттенками
    const colorsBg = [
        'rgba(30, 50, 20, 0.25)',  // тёмный
        'rgba(40, 60, 25, 0.22)',  // болотный
        'rgba(25, 45, 15, 0.28)',  // почти чёрный
        'rgba(35, 55, 20, 0.2)',   // серо-зелёный
        'rgba(45, 65, 30, 0.18)',  // светлее, но тускло
        'rgba(20, 40, 10, 0.3)'    // самый тёмный
    ];
    
    function createHyphaBg() {
        const edge = Math.floor(Math.random() * 2);
        let x, y, angle;
        
        switch(edge) {
            case 0:
                x = 2 + Math.random() * 40;
                y = Math.random() * canvasBg.height;
                angle = (Math.random() * 100 - 50) * Math.PI / 180;
                break;
            case 1:
                x = canvasBg.width - 2 - Math.random() * 40;
                y = Math.random() * canvasBg.height;
                angle = Math.PI + (Math.random() * 100 - 50) * Math.PI / 180;
                break;
        }
        
        return {
            points: [{x, y}],
            angle: angle,
            length: 0,
            maxLength: 120 + Math.random() * 250,
            thickness: 1 + Math.random() * 2.5,
            branchChance: 0.06,
            color: colorsBg[Math.floor(Math.random() * colorsBg.length)],
            nodes: [],
            glowIntensity: 3 + Math.random() * 5 // для свечения
        };
    }
    
    function growHyphaBg(h) {
        if (h.length >= h.maxLength) return;
        
        const last = h.points[h.points.length - 1];
        
        const dx = centerX - last.x;
        const dy = centerY - last.y;
        const distToCenter = Math.sqrt(dx*dx + dy*dy);
        const centerPull = Math.min(0.04, 40 / distToCenter);
        const targetAngle = Math.atan2(dy, dx);
        h.angle += (targetAngle - h.angle) * centerPull;
        
        h.angle += (Math.random() - 0.5) * 0.25;
        
        const step = 1 + Math.random() * 2.5;
        const newX = last.x + Math.cos(h.angle) * step;
        const newY = last.y + Math.sin(h.angle) * step;
        
        h.points.push({x: newX, y: newY});
        h.length += step;
        
        // Узлы — редко, но ярче
        if (Math.random() < 0.015) {
            h.nodes.push({
                x: newX,
                y: newY,
                size: h.thickness * (2 + Math.random() * 3),
                bright: Math.random() > 0.7 // 30% узлов ярче
            });
        }
        
        if (Math.random() < h.branchChance && hyphaeBg.length < MAX_HYPHAE_BG) {
            hyphaeBg.push({
                points: [{x: newX, y: newY}],
                angle: h.angle + (Math.random() - 0.5) * 1.3,
                length: 0,
                maxLength: h.maxLength * 0.6,
                thickness: h.thickness * 0.7,
                branchChance: 0.04,
                color: h.color,
                nodes: [],
                glowIntensity: h.glowIntensity * 0.8
            });
        }
    }
    
    function drawHyphaeBg() {
        ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
        
        const elapsed = Date.now() - startTimeBg;
        const progress = Math.min(elapsed / GROWTH_TIME_BG, 1);
        
        const targetCount = Math.floor(progress * MAX_HYPHAE_BG);
        while (hyphaeBg.length < targetCount) {
            for (let i = 0; i < 2; i++) {
                if (hyphaeBg.length < targetCount) {
                    hyphaeBg.push(createHyphaBg());
                }
            }
        }
        
        hyphaeBg.forEach(growHyphaBg);
        
        ctxBg.lineCap = 'round';
        ctxBg.lineJoin = 'round';
        
        hyphaeBg.forEach(h => {
            if (h.points.length < 2) return;
            
            // СВЕЧЕНИЕ
            ctxBg.shadowColor = '#2e5a3a';
            ctxBg.shadowBlur = h.glowIntensity || 4;
            
            ctxBg.beginPath();
            ctxBg.strokeStyle = h.color;
            ctxBg.lineWidth = h.thickness;
            
            ctxBg.moveTo(h.points[0].x, h.points[0].y);
            for (let i = 1; i < h.points.length; i++) {
                ctxBg.lineTo(h.points[i].x, h.points[i].y);
            }
            ctxBg.stroke();
            
            // Узлы
            h.nodes.forEach(node => {
                ctxBg.shadowBlur = node.bright ? 12 : 6;
                ctxBg.fillStyle = node.bright 
                    ? 'rgba(70, 120, 50, 0.6)' 
                    : 'rgba(30, 60, 20, 0.4)';
                ctxBg.beginPath();
                ctxBg.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctxBg.fill();
            });
        });
        
        // Сбрасываем свечение
        ctxBg.shadowBlur = 0;
        
        requestAnimationFrame(drawHyphaeBg);
    }
    
    drawHyphaeBg();
}

// ===== СТРАШНЫЙ ПОПАП =====
function showWarningMessage() {
    const frame = document.createElement('div');
    frame.className = 'warning-frame';
    frame.innerHTML = `
        <div class="warning-content">
            > НЕ СЕЙЧАС.<br>
            > МИЦЕЛИЙ СЛЕДИТ.<br>
            > ОЧИЩЕНИЕ ДОСТУПНО ТОЛЬКО ВО ВРЕМЯ ВЫБРОСА.<br>
        </div>
    `;
    document.body.appendChild(frame);

    setTimeout(() => {
        frame.remove();
    }, 5000);
}


// ===== ФИНАЛЬНАЯ РАМКА ПОСЛЕ ОЧИЩЕНИЯ =====
function showThanksFrame() {
    const cleanedCount = outbreakCount;
    const remaining = MAX_OUTBREAKS - outbreakCount;

    const frame = document.createElement('div');
    frame.className = 'infection-frame';
    frame.innerHTML = `
        <div class="title">ОЧИЩЕНИЕ ЗАВЕРШЕНО</div>
        <div class="content">
            > Грибница отступила.<br>
            > Они не смогли добраться до вас.<br>
            > Но споры всё ещё в воздухе.<br>
            > Следующий выброс может произойти в любой момент.<br><br>
            > Очищение #${cleanedCount} завершено.<br>
            > Осталось ${remaining} выброса до раскрытия архива.
        </div>
        <div class="warning">МИЦЕЛИЙ ЗАПОМНИЛ ТЕБЯ</div>
        <div class="close-hint" onclick="this.parentElement.remove()">[ НАЖМИТЕ, ЧТОБЫ ЗАКРЫТЬ ]</div>
    `;
    document.body.appendChild(frame);
}


function resetOutbreakTimer() {
    if (outbreakCount >= MAX_OUTBREAKS) {
        console.log('Все выбросы завершены');
        const journalTab = document.getElementById('journalTab');
        const journalSection = document.getElementById('journal');
        if (journalTab) journalTab.style.display = 'block';
        if (journalSection) journalSection.style.display = 'block';
        return;
    }

    setTimeout(() => {
        // ПОЛНЫЙ СБРОС ГРИБНИЦЫ ПЕРЕД НОВЫМ ВЫБРОСОМ
        hyphae = [];                         // очищаем массив нитей
        window.startTime = Date.now();       // сбрасываем время роста
        infectionActive = true;              // активируем выброс

        const canvas = document.getElementById('myceliumCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // чистим канвас
        }

        document.getElementById('cleanseButton').classList.add('outbreak-active');
        outbreakCount++;
        console.log(`Выброс ${outbreakCount} из ${MAX_OUTBREAKS} запущен, время сброшено`);
    }, 180000); // 3 минуты между выбросами
}


// === ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА ПОСЛЕ ОЧИЩЕНИЯ ===
function revealRulesAfterCleanse() {
    const rule5 = document.getElementById('rule5');
    const rule6 = document.getElementById('rule6');
    const rule7 = document.getElementById('rule7');

    if (rule5 && outbreakCount >= 1) rule5.style.display = 'list-item';
    if (rule6 && outbreakCount >= 2) rule6.style.display = 'list-item';
    if (rule7 && outbreakCount >= 3) rule7.style.display = 'list-item';

    // Убираем значок "Доступ ограничен", когда появилось первое правило
    const badge = document.getElementById('classifiedBadge');
    if (badge && outbreakCount >= 1) badge.style.display = 'none';
}


// ===== УЛУЧШЕННЫЙ РАСПАД (ГНИЕНИЕ) =====
function particleEffect(canvas, ctx, callback) {
    let particles = [];

    // Цвета распада
    const decayColors = [
        'rgba(60, 40, 20, 0.9)',  // тёмно-коричневый
        'rgba(80, 60, 30, 0.8)',  // ржавый
        'rgba(100, 70, 40, 0.7)', // землистый
        'rgba(120, 30, 20, 0.8)', // ржаво-красный
        'rgba(40, 50, 20, 0.9)'   // болотный
    ];

    // Создаём частицы из каждой точки
    hyphae.forEach(h => {
        h.points.forEach(p => {
            for (let i = 0; i < 2; i++) { // больше частиц
                const color = decayColors[Math.floor(Math.random() * decayColors.length)];
                particles.push({
                    x: p.x + (Math.random() - 0.5) * 20,
                    y: p.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2 + 1, // лёгкое падение вниз
                    size: 2 + Math.random() * 8,
                    life: 1.0,
                    color: color,
                    rotation: Math.random() * Math.PI * 2
                });
            }
        });
    });

    const steps = 50;
    let step = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Добавляем дымку (чёрный полупрозрачный слой)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03; // гравитация
            p.life -= 0.015;
            p.size *= 0.99;

            // Иногда красная вспышка
            let particleColor = p.color;
            if (Math.random() < 0.01 && step > 10) {
                particleColor = 'rgba(180, 40, 20, 0.9)'; // красная искра
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${p.life * 0.8})`);
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });

        step++;
        if (step < steps) {
            requestAnimationFrame(animate);
        } else {
            let fade = 0.3;
            function fadeOutMask() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = `rgba(30, 20, 10, ${fade})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                fade -= 0.05;
                if (fade > 0) {
                    requestAnimationFrame(fadeOutMask);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    hyphae = [];
                    callback();
                }
            }
            fadeOutMask();
        }
    }

    animate();
}

// ===== ОЧИЩЕНИЕ (ТОЛЬКО PARTICLE EFFECT) =====
function initCleanseButton() {
    const btn = document.getElementById('cleanseButton');
    if (!btn) {
        setTimeout(initCleanseButton, 500);
        return;
    }

    btn.onclick = function() {
        if (infectionActive) {
            infectionActive = false;

            const canvas = document.getElementById('myceliumCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            particleEffect(canvas, ctx, () => {
                btn.classList.remove('outbreak-active');
                showThanksFrame();
                revealRulesAfterCleanse();

                // Показываем вкладку после 3-го очищения
                if (outbreakCount === MAX_OUTBREAKS) {
                    const journalTab = document.getElementById('journalTab');
                    const journalSection = document.getElementById('journal');
                    if (journalTab) journalTab.style.display = 'block';
                    if (journalSection) journalSection.style.display = 'block';
                }

                resetOutbreakTimer();
            });

        } else {
            showWarningMessage();
        }
    };
}

initCleanseButton();


// ===== ЧАТ С ВЫЖИВШИМ (ПОЛНАЯ ВЕРСИЯ) =====
(function() {
    const chatModal = document.getElementById('chatModal');
    const chatCallBtn = document.getElementById('chatCallBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatBody = document.getElementById('chatBody');
    const optionsDiv = document.getElementById('chatOptions');

    let messages = [];
    let currentDialogNode = 'start';

    const dialogTree = {
        start: {
            text: "Ты меня слышишь?.. Я так долго искал живого...",
            options: [
                { text: "Да. Кто ты?", next: "who" },
                { text: "Мне страшно...", next: "fear" }
            ]
        },
        who: {
            text: "Я выживший. Раньше был оператором в этом архиве. А теперь... я просто голос в системе.",
            options: [
                { text: "Что случилось?", next: "whatHappened" },
                { text: "Как мне спастись?", next: "howToSave" }
            ]
        },
        fear: {
            text: "Страх — это нормально. Споры питаются страхом. Но ты можешь бороться.",
            options: [
                { text: "Как бороться?", next: "howToSave" }
            ]
        },
        whatHappened: {
            text: "Мицелий проник в серверную. Мы пытались чистить, но... я не успел. Теперь они в каждом файле.",
            options: [
                { text: "Как мне спастись?", next: "howToSave" }
            ]
        },
        howToSave: {
            text: "В разделе «Правила» есть кнопка очищения. Используй её во время выбросов. Не дай грибнице разрастись.",
            options: [
                { text: "Спасибо. Я попробую.", next: "thanks" }
            ]
        },
        thanks: {
            text: "Не благодари. Просто не исчезай. Мне нужно знать, что я не один.",
            options: [
                { text: "Я останусь.", next: "start" }
            ]
        }
    };

    function renderMessages() {
        if (!chatBody) return;
        chatBody.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.sender === 'user' ? 'msg-user' : 'msg-survivor';
            div.textContent = msg.text;
            chatBody.appendChild(div);
        });
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function renderOptions(nodeId) {
        if (!optionsDiv) return;
        optionsDiv.innerHTML = '';
        const node = dialogTree[nodeId];
        if (node && node.options) {
            node.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.textContent = opt.text;
                btn.className = 'chat-option-btn';
                btn.onclick = () => {
                    messages.push({ sender: 'user', text: opt.text });
                    const nextNode = dialogTree[opt.next];
                    if (nextNode) {
                        messages.push({ sender: 'survivor', text: nextNode.text });
                        currentDialogNode = opt.next;
                    } else {
                        messages.push({ sender: 'survivor', text: "Связь прервана... Они мешают..." });
                    }
                    renderMessages();
                    renderOptions(currentDialogNode);
                    saveChat();
                };
                optionsDiv.appendChild(btn);
            });
        }
    }

    function saveChat() {
        localStorage.setItem('survivor_messages', JSON.stringify(messages));
        localStorage.setItem('survivor_node', currentDialogNode);
    }

    function loadChat() {
        const savedMessages = localStorage.getItem('survivor_messages');
        const savedNode = localStorage.getItem('survivor_node');
        if (savedMessages && savedNode) {
            messages = JSON.parse(savedMessages);
            currentDialogNode = savedNode;
            renderMessages();
            renderOptions(currentDialogNode);
        } else {
            const startNode = dialogTree.start;
            messages = [{ sender: 'survivor', text: startNode.text }];
            currentDialogNode = 'start';
            renderMessages();
            renderOptions('start');
            saveChat();
        }
    }

    if (chatCallBtn && chatModal && chatCloseBtn) {
        chatCallBtn.onclick = () => {
            chatModal.style.display = 'flex';
            loadChat();
        };
        chatCloseBtn.onclick = () => {
            chatModal.style.display = 'none';
        };
    }
})();



// Открываем новости при переходе по якорю #news
if (window.location.hash === '#news') {
    const dossierTab = document.querySelector('.nav-item[data-section="dossier"]');
    const dossierSection = document.getElementById('dossier');
    
    if (dossierTab && dossierSection) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        dossierTab.classList.add('active');
        dossierSection.classList.add('active');
        
        // Прокручиваем к блоку новостей
        setTimeout(() => {
            const newsBlock = document.querySelector('.news-section');
            if (newsBlock) newsBlock.scrollIntoView({ behavior: 'smooth' });
        }, 200);
    }
}


// Раскрытие новостей – простой и надёжный вариант
document.querySelectorAll('.news-link-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Ищем блок с полным текстом ПЕРЕД кнопкой
        const fullText = this.previousElementSibling;

        if (fullText && fullText.classList.contains('news-full-text-hidden')) {
            fullText.classList.toggle('show');
            this.textContent = fullText.classList.contains('show') ? '[ СВЕРНУТЬ ]' : '[ ЧИТАТЬ ДАЛЕЕ ]';
        } else {
            console.log('Блок с текстом не найден');
        }
    });
});

// === РАСКРЫТИЕ КАРТИНОК В ПОЛНЫЙ РАЗМЕР ===
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.querySelector('.close-modal');

// Добавляем обработчик на все картинки с классом archive-photo
document.querySelectorAll('.archive-photo').forEach(img => {
    img.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.style.display = 'block';
        modalImg.src = this.src;
    });
});

// Закрытие по крестику
if (closeModal) {
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
}

// Закрытие по клику на фон (вне картинки)
modal.onclick = function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};


});