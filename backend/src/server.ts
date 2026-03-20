import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import api from "./api/NormalGameAPI";
import mrWhite from "./api/mrWhite";
import pc from "./api/pcInfo";
import cors from "cors";


dotenv.config();
const PORT = Number(process.env.port) || 9999;
const app = express();
app.use(cors(
    {origin: "*" }
));
app.use(express.json());

// API routes
app.use('/api/', api);
app.use('/mrWhite', mrWhite);
app.use('/pc', pc); // Don't take seriously will only use this with PostMan


// Little Thing if someone opens the server (need to change to the built version of the front end)  
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

function startServer() {
    try{
        app.listen(PORT,"0.0.0.0", () => {      
            console.log( `Server started at http://localhost:${PORT}`);
        });
    } catch {
        console.log("error")
    }
};






startServer()
