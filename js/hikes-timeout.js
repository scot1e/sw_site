// js/hikes-timeout.js
(function() {
    // Таймер на 10 секунд
    let timeoutId = setTimeout(function() {
        console.log('⏰ Проверяем...');
        // Проверяем, есть ли хоть одно доступное видео
        checkIfAnyVideoAvailable();
    }, 10000);
    
    // Проверяем, есть ли видео которые должны загрузиться
    function checkIfAnyVideoAvailable() {
        const iframes = document.querySelectorAll('iframe[src*="youtube"]');
        const previews = document.querySelectorAll('.hikes-preview');
        
        console.log('📊 Статус:', {
            iframes: iframes.length,
            previews: previews.length,
            total: iframes.length + previews.length
        });
        
        // Если нет ни одного iframe (все видео недоступны)
        if (iframes.length === 0 && previews.length > 0) {
            console.log('ℹ️ Все видео недоступны для встраивания - это нормально');
            return; // Ничего не делаем
        }
        
        // Если iframe должны быть, но их нет
        if (iframes.length === 0) {
            console.log('❌ YouTube не загрузился');
            showVKFallback();
        }
    }
    
    // Если видео загрузилось - отменяем таймер
    function cancelTimeout() {
        clearTimeout(timeoutId);
        console.log('✅ YouTube загрузился, таймер отменён');
    }
    
    // Показываем заглушку с VK
    function showVKFallback() {
        const container = document.querySelector('.hikes-container');
        if (!container) return;
        
        // Скрываем обычный контент
        const center = document.querySelector('.hikes-center');
        const sidebar = document.querySelector('.hikes-sidebar');
        if (center) center.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        
        // Создаём заглушку
        const fallback = document.createElement('div');
        fallback.className = 'vk-fallback';
        fallback.innerHTML = `
            <div class="vk-fallback-content">
                <div class="vk-fallback-icon">😕</div>
                <h2 class="vk-fallback-title">Упс, видимо YouTube сегодня отдыхает</h2>
                <p class="vk-fallback-text">
                    Не получилось загрузить видео с YouTube.<br>
                    Но ты можешь посмотреть их в группе VK!
                </p>
                <div class="vk-fallback-buttons">
                    <a href="roadtonowhere.html" class="vk-fallback-button primary">ОБРАТНО</a>
                    <a href="https://vk.com/roadtonowheresw" target="_blank" class="vk-fallback-button secondary">СМОТРЕТЬ В VK</a>
                </div>
            </div>
        `;
        
        container.appendChild(fallback);
    }
    
    // Отслеживаем загрузку YouTube iframe
    function checkYouTubeLoaded() {
        const iframes = document.querySelectorAll('iframe[src*="youtube"]');
        if (iframes.length > 0) {
            // Если есть iframe - считаем что загрузилось
            cancelTimeout();
        }
    }
    
    // Проверяем каждые 500мс
    const checkInterval = setInterval(checkYouTubeLoaded, 500);
    
    // Если страница уже загружена с YouTube
    window.addEventListener('load', function() {
        checkYouTubeLoaded();
        // Даём ещё 2 секунды на проверку
        setTimeout(function() {
            clearInterval(checkInterval);
        }, 2000);
    });
})();