import { Router } from "express";
import {
  deleteSessionHandler,
  getSessionsHandler,
} from "../controllers/session.controller";

const sessionRoutes = Router();

// prefix /sessions
sessionRoutes.get("/", getSessionsHandler);
sessionRoutes.delete("/:id", deleteSessionHandler); // Assuming you have a deleteSessionHandler to handle session deletion

export default sessionRoutes;
