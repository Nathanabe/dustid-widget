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

            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p>{item.name}</p>
                    <p className="text-sm text-[#7C3AED]">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 font-bold">
              Total: {formatCurrency(total)}
            </p>

            <button
              onClick={() => {
                navigate("/gift");
                setOpen(false);
              }}
              className="mt-4 w-full bg-[#7C3AED] text-white py-3 rounded-lg"
            >
              Send as Gift 🎁
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}            </p>

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
