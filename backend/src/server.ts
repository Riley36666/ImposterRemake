import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import api from "./api/api"
import cors from "cors";



dotenv.config();
const port = process.env.PORT || 3001;
const app = express();
app.use(cors(
    {origin: "http://localhost:3000"}
));
app.use(express.json());

app.use('/api/', api);
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

function startServer() {
    try{
        app.listen(port, () => {      
            console.log( `server started at http://localhost:${port}`);
        });
    } catch {
        console.log("error")
    }
};

startServer()
