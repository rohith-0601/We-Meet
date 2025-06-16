import React, { useState } from "react";
import Squares from "./Squares";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios"

function Register() {
  const navigate = useNavigate();
  let [name, setname] = useState("");
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  const handlesubmit = async(e) =>{
    e.preventDefault();
    try {
        const res = await axios.post("http://localhost:5001/api/v1/users/register",{
            name,
            username,
            password
        });
        if(res.status === 201){
            navigate("/Home");
        }
        else{
            alert(res.data.message);
        }
        
    } catch (error) {
         alert(error.response?.data?.message || "Registration failed");    
    }
  }

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
          direction="up"
          borderColor="#1FA848"
          hoverFillColor="#1FA848"
        />
      </div>

      {/* Login form */}
      <div className="login-form" style={{ overflowY: "auto" }}>
        <h1>We Meet</h1>
        <h2>Sign Up</h2>
        <form onSubmit={handlesubmit}>
          <input type="text" placeholder="Enter name" onChange={(e)=>setname(e.target.value)} />
          <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <a href="/login">LOGIN</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
