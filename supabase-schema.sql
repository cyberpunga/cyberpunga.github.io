-- Create posts table
CREATE TABLE posts (
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

-- Create index for faster slug lookups
CREATE INDEX posts_slug_idx ON posts (slug);

-- Create index for published posts
CREATE INDEX posts_published_idx ON posts (published);

-- Create RLS policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users (can only read published posts)
CREATE POLICY "Anonymous users can read published posts" 
ON posts FOR SELECT 
USING (published = true);

-- Policy for authenticated users (can CRUD their own posts)
CREATE POLICY "Authenticated users can CRUD their own posts" 
ON posts FOR ALL 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy for service role (can do anything)
CREATE POLICY "Service role can do anything" 
ON posts FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

