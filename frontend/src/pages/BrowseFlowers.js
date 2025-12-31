export default function BrowseFlowers() {
  return (
    <div>
      <h1>Browse Flowers</h1>

      <div>
        <label>Price</label>
        <input placeholder="Max price" />
      </div>

      <div>
        <label>Occasion</label>
        <input placeholder="Birthday, Wedding..." />
      </div>

      <ul>
        <li>Red Roses – Ksh 1500</li>
        <li>Sunflowers – Ksh 1200</li>
      </ul>
    </div>
  );
}
