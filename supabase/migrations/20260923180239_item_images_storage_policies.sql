/*
# Storage bucket policies for item-images

Allows authenticated users to upload and read item images.
*/

CREATE POLICY "Anyone can view item images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Users can delete own item images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'item-images' AND owner = auth.uid());
