import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import api from "./api/NormalGameAPI";
import mrWhite from "./api/mrWhite";
import cors from "cors";



dotenv.config();
const port = 9999;
const app = express();
app.use(cors(
    {origin: "*" }
));
app.use(express.json());

app.use('/api/', api);
app.use('/mrWhite', mrWhite);
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

function startServer() {
    try{
        app.listen(port,"0.0.0.0", () => {      
            console.log( `Server started at http://localhost:${port}`);
        });
    } catch {
        console.log("error")
    }
};

startServer()
