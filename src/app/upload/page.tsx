"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadDropzone from "@/components/upload/UploadDropzone";
import { ParsedQuestion } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("post-assessment");
  const [week, setWeek] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError("");

    // Client-side preview using dynamic import of xlsx
    try {
      const XLSX = await import("xlsx");
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
      });

      const parsed: ParsedQuestion[] = [];
      for (let i = 8; i < rawData.length && parsed.length < 5; i++) {
        const row = rawData[i];
        if (!row) continue;
        const text = row[1];
        if (!text || String(text).trim() === "") continue;

        const correctStr = String(row[7] ?? "");
        const correctIndices = correctStr.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));

        parsed.push({
          number: Number(row[0]) || parsed.length + 1,
          text: String(text),
          answers: [row[2], row[3], row[4], row[5]]
            .filter((a) => a !== null && a !== undefined && String(a).trim() !== "")
            .map((a, idx) => ({
              id: idx + 1,
              text: String(a),
              isCorrect: correctIndices.includes(idx + 1),
            })),
          timeLimit: parseInt(String(row[6] ?? "30")) || 30,
          correctAnswerIndices: correctIndices,
        });
      }
      setPreview(parsed);
    } catch {
      // Preview parsing failed - not critical
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !type) {
      setError("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", type);
      formData.append("description", description);
      if (week) formData.append("week", week);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      router.push(`/assessments/${data.assessmentId}`);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Upload Assessment</h1>
        <p className="text-[var(--muted-foreground)]">
          Upload an XLSX file to add a new assessment.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dropzone */}
        <UploadDropzone onFileSelect={handleFileSelect} disabled={uploading} />

        {file && (
          <div className="card p-4 flex items-center gap-3">
            <svg className="h-8 w-8 text-kahoot-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setPreview([]); }}
              className="text-[var(--muted-foreground)] hover:text-incorrect"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-medium mb-3">Preview (first {preview.length} questions)</h3>
            <div className="space-y-2">
              {preview.map((q, i) => (
                <div key={i} className="text-sm p-2 rounded-lg bg-[var(--muted)]">
                  <span className="font-medium">Q{q.number}:</span> {q.text}
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {q.answers.length} answers | {q.timeLimit}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Form */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 4 Post-Assessment"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this assessment"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="pre-assessment">Pre-Assessment</option>
                <option value="post-assessment">Post-Assessment</option>
                <option value="combined">Combined</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Week</label>
              <input
                type="number"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="e.g. 4"
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-incorrect/10 text-incorrect text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="w-full px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading & Processing..." : "Upload Assessment"}
        </button>
      </div>
    </div>
  );
}
