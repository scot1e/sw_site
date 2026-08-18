/**
 * Browser Detector
 * Определяет браузер, версию, ОС и добавляет классы на body
 * Версия 1.0
 */

(function() {
    'use strict';

    // Функция для нормализации строк (убираем лишнее)
    function normalizeVersion(version) {
        if (!version) return 'unknown';
        // Оставляем только основные цифры (например 120.0.0.0 -> 120)
        const match = version.match(/^(\d+)/);
        return match ? match[1] : version;
    }

    // Основная функция определения
    function detectBrowser() {
        const ua = navigator.userAgent;
        const platform = navigator.platform || '';
        const vendor = navigator.vendor || '';
        
        // Результат
        const result = {
            browser: 'unknown',
            version: 'unknown',
            engine: 'unknown',
            os: 'unknown',
            osVersion: 'unknown',
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            isWebView: false,
            isZen: false
        };

        // ===== ОПРЕДЕЛЕНИЕ БРАУЗЕРА =====

        // 1. Firefox
        if (ua.includes('Firefox') && !ua.includes('Seamonkey')) {
            result.browser = 'firefox';
            result.version = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'unknown';
            result.engine = 'gecko';
        }
        
        // 2. Edge (Chromium)
        else if (ua.includes('Edg/')) {
            result.browser = 'edge';
            result.version = ua.match(/Edg\/([\d.]+)/)?.[1] || 'unknown';
            result.engine = 'blink';
        }
        
        // 3. Opera / Opera GX
        else if (ua.includes('OPR') || ua.includes('Opera')) {
            result.browser = 'opera';
            result.version = ua.match(/(OPR|Opera)\/([\d.]+)/)?.[2] || 'unknown';
            result.engine = 'blink';
        }
        
        // 4. Chrome
        else if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
            result.browser = 'chrome';
            result.version = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'unknown';
            result.engine = 'blink';
        }
        
        // 5. Safari
        else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            result.browser = 'safari';
            result.version = ua.match(/Version\/([\d.]+)/)?.[1] || 'unknown';
            result.engine = 'webkit';
        }
        
        // 6. Zen Browser (особый случай)
        if (ua.includes('Zen') || ua.includes('ZenBrowser')) {
            result.browser = 'zen';
            result.isZen = true;
            // Если Zen не даёт версию, пробуем взять из Chrome
            if (result.version === 'unknown') {
                const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
                if (chromeMatch) result.version = chromeMatch[1];
            }
        }
        
        // 7. Internet Explorer
        else if (ua.includes('MSIE') || ua.includes('Trident')) {
            result.browser = 'ie';
            result.version = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || 'unknown';
            result.engine = 'trident';
        }

        // ===== ОПРЕДЕЛЕНИЕ ОС =====

        // Windows
        if (ua.includes('Windows')) {
            result.os = 'windows';
            if (ua.includes('Windows NT 10.0')) result.osVersion = '10';
            else if (ua.includes('Windows NT 6.3')) result.osVersion = '8.1';
            else if (ua.includes('Windows NT 6.2')) result.osVersion = '8';
            else if (ua.includes('Windows NT 6.1')) result.osVersion = '7';
        }
        
        // macOS
        else if (ua.includes('Mac OS X')) {
            result.os = 'macos';
            const match = ua.match(/Mac OS X ([\d_]+)/);
            if (match) result.osVersion = match[1].replace(/_/g, '.');
        }
        
        // iOS
        else if (ua.includes('iPhone') || ua.includes('iPad')) {
            result.os = 'ios';
            result.isMobile = true;
            result.isDesktop = false;
            const match = ua.match(/OS ([\d_]+)/);
            if (match) result.osVersion = match[1].replace(/_/g, '.');
            if (ua.includes('iPad')) result.isTablet = true;
        }
        
        // Android
        else if (ua.includes('Android')) {
            result.os = 'android';
            result.isMobile = true;
            result.isDesktop = false;
            const match = ua.match(/Android ([\d.]+)/);
            if (match) result.osVersion = match[1];
            if (ua.includes('Tablet') || screen.width >= 600) result.isTablet = true;
        }
        
        // Linux
        else if (ua.includes('Linux')) {
            result.os = 'linux';
        }

        // ===== ОПРЕДЕЛЕНИЕ МОБИЛЬНОСТИ (доп. проверки) =====
        if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            result.isMobile = true;
            result.isDesktop = false;
        }

        // Проверка на WebView
        if (ua.includes('wv') || ua.includes('WebView')) {
            result.isWebView = true;
        }

        return result;
    }

    // Функция добавления классов на body
    function applyBrowserClasses(info) {
        const body = document.body;
        
        // Основные классы
        body.classList.add(`browser-${info.browser}`);
        body.classList.add(`os-${info.os}`);
        
        // Классы версий (только для основных браузеров)
        if (info.version !== 'unknown') {
            const majorVersion = normalizeVersion(info.version);
            body.classList.add(`browser-${info.browser}-${majorVersion}`);
        }
        
        // Классы для движков
        body.classList.add(`engine-${info.engine}`);
        
        // Мобильные классы
        if (info.isMobile) {
            body.classList.add('is-mobile');
            if (info.isTablet) {
                body.classList.add('is-tablet');
            } else {
                body.classList.add('is-phone');
            }
        } else {
            body.classList.add('is-desktop');
        }
        
        // Touch-классы
        if (info.isTouch) {
            body.classList.add('has-touch');
        } else {
            body.classList.add('no-touch');
        }
        
        // Специальные классы
        if (info.isZen) {
            body.classList.add('is-zen-browser');
        }
        
        if (info.isWebView) {
            body.classList.add('is-webview');
        }

        // Добавляем data-атрибуты для CSS
        body.dataset.browser = info.browser;
        body.dataset.os = info.os;
        body.dataset.engine = info.engine;
        if (info.isMobile) body.dataset.device = info.isTablet ? 'tablet' : 'mobile';
        else body.dataset.device = 'desktop';
        
        console.log('Browser detected:', info);
        
        // Возвращаем объект для использования в другом коде
        return info;
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const browserInfo = detectBrowser();
            window.browserInfo = applyBrowserClasses(browserInfo);
        });
    } else {
        const browserInfo = detectBrowser();
        window.browserInfo = applyBrowserClasses(browserInfo);
    }

})();