// js/image-optimizer.js
(function() {
  // Загружаем библиотеку динамически
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Основная функция оптимизации
  async function optimizeImages() {
    // Ждём загрузку страницы
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });

    // Загружаем Zippo с CDN
    await loadScript('https://unpkg.com/@nascimentodeveloper/zippo/dist/zippo.umd.js');
    
    if (!window.Zippo) {
      console.log('Zippo не загрузился');
      return;
    }

    // Находим все картинки, кроме совсем маленьких
    const images = document.querySelectorAll('img:not([data-no-optimize])');
    
    for (let img of images) {
      try {
        // Проверяем размер
        if (img.width < 200 && img.height < 200) continue;
        
        // Пропускаем картинки с локальным src
        if (img.src.startsWith('blob:')) continue;
        
        console.log('Оптимизирую:', img.src);
        
        // Загружаем картинку
        const response = await fetch(img.src);
        const blob = await response.blob();
        
        // Определяем настройки по размеру
        let maxWidth = 1920;
        if (img.width < 800) maxWidth = 800;
        
        // Сжимаем
        const compressed = await Zippo.compress(blob, {
          quality: 0.8,
          maxWidth: maxWidth,
          format: 'image/webp' // конвертируем в WebP
        });
        
        // Создаём новый URL и заменяем
        const newUrl = URL.createObjectURL(compressed);
        img.src = newUrl;
        
        // Добавляем атрибут чтобы не оптимизировать повторно
        img.setAttribute('data-optimized', 'true');
        
      } catch(e) {
        console.log('Ошибка оптимизации:', e);
      }
    }
  }

  // Запускаем
  optimizeImages();
})();