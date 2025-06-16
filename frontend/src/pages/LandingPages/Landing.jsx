import React from "react";
import Particles from "./Particles";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      <Particles
        particleColors={["#1FA848", "#1FA848"]}
        particleCount={700}
        particleSpread={5}
        speed={0.5}
        particleBaseSize={500}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <h1 style={{ color: "white", fontSize: "10rem", marginBottom: "1rem" }}>
          We Meet
        </h1>
        <div>
          <Link to="/login">
            <button
              style={{
                padding: "0.5rem 1.5rem",
                fontSize: "1.2rem",
                marginRight: "1rem",
                backgroundColor: "#1FA848",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </Link>
          <Link to="/register">
            <button
              style={{
                padding: "0.5rem 1.5rem",
                fontSize: "1.2rem",
                backgroundColor: "#1FA848",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </Link>
          <Link to="/:url">
            <button
              style={{
                padding: "0.5rem 1.5rem",
                fontSize: "1.2rem",
                marginLeft: "1.2rem",
                backgroundColor: "#1FA848",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            > 
              Guest
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
