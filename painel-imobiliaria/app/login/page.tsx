"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  const sb = createClient();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setErr("E-mail ou senha incorretos."); setBusy(false); } else window.location.href = "/admin";
  }
  async function forgot() {
    if (!email) return setErr("Digite seu e-mail para receber o link.");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    error ? setErr("Não foi possível enviar o link agora.") : setInfo("Enviamos um link de recuperação para seu e-mail.");
  }
  return (<form className="login" onSubmit={submit}>
    <h1>Entrar no painel</h1>
    <div><label>E-mail</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
    <div><label>Senha</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
    <button className="btn" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</button>
    <button type="button" className="btn ghost" onClick={forgot}>Esqueci minha senha</button>
    {err && <span className="err">{err}</span>}{info && <span>{info}</span>}
  </form>);
}
