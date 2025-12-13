import React, { useEffect, useState } from 'react';

function RandomImage() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      const apiUrl = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:3005/assets/image.jpg'; // Default if not set

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setImageUrl(response.url);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  if (loading) {
    return <p>Loading random image...</p>;
  }

  if (error) {
    return <p>Error loading random image: {error.message}</p>;
  }

  return (
    <div className="random-image">
      {imageUrl ? (
        <img src={imageUrl} alt="Random" style={{ maxWidth: '100%' }} />
      ) : (
        <p>No random image URL found.</p>
      )}
    </div>
  );
}

export default RandomImage;