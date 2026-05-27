// Main JavaScript file

const JIKAN_API = 'https://api.jikan.moe/v4';
let allGundamSeries = [];
let displayedSeries = [];

// Featured Gundam series to fetch
const featuredTitles = ['Mobile Suit Gundam', 'Gundam Wing', 'Mobile Suit Gundam Iron-Blooded Orphans'];

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
  loadFeaturedGundams();
  loadGallery();
  setupSearch();
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

async function loadFeaturedGundams() {
  const featuredGrid = document.querySelector('.card-grid');
  if (!featuredGrid) return;
  
  featuredGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #98a8c6;">Loading featured Gundams...</p>';
  
  try {
    const cardsHtml = await Promise.all(
      featuredTitles.map(title => fetchAndCreateCard(title))
    );
    
    featuredGrid.innerHTML = cardsHtml.filter(html => html).join('');
  } catch (error) {
    console.error('Error loading featured Gundams:', error);
    featuredGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load featured Gundams</p>';
  }
}

async function fetchAndCreateCard(title) {
  try {
    const response = await fetch(`${JIKAN_API}/anime?query=${encodeURIComponent(title)}&limit=1`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const anime = data.data[0];
      const imageSrc = anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/600x400/0d1f2f/ffffff?text=' + encodeURIComponent(anime.title);
      const synopsis = anime.synopsis?.substring(0, 80) + '...' || 'A legendary Gundam series';
      
      return `
        <article class="featured-card">
          <div class="card-image" style="background-image: linear-gradient(180deg, rgba(5,7,12,0.1), rgba(5,7,12,0.8)), url('${imageSrc}'); background-size: cover; background-position: center;"></div>
          <div class="card-body">
            <h3>${anime.title}</h3>
            <p>${anime.year || 'Classic Series'}</p>
            <a class="btn btn-secondary" href="#gallery">View Details</a>
          </div>
        </article>
      `;
    }
  } catch (error) {
    console.error(`Error fetching ${title}:`, error);
  }
  return '';
}

async function loadGallery() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return;
  
  galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #98a8c6; padding: 2rem;">Loading gallery...</p>';
  
  try {
    const response = await fetch(`${JIKAN_API}/anime?query=gundam&limit=8&order_by=popularity&sort=asc`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      allGundamSeries = data.data;
      displayedSeries = data.data;
      
      const galleryHtml = data.data.slice(0, 8).map(anime => `
        <div class="gallery-card" style="background-image: url('${anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/600x400/0f1929/ffffff'}'); background-size: cover; background-position: center;" title="${anime.title}"></div>
      `).join('');
      
      galleryGrid.innerHTML = galleryHtml;
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Failed to load gallery</p>';
  }
}

function setupSearch() {
  const searchInput = document.querySelector('#search');
  const filterSelect = document.querySelector('#filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterGallery();
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      filterGallery();
    });
  }
}

function filterGallery() {
  const searchTerm = document.querySelector('#search')?.value?.toLowerCase() || '';
  const seriesFilter = document.querySelector('#filter')?.value || '';
  const galleryGrid = document.querySelector('.gallery-grid');
  
  if (!galleryGrid || allGundamSeries.length === 0) return;
  
  let filtered = allGundamSeries;
  
  if (searchTerm) {
    filtered = filtered.filter(anime => 
      anime.title?.toLowerCase().includes(searchTerm)
    );
  }
  
  displayedSeries = filtered.slice(0, 8);
  
  if (displayedSeries.length === 0) {
    galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #98a8c6; padding: 2rem;">No results found</p>';
  } else {
    const galleryHtml = displayedSeries.map(anime => `
      <div class="gallery-card" style="background-image: url('${anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/600x400/0f1929/ffffff'}'); background-size: cover; background-position: center;" title="${anime.title}"></div>
    `).join('');
    
    galleryGrid.innerHTML = galleryHtml;
  }
}
