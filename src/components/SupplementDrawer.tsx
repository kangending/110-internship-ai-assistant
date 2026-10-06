import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supplementOptions, type SupplementKey, type Supplements } from "../data/supplementOptions";

export function SupplementDrawer({ initial, locked = [], onClose, onSave }: {
  initial: Supplements;
  locked?: SupplementKey[];
  onClose: () => void;
  onSave: (value: Supplements) => void;
}) {
  const [draft, setDraft] = useState<Supplements>(initial);
  const [error, setError] = useState("");
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  function save() {
    if (!Object.values(draft).some(Boolean)) { setError("请至少补充一项信息"); return; }
    onSave(draft);
  }
  return <div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="drawer supplement-drawer" role="dialog" aria-modal="true" aria-labelledby="supplement-title">
      <div className="drawer-header"><div><span className="eyebrow">完善当前情况</span><h2 id="supplement-title">补充影响判断的关键信息</h2><p>只需回答你确定的部分，未选择的仍会保留为待确认。</p></div><button className="icon-button" aria-label="关闭补充信息" onClick={onClose}><X size={20}/></button></div>
      <div className="drawer-content">{(Object.keys(supplementOptions) as SupplementKey[]).map((key, index) => {
        const item = supplementOptions[key];
        return <fieldset className="supplement-group" key={key} disabled={locked.includes(key)}><legend><span className="layer-number">0{index + 1} / {item.topic}{locked.includes(key) ? " · 已由用户纠正确认" : ""}</span></legend><div className="supplement-choices">{item.options.map(option => <label key={option.label} className={`supplement-option ${draft[key] === option.label ? "selected" : ""}`}><input type="radio" name={`supplement-${key}`} checked={draft[key] === option.label} onChange={() => { setDraft(current => ({ ...current, [key]: option.label })); setError(""); }}/><span className="supplement-option-copy"><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</div></fieldset>;
      })}</div>
      <div className="drawer-actions"><div>{error && <span className="field-error" role="alert">{error}</span>}</div><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={save}>保存补充信息</button></div>
    </aside>
  </div>;
}
