/**
 * Enhanced gallery and lightbox functionality with mobile swipe and thumbnails
 */

document.addEventListener('DOMContentLoaded', function() {
  // If we're on a gallery page
  if (document.querySelector('.gallery')) {
    createLightbox();
    setupGalleryListeners();
  }
});

// Create the lightbox HTML structure
function createLightbox() {
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
  
  // Track touch start position
  element.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, false);
  
  // Handle swipe on touch end
  element.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  // Determine swipe direction and navigate
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to be considered a swipe
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left - go to next photo
      goToNextPhoto();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right - go to previous photo
      goToPreviousPhoto();
    }
  }
}

// Create and populate thumbnail carousel
function createThumbnails(currentIndex) {
  const { links } = window.galleryState || { links: [] };
  if (links.length === 0) return;
  
  const thumbnailCarousel = document.querySelector('.thumbnail-carousel');
  thumbnailCarousel.innerHTML = ''; // Clear existing thumbnails
  
  // Determine what thumbnails to show (2 before, current, 2 after)
  const total = links.length;
  const thumbnailCount = Math.min(5, total);
  
  // Calculate start index for thumbnails
  let startIdx;
  if (total <= 5) {
    // If we have 5 or fewer images, show all
    startIdx = 0;
  } else {
    // Show 2 before current, but handle edge cases
    startIdx = currentIndex - 2;
    
    // Adjust if near the start
    if (startIdx < 0) {
      startIdx = 0;
    }
    
    // Adjust if near the end
    if (startIdx > total - thumbnailCount) {
      startIdx = total - thumbnailCount;
    }
  }
  
  // Create thumbnail elements
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
    
    // Add click event to thumbnail
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
  let currentIndex = 0;
  
  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      currentIndex = index;
      window.galleryState.currentIndex = currentIndex;
      openLightbox(this.href, this.getAttribute('data-title'));
    });
  });
  
  // Store the gallery links and current index in the window for navigation
  window.galleryState = {
    links: galleryLinks,
    currentIndex: currentIndex
  };
}

// Open the lightbox with the selected image
function openLightbox(imageSrc, imageTitle) {
  const lightboxOverlay = document.querySelector('.lightbox-overlay');
  const lightboxImage = lightboxOverlay.querySelector('.lightbox-content img');
  const lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');
  
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
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
  
  // Clear the image source after transition
  setTimeout(() => {
    const lightboxImage = lightboxOverlay.querySelector('.lightbox-content img');
    lightboxImage.src = '';
    
    // Clear thumbnails
    const thumbnailCarousel = lightboxOverlay.querySelector('.thumbnail-carousel');
    thumbnailCarousel.innerHTML = '';
  }, 300);
}

// Go to the previous photo in the gallery
function goToPreviousPhoto() {
  if (!window.galleryState) return;
  
  const { links, currentIndex } = window.galleryState;
  if (links.length === 0) return;
  
  // Calculate the previous index (loop back to the end if at the beginning)
  const prevIndex = (currentIndex === 0) ? links.length - 1 : currentIndex - 1;
  
  // Update the current index
  window.galleryState.currentIndex = prevIndex;
  
  // Get the previous link and open its image
  const prevLink = links[prevIndex];
  openLightbox(prevLink.href, prevLink.getAttribute('data-title'));
}

// Go to the next photo in the gallery
function goToNextPhoto() {
  if (!window.galleryState) return;
  
  const { links, currentIndex } = window.galleryState;
  if (links.length === 0) return;
  
  // Calculate the next index (loop back to the beginning if at the end)
  const nextIndex = (currentIndex === links.length - 1) ? 0 : currentIndex + 1;
  
  // Update the current index
  window.galleryState.currentIndex = nextIndex;
  
  // Get the next link and open its image
  const nextLink = links[nextIndex];
  openLightbox(nextLink.href, nextLink.getAttribute('data-title'));
}