// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const burgerMenu = document.querySelector('.burger-menu');
    const navigation = document.querySelector('.navigation');
    
    // Burger menu toggle
    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navigation.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile menu
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            
            // Let the browser handle navigation to other pages
            // No preventDefault needed for page navigation
        });
    });
    
    // Header background on scroll (original code)
    const header = document.querySelector('.header');
    const heroOverlay = document.querySelector('.hero-overlay');
    const navList = document.querySelector('.nav-list');
    const logoText = document.querySelector('.logo-text');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            heroOverlay.style.background = 'rgba(0, 0, 0, 0.3)';
            
            if (window.innerWidth > 768) {
                // Fade out nav links
                navList.style.opacity = '0';
                
                // Show and style burger menu after nav fades
                setTimeout(() => {
                    navList.style.visibility = 'hidden';
                    burgerMenu.style.display = 'flex';
                    burgerMenu.style.opacity = '1';
                }, 400);
                
                logoText.classList.add('scrolled');
                burgerMenu.classList.add('scrolled');
            }
        } else {
            heroOverlay.style.background = 'rgba(0, 0, 0, 0)';
            
            if (window.innerWidth > 768) {
                // Fade out burger menu
                burgerMenu.style.opacity = '0';
                
                // Show and style nav links after burger fades
                setTimeout(() => {
                    burgerMenu.style.display = 'none';
                    navList.style.visibility = 'visible';
                    navList.style.opacity = '1';
                }, 400);
                
                logoText.classList.remove('scrolled');
                burgerMenu.classList.remove('scrolled');
            }
        }
    });
    
    
    // Page load animations - hero elements only
    function animateOnLoad() {
        // Reset all animations first
        const nameImage = document.querySelector('.name-image');
        const heroYear = document.querySelector('.hero-year');
        const experience = document.querySelector('.experience');
        const profession = document.querySelector('.profession');
        
        // Remove animate classes
        nameImage.classList.remove('animate');
        heroYear.classList.remove('animate');
        experience.classList.remove('animate');
        profession.classList.remove('animate');
        
        // Force reflow
        nameImage.offsetHeight;
        
        // Animate main KUSHTRIM name first
        setTimeout(() => {
            nameImage.classList.add('animate');
        }, 200);
        
        // Masked slide-up reveal sequence with stagger
        setTimeout(() => {
            heroYear.classList.add('animate');
        }, 600);
        
        setTimeout(() => {
            experience.classList.add('animate');
        }, 800);
        
        setTimeout(() => {
            profession.classList.add('animate');
        }, 1000);
    }
    
    // About section scroll animation - paragraph-based staggered text
    const aboutParagraphs = document.querySelectorAll('.about-paragraph');
    
    const aboutTextObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraph = entry.target;
                const textElements = paragraph.querySelectorAll('.about-text');
                
                // Get paragraph number (1 or 2)
                const isParagraph2 = paragraph.classList.contains('about-paragraph-2');
                const baseDelay = isParagraph2 ? 400 : 200; // Second paragraph starts shortly after
                
                // Animate each paragraph
                textElements.forEach((textElement, index) => {
                    setTimeout(() => {
                        textElement.classList.add('animate');
                    }, baseDelay);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    aboutParagraphs.forEach(paragraph => {
        aboutTextObserver.observe(paragraph);
    });
    
    // Start animations when page loads
    animateOnLoad();
    
});
