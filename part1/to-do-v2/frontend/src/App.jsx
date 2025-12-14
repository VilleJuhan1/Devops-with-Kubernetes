// src/App.jsx
function App() {

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || '/api/assets/random.jpg';

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>The Project app</h1>

      <img
        src={`${IMAGE_URL}`}
        alt="Random"
        style={{ maxWidth: '50%' }}
      />
    </div>
  );
}

export default App;
