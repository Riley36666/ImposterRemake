import dotenv from "dotenv";
import express from "express";
import api from "./api/NormalGameAPI";
import mrWhite from "./api/mrWhite";
import pc from "./api/pcInfo";
import cors from "cors";
import path from "path";

dotenv.config();
const PORT = Number(process.env.port) || 9999;
const app = express();

// 🔥 ONE correct build path
const buildPath = path.resolve(__dirname, "../../frontend/build");

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ 1. API routes FIRST
app.use('/api', api);
app.use('/mrWhite', mrWhite);
app.use('/pc', pc);

// ✅ 2. Static files SECOND
app.use(express.static(buildPath));

// ✅ 3. React fallback LAST
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at http://localhost:${PORT}`);
});