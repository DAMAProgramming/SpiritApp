// resize-panel.js

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.manage-points-container');
    const chartSection = document.querySelector('.chart-section');
    const pointsSection = document.querySelector('.points-management-section');
    
    // Create and insert the resizer element
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    container.insertBefore(resizer, pointsSection);

    let isResizing = false;

    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        isResizing = true;
        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);
        resizer.classList.add('active');
        
        // Disable text selection
        document.body.classList.add('no-select');
    }

    function resize(e) {
        if (!isResizing) return;

        const containerRect = container.getBoundingClientRect();
        const newX = e.clientX - containerRect.left;
        const containerWidth = containerRect.width;

        // Ensure the chart section doesn't get smaller than 30% of the container width
        const minChartWidth = containerWidth * 0.3;
        // Ensure the points section doesn't get smaller than 20% of the container width
        const minPointsWidth = containerWidth * 0.2;

        if (newX > minChartWidth && newX < (containerWidth - minPointsWidth)) {
            chartSection.style.width = `${newX}px`;
            pointsSection.style.width = `${containerWidth - newX}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize, false);
        document.removeEventListener('mouseup', stopResize, false);
        resizer.classList.remove('active');
        
        // Re-enable text selection
        document.body.classList.remove('no-select');
    }
});