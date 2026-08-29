import express, { Application, NextFunction, Request, Response } from "express";
import { IndexRoutes } from "./app/Routes/indexRoutes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);
export default app;
