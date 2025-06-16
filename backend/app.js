import express from "express";
import cors from "cors";
import { createServer } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connecttoSocket from "./src/controllers/socketManager.js";
dotenv.config();
import Userroutes from "./src/routes/UserRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api/v1/users",Userroutes);


const server = createServer(app);
const io = connecttoSocket(server)

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



server.listen(process.env.PORT, () => {
  console.log("server running...");

});
