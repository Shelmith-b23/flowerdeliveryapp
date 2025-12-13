import { useEffect } from "react";

export default function LiveTracking({ order }) {
  useEffect(() => {
    if (!order.delivery_lat || !order.delivery_lng) return;

    const createMap = () => {
      if (!(window.google && window.google.maps)) return false;
      const map = new window.google.maps.Map(document.getElementById(`map-${order.id}`), {
        center: { lat: parseFloat(order.delivery_lat), lng: parseFloat(order.delivery_lng) },
        zoom: 15,
      });
      new window.google.maps.Marker({
        position: { lat: parseFloat(order.delivery_lat), lng: parseFloat(order.delivery_lng) },
        map,
        title: "Delivery Location",
      });
      return true;
    };

    // Try immediate creation (script may already be loaded)
    if (createMap()) return;

    // Wait for global event fired by index.html callback when Google Maps has loaded
    const onMapsLoaded = () => { createMap(); };
    window.addEventListener('googleMapsLoaded', onMapsLoaded);
    // As a fallback, also poll for `window.google` for up to 10s
    let polled = 0;
    const interval = setInterval(() => {
      polled += 200;
      if (createMap()) { clearInterval(interval); }
      if (polled > 10000) { clearInterval(interval); }
    }, 200);

    return () => { window.removeEventListener('googleMapsLoaded', onMapsLoaded); clearInterval(interval); };
  }, [order]);

  return <div id={`map-${order.id}`} style={{ width: "400px", height: "300px" }}></div>;
}
