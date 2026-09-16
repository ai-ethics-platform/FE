const BOM = "﻿";
const ESCAPE_PATTERN = /[",\n\r]/;

function escapeCsvField(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return ESCAPE_PATTERN.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsvRow(fields) {
  return fields.map(escapeCsvField).join(",");
}

// admin-be의 messages_to_rows(app/lib/transcript.py)와 동일하게: system 메시지는
// 제외하고, user만 "사용자", 나머지는 전부 "챗봇"으로 매핑한다.
function messagesToRows(messages) {
  return (messages || [])
    .filter((message) => message.role !== "system")
    .map((message) => ({
      speaker: message.role === "user" ? "사용자" : "챗봇",
      content: message.content,
    }));
}

export function buildTranscriptCsv({
  sessionId,
  teacherName,
  teacherSchool,
  teacherEmail,
  startedAt,
  turnCount,
  messages,
}) {
  const downloadedAt = new Date().toISOString();
  const metaLines = [
    toCsvRow(["세션ID", sessionId]),
    toCsvRow(["이름", teacherName]),
    toCsvRow(["학교", teacherSchool]),
    toCsvRow(["이메일", teacherEmail]),
    toCsvRow(["대화시작시각", startedAt]),
    toCsvRow(["다운로드시각", downloadedAt]),
    toCsvRow(["턴수", turnCount]),
  ];

  const rows = messagesToRows(messages);
  const logLines = [
    toCsvRow(["발화자", "내용"]),
    ...rows.map((row) => toCsvRow([row.speaker, row.content])),
  ];

  return BOM + [...metaLines, "", ...logLines].join("\r\n");
}

// admin-be의 build_transcript_filename(app/lib/transcript.py)과 동일하게
// KST(UTC+9) 기준 yymmdd_이름_대화기록.csv 형식을 만든다.
function formatKstYyMmDd(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yy = String(kst.getUTCFullYear()).slice(2);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export function buildTranscriptFilename(startedAt, teacherName) {
  const datePart = formatKstYyMmDd(startedAt);
  const safeName = (teacherName || "")
    .trim()
    .replace(/[\\/:*?"<>|\r\n]+/g, "_");
  return [datePart, safeName, "대화기록"].filter(Boolean).join("_") + ".csv";
}

export function downloadTranscriptCsv(meta) {
  const csv = buildTranscriptCsv(meta);
  const filename = buildTranscriptFilename(meta.startedAt, meta.teacherName);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
