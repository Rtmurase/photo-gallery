/**
 * Fixed masonry layout with proper spacing
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

// Create loading overlay
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
    }, 500);
  }
}

// Debounce function
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

// Initialize masonry layout with absolute positioning
function initMasonry() {
  const gallery = document.querySelector('.gallery.masonry-gallery');
  if (!gallery) return;
  
  const items = Array.from(gallery.querySelectorAll('.gallery-item'));
  if (items.length === 0) return;
  
  // Reset any previous layout
  items.forEach(item => {
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
    item.style.width = '';
  });
  
  // Make sure gallery is a relative container
  gallery.style.position = 'relative';
  
  // Determine the number of columns based on container width
  let numColumns;
  const galleryWidth = gallery.clientWidth;
  
  if (galleryWidth < 600) {
    numColumns = 2; // Minimum 2 columns
  } else {
    numColumns = 3; // Maximum 3 columns
  }
  
  // Store the current column count as a data attribute on the gallery
  gallery.dataset.columns = numColumns;
  
  // Spacing between items
  const gap = 4;
  
  // Calculate column width
  const columnWidth = (galleryWidth / numColumns) - (gap * (numColumns - 1) / numColumns);
  
  // Create array to track column heights
  const columnHeights = Array(numColumns).fill(0);
  
  // Position each item using absolute positioning
  items.forEach(item => {
    // Find the column with the shortest height
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Position the item absolutely
    item.style.position = 'absolute';
    item.style.width = `${columnWidth}px`;
    item.style.left = `${shortestColumn * (columnWidth + gap)}px`;
    item.style.top = `${columnHeights[shortestColumn]}px`;
    
    // Make sure any anchor inside takes up the whole space
    const anchor = item.querySelector('a');
    if (anchor) {
      anchor.style.display = 'block';
      anchor.style.width = '100%';
    }
    
    // Get image to calculate height based on aspect ratio
    const img = item.querySelector('img');
    // Default to square if image isn't loaded yet
    let aspectRatio = 1; 
    
    if (img.complete && img.naturalWidth) {
      aspectRatio = img.naturalWidth / img.naturalHeight;
    }
    
    // Calculate item height based on aspect ratio
    const itemHeight = columnWidth / aspectRatio;
    
    // Update column height
    columnHeights[shortestColumn] += itemHeight + gap;
  });
  
  // Set gallery height to tallest column
  gallery.style.height = `${Math.max(...columnHeights)}px`;
  
  // Update the number of bottom albums to match column count
  updateBottomAlbums(numColumns);
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
    
    // When at least half the images are loaded, initialize layout
    if (!hasInitialized && loadedCount >= Math.ceil(images.length / 2)) {
      initMasonry();
      hasInitialized = true;
    }
    
    // When all images are loaded, remove loading state and finalize layout
    if (loadedCount === images.length) {
      removeLoadingState();
      // Re-initialize to get the final layout with all images
      setTimeout(initMasonry, 100);
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
        img.src = '/assets/images/placeholder.jpg';
        checkAllLoaded();
      });
    }
  });
  
  // Fallback if images take too long to load
  setTimeout(() => {
    if (!hasInitialized) {
      initMasonry();
      hasInitialized = true;
    }
    setTimeout(removeLoadingState, 1000);
  }, 5000);
}