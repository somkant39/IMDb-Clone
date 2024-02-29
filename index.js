// Here is the API Key
const apiKey = "5a8545bd";
const search = document.getElementById("searchInput");
const searchDropdown = document.getElementById("searchDropdown");
const searchButton = document.querySelector(".fa-magnifying-glass");
const movieDetails = document.querySelector("#detailContainer");
const favoriteBtn = document.querySelector("#favoriteButton");
const viewFavoritesButton = document.getElementById("like");
const favoritesList = document.getElementById("favoritesList");

// Function to search movies.
async function searchMovies() {
	const searchTerm = search.value;

	const response = await fetch(
		`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`
	);
	const data = await response.json();
	const movieList = document.querySelector("#movieList");
	movieList.innerHTML = "";

	if (data.Search) {
		data.Search.forEach((movie) => {
			const movieElement = createMovieElement(movie, true);
			movieList.appendChild(movieElement);
		});
	}
}

// Here is the Add event listener for Enter key
if (search) {
	search.addEventListener("keyup", (e) => {
		if (e.key === "Enter") {
			searchMovies();
			searchDropdown.style.visibility = "hidden";
		}
	});
}

// Here is the Add event listeners for Click
if (searchButton) {
	searchButton.addEventListener("click", searchMovies);
}

// Here is the Function to create a Movie element on Index.html
function createMovieElement(movie, isSearchResult) {
	const movieElement = document.createElement("div");
	movieElement.classList.add("movie");
	movieElement.innerHTML = `
    <div class="container">
        <div class="wrapper">
            <img src="${movie.Poster}" alt="Movie Poster" class="banner-image">
            <h1>${movie.Title}</h1>
            <p id="year"> Year: ${movie.Year}</p>
        </div>
        <div class="button-wrapper"> 
            <button class="btn outline view-details">DETAILS</button>
            <button class="btn fill" id="add-to-favorites"><i class="fa-regular fa-heart"></i></button>
        </div>
    </div>
`;
	// Here is the View Detail Button to send detail on movieDetail.html page.
	const viewDetailsBtn = movieElement.querySelector(".view-details");
	viewDetailsBtn.addEventListener("click", () => {
		window.location.href = `moviedetail.html?id=${movie.imdbID}`;
	});
	const favoriteBtn = movieElement.querySelector("#add-to-favorites");
	if (favoriteBtn) {
		favoriteBtn.addEventListener("click", () => {
			addToFavorites(movie, favoriteBtn, isSearchResult);
		});
	}
	return movieElement;
}

if (window.location.pathname.includes("/moviedetail.html")) {
	document.addEventListener("DOMContentLoaded", () => {
		viewDetailPage();
	});
}

// Here is the function to display details on movieDetail.html
async function viewDetailPage() {
	const queryParams = new URLSearchParams(window.location.search);
	const movieId = queryParams.get("id");
	const response = await fetch(
		`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`
	);
	const movieDetail = await response.json();
	movieDetails.innerHTML = `
        <div id="detailContainer">
                        <div>
                            <img src="${movieDetail.Poster}" id="moviePoster">
                        </div>
                        <div class="movie-name">
                            <h1 id="title">${movieDetail.Title}</h1>
                            <p id="rating">RATING: ${movieDetail.Rated}</p>
                            <p id="year">YEAR: ${movieDetail.Year}</p>
                            <p id="director">DIRECTOR: ${movieDetail.Director}</p>
                            <P id="actors">ACTORS: ${movieDetail.Actors}</P>
                            <p id="plot">${movieDetail.Plot}</p>
                        </div>
        </div>
        `;
}

// Button for View Favorite movies
if (viewFavoritesButton) {
	viewFavoritesButton.addEventListener("click", () => {
		window.location.href = "favoritespage.html";
	});
}

// Add event listener on favorites.html
if (window.location.pathname === "/movieSearch/favoritespage.html") {
	document.addEventListener("DOMContentLoaded", () => {
		const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
		displayFavorites(favorites);
	});
}

// Function to add a movie to favorites
function addToFavorites(movie, button, isSearchResult) {
	const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
	const isAlreadyAdded = favorites.some(
		(favMovie) => favMovie.imdbID === movie.imdbID
	);

	if (!isAlreadyAdded) {
		favorites.push(movie);
		sessionStorage.setItem("favorites", JSON.stringify(favorites));

		button.textContent = "Added to Favorites";
		button.disabled = true;

		if (!isSearchResult) {
			displayFavorites(favorites);
		}
	}
}

// Add event listener on favoritespage.html
if (window.location.pathname.includes("favoritespage.html")) {
	document.addEventListener("DOMContentLoaded", () => {
		const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
		displayFavorites(favorites);
	});
}

// Dropdown, Event listener for keyboard input and making an API call to get the movie name from Title
search.addEventListener("keyup", (data) => {
	if (data.key == "Enter") {
		return;
	}
	fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${search.value}`)
		.then((data) => {
			return data.json();
		})
		.then((data) => {
			if (data.Response == "False") {
				searchDropdown.innerHTML = "Not found";
				return;
			}
			searchDropdown.style.visibility = "visible";

			searchDropdown.innerText = "";
			for (let movie of data.Search) {
				let dropdownElement = document.createElement("a");

				dropdownElement.href = `/moviedetail.html?id=${movie.imdbID}`;
				dropdownElement.innerText = movie.Title;

				searchDropdown.appendChild(dropdownElement);
			}
		});
});

// Removing the dropdown of movie suggestion if clicked somewhere else on the page
document.addEventListener("click", (data) => {
	if (!data.target.classList.contains("dont-close-dropdown"))
		searchDropdown.style.visibility = "hidden";
});


// Function to display favorite movies on favoritespage.html
function displayFavorites(favorites) {
	favoritesList.innerHTML = "";
	if (favorites.length > 0) {
		favorites.forEach((movie) => {
			const favoriteMovieElement = createFavoriteMovieElement(movie);
			favoritesList.appendChild(favoriteMovieElement);
		});
	} else {
		favoritesList.innerHTML = "<p>You have no favorite movies.</p>";
	}
}

// Function to create a favorite movie element on favoritespage.html
function createFavoriteMovieElement(movie) {
	const favoriteMovieElement = document.createElement("div");
	favoriteMovieElement.classList.add("movie");
	favoriteMovieElement.innerHTML = `
        <h3>${movie.Title}</h3>
        <img src="${movie.Poster}" alt="${movie.Title}">
        <button class="remove-from-favorites">Remove from Favorites</button>
    `;
	const removeFromFavoritesBtn = favoriteMovieElement.querySelector(
		".remove-from-favorites"
	);
	removeFromFavoritesBtn.addEventListener("click", () => {
		removeFromFavorites(movie, favoriteMovieElement);
	});

	return favoriteMovieElement;
}

// Function to remove a movie from favoritespage.html
function removeFromFavorites(movie, element) {
	const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
	const updatedFavorites = favorites.filter(
		(favMovie) => favMovie.imdbID !== movie.imdbID
	);
	sessionStorage.setItem("favorites", JSON.stringify(updatedFavorites));
	element.remove();
}
