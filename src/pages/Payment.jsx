import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";

export default function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);

    setTimeout(() => {
      navigate("/confirmation", { state });
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-bold">Payment</h1>

      <p className="mt-4 text-gray-600">Amount: £25,000</p>

      {loading && <Loader />}

      <div className="mt-6 space-y-2">
        <Button onClick={handlePayment} loading={loading}>
          Pay Now
        </Button>

        <button className="border p-3 w-full rounded-lg">
          Pay with Bank Transfer
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">
          🔒 Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
}
