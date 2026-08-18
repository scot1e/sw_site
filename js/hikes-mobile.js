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
            
            const titleElement = document.querySelector(`.hikes-card[data-id="${video.id}"] .hikes-title`);
            if (titleElement) titleElement.textContent = title;
        }
        setActiveVideo(videos[0].id);
    }

    function renderVideoList() {
        hikesList.innerHTML = '';
        
        videos.forEach((video, index) => {
            const card = document.createElement('div');
            card.className = 'hikes-card';
            card.setAttribute('data-id', video.id);
            
            const item = document.createElement('div');
            item.className = 'hikes-item';
            if (index === 0) item.classList.add('active');
            item.setAttribute('data-id', video.id);
            
            item.innerHTML = `
                <div class="hikes-thumb" style="background-image: url('${getThumbUrl(video.id)}');"></div>
            `;
            
            const title = document.createElement('div');
            title.className = 'hikes-title';
            title.textContent = video.title;
            
            card.appendChild(item);
            card.appendChild(title);
            
            card.addEventListener('click', () => {
                setActiveVideo(video.id);
            });
            
            hikesList.appendChild(card);
        });
    }

    renderVideoList();
    loadVideos();
    hikesBg.style.backgroundImage = `url('${getThumbUrl(videos[0].id)}')`;

    // Drag-to-scroll для мобилок
    const sidebar = document.querySelector('.hikes-sidebar');
    
    if (sidebar) {
        let isDown = false;
        let startX;
        let scrollLeft;

        sidebar.addEventListener('mousedown', (e) => {
            isDown = true;
            sidebar.classList.add('active');
            startX = e.pageX - sidebar.offsetLeft;
            scrollLeft = sidebar.scrollLeft;
        });

        sidebar.addEventListener('mouseleave', () => {
            isDown = false;
            sidebar.classList.remove('active');
        });

        sidebar.addEventListener('mouseup', () => {
            isDown = false;
            sidebar.classList.remove('active');
        });

        sidebar.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - sidebar.offsetLeft;
            const walk = (x - startX) * 2;
            sidebar.scrollLeft = scrollLeft - walk;
        });
    }
});