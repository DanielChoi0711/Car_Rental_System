const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "."))); // Provide static file

// File Path
const carsPath = path.join(__dirname, "data/cars.json");
const ordersPath = path.join(__dirname, "data/orders.json");

// Vehicle data delivery APIs
app.get('/api/cars', (req, res) => {
  try {
    const data = fs.readFileSync(carsPath, 'utf-8');
    const cars = JSON.parse(data);
    res.json(cars);
  } catch (err) {
    console.error("Error reading cars.json:", err);
    res.status(500).json({ error: "Failed to load car data" });
  }
});

// Order Storage API
app.post("/api/reserve", (req, res) => {
  const newOrder = req.body;

  fs.readFile(ordersPath, "utf8", (err, data) => {
    let ordersData = { orders: [] };

    if (!err && data.trim()) {
      try {
        ordersData = JSON.parse(data);
        if (!Array.isArray(ordersData.orders)) {
          ordersData.orders = [];
        }
      } catch (e) {
        console.warn("orders.json malformed. Initializing with empty orders array.");
      }
    }

    ordersData.orders.push(newOrder);

    fs.writeFile(ordersPath, JSON.stringify(ordersData, null, 2), (err) => {
      if (err) {
        console.error("Failed to write to orders.json:", err);
        return res.status(500).send("Failed to save order.");
      }
      res.status(200).send("Order saved.");
    });
  });
});

// Booking Confirmation API
app.post('/api/confirm', (req, res) => {
  const { vin } = req.body;

  try {
    const ordersRaw = fs.readFileSync(ordersPath, "utf-8");
    const carsRaw = fs.readFileSync(carsPath, "utf-8");

    const orders = JSON.parse(ordersRaw);
    const cars = JSON.parse(carsRaw);

    const order = orders.orders.find(o => o.car.vin === vin && o.status === "pending");
    if (!order) return res.status(404).json({ error: "Order not found." });

    order.status = "confirmed";

    const car = cars.cars.find(c => c.vin === vin);
    if (car) car.available = false;

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2));

    res.json({ message: "Reservation confirmed." });

  } catch (err) {
    console.error("Error during confirmation:", err);
    res.status(500).json({ error: "Failed to confirm reservation" });
  }
});

// Start the server only once, at the very end of the file!
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});