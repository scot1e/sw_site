document.addEventListener('DOMContentLoaded', function() {
    const leftLayer = document.querySelector('.left-layer');
    const centerLayer = document.querySelector('.center-layer');
    const rightLayer = document.querySelector('.right-layer');
    const roadBlock = document.querySelector('.road-block');

    function resetLayers() {
        roadBlock.classList.remove('left-trigger', 'center-trigger', 'right-trigger');
    }

    leftLayer.addEventListener('mouseenter', function() {
        roadBlock.classList.add('left-trigger');
        roadBlock.classList.remove('center-trigger', 'right-trigger');
    });

    centerLayer.addEventListener('mouseenter', function() {
        roadBlock.classList.add('center-trigger');
        roadBlock.classList.remove('left-trigger', 'right-trigger');
    });

    rightLayer.addEventListener('mouseenter', function() {
        roadBlock.classList.add('right-trigger');
        roadBlock.classList.remove('left-trigger', 'center-trigger');
    });

    roadBlock.addEventListener('mouseleave', resetLayers);
});