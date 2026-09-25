// ==========================================================
// SCOTT WORK — КПК (ROADTONOWHERE)
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {

    // ===== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ =====
    const navButtons = document.querySelectorAll('.pda-nav-btn');
    const sections = document.querySelectorAll('.pda-section');

    let hikesInitialized = false;
    let notesInitialized = false;

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.screen;

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const activeSection = document.getElementById('screen-' + target);
            if (activeSection) activeSection.classList.add('active');

            if (target === 'hikes') {
                if (!hikesInitialized) {
                    initHikes();
                    hikesInitialized = true;
                } else {
                    setTimeout(() => {
                        if (window.__syncHikesSidebar) window.__syncHikesSidebar();
                    }, 150);
                }
            }
            if (target === 'notes' && !notesInitialized) {
                initNotes();
                notesInitialized = true;
            }
            if (target === 'map' && map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
        });
    });

    // ===== ПОДСКАЗКА КАРТЫ =====
    const pdaHint = document.getElementById('pdaHint');
    const pdaHintClose = document.getElementById('pdaHintClose');

    function hideHint() {
        if (pdaHint && pdaHint.parentNode) {
            pdaHint.style.opacity = '0';
            pdaHint.style.transform = 'translate(-50%, 20px)';
            pdaHint.style.transition = 'opacity 0.3s, transform 0.3s';
            setTimeout(() => { if (pdaHint.parentNode) pdaHint.remove(); }, 300);
        }
    }

    if (pdaHintClose) pdaHintClose.addEventListener('click', hideHint);
    setTimeout(hideHint, 8000);

    // ===== КАРТА =====
    let map = null;
    let markersLayer = null;

    let currentPhotos = [];
    let currentPhotoIndex = 0;

    function initMap() {
        if (typeof galleryData === 'undefined') {
            console.error('gallery-data.js не загружен');
            return;
        }

        const container = document.getElementById('mapContainer');
        if (!container) return;

        map = L.map('mapContainer', {
            minZoom: 6,
            maxZoom: 17,
            maxBounds: [[56.0, 57.0], [60.5, 63.5]],
            maxBoundsViscosity: 1.0,
            gestureHandling: true,
            zoomControl: true,
            keyboard: false        // ← отключаем клавиатуру
        }).setView([58.0, 60.0], 7);

        // Отключаем фокус на контейнере карты
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.setAttribute('tabindex', '-1');
            mapContainer.addEventListener('focus', (e) => e.target.blur());
        }

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: '© Esri, Maxar, Earthstar Geographics',
                maxZoom: 18
            }
        ).addTo(map);

        markersLayer = L.layerGroup().addTo(map);

        const markerIcon = L.divIcon({
            className: '',
            html: '<div class="pda-marker">☢</div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        galleryData.forEach(city => {
            if (!city.objects) return;
            city.objects.forEach(obj => {
                const parsed = parseCoords(obj.coord_name);
                if (!parsed) return;

                const marker = L.marker([parsed.lat, parsed.lng], { icon: markerIcon });
                marker.bindTooltip(obj.name, {
                    direction: 'top',
                    offset: [0, -12],
                    opacity: 0.95
                });
                marker.on('click', () => openPhotoModal(obj));
                markersLayer.addLayer(marker);
            });
        });
    }

    function parseCoords(str) {
        if (!str || !str.includes(',')) return null;
        const parts = str.split(',');
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
    }

    // ===== МОДАЛКА =====
    const photoModal = document.getElementById('photoModal');
    const photoModalTitle = document.getElementById('photoModalTitle');
    const photoModalClose = document.getElementById('photoModalClose');
    const photoTrack = document.getElementById('photoTrack');
    const photoPrev = document.getElementById('photoPrev');
    const photoNext = document.getElementById('photoNext');
    const photoCounter = document.getElementById('photoCounter');

    function openPhotoModal(obj) {
        if (!obj.photos || obj.photos.length === 0) return;
        currentPhotos = obj.photos;
        currentPhotoIndex = 0;
        photoModalTitle.textContent = obj.name;
        renderPhotoSlides();
        updatePhotoCarousel();
        photoModal.style.display = '';
        photoModal.classList.add('active');
    }

    function closePhotoModal() {
        photoModal.classList.remove('active');
        photoModal.style.display = 'none';
        setTimeout(() => {
            photoModal.style.display = '';
        }, 50);
    }

    function renderPhotoSlides() {
        photoTrack.innerHTML = '';
        currentPhotos.forEach(photo => {
            const slide = document.createElement('div');
            slide.className = 'pda-modal-slide';
            slide.style.backgroundImage = `url('${photo}')`;
            photoTrack.appendChild(slide);
        });
    }

    function updatePhotoCarousel() {
        photoTrack.style.transform = `translateX(${-currentPhotoIndex * 100}%)`;
        photoCounter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    }

    if (photoPrev) photoPrev.addEventListener('click', () => {
        if (currentPhotos.length === 0) return;
        currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
        updatePhotoCarousel();
    });

    if (photoNext) photoNext.addEventListener('click', () => {
        if (currentPhotos.length === 0) return;
        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
        updatePhotoCarousel();
    });

    if (photoModalClose) photoModalClose.addEventListener('click', closePhotoModal);

    if (photoModal) {
        photoModal.addEventListener('click', (e) => {
            if (e.target === photoModal) closePhotoModal();
        });
    }

    // Свайпы для модалки
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselEl = document.querySelector('.pda-modal-carousel');
    if (carouselEl) {
        carouselEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        carouselEl.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) photoNext && photoNext.click();
                else photoPrev && photoPrev.click();
            }
        }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
        if (!photoModal || !photoModal.classList.contains('active')) return;
        if (e.key === 'Escape') closePhotoModal();
        if (e.key === 'ArrowLeft') photoPrev && photoPrev.click();
        if (e.key === 'ArrowRight') photoNext && photoNext.click();
    });

    // ===== ПОХОДЫ =====
    function initHikes() {
        const videos = [
            { id: "oo5txd7J_a4", title: "Загрузка...", available: false },
            { id: "_bmvbQoieH0", title: "Загрузка...", available: true },
            { id: "e58mbuc03lI", title: "Загрузка...", available: true },
            { id: "iCUpZmIyGQc", title: "Загрузка...", available: true },
            { id: "CX9nOYqrYRQ", title: "Загрузка...", available: true },
            { id: "KB1dK4-_Cq8", title: "Загрузка...", available: true },
            { id: "BaosB8VsTto", title: "Загрузка...", available: true },
            { id: "C8w5HiPS_DU", title: "Загрузка...", available: false }
        ];

        const hikesList = document.getElementById('hikesList');
        const hikesMain = document.getElementById('hikesMain');
        const videoTitle = document.getElementById('videoTitle');

        if (!hikesList || !hikesMain) return;

        function getThumbUrl(id) {
            return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        }

        function renderMainContent(video) {
            if (video.available) {
                hikesMain.innerHTML = `<iframe src="https://www.youtube.com/embed/${video.id}?autoplay=0" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
            } else {
                hikesMain.innerHTML = `
                    <div class="pda-hikes-preview" style="background-image: url('${getThumbUrl(video.id)}');"></div>
                    <div class="pda-hikes-preview-overlay">
                        <div class="pda-hikes-preview-text">Видео доступно только на YouTube</div>
                        <a href="https://youtu.be/${video.id}" target="_blank" class="pda-hikes-preview-btn">СМОТРЕТЬ НА YOUTUBE</a>
                    </div>
                `;
            }
        }

        function syncSidebarHeight() {
            if (window.innerWidth <= 900 && window.innerHeight > window.innerWidth) return;

            const player = document.querySelector('.pda-hikes-player');
            const sidebar = document.querySelector('.pda-hikes-sidebar');
            if (player && sidebar) {
                const h = player.offsetHeight;
                if (h > 0) sidebar.style.height = h + 'px';
            }
        }

        window.__syncHikesSidebar = syncSidebarHeight;

        function setActiveVideo(videoId) {
            const video = videos.find(v => v.id === videoId);
            if (!video) return;
            renderMainContent(video);
            videoTitle.textContent = video.title;
            document.querySelectorAll('.pda-hikes-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === videoId);
            });
            setTimeout(syncSidebarHeight, 50);
        }

        async function fetchVideoTitle(videoId) {
            try {
                const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
                const d = await r.json();
                return d.title || 'Без названия';
            } catch {
                return 'Видео ' + videoId;
            }
        }

        async function loadTitles() {
            for (const video of videos) {
                const title = await fetchVideoTitle(video.id);
                video.title = title;
                const item = document.querySelector(`.pda-hikes-item[data-id="${video.id}"]`);
                if (item) item.title = title;
            }
            const activeItem = document.querySelector('.pda-hikes-item.active');
            if (activeItem) {
                const vid = videos.find(v => v.id === activeItem.dataset.id);
                if (vid) videoTitle.textContent = vid.title;
            }
        }

        hikesList.innerHTML = '';
        videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'pda-hikes-item' + (index === 0 ? ' active' : '');
            item.dataset.id = video.id;
            item.title = video.title;
            item.innerHTML = `<div class="pda-hikes-thumb" style="background-image: url('${getThumbUrl(video.id)}');"></div>`;
            item.addEventListener('click', () => setActiveVideo(video.id));
            hikesList.appendChild(item);
        });

        setActiveVideo(videos[0].id);
        loadTitles();

        setTimeout(syncSidebarHeight, 100);
        window.addEventListener('resize', syncSidebarHeight);

        const sidebar = document.querySelector('.pda-hikes-sidebar');
        if (sidebar) {
            let isScrolling = false;
            let targetScroll = sidebar.scrollTop;

            sidebar.addEventListener('wheel', (e) => {
                if (window.innerWidth <= 900 && window.innerHeight > window.innerWidth) return;

                e.preventDefault();
                targetScroll += e.deltaY * 1.5;
                targetScroll = Math.max(0, Math.min(targetScroll, sidebar.scrollHeight - sidebar.clientHeight));

                if (!isScrolling) {
                    isScrolling = true;
                    (function smoothScroll() {
                        const diff = targetScroll - sidebar.scrollTop;
                        if (Math.abs(diff) < 1) {
                            sidebar.scrollTop = targetScroll;
                            isScrolling = false;
                            return;
                        }
                        sidebar.scrollTop += diff * 0.15;
                        requestAnimationFrame(smoothScroll);
                    })();
                }
            }, { passive: false });
        }
    }

    // ===== ЗАПИСКИ =====
    function initNotes() {
        const notesData = {
            audio:  [],
            notes:  [],
            guides: [],
            places: [],
            gear:   [],
            plans:  []
        };

        let currentCat = 'audio';

        const catsContainer = document.getElementById('notesCats');
        const listEl = document.getElementById('notesList');
        const contentEl = document.getElementById('notesContent');

        catsContainer.querySelectorAll('.pda-notes-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                catsContainer.querySelectorAll('.pda-notes-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCat = btn.dataset.cat;
                renderList();
                resetContent();
            });
        });

        function renderList() {
            const items = notesData[currentCat] || [];
            listEl.innerHTML = '';

            if (items.length === 0) {
                listEl.innerHTML = '<div class="pda-notes-empty">ПУСТО</div>';
                return;
            }

            items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'pda-note-item';
                el.textContent = item.title;
                el.dataset.id = item.id;
                el.addEventListener('click', () => {
                    listEl.querySelectorAll('.pda-note-item').forEach(i => i.classList.remove('active'));
                    el.classList.add('active');
                    openNote(item);
                });
                listEl.appendChild(el);
            });
        }

        function resetContent() {
            contentEl.innerHTML = `
                <div class="pda-notes-placeholder">
                    <div class="pda-notes-placeholder-text" data-text="ЗАПИСИ ВЕДУТСЯ">
                        ЗАПИСИ ВЕДУТСЯ<span class="pda-dots"><span>.</span><span>.</span><span>.</span></span>
                    </div>
                </div>
            `;
        }

        function openNote(item) {
            contentEl.innerHTML = `<div class="pda-notes-content-empty">СОДЕРЖИМОЕ ПОЯВИТСЯ ПОЗЖЕ</div>`;
        }

        renderList();
    }

    // Инициализация карты
    setTimeout(() => { initMap(); }, 50);
});