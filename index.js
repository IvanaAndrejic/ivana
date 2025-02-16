const apiKey = '4a9903346a1f3574abb5b64418c45a05';  //Moj API ključ
const movieContainer = document.getElementById('movie-container');
const imageBaseURL = 'https://image.tmdb.org/t/p/w500/';  //Osnovni URL za slike
const spinner = document.querySelector(".spinner");
const prev = document.querySelector("#prev-page");
const next = document.querySelector("#next-page");
const pageInfo = document.querySelector("#page-info");
const search = document.querySelector("#search");
const genresContainer = document.querySelector("#genres");

const modal = document.getElementById("movie-modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalPoster = document.getElementById("modal-poster");
const modalDescription = document.getElementById("modal-description");


let currentPage = 1; //Početna stranica
let totalPages = 1; //Početni broj stranica (biće dinamički dodeljen)
let allMovies = []; 
let filtered = [];
let selectedGenres = []; 

const productsPerPage = 5; // Broj filmova po stranici

prev.addEventListener("click", function() {
    changePage(-1);  
});

next.addEventListener("click", function() {
    changePage(1); 
});

search.addEventListener("keyup", () => {
    filterMovies();
    currentPage = 1;  //Resetovanje stranice pri pretrazi
    renderMovies(filtered);
    changePage(0);
})

genresContainer.addEventListener("change", () => {
    selectedGenres = Array.from(document.querySelectorAll('input[name="genres"]:checked')).map(checkbox => checkbox.value);
    filterMovies();  //Filtriraj ponovo kad se selektuju žanrovi
    currentPage = 1;  //Resetuj stranicu na 1 pri promeni žanrova
    renderMovies(filtered);
    changePage(0);
});

const korpa = document.querySelector("#cart-link");
korpa.addEventListener("drop", function(event){
    drop(event);
});

korpa.addEventListener("dragover", function(event){
    allowDrop(event);
})

function changePage(direction) {
    let newPage = currentPage + direction;
    const totalPG = Math.ceil(filtered.length / productsPerPage);

    if (newPage < 1) {
        newPage = 1;
    }
    else if (newPage > totalPG) {
        newPage = totalPG;
    }

    currentPage = newPage;
    renderMovies(filtered);

    //Ažuriraj vidljivost dugmadi
    updatePageNavigation();
}

//Funkcija za ažuriranje vidljivosti dugmadi sledeće i prethodne stranice
function updatePageNavigation() {
    const totalPG = Math.ceil(filtered.length / productsPerPage);

    //Prikaži ili sakrij dugmad za sledeću i prethodnu stranicu
    prev.style.display = currentPage > 1 ? "inline-block" : "none";
    next.style.display = currentPage < totalPages ? "inline-block" : "none";

    //Ažuriraj informacije o trenutnoj stranici
    pageInfo.textContent = `${currentPage} od ${totalPages}`;
}

//Funkcija za učitavanje popularnih filmova sa API-ja
function fetchMovies() {
    const pagesToLoad = 10;  
    const allFetchedMovies = [];
    
    //Učitaj filove sa više stranica
    let promises = [];
    for (let page = 1; page <= pagesToLoad; page++) {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;
        
        promises.push(
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    //Ako su filmovi dostupni, dodaj ih u niz
                    if (data.results) {
                        allFetchedMovies.push(...data.results);  //Spajanje filmova sa svih stranica
                    }
                })
                .catch(error => console.log('Greška prilikom učitavanja filmova:', error))
        );
    }

    //Kada svi API pozivi završe
    Promise.all(promises)
        .then(() => {
            allMovies = allFetchedMovies;  //Svi filmovi koji su učitani
            filtered = allMovies;
            totalPages = Math.ceil(allMovies.length / productsPerPage);  //Računaj ukupne stranice za sve filmove
            renderMovies(filtered);  //Renderuj sve filmove
            updatePageNavigation();  //Ažuriraj dugmad
        });
}

//Funkcija za renderovanje filmova na ekranu
function renderMovies(movies) {
    movieContainer.innerHTML = ''; //Čisti prethodne filmove

    //Izračunaj početni indeks i filtriraj filmove koji treba da se prikažu na trenutnoj stranici
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedMovies = movies.slice(startIndex, startIndex + productsPerPage);

    //Iteriraj kroz filmove i kreiraj HTML elemente
    paginatedMovies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');
        movieDiv.setAttribute("draggable", true);
        movieDiv.addEventListener("dragstart", function(e){
            drag(e, movie);
        });

        //Kreiraj HTML sadržaj za svaki film
        const movieHTML = `
            <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
            <p>Ocena: ${movie.vote_average.toFixed(2)}</p>
            <button class="btnDodaj">Iznajmi</button>
            <button class="btnFavorit">❤</button>
            <button class="btnDetalji">Detaljnije</button>
        `;

        movieDiv.innerHTML = movieHTML;
        movieContainer.appendChild(movieDiv);  //Dodaj film u DOM



        movieDiv.querySelector(".btnDodaj").addEventListener("click", function(){
            addToCart(movie)
        });
        movieDiv.querySelector(".btnFavorit").addEventListener("click", function(e){
            addToFavorites(e, movie);
        });

        movieDiv.querySelector(".btnDetalji").addEventListener("click", function(){
            openModal(movie);
        })
        checkIfFavorite(movieDiv, movie);
    });
}

  function addToFavorites(e, movie) {
    const {id, title, vote_average, poster_path } = movie;
    const favorites = JSON.parse(localStorage.getItem("fav")) || [];
    const existingFav = favorites.find((fav) => fav.id === id);
  
    if (existingFav) {
      favorites.splice(favorites.indexOf(existingFav), 1);
      e.target.style.color = "white";
    } else {
      favorites.push({ id, title, vote_average, poster_path });
      e.target.style.color = "red";
    }
    localStorage.setItem("fav", JSON.stringify(favorites));
    updateCountFav();
  }
    document.addEventListener("DOMContentLoaded", () => {
    updateCountFav();
  });
  
  function filterMovies() {
    const searchV = search.value.toLowerCase();
  
    filtered = allMovies.filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchV);
        const matchesGenres = selectedGenres.length === 0 || movie.genre_ids.some(genreId => selectedGenres.includes(genreId.toString()));

        return matchesSearch && matchesGenres;
    });
    totalPages = Math.ceil(filtered.length / productsPerPage);
    currentPage = 1;
    renderMovies(filtered);
    updatePageNavigation();
  }

  //Funkcija za učitavanje žanrova
function loadGenres() {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const genres = data.genres;
        genres.forEach(genre => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "genres";
          checkbox.value = genre.id;
          const label = document.createElement("label");
          label.textContent = genre.name;
  
          const genreDiv = document.createElement("div");
          genreDiv.appendChild(checkbox);
          genreDiv.appendChild(label);
          genresContainer.appendChild(genreDiv);
        });
      })
      .catch(error => console.log('Greška pri učitavanju žanrova:', error));
  }



  function updateCountFav() {
    const favorites = JSON.parse(localStorage.getItem("fav")) || [];
    const count = favorites.length;

    document.querySelector("#favorites-count").textContent = count;
  }
  

  //Funkcija koja proverava da li je film u omiljenima prilikom učitavanja stranice
    function checkIfFavorite(movieDiv, movie) {
        const favorites = JSON.parse(localStorage.getItem("fav")) || [];
        const isFavorited = favorites.some(fav => fav.id === movie.id);

        if (isFavorited) {
            movieDiv.querySelector(".btnFavorit").style.color = "red";
        }
    }

  
  function drag(event, movie) {
    const movieData = JSON.stringify(movie);
    event.dataTransfer.setData("movie", movieData);
  }
  function allowDrop(e) {
    e.preventDefault();
  }
  
  function drop(e) {
    e.preventDefault();
    let movie = e.dataTransfer.getData("movie");
    addToCart(JSON.parse(movie));
  }
  
//Otvori modal sa podacima o filmu
function openModal(movie) {
  modalTitle.textContent = movie.title;
  modalPoster.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  modalDescription.textContent = movie.overview;

  modal.style.display = "block";
}

closeModal.addEventListener("click", function() {
  modal.style.display = "none";
});

window.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

//Funkcija za dodavanje filma u korpu sa cenom od 200 RSD i čuvanje u cookies
function addToCart(movie) {

    const moviePrice = 200;  
    const cart = JSON.parse(getCookie("cart")) || []; 
    const existingItem = cart.find((item) => item.id === movie.id);
  
    if (existingItem) {
      alert("Film je već dodat u korpu!");
      return;
    }
  
    cart.push({ 
      id: movie.id, 
      title: movie.title, 
      vote_average: movie.vote_average, 
      poster_path: movie.poster_path, 
      price: moviePrice 
    });
  
    //Ažuriraj cookies
    setCookie("cart", JSON.stringify(cart), 7); //Čuvaj podatke u cookies za 7 dana
  
    //Ažuriraj broj filmova u korpi
    updateCartCount();
    
    alert("Film je dodat u korpu");

  }
  
  //Funkcija za čitanje podataka iz cookies
  function getCookie(name) {
    const cookieArr = document.cookie.split(";");
  
    for (let i = 0; i < cookieArr.length; i++) {
      let cookie = cookieArr[i].trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
  
    return "";
  }
  
  //Funkcija za postavljanje podataka u cookies
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); //1 dan trajanja
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  //Funkcija za ažuriranje broja filmova u korpi
  function updateCartCount() {
    const cart = JSON.parse(getCookie("cart")) || [];
    const cartCountElement = document.querySelector("#cart-count");
  
    if (cartCountElement) {
      cartCountElement.textContent = cart.length;  
    }
    
  }
   
updateCartCount();
loadGenres();
fetchMovies();
