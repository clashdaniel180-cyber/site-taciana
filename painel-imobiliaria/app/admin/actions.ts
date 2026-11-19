"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
async function log(sb: any, action: string, entity: string, id?: string) {
  const { data: { user } } = await sb.auth.getUser();
  if (user) await sb.from("activity_logs").insert({ user_id: user.id, action, entity, entity_id: id ?? null });
}
const num = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));
const txt = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : String(v).trim());
export async function signOut() { await createClient().auth.signOut(); redirect("/login"); }
export async function createProperty(fd: FormData) {
  const sb = createClient(); const { data: { user } } = await sb.auth.getUser();
  const { data, error } = await sb.from("properties").insert({
    code: txt(fd.get("code")), title: txt(fd.get("title")), type: txt(fd.get("type")), purpose: txt(fd.get("purpose")),
    price: num(fd.get("price")), city: txt(fd.get("city")), neighborhood: txt(fd.get("neighborhood")),
    bedrooms: num(fd.get("bedrooms")), bathrooms: num(fd.get("bathrooms")), parking: num(fd.get("parking")),
    area_total: num(fd.get("area_total")), description: txt(fd.get("description")), broker_id: user?.id,
  }).select("id").single();
  if (error) return redirect("/admin/imoveis?erro=" + encodeURIComponent(error.message));
  await log(sb, "criou imóvel", "properties", data.id); revalidatePath("/admin/imoveis"); revalidatePath("/");
}
export async function setPublished(fd: FormData) {
  const sb = createClient(); const id = String(fd.get("id"));
  await sb.from("properties").update({ published: fd.get("value") === "true" }).eq("id", id);
  await log(sb, "alterou publicação", "properties", id); revalidatePath("/admin/imoveis"); revalidatePath("/");
}
export async function setStatus(fd: FormData) {
  const sb = createClient(); const id = String(fd.get("id"));
  await sb.from("properties").update({ status: String(fd.get("status")) }).eq("id", id);
  await log(sb, "alterou status", "properties", id); revalidatePath("/admin/imoveis"); revalidatePath("/");
}
export async function deleteProperty(fd: FormData) {
  const sb = createClient(); const id = String(fd.get("id"));
  await sb.from("properties").delete().eq("id", id); await log(sb, "excluiu imóvel", "properties", id);
  revalidatePath("/admin/imoveis"); revalidatePath("/");
}
export async function moveLead(id: string, status: string) {
  const sb = createClient(); const { error } = await sb.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  await log(sb, "moveu lead para " + status, "leads", id); revalidatePath("/admin"); return { ok: true };
}
export async function saveSettings(fd: FormData) {
  const sb = createClient(); const keys = ["company_name","creci","whatsapp","phone","email","address","hours","hero_title","hero_subtitle","about","instagram","facebook","youtube","tiktok"];
  const patch: Record<string, string | null> = {}; keys.forEach((k) => (patch[k] = txt(fd.get(k))));
  if (patch.whatsapp) patch.whatsapp = patch.whatsapp.replace(/\D/g, "");
  const { error } = await sb.from("site_settings").update(patch).eq("id", 1);
  if (error) return redirect("/admin/site?erro=" + encodeURIComponent(error.message));
  await log(sb, "editou o site", "site_settings", "1"); revalidatePath("/"); redirect("/admin/site?ok=1");
}
export async function createLead(fd: FormData) {
  const sb = createClient(); const name = txt(fd.get("name")); const wa = String(fd.get("whatsapp") ?? "").replace(/\D/g, "");
  if (!name || wa.length < 10) return redirect("/?lead=erro#contato");
  const { error } = await sb.from("leads").insert({ name, whatsapp: wa, property_id: txt(fd.get("property_id")), notes: txt(fd.get("notes")), source: "site", status: "novo" });
  redirect(error ? "/?lead=erro#contato" : "/?lead=ok#contato");
}
