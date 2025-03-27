document.addEventListener("DOMContentLoaded", () => {
    const movieList = document.getElementById("movies");
    const movieTitle = document.getElementById("movie-title");
    const moviePoster = document.getElementById("movie-poster");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieDescription = document.getElementById("movie-description");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieTickets = document.getElementById("movie-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");

    let currentMovie = null;

    // Fetch and display movies
    function fetchMovies() {
        fetch("http://localhost:3000/movies")
            .then(response => response.json())
            .then(movies => {
                movies.forEach(movie => {
                    const li = document.createElement("li");
                    li.textContent = movie.title;
                    li.addEventListener("click", () => displayMovieDetails(movie));
                    movieList.appendChild(li);
                });

                if (movies.length > 0) {
                    displayMovieDetails(movies[0]);
                }
            });
    }

    // Show movie details
    function displayMovieDetails(movie) {
        currentMovie = movie;
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = movie.runtime;
        movieDescription.textContent = movie.description;
        movieShowtime.textContent = movie.showtime;
        updateTickets();
    }

    // Update ticket availability
    function updateTickets() {
        const availableTickets = currentMovie.capacity - currentMovie.tickets_sold;
        movieTickets.textContent = availableTickets > 0 ? availableTickets : "Sold Out";
        buyTicketButton.disabled = availableTickets <= 0;
    }

    // Handle ticket purchase
    buyTicketButton.addEventListener("click", () => {
        if (!currentMovie) return;

        if (currentMovie.tickets_sold < currentMovie.capacity) {
            currentMovie.tickets_sold++;
        
            fetch(`http://localhost:3000/movies/${currentMovie.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets_sold: currentMovie.tickets_sold })
            })
            .then(() => updateTickets())
            .catch(error => console.error("Error:", error));
        }
    
    });

    fetchMovies();
});