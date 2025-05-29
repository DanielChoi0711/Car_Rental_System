document.getElementById("searchBtn1").addEventListener("click", () => {
  const query = document.getElementById("searchBox").value.trim();
  if (query) {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
}); 

// Process Enter key
document.getElementById("searchBox").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    if (query) {
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
  }
});

$(document).ready(function() {
  let allCars = [];

  // Load your data once:
  $.getJSON("data/cars.json", function(data) {
    allCars = data.cars;       // assume your JSON is { cars: [ … ] }
    renderGrid(allCars);       // show everything at first
  });

  // Wire up the Search button:
  $("#searchBtn").on("click", function() {
    doFilterAndRender();
  });

  // Optional: Enter key in the search box too
  $("#searchBox").on("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      doFilterAndRender();
    }
  });

  // Filter+search routine:
  function doFilterAndRender() {
    const q       = $("#searchBox").val().toLowerCase().trim();
    const type    = $("#typeFilter").val();
    const brand   = $("#brandFilter").val();
  
    const filtered = allCars.filter(car => {
      const textMatch = !q
        || car.brand.toLowerCase().includes(q)
        || car.carModel.toLowerCase().includes(q)
        || car.carType.toLowerCase().includes(q);
  
      const typeMatch = type === "All" || car.carType.toLowerCase() === type.toLowerCase();
      const brandMatch = brand === "All" || car.brand.toLowerCase() === brand.toLowerCase();
  
      return textMatch && typeMatch && brandMatch;
    });
  
    renderGrid(filtered);
  }

  // Render helper:
  function renderGrid(cars) {
    const $grid = $("#carGrid").empty();
    if (!cars.length) {
      return $grid.append("<p>No cars match your criteria.</p>");
    }
    cars.forEach(car => {
      const card = `
        <div class="car-card">
          <h3>${car.brand} ${car.carModel}</h3>
          <img src="${car.image}" alt="${car.carModel}" />
          <p>Type: ${car.carType}</p>
          <p>Year: ${car.yearOfManufacture}</p>
          <p>Price/Day: $${car.pricePerDay}</p>
          <button onclick="sessionStorage.setItem('selectedVIN','${car.vin}');location.href='reservation.html';">
            Reserve
          </button>
        </div>`;
      $grid.append(card);
    });
  }
});