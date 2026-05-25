import { useCart } from "../context/CartContext";

export default function Payment() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return <div>Pay {total}</div>;
}          🔒 Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
}
