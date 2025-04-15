/**
 * Gallery and lightbox functionality - Complete Fix
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if a lightbox already exists and remove it to avoid duplicates
  const existingLightbox = document.querySelector('.lightbox-overlay');
  if (existingLightbox) {
    existingLightbox.parentNode.removeChild(existingLightbox);
  }

  // If we're on a gallery page
  if (document.querySelector('.gallery')) {
    createLightbox();
    setupGalleryListeners();
  }
});

// Create the lightbox HTML structure
function createLightbox() {
  // Create new lightbox structure
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  
  const lightboxContent = document.createElement('div');
  lightboxContent.className = 'lightbox-content';
  
  const lightboxImage = document.createElement('img');
  lightboxContent.appendChild(lightboxImage);
  
  const lightboxCaption = document.createElement('div');
  lightboxCaption.className = 'lightbox-caption';
  lightboxContent.appendChild(lightboxCaption);
  
  const closeButton = document.createElement('span');
  closeButton.className = 'close-lightbox';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', closeLightbox);
  
  const prevButton = document.createElement('button');
  prevButton.className = 'prev-button';
  prevButton.innerHTML = '&#10094;';
  prevButton.addEventListener('click', goToPreviousPhoto);
  
  const nextButton = document.createElement('button');
  nextButton.className = 'next-button';
  nextButton.innerHTML = '&#10095;';
  nextButton.addEventListener('click', goToNextPhoto);
  
  // Create thumbnail carousel
  const thumbnailCarousel = document.createElement('div');
  thumbnailCarousel.className = 'thumbnail-carousel';
  
  // Add all elements to the lightbox overlay
  lightboxOverlay.appendChild(closeButton);
  lightboxOverlay.appendChild(prevButton);
  lightboxOverlay.appendChild(nextButton);
  lightboxOverlay.appendChild(lightboxContent);
  lightboxOverlay.appendChild(thumbnailCarousel);
  
  // Append to the body element directly, not inside any other container
  document.body.appendChild(lightboxOverlay);
  
  // Close lightbox when clicking on the overlay background
  lightboxOverlay.addEventListener('click', function(event) {
    if (event.target === lightboxOverlay) {
      closeLightbox();
    }
  });
  
  // Setup touch events for mobile swipe
  setupSwipeEvents(lightboxOverlay);
  
  // Handle keyboard events
  document.addEventListener('keydown', function(event) {
    if (!document.querySelector('.lightbox-overlay.active')) return;
    
    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPreviousPhoto();
        break;
      case 'ArrowRight':
        goToNextPhoto();
        break;
    }
  });
}

// Setup swipe events for mobile navigation
function setupSwipeEvents(element) {
  let touchStartX = 0;
  let touchEndX = 0;
  
  element.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, false);
  
  element.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
      goToNextPhoto();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      goToPreviousPhoto();
    }
  }
}

// Create and populate thumbnail carousel
function createThumbnails(currentIndex) {
  const { links } = window.galleryState || { links: [] };
  if (links.length === 0) return;
  
  const thumbnailCarousel = document.querySelector('.thumbnail-carousel');
  if (!thumbnailCarousel) return;
  
  thumbnailCarousel.innerHTML = '';
  
  const total = links.length;
  const thumbnailCount = Math.min(5, total);
  
  let startIdx;
  if (total <= 5) {
    startIdx = 0;
  } else {
    startIdx = currentIndex - 2;
    
    if (startIdx < 0) {
      startIdx = 0;
    }
    
    if (startIdx > total - thumbnailCount) {
      startIdx = total - thumbnailCount;
    }
  }
  
  for (let i = 0; i < thumbnailCount; i++) {
    const idx = (startIdx + i) % total;
    const link = links[idx];
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';
    if (idx === currentIndex) {
      thumbnail.classList.add('active');
    }
    
    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = link.href;
    thumbnailImg.alt = link.getAttribute('data-title') || '';
    
    thumbnail.appendChild(thumbnailImg);
    
    thumbnail.addEventListener('click', function() {
      window.galleryState.currentIndex = idx;
      openLightbox(link.href, link.getAttribute('data-title'));
    });
    
    thumbnailCarousel.appendChild(thumbnail);
  }
}

// Set up click listeners for gallery items
function setupGalleryListeners() {
  const galleryLinks = document.querySelectorAll('.gallery-item a.lightbox');
  
  galleryLinks.forEach((link, index) => {
    // First remove any existing click handler to avoid duplicates
    const newLink = link.cloneNode(true);
    if (link.parentNode) {
      link.parentNode.replaceChild(newLink, link);
    }
    
    newLink.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Update gallery state
      window.galleryState = {
        links: galleryLinks,
        currentIndex: index
      };
      
      // Open lightbox
      openLightbox(this.href, this.getAttribute('data-title'));
    });
  });
}

// Open the lightbox with the selected image
function openLightbox(imageSrc, imageTitle) {
  const lightboxOverlay = document.querySelector('.lightbox-overlay');
  if (!lightboxOverlay) {
    console.error('Lightbox overlay not found');
    return;
  }
  
  const lightboxImage = lightboxOverlay.querySelector('.lightbox-content img');
  const lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');
  
  if (!lightboxImage || !lightboxCaption) {
    console.error('Lightbox elements not found');
    return;
  }
  
  // Set the image source and title
  lightboxImage.src = imageSrc;
  lightboxCaption.textContent = imageTitle || '';
  
  // Create thumbnails
  createThumbnails(window.galleryState.currentIndex);
  
  // Show the lightbox
  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close the lightbox
function closeLightbox() {
  const lightboxOverlay = document.querySelector('.lightbox-overlay');
  if (!lightboxOverlay) return;
  
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
  
  // Clear the image source after transition
  setTimeout(() => {
    const lightboxImage = lightboxOverlay.querySelector('.lightbox-content img');
    if (lightboxImage) {
      lightboxImage.src = '';
    }
    
    // Clear thumbnails
    const thumbnailCarousel = lightboxOverlay.querySelector('.thumbnail-carousel');
    if (thumbnailCarousel) {
      thumbnailCarousel.innerHTML = '';
    }
  }, 300);
}

// Go to the previous photo in the gallery
function goToPreviousPhoto() {
  if (!window.galleryState) return;
  
  const { links, currentIndex } = window.galleryState;
  if (links.length === 0) return;
  
  const prevIndex = (currentIndex === 0) ? links.length - 1 : currentIndex - 1;
  window.galleryState.currentIndex = prevIndex;
  
  const prevLink = links[prevIndex];
  openLightbox(prevLink.href, prevLink.getAttribute('data-title'));
}

// Go to the next photo in the gallery
function goToNextPhoto() {
  if (!window.galleryState) return;
  
  const { links, currentIndex } = window.galleryState;
  if (links.length === 0) return;
  
  const nextIndex = (currentIndex === links.length - 1) ? 0 : currentIndex + 1;
  window.galleryState.currentIndex = nextIndex;
  
  const nextLink = links[nextIndex];
  openLightbox(nextLink.href, nextLink.getAttribute('data-title'));
}