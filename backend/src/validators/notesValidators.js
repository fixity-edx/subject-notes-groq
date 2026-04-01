import { body } from "express-validator";

export const createRules = [
  body("title").trim().isLength({ min: 2 }).withMessage("Title required"),
  body("subject").trim().isLength({ min: 2 }).withMessage("Subject required"),
  body("keywords").optional().trim(),
];

export const aiRules = [
  body("mode").optional().isIn(["summary","quiz"]).withMessage("Invalid mode"),
];
