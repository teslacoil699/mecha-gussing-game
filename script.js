// Main JavaScript file

const API_URL = 'gundams.json';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400/111a27/ffffff?text=No+Image';
let allGundams = [];
let displayedGundams = [];

// Featured Gundam indices
const featuredIndices = [0, 1, 2];

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
  loadGundamsData();
  setupExploreButton();
});

function setupExploreButton() {
  const exploreBtn = document.querySelector('.btn-primary');
  const featuredSection = document.querySelector('#featured');
  
  if (exploreBtn && featuredSection) {
    exploreBtn.addEventListener('click', event => {
      event.preventDefault();
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

async function loadGundamsData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      allGundams = data;
    } else if (data && Array.isArray(data.gundams)) {
      allGundams = data.gundams;
    } else if (data && typeof data === 'object') {
      allGundams = Object.values(data).flat();
    } else {
      allGundams = [];
    }
    
    displayedGundams = allGundams;
    
    await loadFeaturedGundams();
    await loadGallery();
    setupSearch();
  } catch (error) {
    console.error('Error loading gundams data:', error);
    const cardGrid = document.querySelector('.card-grid');
    const galleryGrid = document.querySelector('.gallery-grid');
    if (cardGrid) cardGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load data</p>';
    if (galleryGrid) galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load gallery</p>';
  }
}

function resolveImageUrl(url) {
  return url && typeof url === 'string' && url.trim().length > 0 ? url : PLACEHOLDER_IMAGE;
}

function loadFeaturedGundams() {
  const featuredGrid = document.querySelector('.card-grid');
  if (!featuredGrid || allGundams.length === 0) return;
  
  const featured = featuredIndices.map(i => allGundams[i]).filter(Boolean);
  
  const cardsHtml = featured.map(gundam => {
    const imageUrl = resolveImageUrl(gundam.image);
    const title = gundam.title || gundam.name || 'Unknown Gundam';
    const series = gundam.series || gundam.title || 'Gundam Series';
    
    return `
      <article class="featured-card">
        <div class="card-image">
          <img src="${imageUrl}" alt="${title}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';" />
        </div>
        <div class="card-body">
          <h3>${title}</h3>
          <p>${series}</p>
          <a class="btn btn-secondary" href="#gallery">View Details</a>
        </div>
      </article>
    `;
  }).join('');
  
  featuredGrid.innerHTML = cardsHtml;
}

async function loadGallery() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid || allGundams.length === 0) return;
  
  const galleryHtml = allGundams.slice(0, 8).map(gundam => {
    const imageUrl = resolveImageUrl(gundam.image);
    const title = gundam.title || gundam.name || 'Gundam Image';
    
    return `
      <div class="gallery-card" title="${title}">
        <img src="${imageUrl}" alt="${title}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';" />
      </div>
    `;
  }).join('');
  
  galleryGrid.innerHTML = galleryHtml;
}

function setupSearch() {
  const searchInput = document.querySelector('#search');
  const filterSelect = document.querySelector('#filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterGallery();
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      filterGallery();
    });
  }
}

function filterGallery() {
  const searchTerm = document.querySelector('#search')?.value?.toLowerCase() || '';
  const galleryGrid = document.querySelector('.gallery-grid');
  
  if (!galleryGrid || allGundams.length === 0) return;
  
  let filtered = allGundams;
  
  if (searchTerm) {
    filtered = filtered.filter(gundam => 
      (gundam.title || gundam.name || '').toLowerCase().includes(searchTerm) ||
      (gundam.series || '').toLowerCase().includes(searchTerm) ||
      (gundam.info_text || '').toLowerCase().includes(searchTerm)
    );
  }
  
  displayedGundams = filtered.slice(0, 8);
  
  if (displayedGundams.length === 0) {
    galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #98a8c6; padding: 2rem;">No results found</p>';
  } else {
    const galleryHtml = displayedGundams.map(gundam => {
      const imageUrl = resolveImageUrl(gundam.image);
      const title = gundam.title || gundam.name || 'Gundam Image';
      
      return `
        <div class="gallery-card" title="${title}">
          <img src="${imageUrl}" alt="${title}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';" />
        </div>
      `;
    }).join('');
    
    galleryGrid.innerHTML = galleryHtml;
  }
}
