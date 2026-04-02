import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const products = [/* same 10 products */];

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === Number(id));

  if (!product) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 bg-white m-4 rounded-xl shadow">
      <img src={product.image} className="h-64 w-full object-cover" />

      <h1 className="text-xl font-bold mt-4">{product.name}</h1>

      <p className="text-[#7C3AED] font-bold mt-2">
        {formatCurrency(product.price)}
      </p>

      <button
        onClick={() => addToCart(product)}
        className="mt-6 w-full bg-[#7C3AED] text-white py-3 rounded-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}
