import fs from "fs";
import Note from "../models/Note.js";
import { summarizeNotes, generateQuiz } from "../services/groqService.js";

function safeTextFromFile(filePath){
  // If it's a txt file: read content. For pdf we do not parse (kept simple for mini project)
  // Students can upload TXT to see best AI output.
  try{
    const ext = filePath.split(".").pop().toLowerCase();
    if(ext === "txt" || ext === "md"){
      return fs.readFileSync(filePath, "utf-8").slice(0, 8000);
    }
    return "";
  }catch{
    return "";
  }
}

export async function listNotes(req, res, next){
  try{
    const { subject, q } = req.query;
    const filter = {};

    if(subject) filter.subject = subject;
    if(q){
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { keywords: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Note.find(filter).populate("uploader", "name email").sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function createNote(req, res, next){
  try{
    const { title, subject, keywords } = req.body;
    if(!req.file){ res.status(400); throw new Error("File missing"); }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const note = await Note.create({
      title,
      subject,
      keywords: keywords || "",
      uploader: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
    });

    // AI auto-generate on upload
    const text = safeTextFromFile(req.file.path);
    if(text){
      note.aiSummary = await summarizeNotes({ title, subject, keywords, text });
      note.aiQuiz = await generateQuiz({ title, subject, keywords, text });
      await note.save();
    }

    res.status(201).json(note);
  }catch(err){ next(err); }
}

export async function runAI(req, res, next){
  try{
    const { id } = req.params;
    const { mode } = req.body;

    const note = await Note.findById(id).populate("uploader", "name email");
    if(!note){ res.status(404); throw new Error("Note not found"); }

    // only admin or owner
    if(req.user.role !== "admin" && note.uploader._id.toString() !== req.user._id.toString()){
      res.status(403); throw new Error("Forbidden");
    }

    // try read text from uploaded file
    const filename = note.fileUrl.split("/uploads/")[1];
    const filepath = `uploads/${filename}`;
    const text = safeTextFromFile(filepath);

    if(!text){
      res.status(400);
      throw new Error("AI works best with .txt/.md uploads in this mini project.");
    }

    let result = "";
    if(mode === "quiz"){
      result = await generateQuiz({ title: note.title, subject: note.subject, keywords: note.keywords, text });
      note.aiQuiz = result;
    }else{
      result = await summarizeNotes({ title: note.title, subject: note.subject, keywords: note.keywords, text });
      note.aiSummary = result;
    }

    await note.save();
    res.json({ result });
  }catch(err){ next(err); }
}

export async function deleteNote(req, res, next){
  try{
    const { id } = req.params;
    const note = await Note.findById(id);
    if(!note){ res.status(404); throw new Error("Note not found"); }

    if(req.user.role !== "admin"){
      res.status(403); throw new Error("Admin only");
    }

    await note.deleteOne();
    res.json({ message: "Deleted" });
  }catch(err){ next(err); }
}
