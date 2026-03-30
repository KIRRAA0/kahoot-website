"use client";

import { cn } from "@/lib/cn";
import { useMemo } from "react";

// Syntax highlighting token rules (order matters - first match wins)
const TOKEN_RULES: { pattern: RegExp; className: string }[] = [
  { pattern: /\/\/.*$/gm, className: "text-slate-500 italic" },
  { pattern: /'[^']*'|"[^"]*"/g, className: "text-amber-300" },
  { pattern: /\b(import|export|library|part|class|extends|implements|with|abstract|mixin|enum|typedef|void|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|rethrow|async|await|yield|sync|new|const|final|var|late|required|static|get|set|operator|factory|external|covariant|dynamic|is|as|in)\b/g, className: "text-purple-400 font-semibold" },
  { pattern: /\b(int|double|num|String|bool|List|Map|Set|Future|Stream|Iterable|Object|Function|Null|void|Never|Type|Symbol|BigInt)\b/g, className: "text-cyan-400" },
  { pattern: /\b(Widget|State|BuildContext|StatelessWidget|StatefulWidget|Key|Navigator|MaterialApp|Scaffold|AppBar|Container|Column|Row|Text|Center|Expanded|Padding|SizedBox|ListView|GridView|Stack|Positioned|Align|Flexible|Wrap|Card|Icon|Image|FloatingActionButton|ElevatedButton|TextButton|IconButton|TextField|Form|Drawer|BottomNavigationBar|TabBar|TabBarView|PageView|StreamBuilder|FutureBuilder|ValueNotifier|ChangeNotifier|Provider|Consumer|InheritedWidget|GestureDetector|MediaQuery|Theme|TextStyle|EdgeInsets|BoxDecoration|BorderRadius|Colors|Icons)\b/g, className: "text-emerald-400" },
  { pattern: /\b(setState|initState|dispose|build|createState|didChangeDependencies|didUpdateWidget|deactivate|reassemble|print|debugPrint|runApp|main|super)\b/g, className: "text-blue-400" },
  { pattern: /\b(true|false|null|this)\b/g, className: "text-orange-400" },
  { pattern: /\b\d+\.?\d*\b/g, className: "text-orange-300" },
  { pattern: /@\w+/g, className: "text-yellow-400" },
  { pattern: /[{}()\[\];,.:]/g, className: "text-slate-400" },
  { pattern: /[=+\-*/<>!&|^~%?]+/g, className: "text-pink-400" },
];

function highlightCode(code: string): React.ReactNode[] {
  const tokens: { start: number; end: number; className: string; text: string }[] = [];

  for (const rule of TOKEN_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    while ((match = regex.exec(code)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        className: rule.className,
        text: match[0],
      });
    }
  }

  tokens.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered: typeof tokens = [];
  let lastEnd = 0;
  for (const token of tokens) {
    if (token.start >= lastEnd) {
      filtered.push(token);
      lastEnd = token.end;
    }
  }

  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (let i = 0; i < filtered.length; i++) {
    const token = filtered[i];
    if (token.start > pos) {
      nodes.push(<span key={`t-${pos}`} className="text-slate-300">{code.slice(pos, token.start)}</span>);
    }
    nodes.push(<span key={`h-${i}`} className={token.className}>{token.text}</span>);
    pos = token.end;
  }
  if (pos < code.length) {
    nodes.push(<span key={`t-${pos}`} className="text-slate-300">{code.slice(pos)}</span>);
  }

  return nodes;
}

// Format single-line code: split at ; and { } with proper indentation
function formatCode(code: string): string {
  if (code.includes("\n")) return reindent(code);

  const chars = code.trim();
  const lines: string[] = [];
  let current = "";
  let inString: string | null = null;
  let depth = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (inString) {
      current += ch;
      if (ch === inString && chars[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === "{") {
      current += " {";
      lines.push("  ".repeat(depth) + current.trim());
      current = "";
      depth++;
      while (i + 1 < chars.length && chars[i + 1] === " ") i++;
      continue;
    }

    if (ch === "}") {
      if (current.trim()) {
        lines.push("  ".repeat(depth) + current.trim());
        current = "";
      }
      depth = Math.max(0, depth - 1);
      lines.push("  ".repeat(depth) + "}");
      while (i + 1 < chars.length && chars[i + 1] === " ") i++;
      continue;
    }

    if (ch === ";") {
      current += ";";
      lines.push("  ".repeat(depth) + current.trim());
      current = "";
      while (i + 1 < chars.length && chars[i + 1] === " ") i++;
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    lines.push("  ".repeat(depth) + current.trim());
  }

  return lines.join("\n");
}

function reindent(code: string): string {
  const lines = code.split("\n");
  let depth = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("}")) depth = Math.max(0, depth - 1);
      const result = "  ".repeat(depth) + trimmed;
      depth += (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
      if (depth < 0) depth = 0;
      return result;
    })
    .join("\n");
}

// ─── Segment types ─────────────────────────────────────────────
type Segment =
  | { type: "text"; content: string }
  | { type: "inline-code"; content: string }
  | { type: "code-block"; content: string };

// ─── Backtick-based parsing ────────────────────────────────────
function parseBacktickSegments(text: string): Segment[] | null {
  if (!text.includes("`")) return null;

  const segments: Segment[] = [];
  const regex = /```([\s\S]*?)```|`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "code-block", content: match[1].trim() });
    } else if (match[2] !== undefined) {
      segments.push({ type: "inline-code", content: match[2] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

// ─── Auto-detection fallback (strict) ──────────────────────────
function isActualCode(text: string): boolean {
  const hasSemicolon = text.includes(";");
  const hasBraces = /\{[\s\S]*\}/.test(text);
  const hasParensWithDot = /\.\w+\(/.test(text);
  const hasFunctionCall = /\w+\([^)]*\)/.test(text);
  const hasAssignment = /\b\w+\s*=\s*\w/.test(text);

  return hasSemicolon && (hasBraces || hasParensWithDot || (hasFunctionCall && hasAssignment));
}

function autoDetectSegments(text: string): Segment[] {
  // Try splitting at separators: —, ?, :
  // Code can be BEFORE or AFTER the separator
  const separators = [
    { regex: /^([\s\S]+?)\s*—\s*([\s\S]+)$/, sepInBefore: true },
    { regex: /^([\s\S]+?\?)\s+([\s\S]+)$/, sepInBefore: false },
  ];

  for (const { regex } of separators) {
    const match = text.match(regex);
    if (match) {
      const before = match[1];
      const after = match[2];
      const beforeIsCode = isActualCode(before);
      const afterIsCode = isActualCode(after);

      // Code AFTER separator: "What is the output? code_here"
      if (afterIsCode && !beforeIsCode) {
        return [
          { type: "text", content: before + " " },
          { type: "code-block", content: after.trim() },
        ];
      }

      // Code BEFORE separator: "code_here; — Output?"
      if (beforeIsCode && !afterIsCode) {
        return [
          { type: "code-block", content: before.trim() },
          { type: "text", content: " " + after },
        ];
      }
    }
  }

  // If the entire text is code
  if (isActualCode(text)) {
    return [{ type: "code-block", content: text }];
  }

  return [{ type: "text", content: text }];
}

function parseSegments(text: string): Segment[] {
  const backtickResult = parseBacktickSegments(text);
  if (backtickResult) {
    // Upgrade inline-code to code-block if it contains multi-statement code
    return backtickResult.map((seg) => {
      if (seg.type === "inline-code" && (seg.content.includes(";") || /\{[\s\S]*\}/.test(seg.content))) {
        return { type: "code-block" as const, content: seg.content };
      }
      return seg;
    });
  }
  return autoDetectSegments(text);
}

// ─── Component ─────────────────────────────────────────────────
interface CodeTextProps {
  text: string;
  className?: string;
}

export default function CodeText({ text, className }: CodeTextProps) {
  const segments = useMemo(() => parseSegments(text), [text]);

  if (segments.length === 1 && segments[0].type === "text") {
    return <span className={cn("whitespace-pre-wrap", className)}>{text}</span>;
  }

  return (
    <div className={className}>
      {segments.map((segment, i) => {
        if (segment.type === "code-block") {
          const formatted = formatCode(segment.content);
          return (
            <div key={i} className="mt-3 mb-2">
              <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-lg">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono ml-2">main.dart</span>
                </div>
                {/* Code content */}
                <div className="px-5 py-4 bg-[#0d1117] overflow-x-auto">
                  <pre className="whitespace-pre font-mono text-sm leading-7 m-0 p-0 bg-transparent">
                    <code>{highlightCode(formatted)}</code>
                  </pre>
                </div>
              </div>
            </div>
          );
        }

        if (segment.type === "inline-code") {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded-md bg-slate-800/90 text-emerald-400 font-mono text-[0.85em] border border-slate-700/50"
            >
              {highlightCode(segment.content)}
            </code>
          );
        }

        return <span key={i}>{segment.content}</span>;
      })}
    </div>
  );
}
