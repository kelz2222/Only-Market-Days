-- ============================================
-- ONLY MARKET DAYS — Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

create extension if not exists "uuid-ossp";

create table markets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

insert into markets (name, location, description) values
  ('Orie Ntigha', 'Ntigha, Isiala Ngwa North, Abia State', 'The women of Ntigha village wake up at dawn for this.'),
  ('Orie Ukwu', 'Ukwu, Isiala Ngwa North, Abia State', 'The great market of Isiala Ngwa. Fresh since before sunrise.');

create table market_days (
  id uuid primary key default uuid_generate_v4(),
  market_id uuid references markets(id),
  market_date date not null,
  preorder_opens_at timestamptz,
  preorder_closes_at timestamptz,
  order_opens_at timestamptz,
  order_closes_at timestamptz,
  status text default 'upcoming',
  notes text,
  created_at timestamptz default now()
);

create table pickup_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  landmark text not null,
  arrival_time text not null,
  delivery_fee integer not null,
  bulk_delivery_fee integer not null,
  active boolean default true
);

insert into pickup_zones (name, city, landmark, arrival_time, delivery_fee, bulk_delivery_fee) values
  ('Umuahia Pickup', 'Umuahia', 'Ubani Motor Park Area, Umuahia', '12:30 PM', 1200, 2500),
  ('Aba Pickup', 'Aba', 'Osisioma Junction, Aba', '3:00 PM', 800, 2000);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emoji text not null,
  slug text unique not null,
  sort_order integer default 0
);

insert into categories (name, emoji, slug, sort_order) values
  ('Leafy Vegetables', '🌿', 'vegetables', 1),
  ('Staples & Swallow', '🌾', 'staples', 2),
  ('Palm Produce', '🫙', 'palm', 3),
  ('Dried Protein', '🐟', 'protein', 4),
  ('Dressed Meat', '🐔', 'meat', 5),
  ('Spices & Condiments', '🌶️', 'spices', 6),
  ('Fruits & Plantain', '🍌', 'fruits', 7),
  ('Seasonal Fruits', '🍊', 'seasonal', 8),
  ('Nuts & Kola', '🌰', 'nuts', 9),
  ('Grains & Corn', '🌽', 'grains', 10);

create table products (
  id uuid primary key default uuid_generate_v4(),
  market_day_id uuid references market_days(id),
  market_id uuid references markets(id),
  category_id uuid references categories(id),
  name text not null,
  description text,
  price integer not null,
  unit text not null,
  quantity_available integer not null default 0,
  quantity_sold integer default 0,
  image_url text,
  is_seasonal boolean default false,
  season_note text,
  is_bulk boolean default false,
  is_preorder_only boolean default false,
  active boolean default true,
  uploaded_by uuid,
  created_at timestamptz default now()
);

create table buyer_profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  whatsapp text not null,
  preferred_zone_id uuid references pickup_zones(id),
  is_wholesale boolean default false,
  wholesale_business_name text,
  wholesale_type text,
  total_orders integer default 0,
  total_spent integer default 0,
  created_at timestamptz default now(),
  last_order_at timestamptz
);

create table agents (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text unique not null,
  pin_hash text not null,
  market_id uuid references markets(id),
  is_active boolean default true,
  total_market_days integer default 0,
  total_earnings integer default 0,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  buyer_id uuid references buyer_profiles(id),
  market_day_id uuid references market_days(id),
  pickup_zone_id uuid references pickup_zones(id),
  order_type text default 'same_day',
  status text default 'pending_payment',
  subtotal integer not null,
  delivery_fee integer not null,
  service_fee integer not null,
  total integer not null,
  paystack_reference text,
  paystack_status text,
  buyer_name text not null,
  buyer_whatsapp text not null,
  special_instructions text,
  packed_at timestamptz,
  dispatched_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  product_name text not null,
  product_unit text not null,
  quantity integer not null,
  unit_price integer not null,
  total_price integer not null,
  packed boolean default false,
  created_at timestamptz default now()
);

create table agent_earnings (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id),
  market_day_id uuid references market_days(id),
  flat_fee integer default 500000,
  commission_per_order integer default 15000,
  orders_fulfilled integer default 0,
  total_commission integer default 0,
  total_earned integer default 0,
  paid boolean default false,
  created_at timestamptz default now()
);

create table seasonal_items (
  id uuid primary key default uuid_generate_v4(),
  product_name text not null,
  category_id uuid references categories(id),
  peak_months integer[] not null,
  village_price_low integer,
  village_price_high integer,
  city_price_note text,
  is_currently_peak boolean default false,
  created_at timestamptz default now()
);

create table notification_log (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references buyer_profiles(id),
  order_id uuid references orders(id),
  type text not null,
  whatsapp_number text,
  message text,
  sent_at timestamptz default now()
);

alter table buyer_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table products enable row level security;
alter table market_days enable row level security;

create policy "Buyers see own profile" on buyer_profiles
  for all using (auth.uid() = id);

create policy "Buyers see own orders" on orders
  for select using (auth.uid() = buyer_id);

create policy "Buyers create own orders" on orders
  for insert with check (auth.uid() = buyer_id);

create policy "Buyers see own order items" on order_items
  for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
  );

create policy "Products are public" on products
  for select using (active = true);

create policy "Market days are public" on market_days
  for select using (true);

create or replace function generate_order_number()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'OMD-';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger orders_set_number
  before insert on orders
  for each row execute function set_order_number();
