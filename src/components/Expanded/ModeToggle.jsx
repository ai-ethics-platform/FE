// components/ModeToggle.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Colors, FontStyles } from "../styleConstants";

export default function ModeToggle({
  value,                 
  defaultValue = "edit", 
  onChange,              
  width = 202,
  height,
  padding,
  editRoute,             
  previewRoute,         
  onEditClick,
  onPreviewClick,
}) {
  const navigate = useNavigate();

  const isControlled = value === "edit" || value === "preview";
  const [internal, setInternal] = useState(defaultValue);
  const mode = isControlled ? value : internal;

  const setModeOnly = useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const handleGo = useCallback(
    (next) => {
      setModeOnly(next);

      // 선택별 사용자 콜백
      if (next === "edit") onEditClick?.();
      if (next === "preview") onPreviewClick?.();

      // 선택별 이동 라우트
      if (next === "edit" && editRoute) navigate(editRoute);
      if (next === "preview" && previewRoute) navigate(previewRoute);
    },
    [setModeOnly, onEditClick, onPreviewClick, editRoute, previewRoute, navigate]
  );

  const BORDER ="#BB4E2D";
  const ACTIVE_BG = "#BB4E2D";
  const INACTIVE_BG = "#FFFFFF";
  const ACTIVE_TEXT = "#FFFFFF";
  const INACTIVE_TEXT = Colors.grey05;

  const commonBtn = useMemo(
    () => ({
      flex: 1,
      height,
      padding: 0,
      border: "none",
      outline: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 120ms ease, color 120ms ease",
      lineHeight: 1,
      ...FontStyles.body,
      userSelect: "none",
    }),
    [height]
  );

  const editActive = mode === "edit";
  const previewActive = mode === "preview";

  return (
    <div
      role="group"
      aria-label="모드 전환"
      style={{
        width,
        border: `1.2px solid ${BORDER}`,
        boxSizing: "border-box",
        padding,
        background: "#fff",
        display: "flex",
        gap: 0,
      }}
    >
      <button
        type="button"
        aria-pressed={editActive}
        onClick={() => handleGo("edit")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGo("edit")}
        style={{
          ...commonBtn,
          background: editActive ? ACTIVE_BG : INACTIVE_BG,
          color: editActive ? ACTIVE_TEXT : INACTIVE_TEXT,
        }}
      >
        편집 모드
      </button>

      <button
        type="button"
        aria-pressed={previewActive}
        onClick={() => handleGo("preview")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGo("preview")}
        style={{
          ...commonBtn,
          background: previewActive ? ACTIVE_BG : INACTIVE_BG,
          color: previewActive ? ACTIVE_TEXT : INACTIVE_TEXT,
          borderLeft: "0px solid transparent",
        }}
      >
        미리보기 모드
      </button>
    </div>
  );
}
