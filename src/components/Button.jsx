export default function Button({ children, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-black text-white px-5 py-2 rounded-xl shadow hover:opacity-90 transition w-full"
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
