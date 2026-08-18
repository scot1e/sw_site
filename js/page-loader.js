// js/page-loader.js
(function() {
    const loader = document.getElementById('pageLoader');
    
    if (!loader) return;
    
    // Определяем, мобильное ли устройство
    const isMobile = window.innerWidth <= 768 || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    // Если мобилка - вообще не показываем загрузчик
    if (isMobile) {
        console.log('📱 Мобильное устройство - загрузчик отключён');
        loader.style.display = 'none';
        return;
    }
    
    console.log('💻 ПК версия - загрузчик активен');
    
    // Флаг, чтобы показывать загрузчик только один раз
    let loaderWasShown = false;
    
    // Показываем загрузчик сразу при старте (если страница ещё не загружена)
    if (document.readyState !== 'complete') {
        loader.classList.add('active');
        loaderWasShown = true;
        console.log('🔄 Загрузчик показан');
    }
    
    // Функция скрытия загрузчика
    function hideLoader() {
        if (loader.classList.contains('active')) {
            loader.classList.remove('active');
            document.body.style.overflow = '';
            console.log('✅ Загрузчик скрыт');
        }
    }
    
    // Когда страница полностью загрузилась
    window.addEventListener('load', function() {
        console.log('📄 Страница загружена');
        
        // Даём небольшую задержку на отрисовку
        setTimeout(function() {
            hideLoader();
        }, 300);
    });
    
    // Если страница уже была загружена (например, при переходе назад)
    if (document.readyState === 'complete') {
        console.log('🚀 Страница уже загружена');
        hideLoader();
    }
    
    // При клике на ссылку - показываем загрузчик (только для переходов на ПК)
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        
        if (link && 
            link.href && 
            link.href.startsWith(window.location.origin) &&
            !link.href.includes('#')) {
            
            console.log('🔗 Переход на:', link.href);
            
            // Показываем загрузчик при переходе
            loader.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Запоминаем, что показали загрузчик при переходе
            loaderWasShown = true;
        }
    });
    
    // Страховка - если загрузчик висит больше 10 секунд
    setTimeout(function() {
        if (loader.classList.contains('active')) {
            console.log('⚠️ Таймаут - принудительно скрываю');
            hideLoader();
        }
    }, 10000);
})();