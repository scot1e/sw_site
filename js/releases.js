document.addEventListener('DOMContentLoaded', function() {
    
    // ===== БЛОК СИНГЛОВ =====
    if (typeof singlesData === 'undefined') {
        console.error('❌ singles-data.js не загружен');
        return;
    }

    const singles = singlesData;
    const track = document.getElementById('singlesTrack');
    const carousel = document.getElementById('singlesCarousel');
    const prevBtn = document.getElementById('singlesPrev');
    const nextBtn = document.getElementById('singlesNext');

    if (!track) return;

    track.innerHTML = '';
    
    // Проверяем, мобильное ли устройство
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // ===== МОБИЛЬНАЯ ВЕРСИЯ - только ссылки, drag-to-scroll + стрелки =====
        singles.forEach(single => {
            const link = document.createElement('a');
            link.href = single.link;
            link.target = '_blank';
            link.className = 'single-card-link';
            link.style.textDecoration = 'none';
            link.style.display = 'block';
            link.style.cursor = 'pointer';
            
            const card = document.createElement('div');
            card.className = 'single-card';
            
            card.innerHTML = `
                <div class="single-cover" style="background-image: url('${single.cover}');"></div>
                <div class="single-info">
                    <p><strong>${single.title}</strong><br>${single.artist}</p>
                </div>
            `;
            
            link.appendChild(card);
            track.appendChild(link);
        });
        
        // Drag-to-scroll для мобилок (но с защитой от случайных переходов)
        let isDown = false;
        let startX;
        let scrollLeft;
        let dragThreshold = 5; // минимальное движение для определения скролла
        let moved = false;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            moved = false;
            carousel.classList.add('active');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('mouseup', (e) => {
            isDown = false;
            carousel.classList.remove('active');
            
            // Если было движение, предотвращаем клик по ссылке
            if (moved) {
                const links = document.querySelectorAll('.single-card-link');
                links.forEach(link => {
                    link.style.pointerEvents = 'none';
                    setTimeout(() => {
                        link.style.pointerEvents = 'auto';
                    }, 100);
                });
            }
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            
            // Проверяем, было ли движение больше порога
            if (Math.abs(walk) > dragThreshold) {
                moved = true;
            }
            
            carousel.scrollLeft = scrollLeft - walk;
        });

        // Отключаем стандартное поведение при клике на ссылки во время скролла
        carousel.addEventListener('click', (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
    } else {
        // ===== ПК ВЕРСИЯ - с hover-эффектами и drag-to-scroll =====
        singles.forEach(single => {
            const card = document.createElement('div');
            card.className = 'single-card';
            
            card.innerHTML = `
                <div class="single-cover" style="background-image: url('${single.cover}');"></div>
                <div class="single-info">
                    <p><strong>${single.title}</strong><br>${single.artist}</p>
                </div>
                <div class="single-hover-info">
                    <div class="hover-title-artist">${single.title} — ${single.artist}</div>
                    <a href="${single.link}" target="_blank" class="single-listen-btn">СЛУШАТЬ</a>
                </div>
            `;
            
            track.appendChild(card);
        });

        // Drag-to-scroll для ПК
        setupDragToScroll(carousel);
    }

    // ===== КНОПКИ НАВИГАЦИИ (работают на всех устройствах) =====
    function setupArrows() {
        prevBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.single-card')?.offsetWidth || 200;
            const gap = 32;
            carousel.scrollBy({ 
                left: -(cardWidth + gap), 
                behavior: 'smooth' 
            });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.single-card')?.offsetWidth || 200;
            const gap = 32;
            carousel.scrollBy({ 
                left: cardWidth + gap, 
                behavior: 'smooth' 
            });
        });
    }

    // Функция для drag-to-scroll
    function setupDragToScroll(carouselElement) {
        if (!carouselElement) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselElement.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselElement.classList.add('active');
            startX = e.pageX - carouselElement.offsetLeft;
            scrollLeft = carouselElement.scrollLeft;
        });

        carouselElement.addEventListener('mouseleave', () => {
            isDown = false;
            carouselElement.classList.remove('active');
        });

        carouselElement.addEventListener('mouseup', () => {
            isDown = false;
            carouselElement.classList.remove('active');
        });

        carouselElement.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselElement.offsetLeft;
            const walk = (x - startX) * 2;
            carouselElement.scrollLeft = scrollLeft - walk;
        });
    }

    // Запускаем стрелки
    setupArrows();

    // Отключаем прокрутку колесом
    carousel.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
});