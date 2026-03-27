// src/pages/FlowerDetails.js

const handleAddToCart = () => {
  if (flower.stock_status === "out_of_stock") {
    setError("This flower is currently out of stock");
    return;
  }

  // Pass the flower AND the quantity in one go
  addToCart(flower, quantity); 
  
  setAddedToCart(true);
  
  // Optional: Auto-navigate to checkout if you want to test the link immediately
  // setTimeout(() => navigate("/checkout"), 500); 

  setTimeout(() => setAddedToCart(false), 2000);
};