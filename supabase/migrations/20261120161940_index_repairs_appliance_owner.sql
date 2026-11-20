-- Index for the repairs → appliances ownership check
-- ==================================================
-- Supabase's performance advisor (lint 0001_unindexed_foreign_keys) noted
-- that repairs_appliance_fk checks (appliance_id, user_id) together but no
-- index covered that pair.
--
-- This replaces the (appliance_id, repair_date) index with one on
-- (appliance_id, user_id, repair_date desc), which serves both:
--   - the ownership check / cascade deletes (appliance_id, user_id), and
--   - "this appliance's repairs, newest first", which also filters on
--     user_id because of Row Level Security.
-- Dropping an index removes no data.

drop index public.repairs_appliance_id_repair_date_idx;

create index repairs_appliance_id_user_id_repair_date_idx
  on public.repairs (appliance_id, user_id, repair_date desc);
