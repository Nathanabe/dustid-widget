import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-bold">Review Order</h1>

      <div className="mt-4 space-y-2 text-gray-700">
        <p><strong>Recipient:</strong> {state?.recipient}</p>
        <p><strong>Message:</strong> {state?.message}</p>
        <p><strong>Gift:</strong> Sneakers</p>
        <p><strong>Total:</strong> £25,000</p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 text-sm"
        >
          ← Edit Details
        </button>

        <Button
          onClick={() => navigate("/payment", { state })}
        >
          Proceed to Payment →
        </Button>
      </div>
    </div>
  );
}
