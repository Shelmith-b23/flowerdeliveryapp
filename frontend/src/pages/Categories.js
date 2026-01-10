const addToCart = (flower) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Check if item already in cart
  const existing = cart.find(item => item.id === flower.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...flower, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Trigger storage event to update TopNav
  window.dispatchEvent(new Event("storage"));
};
import { useEffect, useState } from "react";    