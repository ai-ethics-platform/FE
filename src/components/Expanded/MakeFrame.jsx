import React, { useState, useCallback, useRef, useEffect } from "react";
import frame2 from "../../assets/gameframe3.svg";
import editIcon from "../../assets/edit.svg";
import { Colors, FontStyles } from "../styleConstants";

export default function MakeFrame({
  value,
  defaultValue = "",
  onChange,
  onConfirm,
  maxLength = 30,
  placeholder = "제목을 입력하세요",
  editable = true,
  className,
  style,
}) {
  const isControlled = typeof value === "string";
  const [internal, setInternal] = useState(defaultValue);
  const text = isControlled ? value : internal;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text || "");
  const inputRef = useRef(null);

  const startEdit = useCallback(() => {
    if (!editable) return;
    setDraft(text || "");
    setEditing(true);
  }, [editable, text]);

  const apply = useCallback(() => {
    const next = (draft || "").slice(0, maxLength);
    if (!isControlled) setInternal(next);
    onChange?.(next);
    onConfirm?.(next);
    setEditing(false);
  }, [draft, isControlled, maxLength, onChange, onConfirm]);

  const cancel = useCallback(() => {
    setDraft(text || "");
    setEditing(false);
  }, [text]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // 텍스트 길이에 따른 스타일 결정
 const currentText = editing ? draft : text;
 const textLength = (currentText || "").length;
 const textStyle = textLength < 15 
   ? (FontStyles.headlineSmall )
   : textLength < 23
   ? (FontStyles.title )
   : (FontStyles.bodyBold );

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 1240,
        margin: "0 auto",
        ...style,
      }}
    >
      {/* 프레임 */}
      <img src={frame2} alt="" style={{ width: "100%", display: "block" }} />

      {/* 콘텐츠 레이어 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          paddingInline: 32,
        }}
      >
        {/* 중앙 텍스트/입력 */}
        {!editing ? (
          <div
            style={{
              ...textStyle,
              color: Colors.creatorgrey01,
              textAlign: "center",
              lineHeight: 1.2,
              wordBreak: "keep-all",
              paddingInline: 16,
            }}
          >
            {text?.length ? text : <span style={{ opacity: 0.6 }}>{placeholder}</span>}
          </div>
        ) : (
          <div style={{ position: "relative", width: "80%" }}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
              onBlur={apply}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
                if (e.key === "Escape") cancel();
              }}
              maxLength={maxLength}
              placeholder=""
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                textAlign: "center",
                color: Colors.creatorgrey01,
                ...textStyle,
              }}
            />
            {/* 커스텀 placeholder */}
            {!draft && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "grid",
                  placeItems: "center",
                  color: Colors.creatorgrey01,
                  opacity: 0.6,
                  pointerEvents: "none",
                  textAlign: "center",
                  ...textStyle,
                }}
              >
                {placeholder}
              </div>
            )}
          </div>
        )}

        {/* 우상단 연필 버튼 */}
        {editable && !editing && (
          <button
            type="button"
            onClick={startEdit}
            style={{
              position: "absolute",
              right: 36,
              top: 18,
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img src={editIcon} alt="" style={{ width: 22, height: 22 }} />
          </button>
        )}
      </div>
    </div>
  );
}