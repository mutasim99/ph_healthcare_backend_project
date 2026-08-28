import express, { Application, Request, Response } from "express";
import { indexRoutes } from "./app/Routes/indexRoutes";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use("/api/v1", indexRoutes);

export default app;
