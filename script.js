// Main JavaScript file

let allGundams = [];
let displayedGundams = [];

// Featured Gundam indices
const featuredIndices = [0, 1, 2]; // RX-78-2, Wing Zero, Barbatos

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
    const response = await fetch('/gundams.json');
    const data = await response.json();
    
    allGundams = data.gundams;
    displayedGundams = data.gundams;
    
    loadFeaturedGundams();
    loadGallery();
    setupSearch();
  } catch (error) {
    console.error('Error loading gundams data:', error);
    document.querySelector('.card-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load data</p>';
    document.querySelector('.gallery-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load gallery</p>';
  }
}

function loadFeaturedGundams() {
  const featuredGrid = document.querySelector('.card-grid');
  if (!featuredGrid || allGundams.length === 0) return;
  
  const featured = featuredIndices.map(i => allGundams[i]).filter(Boolean);
  
  const cardsHtml = featured.map(gundam => `
    <article class="featured-card">
      <div class="card-image" style="background-image: linear-gradient(180deg, rgba(5,7,12,0.1), rgba(5,7,12,0.8)), url('${gundam.image}'); background-size: cover; background-position: center;"></div>
      <div class="card-body">
        <h3>${gundam.name}</h3>
        <p>${gundam.series}</p>
        <a class="btn btn-secondary" href="#gallery">View Details</a>
      </div>
    </article>
  `).join('');
  
  featuredGrid.innerHTML = cardsHtml;
}

function loadGallery() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid || allGundams.length === 0) return;
  
  const galleryHtml = allGundams.slice(0, 8).map(gundam => `
    <div class="gallery-card" style="background-image: url('${gundam.image}'); background-size: cover; background-position: center;" title="${gundam.name}"></div>
  `).join('');
  
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
      gundam.name?.toLowerCase().includes(searchTerm) ||
      gundam.series?.toLowerCase().includes(searchTerm)
    );
  }
  
  displayedGundams = filtered.slice(0, 8);
  
  if (displayedGundams.length === 0) {
    galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #98a8c6; padding: 2rem;">No results found</p>';
  } else {
    const galleryHtml = displayedGundams.map(gundam => `
      <div class="gallery-card" style="background-image: url('${gundam.image}'); background-size: cover; background-position: center;" title="${gundam.name}"></div>
    `).join('');
    
    galleryGrid.innerHTML = galleryHtml;
  }
}
