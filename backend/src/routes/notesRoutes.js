import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { createRules, aiRules } from "../validators/notesValidators.js";
import { listNotes, createNote, runAI, deleteNote } from "../controllers/notesController.js";

const router = Router();

router.get("/", protect, listNotes);
router.post("/", protect, requireRole("user","admin"), upload.single("file"), createRules, validate, createNote);
router.post("/:id/ai", protect, aiRules, validate, runAI);
router.delete("/:id", protect, requireRole("admin"), deleteNote);

export default router;
