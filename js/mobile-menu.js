document.addEventListener('DOMContentLoaded', function() {
    const burgerIcon = document.querySelector('.burger-icon');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (burgerIcon && mobileNav) {
        burgerIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('open');
            mobileNav.classList.toggle('open');
            
            if (mobileNav.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerIcon.classList.remove('open');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!burgerIcon.contains(event.target) && !mobileNav.contains(event.target)) {
                burgerIcon.classList.remove('open');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
        
        mobileNav.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // ===== ПОДСКАЗКА ДЛЯ МОБИЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ =====
    if (window.innerWidth <= 768) {
        // Используем sessionStorage - подсказка показывается один раз за сессию
        if (!sessionStorage.getItem('hintShown')) {
            // Создаем элемент подсказки с новым текстом
            const hint = document.createElement('div');
            hint.className = 'mobile-hint';
            hint.id = 'mobileHint';
            hint.innerHTML = `
                <span class="hint-icon">💻</span>
                <span class="hint-text">Контент доступен не в полной мере, полная версия сайта доступна с ПК</span>
                <button class="hint-close" id="closeHint">✕</button>
            `;
            
            document.body.appendChild(hint);
            sessionStorage.setItem('hintShown', 'true');
            
            // Обработчик закрытия
            const closeHint = document.getElementById('closeHint');
            if (closeHint) {
                closeHint.addEventListener('click', function() {
                    const hintElement = document.getElementById('mobileHint');
                    if (hintElement) {
                        hintElement.remove();
                    }
                });
            }
            
            // Автоматическое скрытие через 8 секунд
            setTimeout(() => {
                const hintElement = document.getElementById('mobileHint');
                if (hintElement) {
                    hintElement.style.opacity = '0';
                    hintElement.style.transform = 'translateX(20px)';
                    hintElement.style.transition = 'opacity 0.5s, transform 0.5s';
                    setTimeout(() => {
                        if (hintElement.parentNode) {
                            hintElement.remove();
                        }
                    }, 500);
                }
            }, 8000);
        }
    }
});