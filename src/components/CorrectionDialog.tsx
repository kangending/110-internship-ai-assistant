import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { linHaoCase } from "../data/linHao";

const defaultNote =
  "我其实刚学完集合，多线程还不会。MySQL 也只会增删改查，学生管理系统只是学校 JDBC 作业。我现在应该算 Java 初学者。";

export function CorrectionDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const [reason, setReason] = useState("基础没有这么完整");
  const [note, setNote] = useState(defaultNote);
  const [error, setError] = useState("");
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  function save() {
    if (!note.trim()) {
      setError("请写下实际情况");
      return;
    }
    if (
      !/集合/.test(note) ||
      !/多线程/.test(note) ||
      !/(增删改查|CRUD)/i.test(note) ||
      !/(JDBC|课程|作业)/i.test(note)
    ) {
      setError(
        "当前演示需要包含林浩关于集合、多线程、MySQL CRUD 和 JDBC 课程项目的纠正信息。",
      );
      return;
    }
    onSave(note);
  }
  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="correction-title"
      >
        <div className="dialog-head">
          <div>
            <span className="eyebrow">修正 AI 理解</span>
            <h2 id="correction-title">调整这条理解</h2>
          </div>
          <button
            className="icon-button"
            aria-label="关闭弹窗"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        <div className="quote-box">
          <Sparkles size={16} />
          <span>你{linHaoCase.firstUnderstanding.inferred[0].statement}。</span>
        </div>
        <fieldset className="radio-group">
          <legend>哪部分不符合你的实际情况？</legend>
          {["基础没有这么完整", "AI 遗漏了我的相关经历", "其他"].map(
            (option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="reason"
                  checked={reason === option}
                  onChange={() => setReason(option)}
                />
                {option === "基础没有这么完整"
                  ? "我的基础没有这么完整"
                  : option}
              </label>
            ),
          )}
        </fieldset>
        <label htmlFor="correction-note">补充实际情况</label>
        <textarea
          id="correction-note"
          rows={5}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError("");
          }}
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button ghost small"
          onClick={() => {
            setNote(defaultNote);
            setError("");
          }}
        >
          载入林浩纠正信息
        </button>
        <div className="dialog-actions">
          <button className="button secondary" onClick={onClose}>
            取消
          </button>
          <button className="button primary" onClick={save}>
            保存并重新分析
          </button>
        </div>
      </div>
    </div>
  );
}
