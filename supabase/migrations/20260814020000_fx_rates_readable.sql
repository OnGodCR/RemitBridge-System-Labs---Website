-- Let the browser read the stored rates directly.
--
-- The table holds a currency pair, a date and a number. Nothing in it is user
-- data, nothing in it is secret, and every figure in it is published by a
-- central bank or a rate provider for anyone to read. Making it public removes
-- the edge function from the common path: a lookup that is already stored is a
-- single PostgREST read of about 100ms instead of a function cold start of
-- about 1.5s.
--
-- Reads only. Writes stay with the service role, which is the edge function, so
-- nobody can seed a rate of their own choosing into a tool whose whole point is
-- telling people what the real rate was.

grant select on public.fx_rates to anon, authenticated;

create policy "anyone can read stored rates"
  on public.fx_rates for select
  to anon, authenticated
  using (true);

-- No insert, update or delete policy exists, deliberately. With RLS on, an
-- absent policy is a denial, and the service role bypasses RLS entirely.
