import React, { useState } from "react";
import Squares from "./Squares";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import server from "../../environment";

function LoginPage() {
  const navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${server.prod}/api/v1/users/login`, {
        username,
        password,
      });
      if (res.status >= 200 && res.status < 300) {
        navigate("/Home");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "loginfailed");
    }
  };
  return (
    <div className="login-container">
      {/* Squares background with desired style */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <Squares
          speed={1}
          squareSize={70}
          direction="down"
          borderColor="#1FA848"
          hoverFillColor="#1FA848"
        />
      </div>

      {/* Login form */}
      <div className="login-form" style={{ overflowY: "auto" }}>
        <h1>We Meet</h1>
        <h2>Login</h2>
        <form onSubmit={handlesubmit}>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have a account? <br /> <a href="/register">REGISTER HERE</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
