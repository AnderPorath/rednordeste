import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import apiRouter from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

app.use("/api", apiRouter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT);
