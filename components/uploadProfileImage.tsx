"use client";
import React, { useState } from 'react';
import { createClient } from '../utils/supabase/client';

const UploadProfileAndCoverImage = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Create Supabase client instance
  const supabase = createClient();

  // Handle file change for profile image
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  // Handle file change for cover image
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverImage(file);
  };

  // Upload or update images
  const uploadImages = async () => {
    try {
      setUploading(true);

      // Get the current authenticated user
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        alert('Please log in to upload images.');
        return;
      }

      const user = data.user;

      // Upload profile image if selected
      if (profileImage) {
        const profileExt = profileImage.name.split('.').pop();
        const profileFileName = `profile.${profileExt}`; // Profile image name
        const profileFilePath = `profile-images/${user.id}/${profileFileName}`; // Store image using user id

        console.log('Uploading profile image to:', profileFilePath);
        const { error: profileUploadError } = await supabase.storage
          .from('Uploads') // Replace with your bucket name
          .upload(profileFilePath, profileImage, {
            upsert: true, // Allow overwriting the file to update the profile image
          });

        if (profileUploadError) throw profileUploadError;

        // Fetch the updated profile image URL
        const { data: profilePublicUrlData } = supabase.storage
          .from('Uploads')
          .getPublicUrl(profileFilePath);

        if (profilePublicUrlData) {
          setProfileUrl(profilePublicUrlData.publicUrl);
        }
      }

      // Upload cover image if selected
      if (coverImage) {
        const coverExt = coverImage.name.split('.').pop();
        const coverFileName = `cover.${coverExt}`; // Cover image name
        const coverFilePath = `cover-images/${user.id}/${coverFileName}`; // Store cover image using user id

        console.log('Uploading cover image to:', coverFilePath);
        const { error: coverUploadError } = await supabase.storage
          .from('Uploads') // Replace with your bucket name
          .upload(coverFilePath, coverImage, {
            upsert: true, // Allow overwriting the file to update the cover image
          });

        if (coverUploadError) throw coverUploadError;

        // Fetch the updated cover image URL
        const { data: coverPublicUrlData } = supabase.storage
          .from('Uploads')
          .getPublicUrl(coverFilePath);

        if (coverPublicUrlData) {
          setCoverUrl(coverPublicUrlData.publicUrl);
        }
      }

      alert('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  // Fetch the existing images if available
  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        alert('Please log in to fetch images.');
        return;
      }

      const user = data.user;

      // Fetch profile image URL
      const profileFilePath = `profile-images/${user.id}/profile.jpg`;
      const { data: profilePublicUrlData } = supabase.storage
        .from('Uploads')
        .getPublicUrl(profileFilePath);
      if (profilePublicUrlData) {
        setProfileUrl(profilePublicUrlData.publicUrl);
      }

      // Fetch cover image URL
      const coverFilePath = `cover-images/${user.id}/cover.jpg`;
      const { data: coverPublicUrlData } = supabase.storage
        .from('Uploads')
        .getPublicUrl(coverFilePath);
      if (coverPublicUrlData) {
        setCoverUrl(coverPublicUrlData.publicUrl);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to fetch images.');
    }
  };

  return (
    <div>
      <div>
        <h3>Upload Profile Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleProfileFileChange}
          disabled={uploading}
        />
      </div>

      <div>
        <h3>Upload Cover Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverFileChange}
          disabled={uploading}
        />
      </div>

      <button onClick={uploadImages} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload/Update Images'}
      </button>

      <div>
        {profileUrl && (
          <div>
            <h3>Your Profile Image:</h3>
            <img src={profileUrl} alt="Profile" width={150} height={150} />
          </div>
        )}

        {coverUrl && (
          <div>
            <h3>Your Cover Image:</h3>
            <img src={coverUrl} alt="Cover" width={300} height={150} />
          </div>
        )}
      </div>

      <button onClick={fetchImages}>Fetch Images</button>
    </div>
  );
};

export default UploadProfileAndCoverImage;
