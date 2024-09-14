//
const global = {
  currentPage: window.location.pathname,
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKEY: "4a02486901033cb1e8f399b062bbf3c5",
    apiURL: "https://api.themoviedb.org/3/",
  },
};

async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");
  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
          <a href="movie-details.html?id=${movie.id}">
        ${
          movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="Movie Title" />`
            : `<img src="images/no-image.jpg" class="card-img-top" alt="Movie Title" />`
        }
      </a>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${movie.release_date}</small>
        </p>
      </div>
    `;

    document.querySelector("#popular-movies").appendChild(div);
    hideSpinner();
  });
}

async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");
  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
            <a href="tv-details.html?id=${show.id}">
          ${
            show.poster_path
              ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="show Title" />`
              : `<img src="images/no-image.jpg" class="card-img-top" alt="show Title" />`
          }
        </a>
        <div class="card-body">
          <h5 class="card-title">${show.name}</h5>
          <p class="card-text">
            <small class="text-muted">Release: ${show.first_air_date}</small>
          </p>
        </div>
      `;
    document.querySelector("#popular-shows").appendChild(div);
    hideSpinner();
  });
}

function displayBackgroundImage(type, path) {
  const div = document.createElement("div");
  div.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${path})`;
  div.style.backgroundSize = "cover";
  div.style.backgroundPosition = "top left";
  div.style.backgroundRepeat = "no-repeat";
  div.style.height = "100vh";
  div.style.width = "100vw";
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.bottom = "0";
  div.style.zIndex = "-1";
  div.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector("#movie-details").appendChild(div);
  } else {
    document.querySelector("#show-details").appendChild(div);
  }
}

async function search() {
  const queryString = window.location.search;
  const URLParams = new URLSearchParams(queryString);
  global.search.type = URLParams.get("type");
  global.search.term = URLParams.get("search-term");

  if (global.search.term !== "" && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    if (results.length === 0) {
      showAlert("No Results Found");
      return;
    } else {
      displaySearchResults(results);
      document.querySelector("#search-term").value = "";
    }
  } else {
    showAlert(
      `Please enter a ${
        global.search.type === "movie" ? "Movie" : "Tv Show"
      } name`
    );
  }
}

function displaySearchResults(results) {
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";
  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
            <a href="${global.search.type}-details.html?id=${result.id}">
            ${
              result.poster_path
                ? `<img src="https://image.tmdb.org/t/p/w500${
                    result.poster_path
                  }" class="card-img-top" alt="${
                    global.search.type === "movie" ? result.title : result.name
                  }" />`
                : `<img src="images/no-image.jpg" class="card-img-top" alt="${
                    global.search.type === "movie" ? result.title : result.name
                  }" />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${
              global.search.type === "movie" ? result.title : result.name
            }</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${
                global.search.type === "movie"
                  ? result.release_date
                  : result.first_air_date
              }</small>
            </p>
          </div>
        `;

    document.querySelector("#search-results-heading").innerHTML = `
     <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>
    `;
    document.querySelector("#search-results").appendChild(div);
    hideSpinner();
  });

  displayPagination();
}

// create & display pagination for search
function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");
  div.innerHTML = ` 
        <button class="btn btn-primary" id="prev">Prev</button>
          <button class="btn btn-primary" id="next">Next</button>
          <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`;

  document.querySelector("#pagination").appendChild(div);

  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }

  if (global.search.page === global.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  //   Next Page
  document.querySelector("#next").addEventListener("click", async (e) => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });

  document.querySelector("#prev").addEventListener("click", async (e) => {
    global.search.page--;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });
}

async function searchAPIData() {
  const API_URL = global.api.apiURL;
  const API_KEY = global.api.apiKEY;

  showSpinner();
  const response = await fetch(
    `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}`
  );
  const data = await response.json();
  hideSpinner();
  return data;
}

async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");
  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
     <a href="movie-details.html?id=${movie.id}">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
      movie.title
    }" />
    </a>
    <h4 class="swiper-rating">
      <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
        1
      )}/ 10
    </h4>
    `;

    document.querySelector(".swiper-wrapper").appendChild(div);
    initSwiper();
  });
}

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

async function displayMovieDetails() {
  const movieID = window.location.search.split("=")[1];
  const movie = await fetchAPIData(`movie/${movieID}`);

  displayBackgroundImage("movie", movie.backdrop_path);

  const div = document.createElement("div");

  div.innerHTML = `
    <div class="details-top">
          <div>
              ${
                movie.poster_path
                  ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="show Title" />`
                  : `<img src="images/no-image.jpg" class="card-img-top" alt="show Title" />`
              }
          </div>
          <div>
            <h2>${movie.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
              ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
               ${movie.genres
                 .map((genre) => {
                   return `<li>${genre.name}</li>`;
                 })
                 .join("")}
            </ul>
            <a href="${
              movie.homepage
            }" target="_blank" class="btn">Visit Movie Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(
              movie.budget
            )}</li>
            <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(
              movie.revenue
            )}</li>
            <li><span class="text-secondary">Runtime:</span> ${
              movie.runtime
            } minutes</li>
            <li><span class="text-secondary">Status:</span> ${movie.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${movie.production_companies
            .map((company) => {
              return `<span>${company.name}</span>`;
            })
            .join("")}</div>
        </div>
  `;

  document.querySelector("#movie-details").appendChild(div);
  hideSpinner();
}

async function displayShowDetails() {
  const showID = window.location.search.split("=")[1];
  const show = await fetchAPIData(`tv/${showID}`);

  displayBackgroundImage("tv", show.backdrop_path);

  const div = document.createElement("div");

  div.innerHTML = `
      <div class="details-top">
            <div>
                ${
                  show.poster_path
                    ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="show Title" />`
                    : `<img src="images/no-image.jpg" class="card-img-top" alt="show Title" />`
                }
            </div>
            <div>
              <h2>${show.name}</h2>
              <p>
                <i class="fas fa-star text-primary"></i>
                ${show.vote_average.toFixed(1)} / 10
              </p>
              <p class="text-muted">Last Air Date: ${show.last_air_date}</p>
              <p>
                ${show.overview}
              </p>
              <h5>Genres</h5>
              <ul class="list-group">
                 ${show.genres
                   .map((genre) => {
                     return `<li>${genre.name}</li>`;
                   })
                   .join("")}
              </ul>
              <a href="${
                show.homepage
              }" target="_blank" class="btn">Visit show Homepage</a>
            </div>
          </div>
          <div class="details-bottom">
            <h2>Show Info</h2>
            <ul>
              <li><span class="text-secondary">Number of Episoded: </span> ${
                show.number_of_episodes
              }</li>
              <li><span class="text-secondary">Last Episode To Air:</span> ${
                show.last_episode_to_air.name
              }</li>
              
              <li><span class="text-secondary">Status:</span> ${
                show.status
              }</li>
            </ul>
            <h4>Production Companies</h4>
            <div class="list-group">${show.production_companies
              .map((company) => {
                return `<span>${company.name}</span>`;
              })
              .join("")}</div>
          </div>
    `;

  document.querySelector("#show-details").appendChild(div);
  hideSpinner();
}

function showAlert(msg, className) {
  const alertEL = document.createElement("div");
  alertEL.classList.add("alert", className);
  alertEL.appendChild(document.createTextNode(msg));
  document.getElementById("alert").appendChild(alertEL);

  setTimeout(() => {
    alertEL.remove();
  }, 3000);
}

function addCommasToNumber(number) {
  return number.toLocaleString();
}

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

async function fetchAPIData(endpoint) {
  const API_URL = global.api.apiURL;
  const API_KEY = global.api.apiKEY;

  showSpinner();
  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
  );
  const data = await response.json();
  console.log(data);
  return data;
}

function highlightActiceLink(path) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

function init() {
  switch (global.currentPage) {
    case "/":
    case "/index.html":
      displaySlider();
      displayPopularMovies();
      break;
    case "/shows.html":
      console.log("Shows");
      displayPopularShows();
      break;
    case "/movie-details.html":
      console.log("Movie Details");
      displayMovieDetails();
      break;
    case "/tv-details.html":
      console.log("TV Details");
      displayShowDetails();
      break;
    case "/search.html":
      search();
      console.log("Search");
      break;
  }

  highlightActiceLink();
}

document.addEventListener("DOMContentLoaded", init);
