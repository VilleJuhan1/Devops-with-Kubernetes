function RandomImage() {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'api/assets/random.jpg';
  return (
    <div className="random-image">
      <img
        src={`${IMAGE_URL}`}
        alt="Random"
        style={{ maxWidth: '50%' }}
      />
    </div>
  );
}

export default RandomImage;