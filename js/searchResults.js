document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn1");
  const searchBox = document.getElementById("searchBox");

  if (searchBtn && searchBox) {
    searchBtn.addEventListener("click", () => {
      const newQuery = searchBox.value.trim();
      if (newQuery) {
        window.location.href = `searchResults.html?query=${encodeURIComponent(newQuery)}`;
      }
    });
  }

  const resultsDiv = document.getElementById("results");
  const keyword = new URLSearchParams(window.location.search).get("query")?.toLowerCase() || "";

  fetch("/api/cars")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const cars = data.cars || [];

      // Filter (show full list without search terms, filter if present)
      const filtered = keyword 
        ? cars.filter(car =>
            car.brand.toLowerCase().includes(keyword) ||
            car.carModel.toLowerCase().includes(keyword) ||
            car.carType.toLowerCase().includes(keyword)
          )
        : cars;

      displayCars(filtered);
    })
    .catch(err => {
      console.error("Error fetching cars:", err);
      resultsDiv.textContent = "Failed to load car data.";
    });

  function displayCars(cars) {
    resultsDiv.innerHTML = "";

    if (cars.length === 0) {
      resultsDiv.textContent = "No matching cars found.";
      return;
    }

    cars.forEach(car => {
      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.margin = "10px";
      card.style.padding = "10px";
      card.style.borderRadius = "8px";
      card.style.backgroundColor = "#f9f9f9";

      card.innerHTML = `
       <h3>${car.brand} ${car.carModel}</h3>
  <img src="${car.image}" alt="${car.carModel}" width="200" />
  <p><strong>Type:</strong> ${car.carType}</p>
  <p><strong>Year:</strong> ${car.yearOfManufacture}</p>
  <p><strong>Fuel:</strong> ${car.fuelType}</p>
  <p><strong>Price/Day:</strong> $${car.pricePerDay}</p>
  <p><strong>Available:</strong> ${car.available ? "✅ Yes" : "❌ No"}</p>
  <p><strong>Description:</strong> ${car.description}</p>
  <button class="order-btn" data-vin="${car.vin}" ${car.available ? "" : "disabled style='background-color: #ccc; color: #666; cursor: not-allowed;'"}>Order</button>
`;

    card.querySelector('.order-btn').addEventListener('click', () => {
      sessionStorage.setItem('selectedVIN', car.vin);  
      window.location.href = 'reservation.html';     
    });
    
      resultsDiv.appendChild(card);
    });
  }
});