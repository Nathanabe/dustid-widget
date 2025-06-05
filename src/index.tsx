// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DustidWidget } from './DustidWidget'; // Import your component

// This part ensures React is available globally if needed by other scripts,
// though for a bundled component, it's usually encapsulated.
// window.React = React;
// window.ReactDOM = ReactDOM;

// Find the root element where your widget should be mounted
const rootElement = document.getElementById('dustid-root');

// Only render if the element exists in the DOM
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DustidWidget />
    </React.StrictMode>
  );
}