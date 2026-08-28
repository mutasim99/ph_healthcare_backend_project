import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/Routes/indexRoutes";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use("/api/v1", IndexRoutes);

export default app;
