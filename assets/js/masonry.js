/**
 * Simple masonry layout implementation
 */

document.addEventListener('DOMContentLoaded', function() {
  // If we're on an album page with a gallery
  if (document.querySelector('.gallery.masonry-gallery')) {
    initMasonry();
    
    // Re-layout on window resize
    window.addEventListener('resize', debounce(function() {
      initMasonry();
    }, 200));
  }
});

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
  
  const columnWidth = galleryWidth / numColumns;
  const gutterSize = 16; // Spacing between items
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
    
    // Get image height considering aspect ratio
    const img = item.querySelector('img');
    const aspectRatio = img.naturalWidth / img.naturalHeight;
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
  let loadedCount = 0;
  
  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount === images.length) {
      initMasonry();
      
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
      img.addEventListener('error', checkAllLoaded);
    }
  });
  
  // If no images are found or they're taking too long, initialize anyway after a timeout
  setTimeout(() => {
    if (loadedCount < images.length) {
      initMasonry();
    }
  }, 3000);
}

// Run after initial DOM load
window.addEventListener('load', loadImages);

// Handle window resize events
window.addEventListener('resize', debounce(function() {
  initMasonry();
}, 200));

// Also reinitialize when orientationchange happens (for mobile)
window.addEventListener('orientationchange', function() {
  // Wait for orientation change to complete
  setTimeout(initMasonry, 300);
});