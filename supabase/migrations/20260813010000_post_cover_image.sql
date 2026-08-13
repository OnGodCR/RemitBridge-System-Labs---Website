-- A cover image is a different thing from an image inside the post: it is the
-- thumbnail on the blog index and the banner at the top of the article, and
-- there is exactly one. Inline images live in the body markdown.
alter table public.posts add column if not exists cover_image text;
