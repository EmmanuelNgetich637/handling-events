document.addEventListener('DOMContentLoaded', () => {
    const moviesList = document.getElementById('movies');
    const buyButton = document.getElementById('buy-ticket');
    let currentMovie = null;
   
async function fetchMovies() {
    const loadingIndicator = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const moviesList = document.getElementById('moviesList');

    try {
        // Show loading state
        loadingIndicator.style.display = 'block';
        errorElement.style.display = 'none';

        // Try multiple common backend ports
        const ports = [3000, 3001, 8080, 8081];
        let response;
        let lastError;

        for (const port of ports) {
            try {
                response = await fetch('http://localhost:${port}/films');
                if (response.ok) break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        if (!response || !response.ok) {
            throw lastError || new Error('Server not responding on any port');
        }

        const movies = await response.json();
        moviesList.innerHTML = '';

        movies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'movie-item';
            li.innerHTML = `
                <h3>${movie.title}</h3>
                <p>${movie.description || ''}</p>
                <span>${movie.runtime} mins</span>
                <button class="buy-btn" 
                        data-id="${movie.id}"
                        data-tickets="${movie.tickets_sold || 0}">
                    Buy Ticket (${movie.capacity - (movie.tickets_sold || 0)} left)
                </button>
            `;
            moviesList.appendChild(li);
        });

        if (movies.length > 0) {
            displayMovieDetails(movies[0]);
        }

    } catch (error) {
        console.error('Fetch error:', error);
        errorElement.textContent = 'Failed to load movies. Please check:';
        errorElement.innerHTML += `
            <ul>
                <li>Is the server running?</li>
                <li>Check server port (tried 3000, 3001, 8080, 8081)</li>
                <li>Refresh the page</li>
            </ul>
        `;
        errorElement.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Add event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    fetchMovies();
    
    // Add click handler for buy buttons (using event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const button = e.target;
            const ticketsLeft = parseInt(button.textContent.match(/\d+/)[0]);
            
            if (ticketsLeft > 0) {
                button.textContent = 'Buy Tickets (`${ticketsLeft - 1} left`)';
                // Here you would add actual purchase logic
            } else {
                button.textContent = 'Sold Out';
                button.disabled = true;
            }
       }
    });
});
  
    // Display movie details
    function displayMovieDetails(movie) {
      currentMovie = movie;
      const ticketsAvailable = movie.capacity - movie.tickets_sold;
  
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-description').textContent = movie.description;
      document.getElementById('movie-showtime').textContent = `Showtime: ${movie.showtime}`;
      document.getElementById('movie-tickets').textContent = `Tickets available: ${ticketsAvailable}`;
      
      // Update poster if available
      const posterDiv = document.getElementById('movie-poster');
      posterDiv.innerHTML = movie.poster ? `<img src="${movie.poster}" alt="${movie.title}" /> ` : '';
      // Update buy button
      buyButton.disabled = ticketsAvailable <= 0;
      buyButton.textContent = ticketsAvailable > 0 ? 'Buy Ticket' : 'Sold Out';
    }
  
    // Handle ticket purchase
    buyButton.addEventListener('click', () => {
      if (!currentMovie) return;
      const newTicketsSold = currentMovie.tickets_sold + 1;
      const ticketsAvailable = currentMovie.capacity - currentMovie.tickets_sold;
      if (ticketsAvailable <= 0) return;
  
      // Update tickets_sold on server
      fetch(`http://localhost:3001/films/${currentMovie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickets_sold:newTicketsSold
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update tickets');
        return response.json();
      })
      .then(updatedMovie => {
        const newTicketsAvailable = updatedMovie.capacity - updatedMovie.tickets_sold;
        document.getElementById('movie-tickets').textContent = `${newTicketsAvailable} remaining tickets`;
        if (newTicketsAvailable <=0){
            buyButton.disabled = true;
            buyButton.textContent = 'Sold Out';
        }
      })
      .catch(error => console.error('Error purchasing ticket:', error));
    });
  });