import { Product } from "../types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow p-3 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <motion.img
        src={product.image}
        className="h-40 w-full object-cover rounded"
      />

      <h2 className="mt-2">{product.name}</h2>

      <p className="text-[#7C3AED] font-bold">
        {formatCurrency(product.price)}
      </p>
    </motion.div>
  );
}
