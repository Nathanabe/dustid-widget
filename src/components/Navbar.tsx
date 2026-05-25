import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between p-4 bg-white shadow">
        <h1 className="text-xl font-bold text-[#7C3AED]">Dustid</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#C4B5FD] px-4 py-2 rounded-lg"
        >
          Cart 🛒
        </button>
      </div>

      <CartDrawer open={open} setOpen={setOpen} />
    </>
  );
}
