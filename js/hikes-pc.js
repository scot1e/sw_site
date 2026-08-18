document.addEventListener('DOMContentLoaded', function() {
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
    const hikesBg = document.getElementById('hikesBg');
    const hikesMain = document.getElementById('hikesMain');
    const videoTitle = document.getElementById('videoTitle');
    
    let currentVideoId = videos[0].id;

    function getThumbUrl(id) {
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }

    async function fetchVideoTitle(videoId) {
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const data = await response.json();
            return data.title || "Без названия";
        } catch (error) {
            return "Видео " + videoId;
        }
    }

    function renderMainContent(video) {
        if (video.available) {
            hikesMain.innerHTML = `<iframe src="https://www.youtube.com/embed/${video.id}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
        } else {
            hikesMain.innerHTML = `
                <div class="hikes-preview" style="background-image: url('${getThumbUrl(video.id)}');"></div>
                <div class="hikes-preview-overlay">
                    <div class="preview-text">В данный момент видео доступно только для просмотра на YouTube</div>
                    <a href="https://youtu.be/${video.id}" target="_blank" class="hikes-youtube-btn">СМОТРЕТЬ НА YOUTUBE</a>
                </div>
            `;
        }
    }

    function setActiveVideo(videoId) {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;
        
        currentVideoId = videoId;
        hikesBg.style.backgroundImage = `url('${getThumbUrl(videoId)}')`;
        renderMainContent(video);
        videoTitle.textContent = video.title;
        
        document.querySelectorAll('.hikes-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`.hikes-item[data-id="${videoId}"]`);
        if (activeItem) activeItem.classList.add('active');
    }

    async function loadVideos() {
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            const title = await fetchVideoTitle(video.id);
            video.title = title;
            
            const overlay = document.querySelector(`.hikes-item[data-id="${video.id}"] .hikes-title-overlay`);
            if (overlay) overlay.textContent = title;
        }
        setActiveVideo(videos[0].id);
    }

    function renderVideoList() {
        hikesList.innerHTML = '';
        
        videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'hikes-item';
            if (index === 0) item.classList.add('active');
            item.setAttribute('data-id', video.id);
            
            item.innerHTML = `
                <div class="hikes-thumb" style="background-image: url('${getThumbUrl(video.id)}');"></div>
                <div class="hikes-title-overlay">${video.title}</div>
            `;
            
            item.addEventListener('click', () => {
                setActiveVideo(video.id);
            });
            
            hikesList.appendChild(item);
        });
    }

    renderVideoList();
    loadVideos();
    hikesBg.style.backgroundImage = `url('${getThumbUrl(videos[0].id)}')`;

    // ===== ПЛАВНЫЙ СКРОЛЛ КОЛЕСИКОМ =====
    setTimeout(() => {
        const sidebar = document.querySelector('.hikes-sidebar');
        if (sidebar) {
            let isScrolling = false;
            let targetScroll = sidebar.scrollTop;
            
            sidebar.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                targetScroll += e.deltaY * 1.5;
                targetScroll = Math.max(0, Math.min(targetScroll, sidebar.scrollHeight - sidebar.clientHeight));
                
                if (!isScrolling) {
                    isScrolling = true;
                    
                    function smoothScroll() {
                        const currentScroll = sidebar.scrollTop;
                        const diff = targetScroll - currentScroll;
                        
                        if (Math.abs(diff) < 1) {
                            sidebar.scrollTop = targetScroll;
                            isScrolling = false;
                            return;
                        }
                        
                        sidebar.scrollTop += diff * 0.15;
                        requestAnimationFrame(smoothScroll);
                    }
                    
                    requestAnimationFrame(smoothScroll);
                }
            }, { passive: false });
        }
    }, 100);
});