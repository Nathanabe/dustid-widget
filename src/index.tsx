import { createRoot } from "react-dom/client";
import { DustidWidget } from "./DustidWidget";
import "./widget.css";

// Expose a global function for embedding
(window as any).DustidWidget = function (options: { mountId?: string; userName?: string } = {}) {
  const mountId = options.mountId || "dustid-root";
  const mountNode = document.getElementById(mountId);
  if (mountNode) {
    createRoot(mountNode).render(<DustidWidget {...options} />);
  }
}; 