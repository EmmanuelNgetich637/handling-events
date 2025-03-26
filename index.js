document.addEventListener("DOMContentLoaded", () => {
    fetchMovieDetails(1); 
});

function fetchMovieDetails(movieId) {
    fetch('http://localhost:3000/films/${movieId')
        .then(response => response.json())
        .then(movie => {
            displayMovie(movie);
        })
        .catch(error => console.error("Error fetching movie data:", error));
}

function displayMovie(movie) {
    const poster = document.getElementById("poster");
    const title = document.getElementById("title");
    const runtime = document.getElementById("runtime");
    const showtime = document.getElementById("showtime");
    const availableTickets = document.getElementById("available-tickets");

    poster.src = movie.poster;
    title.textContent = movie.title;
    runtime.textContent = 'Runtime: ${movie.runtime} min';
    showtime.textContent = 'Showtime: ${movie.showtime}';
    
    let available = movie.capacity - movie.tickets_sold;
    availableTickets.textContent = 'Available Tickets: ${available}';
}