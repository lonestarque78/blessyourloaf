-- Part of the pre-existing-schema baseline; see 202606010001_baseline_extensions.sql for
-- how this was reconstructed and why the date prefix is nominal.

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
