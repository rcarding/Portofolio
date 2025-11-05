document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    // KUNCI PERBAIKAN: Memilih elemen judul baru
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxSourceLink = document.getElementById('lightbox-source-link');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const closeBtn = document.querySelector('.lightbox-close');
    let lastClickedThumb;
    let isAnimating = false;

    const transitionDuration = 400;
    const easing = 'cubic-bezier(0.65, 0, 0.35, 1)';

    function triggerAnimation(mediaElement, mediaType) {
        document.body.classList.add('lightbox-open');
        const thumbRect = lastClickedThumb.getBoundingClientRect();
        
        const viewportPadding = window.innerWidth > 768 ? 80 : 40;
        const maxModalWidth = window.innerWidth - viewportPadding;
        const maxModalHeight = window.innerHeight - viewportPadding;
        
        const mediaAspectRatio = mediaType === 'video' 
            ? mediaElement.videoWidth / mediaElement.videoHeight
            : mediaElement.naturalWidth / mediaElement.naturalHeight;
        
        let finalWidth = maxModalWidth;
        let finalHeight = finalWidth / mediaAspectRatio;

        if (finalHeight > maxModalHeight) {
            finalHeight = maxModalHeight;
            finalWidth = finalHeight * mediaAspectRatio;
        }

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const thumbCenterX = thumbRect.left + thumbRect.width / 2;
        const thumbCenterY = thumbRect.top + thumbRect.height / 2;

        const translateX = thumbCenterX - screenCenterX;
        const translateY = thumbCenterY - screenCenterY;
        const scaleX = thumbRect.width / finalWidth;
        const scaleY = thumbRect.height / finalHeight;

        lightboxContent.style.transition = 'none';
        lightboxContent.style.width = `${finalWidth}px`;
        lightboxContent.style.height = `${finalHeight}px`;
        lightboxContent.style.borderRadius = '10px';
        lightboxContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        
        // KUNCI PERBAIKAN: Mengatur judul dan link sumber
        const sourceUrl = lastClickedThumb.dataset.sourceUrl || '#';
        const title = lastClickedThumb.dataset.title || 'Media';
        lightboxSourceLink.href = sourceUrl;
        lightboxTitle.textContent = title;

        if (mediaType === 'video') {
            lightboxVideo.src = mediaElement.src;
            lightboxVideo.style.display = 'block';
            lightboxImg.style.display = 'none';
            lightboxVideo.muted = false;
            lightboxVideo.play();
        } else {
            lightboxImg.src = mediaElement.src;
            lightboxImg.style.display = 'block';
            lightboxVideo.style.display = 'none';
        }
        
        lightbox.classList.add('show');
        lastClickedThumb.style.visibility = 'hidden';

        requestAnimationFrame(() => {
            lightboxContent.style.transition = `transform ${transitionDuration}ms ${easing}, border-radius ${transitionDuration}ms ${easing}`;
            lightboxContent.style.borderRadius = '18px';
            lightboxContent.style.transform = 'translate(0, 0) scale(1)';
        });

        setTimeout(() => {
            isAnimating = false;
        }, transitionDuration);
    }

    function openLightbox(event) {
        event.preventDefault();
        if (isAnimating) return;
        isAnimating = true;

        lastClickedThumb = this;
        const mediaUrl = lastClickedThumb.getAttribute('href');
        const isVideo = lastClickedThumb.classList.contains('video-item');

        if (isVideo) {
            const videoLoader = document.createElement('video');
            videoLoader.onloadedmetadata = () => triggerAnimation(videoLoader, 'video');
            videoLoader.onerror = () => {
                console.error("Lightbox video failed to load:", mediaUrl);
                isAnimating = false;
            };
            videoLoader.src = mediaUrl;
            if (videoLoader.readyState >= 2) {
                triggerAnimation(videoLoader, 'video');
            }
        } else {
            const imgLoader = new Image();
            imgLoader.onload = () => triggerAnimation(imgLoader, 'image');
            imgLoader.onerror = () => {
                console.error("Lightbox image failed to load:", mediaUrl);
                isAnimating = false;
            };
            imgLoader.src = mediaUrl;
            if (imgLoader.complete) {
                triggerAnimation(imgLoader, 'image');
            }
        }
    }

    function closeLightbox() {
        if (isAnimating || !lastClickedThumb) return;
        isAnimating = true;

        lightbox.classList.remove('show');
        document.body.classList.remove('lightbox-open');

        const thumbRect = lastClickedThumb.getBoundingClientRect();
        const finalWidth = parseFloat(lightboxContent.style.width);
        const finalHeight = parseFloat(lightboxContent.style.height);

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const thumbCenterX = thumbRect.left + thumbRect.width / 2;
        const thumbCenterY = thumbRect.top + thumbRect.height / 2;

        const translateX = thumbCenterX - screenCenterX;
        const translateY = thumbCenterY - screenCenterY;
        const scaleX = thumbRect.width / finalWidth;
        const scaleY = thumbRect.height / finalHeight;

        lightboxContent.style.transition = `transform ${transitionDuration}ms ${easing}, border-radius ${transitionDuration}ms ${easing}`;
        lightboxContent.style.borderRadius = '10px';
        lightboxContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        setTimeout(() => {
            lastClickedThumb.style.visibility = 'visible';
            lightboxImg.src = '';
            lightboxVideo.pause();
            lightboxVideo.src = '';
            // KUNCI PERBAIKAN: Mereset judul dan link
            lightboxTitle.textContent = '';
            lightboxSourceLink.href = '#';
            isAnimating = false;
        }, transitionDuration);
    }

    lightboxTriggers.forEach(trigger => trigger.addEventListener('click', openLightbox));
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('show')) {
            closeLightbox();
        }
    });

    // Kode untuk Animasi Fluid Scroll
    const animatedCards = document.querySelectorAll('.glass-card');
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    let ticking = false;

    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const scrollDelta = scrollY - lastScrollY;

                const maxSkew = 8;
                const maxStretch = 0.08;
                const intensity = Math.min(Math.abs(scrollDelta) / 30, 1.0);

                const skew = maxSkew * intensity * Math.sign(scrollDelta);
                const stretch = 1 + maxStretch * intensity;

                animatedCards.forEach(card => {
                    card.style.setProperty('--scroll-skew', `${skew}deg`);
                    card.style.setProperty('--scroll-scale', stretch);
                });

                lastScrollY = scrollY;
                ticking = false;

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    animatedCards.forEach(card => {
                        card.style.setProperty('--scroll-skew', '0deg');
                        card.style.setProperty('--scroll-scale', '1');
                    });
                }, 100);
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
});