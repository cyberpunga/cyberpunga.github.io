-- This SQL script will help set up the necessary policies for your storage bucket

-- First, create a storage bucket called 'blog-assets'
-- Note: You'll need to create this bucket through the Supabase dashboard first

-- Then apply these policies to allow authenticated users to upload and read images

-- Allow authenticated users to upload files to the 'blog-assets' bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-assets' AND
  (storage.foldername(name))[1] = 'post-images'
);

-- Allow public access to read files from the 'blog-assets' bucket
CREATE POLICY "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-assets');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-assets' AND auth.uid() = owner);

