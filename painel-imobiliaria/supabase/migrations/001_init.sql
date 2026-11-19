-- Painel imobiliário: schema, RLS, triggers e storage
create type app_role as enum ('admin','manager','broker');
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text, role app_role not null default 'broker', creci text, phone text, whatsapp text, bio text, active boolean not null default true, created_at timestamptz default now());
create function public.my_role() returns app_role language sql stable security definer set search_path=public as $$ select role from profiles where id=auth.uid() and active $$;
create function public.is_staff() returns boolean language sql stable as $$ select public.my_role() in ('admin','manager') $$;
-- o primeiro usuário criado vira administrador
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.email),case when (select count(*) from profiles)=0 then 'admin'::app_role else 'broker'::app_role end); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table properties(id uuid primary key default gen_random_uuid(), code text unique not null, title text not null, type text not null, purpose text not null check (purpose in ('venda','aluguel')), price numeric(14,2), promo_price numeric(14,2), status text not null default 'disponivel' check (status in ('disponivel','vendido','alugado')), published boolean not null default false, featured boolean not null default false, description text, cep text, state text, city text, neighborhood text, street text, number text, complement text, reference text, lat double precision, lng double precision, area_total numeric, area_built numeric, bedrooms int, suites int, bathrooms int, parking int, rooms int, balconies int, features text[] not null default '{}', virtual_tour_url text, views int not null default 0, broker_id uuid references profiles(id) on delete set null, created_at timestamptz default now(), updated_at timestamptz default now());
create table property_media(id uuid primary key default gen_random_uuid(), property_id uuid not null references properties(id) on delete cascade, url text not null, kind text not null default 'image', position int not null default 0, is_cover boolean not null default false);
create table leads(id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 2 and 120), phone text, whatsapp text, email text, property_id uuid references properties(id) on delete set null, budget_range text, wanted_type text, wanted_place text, source text not null default 'site', status text not null default 'novo' check (status in ('novo','primeiro_contato','em_negociacao','visita_agendada','proposta_enviada','venda_concluida','perdido')), broker_id uuid references profiles(id) on delete set null, notes text check (length(notes)<2000), next_contact timestamptz, created_at timestamptz default now());
create table lead_interactions(id uuid primary key default gen_random_uuid(), lead_id uuid not null references leads(id) on delete cascade, author_id uuid references profiles(id), kind text not null default 'nota', note text, created_at timestamptz default now());
create table visits(id uuid primary key default gen_random_uuid(), property_id uuid references properties(id) on delete cascade, lead_id uuid references leads(id) on delete set null, broker_id uuid references profiles(id), starts_at timestamptz not null, status text not null default 'agendada' check (status in ('agendada','confirmada','cancelada','realizada')), notes text);
create table testimonials(id uuid primary key default gen_random_uuid(), name text not null, body text not null, rating int not null default 5 check (rating between 1 and 5), photo_url text, published boolean not null default false, created_at timestamptz default now());
create table site_settings(id int primary key default 1 check (id=1), company_name text, creci text, whatsapp text, phone text, email text, address text, hours text, hero_title text, hero_subtitle text, hero_image_url text, about text, instagram text, facebook text, youtube text, tiktok text, primary_color text, wa_message text);
insert into site_settings(company_name,hero_title,hero_subtitle,whatsapp,hours) values('Tassiana Damasceno Escritório Imobiliário','Encontre o imóvel ideal para viver seus melhores momentos.','Lotes, casas e financiamento da casa própria em Carnaubal e São Benedito.','5588997293067','Seg a Sex, 8h às 12h e 14h às 17h · Sáb, 8h às 12h');
create table notifications(id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, title text not null, body text, read boolean not null default false, created_at timestamptz default now());
create table activity_logs(id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id), action text not null, entity text, entity_id text, created_at timestamptz default now());
create index on leads(status); create index on leads(broker_id); create index on properties(published,status); create index on visits(starts_at);

create function public.touch() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger t_touch before update on properties for each row execute function public.touch();
-- novo lead avisa administradores e gerentes
create function public.notify_new_lead() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into notifications(user_id,title,body) select id,'Novo lead recebido',new.name from profiles where role in ('admin','manager') and active; return new; end $$;
create trigger t_new_lead after insert on leads for each row execute function public.notify_new_lead();

alter table profiles enable row level security; alter table properties enable row level security; alter table property_media enable row level security; alter table leads enable row level security; alter table lead_interactions enable row level security; alter table visits enable row level security; alter table testimonials enable row level security; alter table site_settings enable row level security; alter table notifications enable row level security; alter table activity_logs enable row level security;

create policy p_sel on profiles for select to authenticated using (id=auth.uid() or public.is_staff());
create policy p_upd on profiles for update to authenticated using (public.my_role()='admin') with check (public.my_role()='admin');
create policy pr_pub on properties for select using (published);
create policy pr_sel on properties for select to authenticated using (public.is_staff() or broker_id=auth.uid());
create policy pr_ins on properties for insert to authenticated with check (public.my_role() is not null and (public.is_staff() or broker_id=auth.uid()));
create policy pr_upd on properties for update to authenticated using (public.is_staff() or broker_id=auth.uid()) with check (public.is_staff() or broker_id=auth.uid());
create policy pr_del on properties for delete to authenticated using (public.is_staff());
create policy m_pub on property_media for select using (exists(select 1 from properties p where p.id=property_id and p.published));
create policy m_all on property_media for all to authenticated using (exists(select 1 from properties p where p.id=property_id and (public.is_staff() or p.broker_id=auth.uid()))) with check (exists(select 1 from properties p where p.id=property_id and (public.is_staff() or p.broker_id=auth.uid())));
-- visitantes do site só conseguem CRIAR leads novos e sem corretor
create policy l_site on leads for insert to anon, authenticated with check (status='novo' and broker_id is null and source in ('site','whatsapp'));
create policy l_ins on leads for insert to authenticated with check (public.my_role() is not null);
create policy l_sel on leads for select to authenticated using (public.is_staff() or broker_id=auth.uid());
create policy l_upd on leads for update to authenticated using (public.is_staff() or broker_id=auth.uid()) with check (public.is_staff() or broker_id=auth.uid());
create policy l_del on leads for delete to authenticated using (public.is_staff());
create policy i_all on lead_interactions for all to authenticated using (exists(select 1 from leads l where l.id=lead_id and (public.is_staff() or l.broker_id=auth.uid()))) with check (exists(select 1 from leads l where l.id=lead_id and (public.is_staff() or l.broker_id=auth.uid())));
create policy v_all on visits for all to authenticated using (public.is_staff() or broker_id=auth.uid()) with check (public.is_staff() or broker_id=auth.uid());
create policy t_pub on testimonials for select using (published);
create policy t_staff on testimonials for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy s_pub on site_settings for select using (true);
create policy s_upd on site_settings for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy n_own on notifications for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy a_ins on activity_logs for insert to authenticated with check (user_id=auth.uid());
create policy a_sel on activity_logs for select to authenticated using (public.my_role()='admin');

insert into storage.buckets(id,name,public) values('property-media','property-media',true) on conflict do nothing;
create policy sm_read on storage.objects for select using (bucket_id='property-media');
create policy sm_write on storage.objects for insert to authenticated with check (bucket_id='property-media' and public.my_role() is not null);
create policy sm_del on storage.objects for delete to authenticated using (bucket_id='property-media' and public.is_staff());
