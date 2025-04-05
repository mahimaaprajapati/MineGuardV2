import React from "react";
import MapComponent from "./components/MapComponent"; // Ensure correct path
import "./index.css"; // Import global styles

function App() {
  return (
    <div>
      <header style={headerStyles}>
        <h1>MineGuard - AI Hazard Prediction</h1>
      </header>
      <MapComponent />
    </div>
  );
}

// Header styling (you can add more styles here if needed)
const headerStyles = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f0f0f0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
};

export default App;
