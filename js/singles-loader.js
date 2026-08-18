// Загрузчик синглов
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузчик синглов запущен...');
    
    Promise.all([
        fetch('js/singles-data.js?_=' + Date.now()).then(r => r.text()),
        fetch('js/singles-links.js?_=' + Date.now()).then(r => r.text())
    ]).then(([singlesText, linksText]) => {
        const singlesMatch = singlesText.match(/const singlesData = (\[.*?\]);/s);
        const linksMatch = linksText.match(/const singlesLinks = (\[.*?\]);/s);
        
        if (!singlesMatch) {
            console.error('Не удалось распарсить singles-data.js');
            return;
        }
        
        const singlesData = JSON.parse(singlesMatch[1]);
        const singlesLinks = linksMatch ? JSON.parse(linksMatch[1]) : [];
        
        const linksMap = {};
        singlesLinks.forEach(item => {
            linksMap[item.id] = item.link;
        });

        const track = document.getElementById('singlesTrack');
        const carousel = document.getElementById('singlesCarousel');
        const prevBtn = document.getElementById('singlesPrev');
        const nextBtn = document.getElementById('singlesNext');

        if (!track) {
            console.error('Не найден элемент singlesTrack');
            return;
        }

        track.innerHTML = '';
        
        if (singlesData.length === 0) {
            track.innerHTML = '<div class="no-releases">Нет релизов</div>';
            return;
        }
        
        // СОРТИРОВКА ПО УБЫВАНИЮ (большие числа первые)
        const sortedData = [...singlesData].sort((a, b) => {
            const orderA = a.sort_order !== undefined ? a.sort_order : 0;
            const orderB = b.sort_order !== undefined ? b.sort_order : 0;
            return orderB - orderA;
        });
        
        console.log('Отсортированные данные:', sortedData.map(item => ({
            title: item.title,
            order: item.sort_order
        })));
        
        sortedData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'single-card';
            
            const listenLink = linksMap[item.id] || item.link || 'https://band.link/';
            
            // Формируем текст через длинное тире
            const artistTitle = `${item.artist} — ${item.title}`;
            
            card.innerHTML = `
                <div class="single-cover" style="background-image: url('${item.cover}');"></div>
                <div class="single-info">
                    <div class="title-artist">${artistTitle}</div>
                    <div class="year">${item.year || ''}</div>
                </div>
                <div class="single-hover-info">
                    <div class="hover-title-artist">${artistTitle}</div>
                    <a href="${listenLink}" target="_blank" class="single-listen-btn">СЛУШАТЬ</a>
                </div>
            `;
            
            track.appendChild(card);
        });

        console.log('Загружено карточек:', sortedData.length);

        // Инициализация карусели
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.classList.add('active');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });

        prevBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.single-card')?.offsetWidth || 600;
            carousel.scrollBy({ left: -cardWidth - 32, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = document.querySelector('.single-card')?.offsetWidth || 600;
            carousel.scrollBy({ left: cardWidth + 32, behavior: 'smooth' });
        });

        carousel.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });
        
    }).catch(error => {
        console.error('Ошибка загрузки данных:', error);
    });
});