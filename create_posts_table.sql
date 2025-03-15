-- Create a stored procedure to create the posts table
CREATE OR REPLACE FUNCTION create_posts_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create posts table if it doesn't exist
  CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    published BOOLEAN DEFAULT false,
    cover_image TEXT,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index for faster slug lookups if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'posts_slug_idx'
  ) THEN
    CREATE INDEX posts_slug_idx ON posts (slug);
  END IF;

  -- Create index for published posts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'posts_published_idx'
  ) THEN
    CREATE INDEX posts_published_idx ON posts (published);
  END IF;
END;
$$;

