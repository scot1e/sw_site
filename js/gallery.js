document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.style.scrollSnapType = 'none';
    if (typeof galleryData === 'undefined') {
        console.error('❌ gallery-data.js не загружен');
        document.getElementById('cityTitleTrigger').textContent = 'ОШИБКА';
        return;
    }

    const cities = galleryData;
    
    let currentCityIndex = 0;
    let currentObjectIndex = 0;
    let currentPhotoIndex = 0;

    const cityBg = document.getElementById('cityBg');
    const cityTitleTrigger = document.getElementById('cityTitleTrigger');
    const citiesDropdown = document.getElementById('citiesDropdown');
    const objectsList = document.getElementById('objectsList');
    const carouselTrack = document.getElementById('carouselTrack');
    const prevPhoto = document.getElementById('prevPhoto');
    const nextPhoto = document.getElementById('nextPhoto');
    const coordsLink = document.getElementById('coordsLink');
    
    // Элементы для социальных кнопок
    const socialBtn = document.querySelector('.social-btn-main');
    const socialDropdown = document.querySelector('.social-btn-dropdown');

    // Проверяем, мобильное ли устройство
    const isMobile = window.innerWidth <= 768;

    function updateCity(index) {
        const city = cities[index];
        cityBg.style.backgroundImage = `url('${city.bg}')`;
        cityTitleTrigger.textContent = city.name;
        currentCityIndex = index;
        currentObjectIndex = 0;
        renderObjectsList();
        updateObject(0);
        renderCitiesDropdown();
        
        // Закрываем дропдаун после выбора (для мобилок)
        if (isMobile) {
            citiesDropdown.classList.remove('visible');
        }
    }

    function renderObjectsList() {
        const city = cities[currentCityIndex];
        objectsList.innerHTML = '';
        city.objects.forEach((obj, idx) => {
            const item = document.createElement('div');
            item.className = `object-item ${idx === currentObjectIndex ? 'active' : ''}`;
            item.textContent = obj.name;
            item.addEventListener('click', () => {
                document.querySelectorAll('.object-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                currentObjectIndex = idx;
                updateObject(idx);
            });
            objectsList.appendChild(item);
        });
    }

    function updateObject(objIndex) {
        const city = cities[currentCityIndex];
        const object = city.objects[objIndex];
        
        currentPhotoIndex = 0;
        renderCarousel(object.photos);
        
        if (object.coord_url && object.coord_url !== "#") {
            coordsLink.href = object.coord_url;
            coordsLink.textContent = object.coord_name;
            coordsLink.target = "_blank";
            coordsLink.classList.remove('disabled');
        } else {
            coordsLink.href = "#";
            coordsLink.textContent = "???";
            coordsLink.removeAttribute('target');
            coordsLink.classList.add('disabled');
        }
    }

    function renderCarousel(photos) {
        carouselTrack.innerHTML = '';
        photos.forEach(photo => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.style.backgroundImage = `url('${photo}')`;
            carouselTrack.appendChild(slide);
        });
        updateCarouselPosition();
    }

    function updateCarouselPosition() {
        carouselTrack.style.transform = `translateX(${-currentPhotoIndex * 100}%)`;
    }

    function renderCitiesDropdown() {
        citiesDropdown.innerHTML = '';
        cities.forEach((city, index) => {
            const item = document.createElement('div');
            item.className = `city-dropdown-item ${index === currentCityIndex ? 'active' : ''}`;
            item.textContent = city.name;
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCityIndex = index;
                updateCity(currentCityIndex);
            });
            
            citiesDropdown.appendChild(item);
        });
    }

    // ===== ЛОГИКА ДЛЯ ПК =====
    if (!isMobile) {
        // Города - hover
        cityTitleTrigger.addEventListener('mouseenter', () => {
            renderCitiesDropdown();
            citiesDropdown.classList.add('visible');
        });

        citiesDropdown.addEventListener('mouseleave', () => {
            citiesDropdown.classList.remove('visible');
        });
        
        citiesDropdown.addEventListener('mouseenter', () => {
            citiesDropdown.classList.add('visible');
        });
        
        // Социальные кнопки - hover (как было)
        if (socialBtn && socialDropdown) {
            socialBtn.addEventListener('mouseenter', () => {
                socialDropdown.classList.add('visible');
            });

            socialDropdown.addEventListener('mouseleave', () => {
                socialDropdown.classList.remove('visible');
            });
        }
    } 
    // ===== ЛОГИКА ДЛЯ МОБИЛОК =====
    else {
        // Города - по клику
        cityTitleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (citiesDropdown.classList.contains('visible')) {
                citiesDropdown.classList.remove('visible');
            } else {
                renderCitiesDropdown();
                citiesDropdown.classList.add('visible');
            }
        });

        // Закрываем дропдаун городов при клике вне
        document.addEventListener('click', (e) => {
            if (!cityTitleTrigger.contains(e.target) && !citiesDropdown.contains(e.target)) {
                citiesDropdown.classList.remove('visible');
            }
        });

        // Предотвращаем закрытие при клике на сам дропдаун городов
        citiesDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Социальные кнопки - по клику
        if (socialBtn && socialDropdown) {
            socialBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                if (socialDropdown.classList.contains('visible')) {
                    socialDropdown.classList.remove('visible');
                } else {
                    socialDropdown.classList.add('visible');
                }
            });
            
            // Закрываем социальный дропдаун при клике вне
            document.addEventListener('click', (e) => {
                if (!socialBtn.contains(e.target) && !socialDropdown.contains(e.target)) {
                    socialDropdown.classList.remove('visible');
                }
            });
            
            // Предотвращаем закрытие при клике на сам дропдаун
            socialDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    prevPhoto.addEventListener('click', () => {
        const object = cities[currentCityIndex].objects[currentObjectIndex];
        if (object.photos.length > 0) {
            currentPhotoIndex = (currentPhotoIndex - 1 + object.photos.length) % object.photos.length;
            updateCarouselPosition();
        }
    });

    nextPhoto.addEventListener('click', () => {
        const object = cities[currentCityIndex].objects[currentObjectIndex];
        if (object.photos.length > 0) {
            currentPhotoIndex = (currentPhotoIndex + 1) % object.photos.length;
            updateCarouselPosition();
        }
    });

    if (cities.length > 0) updateCity(0);
    else cityTitleTrigger.textContent = 'НЕТ ГОРОДОВ';
});