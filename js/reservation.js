$(document).ready(function () {
  const vin = sessionStorage.getItem("selectedVIN");
  let selectedCar = null;

  // If your form is autosaved, click Load
  const savedForm = JSON.parse(localStorage.getItem("reservationForm"));
  if (savedForm) {
    $("#name").val(savedForm.name);
    $("#phone").val(savedForm.phone);
    $("#email").val(savedForm.email);
    $("#license").val(savedForm.license);
    $("#startDate").val(savedForm.startDate);
    $("#rentalDays").val(savedForm.rentalDays);
  }

  // Retrieving and displaying vehicle information
  $.getJSON("data/cars.json", function (data) {
    selectedCar = data.cars.find((car) => car.vin === vin);
    if (!selectedCar) {
      $("#carDetails").html("<p>Car not found.</p>");
      return;
    }

    const details = `
      <h2>${selectedCar.brand} ${selectedCar.carModel}</h2>
      <img src="${selectedCar.image}" alt="${selectedCar.carModel}" style="width:100%;max-width:400px"/>
      <p>Type: ${selectedCar.carType}</p>
      <p>Year: ${selectedCar.yearOfManufacture}</p>
      <p>Fuel: ${selectedCar.fuelType}</p>
      <p>Price Per Day: $${selectedCar.pricePerDay}</p>
      <p>Status: ${selectedCar.available ? "Available" : "Not Available"}</p>
    `;
    $("#carDetails").html(details);

    // If the vehicle is unavailable
    if (!selectedCar.available) {
      $("#carDetails").append('<p style="color:red; font-weight:bold;">This car is currently not available for reservation.</p>');
      $("#reservationForm :input").prop("disabled", true);  
      $("#cancelBtn").prop("disabled", false);             
    }

    // Auto-calculate prices (connect after vehicle data is ready!)
    $("#rentalDays").on("input", function () {
      const days = parseInt($(this).val());
      if (days > 0) {
        const total = days * selectedCar.pricePerDay;
        $("#totalPrice").text(`$${total}`);
      } else {
        $("#totalPrice").text("$0");
      }
    });
  });

  // Process form submissions
  $("#reservationForm").submit(function (e) {
    e.preventDefault();

    const name = $("#name").val();
    const phone = $("#phone").val();
    const email = $("#email").val();
    const license = $("#license").val();
    const startDate = $("#startDate").val();
    const rentalDays = parseInt($("#rentalDays").val());

    if (!selectedCar || !selectedCar.pricePerDay || rentalDays <= 0) {
      alert("Please select a valid car and rental period.");
      return;
    }

    const totalPrice = rentalDays * selectedCar.pricePerDay;

    const newOrder = {
      customer: {
        name,
        phoneNumber: phone,
        email,
        driversLicenseNumber: license
      },
      car: {
        vin: vin
      },
      rental: {
        startDate,
        rentalPeriod: rentalDays,
        totalPrice,
        orderDate: new Date().toISOString().split("T")[0]
      }
    };

    // Send reservation information to the server
    $.ajax({
      url: "/api/reserve",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(newOrder),
      success: function () {
        // Process on successful booking
        localStorage.setItem("lastReservation", JSON.stringify(newOrder)); 
        localStorage.setItem("selectedCar", JSON.stringify(selectedCar));   
      
        alert("Reservation submitted! Please confirm on the next page.");
        window.location.href = "confirmation.html";
      },
      error: function () {
        alert("Failed to submit reservation.");
      }
    });
  });

  let shouldSaveForm = true; // Enable saving by default

  // Cancel Button and other ways to go back are different!!

//"If click Cancel button, disable saving + initialize form + remove data
$("#cancelBtn").click(function () {
  shouldSaveForm = false; 
  localStorage.removeItem("reservationForm");
  sessionStorage.removeItem("selectedVIN");
  window.location.href = "index.html";
});

//Save on page exit (but only if shouldSaveForm is true!)
$(window).on("beforeunload", function () {
  if (!shouldSaveForm) return;

  const formState = {
    name: $("#name").val(),
    phone: $("#phone").val(),
    email: $("#email").val(),
    license: $("#license").val(),
    startDate: $("#startDate").val(),
    rentalDays: $("#rentalDays").val()
  };
  localStorage.setItem("reservationForm", JSON.stringify(formState));
});
});