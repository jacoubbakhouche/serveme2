-- supabase/migrations/20250902130000_add_social_media_to_profiles.sql

ALTER TABLE public.profiles
ADD COLUMN social_media JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.social_media IS 'Stores social media links like Facebook, Instagram, etc.';
