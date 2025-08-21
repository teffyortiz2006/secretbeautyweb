document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Función para mostrar un slide específico
    function showSlide(index) {
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        
        const offset = -currentSlide * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    }
    
    // Event listeners para los botones
    prevButton.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
    
    nextButton.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
    
    // Auto-play del carrusel
    let autoplayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
    
    // Pausar el auto-play cuando el mouse está sobre el carrusel
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });
    
    // Reanudar el auto-play cuando el mouse sale del carrusel
    carouselContainer.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    });
});