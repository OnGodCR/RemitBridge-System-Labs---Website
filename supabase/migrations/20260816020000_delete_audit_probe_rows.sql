-- Removes the five rows the security audit inserted while proving the rate
-- limit works. Targeted by the exact bodies the probes used, not by name, so
-- a real person who happens to be called something similar is untouched.
-- Runs as postgres, which is the point: staff delete from the dashboard, and
-- these were inserted by a probe, not a person.
delete from public.messages
where body in ('security audit test row, delete me', 'audit test row, delete me');
