// DOM Elements
const elements = {
  moviesList: document.getElementById('moviesList'),
  movieDetails: document.getElementById('movieDetails'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error-message')
};

// State
let allMovies = [];

// Initialize App
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  try {
      showLoading();
      allMovies = await fetchMovies();
      renderMovies(allMovies);
      if (allMovies.length > 0) showMovieDetails(allMovies[0]);
  } catch (err) {
      showError(err);
  } finally {
      hideLoading();
  }
}

// API Functions
async function fetchMovies() {
  const response = await fetch('http://localhost:3000/films');
  if (!response.ok) throw new Error('Failed to load movies');
  return await response.json();
}

// Render Functions
function renderMovies(movies) {
  elements.moviesList.innerHTML = movies.map(movie => `
      <li class="movie-item" onclick="showMovieDetails(${movie.id})">
          <h4>${movie.title}</h4>
          <p>${movie.runtime} mins • $${movie.ticketPrice}</p>
          ${renderTicketButton(movie)}
      </li>
  `).join('');
}

function renderTicketButton(movie) {
  const ticketsLeft = movie.capacity - movie.tickets_sold;
  const isSoldOut = ticketsLeft <= 0;
  
  return `
      <button class="buy-btn" 
              onclick="handleBuyTicket(event, ${movie.id})"
              ${isSoldOut ? 'disabled' : ''}>
          ${isSoldOut ? 'Sold Out' : 'Buy Ticket (${ticketsLeft} left)'}
      </button>
  `;
}

function showMovieDetails(movieId) {
  const movie = allMovies.find(m => m.id === movieId) || allMovies[0];
  if (!movie) return;

  const ticketsLeft = movie.capacity - movie.tickets_sold;
  
  elements.movieDetails.innerHTML = `
      <h3>${movie.title}</h3>
      <p><strong>Description:</strong> ${movie.description || 'N/A'}</p>
      <p><strong>Showtime:</strong> ${movie.showtime}</p>
      <p><strong>Tickets:</strong> ${ticketsLeft}/${movie.capacity} available</p>
      <p><strong>Status:</strong> ${ticketsLeft > 0 ? 'Available' : 'Sold Out'}</p>
  `;
}

// Event Handlers
async function handleBuyTicket(event, movieId) {
  event.stopPropagation();
  const button = event.target;
  
  try {
      button.disabled = true;
      button.textContent = 'Processing...';
      
      // In a real app: await updateServer(movieId);
      updateLocalTicketCount(movieId);
      
      const movie = allMovies.find(m => m.id === movieId);
      showMovieDetails(movieId);
      updateButtonUI(button, movie);
  } catch (err) {
      button.textContent = 'Error - Try Again';
  }
}

// Helper Functions
function updateLocalTicketCount(movieId) {
  const movie = allMovies.find(m => m.id === movieId);
  if (movie && movie.tickets_sold < movie.capacity) {
      movie.tickets_sold++;
  }
}

function updateButtonUI(button, movie) {
  const ticketsLeft = movie.capacity - movie.tickets_sold;
  button.textContent = ticketsLeft > 0 ? 'Buy Ticket (${ticketsLeft} left)' : 'Sold Out';
  button.disabled = ticketsLeft <= 0;
}

function showLoading() {
  elements.loading.style.display = 'block';
  elements.error.style.display = 'none';
}

function hideLoading() {
  elements.loading.style.display = 'none';
}

function showError(error) {
  elements.error.innerHTML =` Error : ${error.message}`;
  elements.error.style.display = 'block';
}