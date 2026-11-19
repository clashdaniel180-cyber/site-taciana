import { createClient } from "@/lib/supabase/server";
import Kanban from "@/components/Kanban";
export const dynamic = "force-dynamic";
export default async function Leads() {
  const { data } = await createClient().from("leads").select("id,name,phone,whatsapp,email,status,properties(title)").order("created_at", { ascending: false });
  return (<><h1>Leads / CRM</h1><p style={{ color: "var(--mut)" }}>Arraste os cartões entre as etapas. Os formulários do site entram aqui como “Novo”.</p><Kanban initial={data ?? []} /></>);
}
