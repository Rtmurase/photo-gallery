/**
 * Improved masonry layout with loading state
 */

document.addEventListener('DOMContentLoaded', function() {
  // If we're on an album page with a gallery
  if (document.querySelector('.gallery.masonry-gallery')) {
    setupLoadingState();
    initMasonry();
    loadImages();
    
    // Re-layout on window resize
    window.addEventListener('resize', debounce(function() {
      initMasonry();
      updateBottomAlbums();
    }, 200));
  }
});

// Create and show loading state
function setupLoadingState() {
  const gallery = document.querySelector('.gallery.masonry-gallery');
  if (!gallery) return;
  
  // Add loading class to the gallery
  gallery.classList.add('loading');
  
  // Create loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'gallery-loading-overlay';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading-spinner';
  loadingOverlay.appendChild(loadingSpinner);
  
  const loadingText = document.createElement('div');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Loading images...';
  loadingOverlay.appendChild(loadingText);
  
  // Insert loading overlay
  gallery.parentNode.insertBefore(loadingOverlay, gallery);
}

// Remove loading state
function removeLoadingState() {
  const gallery = document.querySelector('.gallery.masonry-gallery');
  if (!gallery) return;
  
  // Remove loading class
  gallery.classList.remove('loading');
  
  // Remove loading overlay
  const loadingOverlay = document.querySelector('.gallery-loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
      }
    }, 500); // After fade animation
  }
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

// Initialize masonry layout
function initMasonry() {
  const gallery = document.querySelector('.gallery.masonry-gallery');
  if (!gallery) return;
  
  const items = Array.from(gallery.querySelectorAll('.gallery-item'));
  if (items.length === 0) return;
  
  // Reset any previous layout
  items.forEach(item => {
    item.style.position = '';
    item.style.top = '';
    item.style.left = '';
    item.style.width = '';
  });
  
  // Determine the number of columns based on container width
  let numColumns;
  const galleryWidth = gallery.clientWidth;
  
  if (galleryWidth < 600) {
    numColumns = 2; // Minimum 2 columns
  } else {
    numColumns = 3; // Maximum 3 columns
  }
  
  // Store the current column count as a data attribute on the gallery
  // This can be useful for other scripts that might need to know the column count
  gallery.dataset.columns = numColumns;
  
  // Update the number of bottom albums to match column count
  updateBottomAlbums(numColumns);
  
  // Calculate adaptive gap size based on screen width to match homepage
  let gutterSize;
  if (galleryWidth < 480) {
    gutterSize = 2; // Minimal gap on very small screens
  } else if (galleryWidth < 768) {
    gutterSize = 3; // Small gap on tablets
  } else {
    gutterSize = 4; // Standard gap on larger screens
  }
  
  const columnWidth = galleryWidth / numColumns;
  const actualColumnWidth = columnWidth - gutterSize; // Account for gutters
  
  // Create array to track column heights
  const columnHeights = Array(numColumns).fill(0);
  
  // Position each item
  items.forEach(item => {
    // Find the column with the shortest height
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Position the item
    item.style.position = 'absolute';
    item.style.width = `${actualColumnWidth}px`;
    item.style.left = `${(shortestColumn * columnWidth) + (gutterSize / 2)}px`;
    item.style.top = `${columnHeights[shortestColumn] + (gutterSize / 2)}px`;
    
    // Set adaptive padding based on screen width
    const paddingSize = (galleryWidth < 480) ? 2 : (galleryWidth < 768) ? 3 : 4;
    item.style.padding = `${paddingSize}px`;
    
    // Get image height considering aspect ratio
    const img = item.querySelector('img');
    const aspectRatio = img.naturalWidth / img.naturalHeight || 1; // Fallback to 1 if dimensions not available
    const itemHeight = actualColumnWidth / aspectRatio;
    
    // Update the column height
    columnHeights[shortestColumn] += itemHeight + gutterSize; // Add gutter space
  });
  
  // Set gallery height to tallest column plus extra padding
  gallery.style.height = `${Math.max(...columnHeights) + gutterSize}px`;
}

// Function to load images and then initialize masonry
function loadImages() {
  const gallery = document.querySelector('.gallery.masonry-gallery');
  if (!gallery) return;
  
  const images = Array.from(gallery.querySelectorAll('img'));
  if (images.length === 0) {
    removeLoadingState();
    return;
  }
  
  let loadedCount = 0;
  let hasInitialized = false;
  
  function checkAllLoaded() {
    loadedCount++;
    
    // Show layout once at least half the images or 5 images have loaded
    if (!hasInitialized && (loadedCount >= Math.min(5, Math.ceil(images.length / 2)))) {
      initMasonry();
      hasInitialized = true;
    }
    
    // When all images are loaded, finalize layout and remove loading state
    if (loadedCount === images.length) {
      initMasonry();
      removeLoadingState();
      
      // Re-initialize after a short delay to ensure all images are properly rendered
      setTimeout(initMasonry, 300);
    }
  }
  
  // Wait for all images to load
  images.forEach(img => {
    if (img.complete) {
      checkAllLoaded();
    } else {
      img.addEventListener('load', checkAllLoaded);
      img.addEventListener('error', () => {
        // Handle image error
        img.src = '/assets/images/placeholder.jpg'; // Replace with error placeholder
        checkAllLoaded();
      });
    }
  });
  
  // If no images are found or they're taking too long, initialize anyway after a timeout
  setTimeout(() => {
    if (loadedCount < images.length) {
      initMasonry();
      if (loadedCount === 0) {
        removeLoadingState();
      }
    }
  }, 5000); // 5 second fallback
}

// Function to update bottom album display based on column count
function updateBottomAlbums(columns) {
  // If columns not provided, get it from the gallery
  if (!columns) {
    const gallery = document.querySelector('.gallery.masonry-gallery');
    if (gallery && gallery.dataset.columns) {
      columns = parseInt(gallery.dataset.columns);
    } else {
      // Default to responsive behavior based on window width
      if (window.innerWidth < 600) {
        columns = 2;
      } else {
        columns = 3;
      }
    }
  }
  
  // Update bottom albums container to match column count
  const bottomAlbumsContainer = document.querySelector('.bottom-albums-container');
  if (bottomAlbumsContainer) {
    // Set number of columns
    bottomAlbumsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Hide any extra albums beyond the column count
    const albumCards = bottomAlbumsContainer.querySelectorAll('.bottom-album-card');
    albumCards.forEach((card, index) => {
      if (index < columns) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

// Run after initial DOM load
window.addEventListener('load', function() {
  // If images haven't loaded after 8 seconds, remove loading state anyway
  setTimeout(() => {
    removeLoadingState();
  }, 8000);
});

// Handle window resize events
window.addEventListener('resize', debounce(function() {
  initMasonry();
  updateBottomAlbums();
}, 200));

// Also reinitialize when orientationchange happens (for mobile)
window.addEventListener('orientationchange', function() {
  // Wait for orientation change to complete
  setTimeout(() => {
    initMasonry();
    updateBottomAlbums();
  }, 300);
});