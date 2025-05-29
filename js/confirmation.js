$(document).ready(function () {
  const lastReservation = JSON.parse(localStorage.getItem("lastReservation"));
  const selectedCar = JSON.parse(localStorage.getItem("selectedCar"));

  if (!lastReservation || !selectedCar) {
    $("#confirmationSection").html("<p>No reservation data found.</p>");
    return;
  }

  // Display car information
  const carDetails = `
    <h2>${selectedCar.brand} ${selectedCar.carModel}</h2>
    <img src="${selectedCar.image}" alt="${selectedCar.carModel}" style="width:100%;max-width:400px"/>
    <p>Type: ${selectedCar.carType}</p>
    <p>Year: ${selectedCar.yearOfManufacture}</p>
    <p>Fuel: ${selectedCar.fuelType}</p>
    <p>Price Per Day: $${selectedCar.pricePerDay}</p>
    <p>Status: ${selectedCar.available ? "Available" : "Not Available"}</p>
  `;

  // Display order information
  const rentalInfo = `
    <h3>Reservation Summary</h3>
    <p>Name: ${lastReservation.customer.name}</p>
    <p>Email: ${lastReservation.customer.email}</p>
    <p>Start Date: ${lastReservation.rental.startDate}</p>
    <p>Days: ${lastReservation.rental.rentalPeriod}</p>
    <p>Total Price: $${lastReservation.rental.totalPrice}</p>
    <a href="#" id="confirmLink">Click here to Confirm Reservation</a>
  `;

  $("#confirmationSection").html(carDetails + rentalInfo);

  // Delegate events to confirmation links
  $("#confirmationSection").on("click", "#confirmLink", function (e) {
    e.preventDefault();

    $.ajax({
      url: "/api/confirm",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ vin: lastReservation.car.vin }),
      success: function () {
        alert("Reservation confirmed! Your car is now unavailable.");
        
        // Update status
        $('#reservationStatus').text('Status: Confirmed');  
      
        sessionStorage.removeItem("selectedVIN");
        localStorage.removeItem("reservationForm");
        localStorage.removeItem("lastReservation");
        localStorage.removeItem("selectedCar");
        window.location.href = "index.html";
      },
    });
  });
});