"use client";
import { useState, useTransition } from "react";
import { moveLead } from "@/app/admin/actions";
export const STAGES: [string, string][] = [["novo","Novo"],["primeiro_contato","Primeiro contato"],["em_negociacao","Em negociação"],["visita_agendada","Visita agendada"],["proposta_enviada","Proposta enviada"],["venda_concluida","Venda concluída"],["perdido","Perdido"]];
export default function Kanban({ initial }: { initial: any[] }) {
  const [leads, setLeads] = useState(initial); const [msg, setMsg] = useState(""); const [, start] = useTransition();
  function drop(e: React.DragEvent, status: string) {
    const id = e.dataTransfer.getData("id"); const prev = leads;
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    start(async () => { const r = await moveLead(id, status); if (r?.error) { setLeads(prev); setMsg("Não foi possível mover: " + r.error); } else setMsg("Lead atualizado"); });
  }
  return (<>
    <p aria-live="polite" style={{ color: "var(--mut)", minHeight: 22 }}>{msg}</p>
    <div className="board">{STAGES.map(([k, label]) => (
      <div key={k} className="col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, k)}>
        <h3>{label} ({leads.filter((l) => l.status === k).length})</h3>
        {leads.filter((l) => l.status === k).map((l) => (
          <div key={l.id} className="lead" draggable onDragStart={(e) => e.dataTransfer.setData("id", l.id)}>
            <b>{l.name}</b><br /><small>{l.whatsapp || l.phone || l.email}</small>
            {l.properties?.title && <div><small>Interesse: {l.properties.title}</small></div>}
          </div>))}
      </div>))}
    </div></>);
}
