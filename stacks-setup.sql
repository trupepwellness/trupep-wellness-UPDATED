-- stacks-setup.sql — DB-driven protocol stacks (Admin › Stacks builder).
-- Storefront reads ACTIVE stacks from this table (falling back to catalog.js
-- STACKS if the table is empty/unreachable). Admins manage them in the dashboard.
create table if not exists public.stacks (
  id text primary key,
  name_en text not null,
  name_es text,
  tagline_en text,
  tagline_es text,
  desc_en text,
  desc_es text,
  items jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.stacks enable row level security;
drop policy if exists "stacks_public_read_active" on public.stacks;
create policy "stacks_public_read_active" on public.stacks
  for select to anon, authenticated using (active = true);
drop policy if exists "stacks_admin_read" on public.stacks;
create policy "stacks_admin_read" on public.stacks
  for select to authenticated using (public.is_admin());
drop policy if exists "stacks_admin_write" on public.stacks;
create policy "stacks_admin_write" on public.stacks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed: the current catalog stacks (safe to re-run — updates copy in place).
insert into public.stacks (id, name_en, name_es, tagline_en, tagline_es, desc_en, desc_es, items, active, sort) values
('weightloss', 'Weight Loss Stack', 'Stack para Pérdida de Peso', 'Advanced Metabolic Protocol', 'Protocolo Metabólico Avanzado', 'Comprehensive multi-compound approach to metabolic support, appetite regulation, and body recomposition.', 'Enfoque integral de varios compuestos para el apoyo metabólico, la regulación del apetito y la recomposición corporal.', '[{"id":"tirzepatide","name":"Tirzepatide"},{"id":"retatrutide","name":"Retatrutide"},{"id":"5amino","name":"5-Amino-1MQ"},{"id":"cagrilintide","name":"Cagrilintide"},{"id":"hghfrag","name":"HGH Fragment 176-191"},{"id":"lipoc","name":"Lipo C with B12"}]'::jsonb, true, 0),
('recovery', 'Recovery Stack', 'Stack de Recuperación', 'Accelerated Tissue Repair', 'Reparación Tisular Acelerada', 'Targeted compounds for musculoskeletal healing, gut health, and structural tissue recovery.', 'Compuestos dirigidos a la curación musculoesquelética, la salud intestinal y la recuperación del tejido estructural.', '[{"id":"bpc157","name":"BPC-157"},{"id":"tb500","name":"TB-500"},{"id":"ipamorelin","name":"Ipamorelin"},{"id":"cjcipamorelin","name":"CJC No DAC / Ipamorelin"},{"id":"kpv","name":"KPV Tripeptide"}]'::jsonb, true, 1),
('antiaging', 'Anti-Aging Stack', 'Stack Antienvejecimiento', 'Longevity & Cellular Health', 'Longevidad y Salud Celular', 'Research-backed compounds targeting telomere support, mitochondrial function, and cellular longevity.', 'Compuestos respaldados por investigación que apuntan al apoyo de los telómeros, la función mitocondrial y la longevidad celular.', '[{"id":"epithalon","name":"Epithalon"},{"id":"ghkcu","name":"GHK-Cu"},{"id":"motsc","name":"MOTS-C"},{"id":"nad","name":"NAD+"},{"id":"tesamorelin","name":"Tesamorelin"}]'::jsonb, true, 2),
('performance', 'Performance Stack', 'Stack de Rendimiento', 'Peak Physical Output', 'Máximo Rendimiento Físico', 'Optimized for athletes seeking elevated GH output, endurance, focus, and faster recovery.', 'Optimizado para atletas que buscan mayor liberación de GH, resistencia, enfoque y una recuperación más rápida.', '[{"id":"cjcipamorelin","name":"CJC No DAC / Ipamorelin"},{"id":"ipamorelin","name":"Ipamorelin"},{"id":"bpc157","name":"BPC-157"},{"id":"tb500","name":"TB-500"},{"id":"selank","name":"Selank"},{"id":"semax","name":"Semax"}]'::jsonb, true, 3),
('glow', 'Glow & Aesthetics Stack', 'Stack Glow y Estética', 'Skin, Pigmentation & Beauty', 'Piel, Pigmentación y Belleza', 'Aesthetic compounds for skin quality, pigmentation, libido, and overall appearance enhancement.', 'Compuestos estéticos para la calidad de la piel, la pigmentación, la libido y la mejora general de la apariencia.', '[{"id":"melanotanI","name":"Melanotan I"},{"id":"melanotanII","name":"Melanotan II"},{"id":"pt141","name":"PT-141"},{"id":"kpv","name":"KPV Tripeptide"},{"id":"lipoc","name":"Lipo C with B12"},{"id":"glowblend","name":"GLOW Blend"}]'::jsonb, true, 4),
('cognitive', 'Cognitive & Mood Stack', 'Stack Cognitivo y de Estado de Ánimo', 'Mental Clarity & Focus', 'Claridad Mental y Enfoque', 'Nootropic stack for enhanced cognition, mood stabilization, stress resilience, and neuroprotection.', 'Stack nootrópico para mejorar la cognición, estabilizar el estado de ánimo, aumentar la resiliencia al estrés y la neuroprotección.', '[{"id":"semax","name":"Semax"},{"id":"selank","name":"Selank"},{"id":"pt141","name":"PT-141"},{"id":"nad","name":"NAD+"}]'::jsonb, true, 5),
('klow', 'KLOW Metabolic Stack', 'Stack Metabólico KLOW', 'Metabolic Optimization', 'Optimización Metabólica', 'Proprietary metabolic protocol combining the KLOW Blend with complementary compounds.', 'Protocolo metabólico exclusivo que combina la mezcla KLOW con compuestos complementarios.', '[{"id":"klowblend","name":"KLOW Blend"},{"id":"5amino","name":"5-Amino-1MQ"},{"id":"cagrilintide","name":"Cagrilintide"}]'::jsonb, true, 6)
on conflict (id) do update set name_en=excluded.name_en, name_es=excluded.name_es, tagline_en=excluded.tagline_en, tagline_es=excluded.tagline_es, desc_en=excluded.desc_en, desc_es=excluded.desc_es, items=excluded.items, sort=excluded.sort, updated_at=now();
