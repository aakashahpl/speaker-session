import express from "express";
import bodyParser from "body-parser";
import {connectToDB} from "./utils/db";
import route1 from "./api/user";
import route2 from "./api/speaker"
import route3 from "./api/booking";
import { createTables } from "./utils/table";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import { sendMail } from "./utils/mailservice";


// initialize MySql tables if they don't exist in database
// createTables();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  };

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/",route1);
app.use("/speaker",route2);
app.use("/booking",route3);

app.get("/test",async(req,res)=>{
    res.send("api working correctly");
})

connectToDB();

const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`server is running on Port ${PORT}`);
}) 