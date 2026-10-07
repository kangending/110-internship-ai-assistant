import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { DrawerPortal } from './DrawerPortal';
import { supplementOptions, type SupplementKey, type Supplements } from "../data/supplementOptions";

export function SupplementDrawer({ initial, generic = false, guidedDemo = false, onClose, onSave }: {
  initial: Supplements;
  generic?: boolean;
  guidedDemo?: boolean;
  onClose: () => void;
  onSave: (value: Supplements) => void;
}) {
  const [draft, setDraft] = useState<Supplements>(() => guidedDemo ? {
    threads: supplementOptions.threads.options[0].label,
    mysql: supplementOptions.mysql.options[0].label,
    tools: supplementOptions.tools.options[0].label,
    ...initial,
  } : initial);
  const [error, setError] = useState("");
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  function save() {
    if (generic ? !draft.general?.trim() : !(Object.keys(supplementOptions) as SupplementKey[]).some(key => !!draft[key])) { setError("请至少补充一项信息"); return; }
    onSave(draft);
  }
  return <DrawerPortal><div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="drawer supplement-drawer" role="dialog" aria-modal="true" aria-labelledby="supplement-title">
      <div className="drawer-header"><div><span className="eyebrow">完善当前情况</span><h2 id="supplement-title">{generic ? '补充岗位相关能力信息' : '补充影响判断的关键信息'}</h2><p>{generic ? '写下你明确知道的经历和能力；保存后仍可修改。' : '只需回答你确定的部分，未选择的仍会保留为待确认。'}</p></div><button className="icon-button" aria-label="关闭补充信息" onClick={onClose}><X size={20}/></button></div>
      <div className="drawer-content">{generic ? <label className="feedback-note" htmlFor="general-supplement">当前补充<textarea id="general-supplement" rows={7} value={draft.general ?? ''} onChange={event => { setDraft(current => ({ ...current, general: event.target.value })); setError(''); }} placeholder="补充你已经掌握、仍需学习或实践的内容"/></label> : (Object.keys(supplementOptions) as SupplementKey[]).map((key, index) => {
        const item = supplementOptions[key];
        return <fieldset className="supplement-group" key={key}><legend><span className="layer-number">0{index + 1} / {item.topic}</span></legend><div className="supplement-choices">{item.options.map(option => <label key={option.label} className={`supplement-option ${draft[key] === option.label ? "selected" : ""}`}><input type="radio" name={`supplement-${key}`} checked={draft[key] === option.label} onChange={() => { setDraft(current => ({ ...current, [key]: option.label })); setError(""); }}/><span className="supplement-option-copy"><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</div></fieldset>;
      })}</div>
      <div className="drawer-actions"><div>{error && <span className="field-error" role="alert">{error}</span>}</div><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={save}>保存补充信息</button></div>
    </aside>
  </div></DrawerPortal>;
}
