/**
 * УЛЬТРА-ПРИЛИПАНИЕ через JavaScript
 * Блоки прилипают мгновенно и жёстко
 */

(function() {
    'use strict';

    // === НАСТРОЙКИ ===
    const SELECTOR = '.full-screen';      // Блоки для листания
    const DURATION = 300;                  // Скорость прокрутки (меньше = быстрее)
    const LOCK_TIME = 600;                  // Время блокировки после прокрутки (мс)
    const STRONG_MODE = false;               // Супер-сильный режим

    // === КОД ===
    let isLocked = false;
    let scrollTimeout;
    let sections = [];
    let currentIndex = 0;
    let lastScrollTime = 0;

    function updateSections() {
        sections = Array.from(document.querySelectorAll(SELECTOR));
        updateCurrentIndex();
    }

    function updateCurrentIndex() {
        const scrollPos = window.scrollY;
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i].getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            
            if (scrollPos >= absoluteTop - 10 && scrollPos < absoluteTop + rect.height - 10) {
                currentIndex = i;
                break;
            }
        }
    }

    function lockScrolling() {
        isLocked = true;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            isLocked = false;
        }, LOCK_TIME);
    }

    function scrollToSection(index) {
        if (index < 0 || index >= sections.length) return;
        if (isLocked) return;
        
        const now = Date.now();
        if (now - lastScrollTime < 300) return; // Анти-спам
        
        lastScrollTime = now;
        currentIndex = index;
        
        sections[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        if (STRONG_MODE) {
            lockScrolling();
        }
    }

    function forceScrollToCurrent() {
        if (sections.length === 0) return;
        
        const current = sections[currentIndex];
        if (!current) return;
        
        const rect = current.getBoundingClientRect();
        const isAtBlock = Math.abs(rect.top) < 50;
        
        if (!isAtBlock) {
            current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function handleWheel(e) {
        e.preventDefault();
        
        if (isLocked) return;
        
        updateCurrentIndex();
        
        const direction = e.deltaY > 0 ? 1 : -1;
        const targetIndex = currentIndex + direction;
        
        if (targetIndex >= 0 && targetIndex < sections.length) {
            scrollToSection(targetIndex);
        } else {
            // Если дошли до края, чуть-чуть пружиним
            if (STRONG_MODE) {
                document.body.style.transform = `translateY(${direction * -5}px)`;
                setTimeout(() => {
                    document.body.style.transform = '';
                }, 100);
            }
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            updateCurrentIndex();
            scrollToSection(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            updateCurrentIndex();
            scrollToSection(currentIndex - 1);
        }
    }

    function handleScroll() {
        if (isLocked) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (STRONG_MODE) {
                forceScrollToCurrent();
            }
        }, 150);
    }

    function blockNativeScroll(e) {
        if (e.type === 'wheel') {
            e.preventDefault();
            return false;
        }
    }

    function init() {
        updateSections();
        
        // Жёстко блокируем родной скролл
        window.addEventListener('wheel', blockNativeScroll, { passive: false });
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Клавиши
        window.addEventListener('keydown', handleKeyDown);
        
        // Контроль скролла
        window.addEventListener('scroll', handleScroll, { passive: false });
        
        // Обновляем секции при ресайзе
        window.addEventListener('resize', () => {
            updateSections();
        });
        
        // Стартовое выравнивание
        setTimeout(() => {
            forceScrollToCurrent();
        }, 100);
        
        console.log('🔥 Ультра-прилипание активировано');
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();