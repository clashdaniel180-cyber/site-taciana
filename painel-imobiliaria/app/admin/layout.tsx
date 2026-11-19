import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient(); const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("full_name, role, active").eq("id", user.id).single();
  if (!me?.active) { await sb.auth.signOut(); redirect("/login"); }
  const staff = me.role !== "broker";
  const links: [string, string][] = [["/admin","Dashboard"],["/admin/imoveis","Imóveis"],["/admin/leads","Leads / CRM"], ...(staff ? ([["/admin/site","Editar meu site"]] as [string,string][]) : [])];
  return (<div className="shell"><aside className="side"><b>Painel</b>
    {links.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
    <form action={signOut} className="out"><button style={{ width: "100%" }}>Sair ({me.full_name})</button></form></aside>
    <main>{children}</main></div>);
}
