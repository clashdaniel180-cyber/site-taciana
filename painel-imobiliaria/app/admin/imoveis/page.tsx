import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import { createProperty, setPublished, setStatus, deleteProperty } from "../actions";
export const dynamic = "force-dynamic";
export default async function Imoveis({ searchParams }: { searchParams: { erro?: string } }) {
  const sb = createClient();
  const { data: list } = await sb.from("properties").select("id,code,title,city,price,status,published").order("created_at", { ascending: false });
  const brl = (n: number | null) => (n == null ? "Sob consulta" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  return (<><h1>Imóveis</h1>
    {searchParams.erro && <p className="err">Não foi possível salvar: {searchParams.erro}</p>}
    <details className="card"><summary><b>Cadastrar imóvel</b></summary>
      <form action={createProperty} style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div className="grid">
          <div><label>Título</label><input name="title" required /></div><div><label>Código</label><input name="code" required /></div>
          <div><label>Tipo</label><select name="type"><option>Casa</option><option>Lote</option><option>Apartamento</option><option>Comercial</option></select></div>
          <div><label>Finalidade</label><select name="purpose"><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select></div>
          <div><label>Preço (R$)</label><input name="price" type="number" step="0.01" /></div><div><label>Cidade</label><input name="city" /></div>
          <div><label>Bairro</label><input name="neighborhood" /></div><div><label>Quartos</label><input name="bedrooms" type="number" /></div>
          <div><label>Banheiros</label><input name="bathrooms" type="number" /></div><div><label>Vagas</label><input name="parking" type="number" /></div>
          <div><label>Área total (m²)</label><input name="area_total" type="number" step="0.01" /></div>
        </div>
        <div><label>Descrição</label><textarea name="description" rows={3} /></div>
        <button className="btn gold">Salvar imóvel</button>
      </form></details>
    <div className="card">{list?.length ? <table><thead><tr><th>Código</th><th>Imóvel</th><th>Preço</th><th>Status</th><th>Site</th><th></th></tr></thead><tbody>
      {list.map((p) => <tr key={p.id}><td>{p.code}</td><td>{p.title}<br /><small>{p.city}</small></td><td>{brl(p.price)}</td>
        <td><form action={setStatus} style={{ display: "flex", gap: 4 }}><input type="hidden" name="id" value={p.id} />
          <select name="status" defaultValue={p.status}><option value="disponivel">Disponível</option><option value="vendido">Vendido</option><option value="alugado">Alugado</option></select><button className="btn sm">OK</button></form></td>
        <td><form action={setPublished}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="value" value={String(!p.published)} /><button className={"btn sm " + (p.published ? "" : "ghost")}>{p.published ? "Publicado" : "Publicar"}</button></form></td>
        <td><form action={deleteProperty}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Excluir este imóvel? Isso não pode ser desfeito.">Excluir</ConfirmButton></form></td></tr>)}
    </tbody></table> : <p>Nenhum imóvel ainda. Use “Cadastrar imóvel” acima e depois clique em Publicar para ele aparecer no site.</p>}</div></>);
}
