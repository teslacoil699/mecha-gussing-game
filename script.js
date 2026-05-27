// Main JavaScript file

const exploreBtn = document.querySelector('.btn-primary');
const featuredSection = document.querySelector('#featured');

if (exploreBtn && featuredSection) {
  exploreBtn.addEventListener('click', event => {
    event.preventDefault();
    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
