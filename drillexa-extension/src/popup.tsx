import { useState } from "react"

function IndexPopup() {
  return (
    <div style={{ padding: 16, width: "200px", background: "#072138", color: "white" }}>
      <h2>Drillexa</h2>
      <p>La extensión está activa.</p>
      <button 
        onClick={() => window.open("https://dibylocal.com:5173", "_blank")}
        style={{
            background: "#00c3ff", border: "none", padding: "8px", 
            width: "100%", cursor: "pointer", fontWeight: "bold"
        }}>
        Ir al Dashboard
      </button>
    </div>
  )
}

export default IndexPopup