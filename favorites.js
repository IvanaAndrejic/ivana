let favItems = document.querySelector("#favorites-list");

function renderFav() {
  const favorites = JSON.parse(localStorage.getItem("fav")) || [];

  if (favorites.length == 0) {
    favItems.textContent = "Lista omiljenih filmova je prazna!!!";
    return;
  }

  favItems.innerHTML = "";
  favorites.forEach((movie, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    const imageUrl = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;  
    div.innerHTML = `
          <img src="${imageUrl}" alt="${movie.title}" class="fav-item-img">
          <h3>${movie.title}</h3>
          
          <div>
            <button class="deleteItem">Ukloni</button>
          </div>
          `;
    favItems.appendChild(div);

    div.querySelector(".deleteItem").addEventListener("click", function () {
      deleteItem(index);
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  renderFav();
});

function deleteItem(index) {
  const favorites = JSON.parse(localStorage.getItem("fav")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("fav", JSON.stringify(favorites));
  renderFav();
}
