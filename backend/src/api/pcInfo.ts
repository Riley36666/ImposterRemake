import express, { Request, Response } from "express";
import {getPublicIP, getPcInfo, getUser, discord} from './helperFunctions';
const router = express.Router();


router.get("/", async (req:Request, res:Response) => {
  console.log("Pc info");
  const info = await getPcInfo();
  res.json(info);
})


router.get("/user", async (req: Request, res: Response) => {
  const user = await getUser();
  res.json(user);
});

router.get("/ip", async (req: Request, res: Response) => {
  const ip = await getPublicIP();
  res.json(ip);
})

router.get("/discord", async (req: Request, res: Response) => {
  try {
    await discord();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send webhook" });
  }
});



export default router