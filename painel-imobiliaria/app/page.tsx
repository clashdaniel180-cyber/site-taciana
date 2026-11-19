import { createClient } from "@/lib/supabase/server";
import { createLead } from "./admin/actions";
export const revalidate = 60;
export default async function Home({ searchParams }: { searchParams: { lead?: string } }) {
  const sb = createClient();
  const [{ data: s }, { data: list }] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).single(),
    sb.from("properties").select("id,code,title,city,neighborhood,price,status,featured").eq("published", true).order("featured", { ascending: false }),
  ]);
  const wa = (m: string) => `https://wa.me/${s?.whatsapp ?? ""}?text=${encodeURIComponent(m)}`;
  const brl = (n: number | null) => (n == null ? "Sob consulta" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  return (<div className="pub">
    <section className="hero"><h1>{s?.hero_title}</h1><p>{s?.hero_subtitle}</p><a className="btn gold" href={wa("Olá! Vim pelo site e quero atendimento.")}>Fale com um corretor</a></section>
    <h2>Imóveis</h2>
    <div className="pc">{list?.map((p) => <div className="card" key={p.id}><small>{p.city} {p.neighborhood && "· " + p.neighborhood}</small><h2 style={{ fontSize: "1.15rem" }}>{p.title}</h2>
      <p><b>{brl(p.price)}</b> {p.status !== "disponivel" && <em>({p.status})</em>}</p>
      <a className="btn sm" href={wa(`Olá! Tenho interesse no imóvel “${p.title}” (cód. ${p.code}).`)}>WhatsApp</a></div>)}
      {!list?.length && <p>Em breve, novos imóveis.</p>}</div>
    <section id="contato" className="card" style={{ marginTop: 28 }}><h2>Solicitar informações</h2>
      {searchParams.lead === "ok" && <p>Recebemos seu contato. Retornaremos em breve.</p>}{searchParams.lead === "erro" && <p className="err">Confira nome e WhatsApp com DDD e tente de novo.</p>}
      <form action={createLead} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input name="name" placeholder="Nome completo" required /><input name="whatsapp" placeholder="WhatsApp com DDD" required inputMode="tel" />
        <textarea name="notes" placeholder="Mensagem" rows={3} maxLength={500} /><button className="btn gold">Enviar</button></form>
      <p style={{ color: "var(--mut)" }}>{s?.hours}</p></section></div>);
}
