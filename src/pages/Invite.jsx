import { useLocation } from "react-router-dom";
import Button from "../components/Button";

export default function Invite() {
  const { state } = useLocation();

  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h1 className="text-xl font-bold">
        Invite your friend to receive this gift 🎁
      </h1>

      <p className="mt-3 text-gray-600">
        {state?.recipient} isn’t on Dustid yet.
      </p>

      <div className="mt-6">
        <Button onClick={() => alert("Invite link sent!")}>
          Send Invite Link
        </Button>
      </div>
    </div>
  );
}
