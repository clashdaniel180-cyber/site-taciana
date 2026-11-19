import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const sb = createClient();
  const c = async (q: any) => (await q).count ?? 0;
  const head = { count: "exact" as const, head: true };
  const [total, disp, vend, alug, leads, novos] = await Promise.all([
    c(sb.from("properties").select("id", head)), c(sb.from("properties").select("id", head).eq("status", "disponivel")),
    c(sb.from("properties").select("id", head).eq("status", "vendido")), c(sb.from("properties").select("id", head).eq("status", "alugado")),
    c(sb.from("leads").select("id", head)), c(sb.from("leads").select("id", head).eq("status", "novo")),
  ]);
  const { data: recentes } = await sb.from("leads").select("id,name,whatsapp,status,created_at").order("created_at", { ascending: false }).limit(6);
  const k: [string, number][] = [["Imóveis cadastrados", total],["Disponíveis", disp],["Vendidos", vend],["Alugados", alug],["Leads recebidos", leads],["Leads novos", novos]];
  return (<><h1>Dashboard</h1>
    <div className="kpis">{k.map(([l, v]) => <div className="kpi" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
    <div className="card" style={{ marginTop: 20 }}><h2>Últimos contatos</h2>
      {recentes?.length ? <table><tbody>{recentes.map((l) => <tr key={l.id}><td>{l.name}</td><td>{l.whatsapp}</td><td>{l.status}</td><td>{new Date(l.created_at).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table> : <p>Nenhum contato ainda. Quando alguém enviar o formulário do site, aparece aqui.</p>}
    </div></>);
}
