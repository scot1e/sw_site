// ===== ОБЩИЕ СКРИПТЫ ДЛЯ ВСЕХ СТРАНИЦ =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== УВЕДОМЛЕНИЕ ДЛЯ ПК-ПОЛЬЗОВАТЕЛЕЙ =====
    // Показываем только на ПК (шире 768px)
    if (window.innerWidth > 768) {
        
        // Проверяем, не закрывали ли уведомление в этой сессии
        if (!sessionStorage.getItem('pcHintShown')) {
            
            // Создаём элемент уведомления
            const pcHint = document.createElement('div');
            pcHint.className = 'pc-hint';
            pcHint.id = 'pcHint';
            pcHint.innerHTML = `
                <span class="pc-hint-icon">🖥️</span>
                <span class="pc-hint-text">Для лучшего восприятия сайта используйте полноэкранный режим браузера (F11)</span>
                <button class="pc-hint-close" id="closePcHint">✕</button>
            `;
            
            document.body.appendChild(pcHint);
            sessionStorage.setItem('pcHintShown', 'true');
            
            // Обработчик закрытия
            const closePcHint = document.getElementById('closePcHint');
            if (closePcHint) {
                closePcHint.addEventListener('click', function() {
                    const hintElement = document.getElementById('pcHint');
                    if (hintElement) {
                        hintElement.style.opacity = '0';
                        hintElement.style.transform = 'translateY(-20px)';
                        setTimeout(() => {
                            if (hintElement.parentNode) {
                                hintElement.remove();
                            }
                        }, 300);
                    }
                });
            }
            
            // Автоматическое скрытие через 7 секунд
            setTimeout(() => {
                const hintElement = document.getElementById('pcHint');
                if (hintElement) {
                    hintElement.style.opacity = '0';
                    hintElement.style.transform = 'translateY(-20px)';
                    hintElement.style.transition = 'opacity 0.5s, transform 0.5s';
                    setTimeout(() => {
                        if (hintElement.parentNode) {
                            hintElement.remove();
                        }
                    }, 500);
                }
            }, 7000);
        }
    }
});