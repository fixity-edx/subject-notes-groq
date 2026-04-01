import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearToken, getUser } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Toast from "../components/Toast";
import { LogOut, UploadCloud, Sparkles, Shield, Download, Trash2 } from "lucide-react";

const SUBJECTS = ["DSA","DBMS","OS","CN","AI","Maths","WT","Other"];

function Modal({ open, title, children, onClose }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-panel glass overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Library(){
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [notes, setNotes] = useState([]);
  const [activeSub, setActiveSub] = useState("DSA");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const notify = (title, message="") => { setToast({ title, message }); setTimeout(()=>setToast(null), 3200); };

  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("DSA");
  const [keywords, setKeywords] = useState("");
  const [file, setFile] = useState(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiNoteId, setAiNoteId] = useState(null);
  const [aiMode, setAiMode] = useState("summary"); // quiz
  const [aiResult, setAiResult] = useState("");

  const fetchNotes = async () => {
    try{
      const res = await api.get("/notes", { params: { subject: activeSub, q: search } });
      setNotes(res.data);
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  useEffect(()=>{ fetchNotes(); }, [activeSub, search]);

  const logout = async () => {
    try{ await api.post("/auth/logout", {}); }catch{}
    clearToken();
    window.location.href = "/login";
  };

  const uploadNote = async (e) => {
    e.preventDefault();
    if(!file) return notify("Missing file","Please select a file");
    try{
      const fd = new FormData();
      fd.append("title", title);
      fd.append("subject", subject);
      fd.append("keywords", keywords);
      fd.append("file", file);
      await api.post("/notes", fd, { headers: { "Content-Type": "multipart/form-data" } });
      notify("Uploaded","AI summary & quiz generated");
      setUploadOpen(false);
      setTitle(""); setKeywords(""); setFile(null);
      setActiveSub(subject);
      fetchNotes();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  const openAI = async (note) => {
    setAiOpen(true);
    setAiNoteId(note._id);
    setAiResult(note.aiSummary || "No AI result yet");
    setAiMode("summary");
  };

  const runAI = async () => {
    try{
      setAiResult("Thinking...");
      const res = await api.post(`/notes/${aiNoteId}/ai`, { mode: aiMode });
      setAiResult(res.data.result || "");
      fetchNotes();
    }catch(err){
      setAiResult(err?.response?.data?.message || err.message);
    }
  };

  const delNote = async (id) => {
    if(!confirm("Delete this note?")) return;
    try{
      await api.delete(`/notes/${id}`);
      notify("Deleted","Note removed");
      fetchNotes();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-panel glass p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-slate-200">
                <Sparkles size={16} />
                Integrated Subject Notes
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
                Notes Library Dashboard
              </h1>
              <p className="text-slate-300 mt-2">
                Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={()=>setUploadOpen(true)}><UploadCloud size={18}/> Upload Notes</Button>
              <Button variant="secondary" onClick={logout}><LogOut size={18}/> Logout</Button>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            <Input label="Search Notes" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by title/keywords/uploader..." />
            <div className="flex items-end justify-end gap-2">
              <div className="text-xs text-slate-400">
                Tip: AI summary & quiz auto-generated on upload.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {SUBJECTS.map(s => (
            <button key={s} onClick={()=>setActiveSub(s)} className={"px-4 py-2 rounded-full text-sm font-semibold border transition "+(activeSub===s?"bg-blue-500/25 border-blue-500/40 text-blue-100":"bg-white/5 border-white/10 text-slate-200 hover:bg-white/10")}>
              {s}
            </button>
          ))}
        </div>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length===0 ? <div className="text-slate-400">No notes found.</div> : null}
          {notes.map(n => (
            <div key={n._id} className="rounded-panel glass p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">{n.subject}</div>
                  <div className="font-extrabold text-lg mt-1">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-1">By {n.uploader?.name || "Unknown"}</div>
                </div>
                {isAdmin ? (
                  <button onClick={()=>delNote(n._id)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
                    <Trash2 size={18} />
                  </button>
                ) : null}
              </div>

              <div className="mt-3 text-xs text-slate-300">
                Keywords: <span className="text-slate-200">{n.keywords || "-"}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <a className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-semibold bg-white/10 hover:bg-white/15 border border-white/10"
                   href={n.fileUrl} target="_blank">
                  <Download size={18}/> Download
                </a>
                <Button className="flex-1" onClick={()=>openAI(n)}><Sparkles size={18}/> AI</Button>
              </div>

              {n.aiSummary ? (
                <div className="mt-4 text-sm text-slate-300 line-clamp-3">
                  <b className="text-slate-200">AI Summary:</b> {n.aiSummary}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <Modal open={uploadOpen} title="Upload Notes" onClose={()=>setUploadOpen(false)}>
          <form onSubmit={uploadNote} className="grid md:grid-cols-2 gap-4">
            <Input label="Title" required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="DBMS Normalization Notes" />
            <Select label="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Keywords" value={keywords} onChange={(e)=>setKeywords(e.target.value)} placeholder="normal forms, 1NF, 2NF, 3NF" />
            <div>
              <div className="text-sm text-slate-300 mb-2">Select File (PDF/TXT)</div>
              <input type="file" required onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            </div>
            <div className="flex items-end justify-end gap-2 md:col-span-2">
              <Button type="button" variant="secondary" onClick={()=>setUploadOpen(false)}>Cancel</Button>
              <Button type="submit">Upload + AI</Button>
            </div>
          </form>
        </Modal>

        <Modal open={aiOpen} title="AI - Summary / Quiz Generator" onClose={()=>setAiOpen(false)}>
          <div className="grid gap-4">
            <Select label="Mode" value={aiMode} onChange={(e)=>setAiMode(e.target.value)}>
              <option value="summary">Summarize Notes</option>
              <option value="quiz">Generate Quiz (10 MCQs)</option>
            </Select>
            <Button onClick={runAI}><Sparkles size={18}/> Run Groq AI</Button>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm whitespace-pre-wrap min-h-[140px]">
              {aiResult || "AI output will appear here..."}
            </div>
          </div>
        </Modal>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
