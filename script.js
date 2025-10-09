// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const burgerMenu = document.querySelector('.burger-menu');
    const navigation = document.querySelector('.navigation');
    const navClose = document.querySelector('.nav-close');
    
    // Burger menu toggle
    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navigation.classList.toggle('active');
        
        // For desktop, also show/hide the navigation overlay
        if (window.innerWidth > 768) {
            if (navigation.classList.contains('active')) {
                navigation.style.display = 'flex';
            } else {
                navigation.style.display = 'none';
            }
        }
    });
    
    // Close button functionality
    if (navClose) {
        navClose.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            if (window.innerWidth > 768) {
                navigation.style.display = 'none';
            }
        });
    }
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close menu
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            if (window.innerWidth > 768) {
                navigation.style.display = 'none';
            }
            
            // Let the browser handle navigation to other pages
            // No preventDefault needed for page navigation
        });
    });
    
    // SIMPLE APPROACH:
    // 1. Hero section: Always gray (no transition)
    // 2. About section: White by default, smooth transition to gray at the end
    
    window.addEventListener('scroll', function() {
        const aboutSection = document.querySelector('.about-section');
        const scrollPosition = window.scrollY;
        
        if (aboutSection) {
            const aboutBottom = aboutSection.offsetTop + (aboutSection.offsetHeight / 8); // Start transition from 1/8 of about section
            
            if (scrollPosition < aboutBottom) {
                // BEFORE END OF ABOUT SECTION - WHITE
                document.body.style.setProperty('background-color', '#ffffff', 'important');
                // Update text colors for white background
                document.querySelectorAll('.about-text').forEach(el => {
                    el.style.setProperty('color', '#333333', 'important');
                });
                const label = document.querySelector('.about-label');
                if (label) label.style.setProperty('color', '#333333', 'important');
                const ctaLink = document.querySelector('.cta-link');
                if (ctaLink) {
                    ctaLink.style.setProperty('color', '#333333', 'important');
                    ctaLink.style.setProperty('border-color', '#333333', 'important');
                }
            } else {
                // AFTER END OF ABOUT SECTION - GRAY
                document.body.style.setProperty('background-color', '#212121', 'important');
                // Update text colors for gray background
                document.querySelectorAll('.about-text').forEach(el => {
                    el.style.setProperty('color', '#ffffff', 'important');
                });
                const label = document.querySelector('.about-label');
                if (label) label.style.setProperty('color', '#ffffff', 'important');
                const ctaLink = document.querySelector('.cta-link');
                if (ctaLink) {
                    ctaLink.style.setProperty('color', '#ffffff', 'important');
                    ctaLink.style.setProperty('border-color', '#ffffff', 'important');
                }
            }
        }
    });
    
    
    // Page load animations - hero elements only
    function animateOnLoad() {
        // Reset all animations first
        const titleLine1 = document.querySelector('.hero-title-line-1');
        const titleLine2 = document.querySelector('.hero-title-line-2');
        const titleLine3 = document.querySelector('.hero-title-line-3');
        const heroPortrait = document.querySelector('.hero-portrait');
        const heroName = document.querySelector('.hero-name');
        const heroYear = document.querySelector('.hero-year');
        const heroExperience = document.querySelector('.hero-experience');
        
        // Remove animate classes
        if (titleLine1) titleLine1.classList.remove('animate');
        if (titleLine2) titleLine2.classList.remove('animate');
        if (titleLine3) titleLine3.classList.remove('animate');
        if (heroPortrait) heroPortrait.classList.remove('animate');
        if (heroName) heroName.classList.remove('animate');
        if (heroYear) heroYear.classList.remove('animate');
        if (heroExperience) heroExperience.classList.remove('animate');
        
        // Force reflow
        if (titleLine1) titleLine1.offsetHeight;
        
        // Animate title lines with staggered timing
        setTimeout(() => {
            if (titleLine1) {
                titleLine1.classList.add('animate');
                console.log('Title line 1 animated');
            }
        }, 200);
        
        setTimeout(() => {
            if (titleLine2) {
                titleLine2.classList.add('animate');
                console.log('Title line 2 animated');
            }
        }, 400);
        
        setTimeout(() => {
            if (titleLine3) {
                titleLine3.classList.add('animate');
                console.log('Title line 3 animated');
            }
        }, 600);
        
        // Animate portrait
        setTimeout(() => {
            if (heroPortrait) heroPortrait.classList.add('animate');
        }, 800);
        
        // Animate name
        setTimeout(() => {
            if (heroName) heroName.classList.add('animate');
        }, 1000);
        
        // Animate year
        setTimeout(() => {
            if (heroYear) heroYear.classList.add('animate');
        }, 1200);
        
        // Animate experience
        setTimeout(() => {
            if (heroExperience) heroExperience.classList.add('animate');
        }, 1400);
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
    
    // Experience section animations
    const experienceTitle = document.querySelector('.experience-title h2');
    const experienceItems = document.querySelectorAll('.experience-item');
    
    const experienceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.matches('.experience-title h2')) {
                    // Animate title first
                    entry.target.classList.add('animate');
                    
                    // Add word-by-word reveal effect
                    const words = entry.target.querySelectorAll('.title-word');
                    words.forEach((word, index) => {
                        setTimeout(() => {
                            word.classList.add('revealed');
                        }, index * 200); // 200ms delay between each word
                    });
                } else if (entry.target.matches('.experience-item')) {
                    // Stagger experience items
                    const items = Array.from(experienceItems);
                    const index = items.indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 200); // 200ms delay between each item
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    // Observe title and items
    if (experienceTitle) {
        experienceObserver.observe(experienceTitle);
    }
    
    experienceItems.forEach(item => {
        experienceObserver.observe(item);
    });
    
    // Work page text reveal animation
    const workPageWrappers = document.querySelectorAll('.work-page-section .text-reveal-wrapper');
    const workGallery = document.querySelector('.work-gallery');
    
    const workPageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered animation for text wrappers
                workPageWrappers.forEach((wrapper, index) => {
                    setTimeout(() => {
                        wrapper.classList.add('revealed');
                    }, index * 200); // 200ms delay between each element
                });
                
                // Animate gallery elements
                if (workGallery) {
                    const galleryItems = workGallery.querySelectorAll('.gallery-item');
                    
                    // Animate gallery items
                    galleryItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 600 + (index * 200));
                    });
                }
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe work page section
    const workPageSection = document.querySelector('.work-page-section');
    if (workPageSection) {
        workPageObserver.observe(workPageSection);
    }

    // Gallery item click functionality - Direct navigation
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const projectName = item.getAttribute('data-project');
            
            // Add visual feedback
            item.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                item.style.transform = 'translateY(-5px)';
            }, 200);
            
            // Navigate to project page
            setTimeout(() => {
                if (projectName === 'stplaner') {
                    window.location.href = 'stplaner.html';
                } else if (projectName === 'monun') {
                    window.location.href = 'monun.html';
                } else if (projectName === 'doratec') {
                    window.location.href = 'doratec.html';
                } else if (projectName === 'spitex') {
                    window.location.href = 'spitex.html';
                } else if (projectName === 'jetonikeramika') {
                    window.location.href = 'jetonikeramika.html';
                } else if (projectName === 'mardal') {
                    window.location.href = 'mardal.html';
                } else if (projectName === 'archiget') {
                    window.location.href = 'archiget.html';
                } else if (projectName === 'baren') {
                    window.location.href = 'baren.html';
                } else if (projectName === 'riesen') {
                    window.location.href = 'riesen.html';
                } else if (projectName === 'ennur') {
                    window.location.href = 'ennur.html';
                } else if (projectName === 'socialmedia') {
                    window.location.href = 'socialmedia.html';
                } else if (projectName === 'printing') {
                    window.location.href = 'printing.html';
                } else if (projectName === 'alba') {
                    window.location.href = 'alba.html';
                }
            }, 300);
        });
    });


    // Project page image reveal animation
    const projectMainImages = document.querySelectorAll('.project-main-image');
    const projectGalleryContainers = document.querySelectorAll('.project-gallery-section .work-image');
    
    // Reveal main project images immediately on page load
    if (projectMainImages.length > 0) {
        setTimeout(() => {
            projectMainImages.forEach(image => {
                image.classList.add('revealed');
            });
        }, 500); // Small delay after page load
    }
    
    // Gallery images reveal only when scrolling to them
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate gallery images with stagger
                const containers = Array.from(projectGalleryContainers);
                containers.forEach((container, index) => {
                    setTimeout(() => {
                        container.classList.add('revealed');
                    }, index * 300); // 300ms stagger between images
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px'
    });
    
    // Observe only the gallery section
    const projectGallerySection = document.querySelector('.project-gallery-section');
    if (projectGallerySection) {
        galleryObserver.observe(projectGallerySection);
    }
    
    
    // Education section - simple reveal
    const educationSection = document.querySelector('.about-education');
    if (educationSection) {
        let hasAppeared = false;
        
        const educationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAppeared) {
                    educationSection.classList.add('revealed');
                    hasAppeared = true;
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        educationObserver.observe(educationSection);
    }
    
    // Project page text reveal animation
    const projectPageWrappers = document.querySelectorAll('.project-main .text-reveal-wrapper');
    
    if (projectPageWrappers.length > 0) {
        const projectPageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggered animation for text wrappers
                    projectPageWrappers.forEach((wrapper, index) => {
                        setTimeout(() => {
                            wrapper.classList.add('revealed');
                        }, index * 200); // 200ms delay between each element
                    });
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Observe project page section
        const projectMain = document.querySelector('.project-main');
        if (projectMain) {
            projectPageObserver.observe(projectMain);
        }
    }

    // Start animations when page loads
    animateOnLoad();
    
});
