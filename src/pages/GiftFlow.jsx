import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import Button from "../components/Button";

export default function GiftFlow() {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const resolveRecipient = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/recipient/resolve", { recipient });

      setStep(2);
    } catch (err) {
      setError("Recipient not on Dustid. Redirecting to invite...");
      setTimeout(() => {
        navigate("/invite", { state: { recipient } });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold">Send a Gift 🎁</h2>
          <input
            className="border p-3 w-full mt-4 rounded-lg"
            placeholder="Enter phone or name"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <p className="text-green-600 text-sm mt-2">
            ✔ No address needed — recipient will confirm delivery
          </p>

          {error && <ErrorMessage message={error} />}
          {loading && <Loader />}

          <div className="mt-4">
            <Button onClick={resolveRecipient} loading={loading}>
              Continue →
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-gray-500"
          >
            ← Change Recipient
          </button>

          <h2 className="text-xl font-semibold mt-4">
            Add a Message
          </h2>

          <textarea
            className="border w-full p-3 mt-3 rounded-lg"
            rows="4"
            placeholder="Write something nice..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mt-4">
            <Button
              onClick={() =>
                navigate("/checkout", { state: { recipient, message } })
              }
            >
              Proceed to Checkout →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
