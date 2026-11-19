# Painel da imobiliária (Next.js + Supabase)

Site público + painel administrativo ligados ao mesmo banco PostgreSQL. Nada fica no navegador: imóveis, leads e textos do site vêm do Supabase.

## Como iniciar
1. Crie um projeto em https://supabase.com (grátis).
2. No Supabase, abra **SQL Editor**, cole todo o arquivo `supabase/migrations/001_init.sql` e execute. Ele cria tabelas, permissões (RLS), gatilhos e o bucket de imagens.
3. Em **Project Settings > API**, copie a URL e a chave `anon`. Copie `.env.example` para `.env.local` e preencha.
4. `npm install` e `npm run dev`. Abra http://localhost:3000 (site) e http://localhost:3000/login (painel).

## Criar o primeiro administrador
No Supabase: **Authentication > Users > Add user**, informe e-mail e senha e marque "Auto confirm". O primeiro usuário criado vira **administrador** automaticamente (gatilho no banco). Os próximos entram como **corretor**; o admin muda o nível alterando `role` na tabela `profiles` (admin, manager ou broker).

## Publicar
Suba o código no GitHub e importe na Vercel com as duas variáveis do `.env.example`. Em Supabase > Authentication > URL Configuration, coloque o domínio do site.

## Segurança
- Senhas e sessões são do Supabase Auth (hash bcrypt, cookies seguros). `/admin` é protegido por middleware e pelo layout.
- Permissões reais no banco (RLS): visitante só lê imóveis publicados e só cria leads "novos"; corretor vê só os próprios imóveis e leads; gerente e admin veem tudo; só admin lê o log de atividades.
- Nunca use a chave `service_role` no front. Ative backups diários no plano Pro do Supabase.

## O que já funciona
Login, logout e recuperação de senha; níveis de acesso; dashboard com contagens reais; cadastro, publicação, status (vendido/alugado) e exclusão com confirmação de imóveis; kanban de leads com arrastar e soltar; formulário do site gravando leads; edição de WhatsApp, textos, horário e redes do site; log de atividades e aviso de novo lead no banco.

## Ainda não implementado (tabelas e permissões já existem no banco)
Editar imóvel e duplicar; upload e ordenação de fotos e vídeos; telas de corretores, usuários, agenda e visitas, depoimentos, relatórios com PDF e Excel, central de notificações; gráficos; página de detalhe do imóvel no site público; filtros e busca. Este código não foi executado: rode `npm run build` e me envie qualquer erro para corrigir.
