import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, setOpen }: any) {
  const { cart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-white p-5"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
          >
            <h2 className="font-bold text-[#7C3AED]">Your Cart</h2>

            {cart.map((item) => (
              <p key={item.id}>
                {item.name} - {formatCurrency(item.price)}
              </p>
            ))}

            <p className="mt-4 font-bold">
              Total: {formatCurrency(total)}
            </p>

            <button
              onClick={() => {
                navigate("/gift");
                setOpen(false);
              }}
              className="mt-4 w-full bg-[#7C3AED] text-white py-3 rounded"
            >
              Send as Gift 🎁
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
