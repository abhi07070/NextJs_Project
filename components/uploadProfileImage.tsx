"use client";
import React, { useState } from 'react';
import { createClient } from '../utils/supabase/client';

/*

INSERT - 
(
  bucket_id = 'Uploads'::text
  AND auth.role() = 'authenticated'::text
)


UPDATE - 
(
  bucket_id = 'Uploads'::text
  AND (auth.role() = 'authenticated'::text)
)

DELETE - 
(
  bucket_id = 'Uploads'::text
  AND auth.role() = 'authenticated'::text
)

GET - 
(
  bucket_id = 'Uploads'::text
  AND auth.role() = 'authenticated'::text
)


*/

const UploadProfileImage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  // Create Supabase client instance
  const supabase = createClient();

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  // Upload or update profile image
  const uploadProfileImage = async () => {
    try {
      setUploading(true);

      // Get the current authenticated user
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        alert('Please log in to upload a profile image.');
        return;
      }

      const user = data.user;

      if (!image) {
        alert('Please select an image to upload.');
        return;
      }

      const fileExt = image.name.split('.').pop();
      const fileName = `profile.${fileExt}`; // Profile image name
      const filePath = `profile-images/${user.id}/${fileName}`; // Store image using user id
      console.log('Uploading to:', filePath);
      // Upload image to the storage bucket
      const { error: uploadError } = await supabase.storage
        .from('Uploads') // Replace with your bucket name
        .upload(filePath, image, {
          upsert: true, // Allow overwriting the file to update the profile image
        });

      if (uploadError) {
        throw uploadError;
      }

      // Fetch the updated profile image URL
      const { data: publicUrlData } = supabase.storage
        .from('Uploads')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        setProfileUrl(publicUrlData.publicUrl);
      }

      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  // Fetch the existing profile image if available
  const fetchProfileImage = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        alert('Please log in to fetch the profile image.');
        return;
      }

      const user = data.user;
      const filePath = `profile-images/${user.id}/profile.jpg`;

      const { data: publicUrlData } = supabase.storage
        .from('Uploads')
        .getPublicUrl(filePath);
      if (publicUrlData) {
        setProfileUrl(publicUrlData.publicUrl);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      alert('Failed to fetch profile image.');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button onClick={uploadProfileImage} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload/Update Profile Image'}
      </button>

      {profileUrl && (
        <div>
          <h3>Your Profile Image:</h3>
          <img src={profileUrl} alt="Profile" width={150} height={150} />
        </div>
      )}

      <button onClick={fetchProfileImage}>Fetch Profile Image</button>
    </div>
  );
};

export default UploadProfileImage;
