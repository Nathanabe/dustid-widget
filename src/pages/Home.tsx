import ProductCard from "../components/ProductCard";

const products = [
  { id: 1, name: "Sneakers", price: 250, image: "/shoe.jpg" },
  { id: 2, name: "Luxury Watch", price: 400, image: "/watch.jpg" },
  { id: 3, name: "Perfume", price: 120, image: "/perfume.jpg" },
  { id: 4, name: "Leather Bag", price: 300, image: "/bag.jpg" },
  { id: 5, name: "Sunglasses", price: 150, image: "/glasses.jpg" },
  { id: 6, name: "Headphones", price: 220, image: "/headphones.jpg" },
  { id: 7, name: "Smartphone", price: 650, image: "/phone.jpg" },
  { id: 8, name: "Gaming Console", price: 500, image: "/console.jpg" },
  { id: 9, name: "Wrist Bracelet", price: 80, image: "/bracelet.jpg" },
  { id: 10, name: "Laptop", price: 900, image: "/laptop.jpg" },
];

export default function Home() {
  return (
    <div className="p-6 pb-20">
      <h1 className="text-2xl text-[#7C3AED] font-bold">
        Discover Gifts 🎁
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
