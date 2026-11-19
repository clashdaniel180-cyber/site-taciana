import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveSettings } from "../actions";
export const dynamic = "force-dynamic";
const F: [string, string][] = [["company_name","Nome da imobiliária"],["creci","CRECI"],["whatsapp","WhatsApp (com DDD)"],["phone","Telefone"],["email","E-mail"],["address","Endereço"],["hours","Horário de atendimento"],["hero_title","Título da página inicial"],["hero_subtitle","Subtítulo"],["instagram","Instagram"],["facebook","Facebook"],["youtube","YouTube"],["tiktok","TikTok"]];
export default async function Site({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const sb = createClient(); const { data: { user } } = await sb.auth.getUser();
  const { data: me } = await sb.from("profiles").select("role").eq("id", user!.id).single();
  if (me?.role === "broker") redirect("/admin");
  const { data: s } = await sb.from("site_settings").select("*").eq("id", 1).single();
  return (<><h1>Editar meu site</h1>
    {searchParams.ok && <p>Alterações salvas. O site já está atualizado.</p>}{searchParams.erro && <p className="err">{searchParams.erro}</p>}
    <form action={saveSettings} className="card"><div className="grid">{F.map(([k, l]) => <div key={k}><label>{l}</label><input name={k} defaultValue={(s as any)?.[k] ?? ""} /></div>)}</div>
      <div style={{ marginTop: 12 }}><label>Sobre nós</label><textarea name="about" rows={4} defaultValue={s?.about ?? ""} /></div>
      <button className="btn gold" style={{ marginTop: 14 }}>Salvar alterações</button></form></>);
}
