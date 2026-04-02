import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const fee = 5;
  const total = subtotal + fee;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-[#7C3AED]">Checkout</h1>

      <p>Total: {formatCurrency(total)}</p>

      <button
        onClick={() => navigate("/payment")}
        className="mt-4 bg-[#7C3AED] text-white px-4 py-2"
      >
        Proceed
      </button>
    </div>
  );
}
