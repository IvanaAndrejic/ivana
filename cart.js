const cartItems = document.querySelector("#cart-items");
const cartDelete = document.querySelector("#obrisi");

cartDelete.addEventListener("click", obrisi);

function renderCart() {
  const cart = JSON.parse(getCookie("cart")) || [];

  let suma = 0;

  if (cart.length == 0) {
    cartItems.textContent = "Korpa je prazna!";
    cartDelete.style.display = "none";
    return;
  }

  cartItems.innerHTML = "";
  cartDelete.style.display = "inline-block";

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    const imageUrl = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;
    div.innerHTML = `
        <img src="${imageUrl}" alt="${item.title}" class="imgCart">
        <h3>${item.title}</h3>
        <p>Ocena: ${item.vote_average.toFixed(2)}</p>
        <p>Cena: ${item.price} RSD</p>
        <button class="deleteItem">Ukloni</button>
    `;
    cartItems.appendChild(div);

    div.querySelector(".deleteItem").addEventListener("click", function () {
      deleteItem(index);
    });

   
  });
  
  updateTotalPrice();
  cartItems.appendChild(sumaDiv);

  cartDelete.style.display = cart.length > 0 ? "inline-block" : "none";
}

//Funkcija za uklanjanje filma iz korpe
function deleteItem(index) {
  const cart = JSON.parse(getCookie("cart")) || [];
  cart.splice(index, 1);  

  setCookie("cart", JSON.stringify(cart), 7);

  updateCartCount();
  updateTotalPrice();
  renderCart(); 
}

//Funkcija za brisanje svih filmova iz korpe
function obrisi() {
  setCookie("cart", JSON.stringify([]), 7); 
  renderCart(); 
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
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  //Funkcija za ažuriranje ukupne cene
  function updateTotalPrice() {
    const cart = JSON.parse(getCookie("cart")) || [];
    let totalPrice = 0;
  
    cart.forEach(item => {
      totalPrice += 200;
    });

    let br = cart.length;
    let brFree = Math.floor(br / 5);
    totalPrice -= brFree*200;
  
    const totalElement = document.getElementById("cart-total");
    if (totalElement) {
      totalElement.textContent = `Ukupno: ${totalPrice} RSD i ${brFree} gratis filmova`;
    }
  }
   //Funkcija za ažuriranje broja filmova u korpi
   function updateCartCount() {
    const cart = JSON.parse(getCookie("cart")) || [];
    const cartCountElement = document.querySelector("#cart-count");
  
    if (cartCountElement) {
      cartCountElement.textContent = cart.length; 
    }
    
  }

//Na učitavanje stranice renderuj korpu
document.addEventListener("DOMContentLoaded", function () {
  renderCart();
  updateCartCount();
});
