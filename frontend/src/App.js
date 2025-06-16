import {BrowserRouter,Routes,Route} from "react-router-dom"
// import './App.css';
import LandingPage from "./pages/LandingPages/Landing";
import Login from "./pages/AuthenticationPages/LoginPage";
import Register from "./pages/AuthenticationPages/Registerpage";
import VideoMeet from "./pages/VideoPages/VideoMeet";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element= {<LandingPage/>}/>
        <Route path="/login" element= {<Login/>}/>
        <Route path="/register" element= {<Register/>}/>
        <Route path="/:url" element={<VideoMeet/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
