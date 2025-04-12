/**
 * Gallery and lightbox functionality
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
  
  lightboxOverlay.appendChild(closeButton);
  lightboxOverlay.appendChild(prevButton);
  lightboxOverlay.appendChild(nextButton);
  lightboxOverlay.appendChild(lightboxContent);
  
  document.body.appendChild(lightboxOverlay);
  
  // Close lightbox when clicking on the overlay background
  lightboxOverlay.addEventListener('click', function(event) {
    if (event.target === lightboxOverlay) {
      closeLightbox();
    }
  });
  
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

// Set up click listeners for gallery items
function setupGalleryListeners() {
  const galleryLinks = document.querySelectorAll('.gallery-item a.lightbox');
  let currentIndex = 0;
  
  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      currentIndex = index;
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