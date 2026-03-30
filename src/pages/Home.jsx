import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="text-center py-20 px-6">
        <h1 className="text-4xl font-bold leading-tight">
          Send Gifts Without  
          <span className="text-green-600"> Knowing Their Address</span>
        </h1>

        <p className="mt-4 text-gray-600 max-w-md mx-auto">
          Dustid lets you send gifts using just a phone number.
          The recipient handles delivery details — stress free.
        </p>

        <button
          onClick={() => navigate("/gift")}
          className="mt-6 bg-black text-white px-6 py-3 rounded-xl shadow"
        >
          Send a Gift 🎁
        </button>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Trusted by modern shoppers • Built for Africa 🌍
      </div>
    </div>
  );
}
