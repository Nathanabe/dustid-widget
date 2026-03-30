import { useLocation } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();

  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="text-4xl">🎉</div>

      <h1 className="text-2xl font-bold mt-4">
        Gift Sent Successfully!
      </h1>

      <p className="mt-3 text-gray-600">
        Your gift to <strong>{state?.recipient}</strong> is on its way.
      </p>

      <p className="mt-2 italic text-gray-500">
        "{state?.message}"
      </p>

      <div className="mt-6 bg-gray-100 p-4 rounded-xl text-sm">
        <p><strong>Status:</strong> Awaiting recipient response</p>
      </div>
    </div>
  );
}
