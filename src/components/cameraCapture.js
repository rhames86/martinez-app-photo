import React, { useRef, useState } from 'react';
import axios from 'axios';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setError(''); // Limpiar errores anteriores
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError(
        'Error accessing the camera. Please ensure you have granted camera permissions.'
      );
      console.error('Error accessing the camera', err);
    }
  };

  const capturePhoto = () => {
    setError(''); // Limpiar errores anteriores
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setImageData(dataUrl);
    } catch (err) {
      setError('Error capturing the photo. Please try again.');
      console.error('Error capturing the photo', err);
    }
  };

  const retakePhoto = () => {
    setImageData(null); // Reiniciar la foto capturada
    setError(''); // Limpiar errores anteriores
  };

  const uploadPhoto = async () => {
    setError(''); // Limpiar errores anteriores
    try {
      if (!imageData) {
        throw new Error('No photo to upload.');
      }

      const formData = new FormData();
      formData.append('image', imageData);

      const response = await axios.post('YOUR_API_ENDPOINT', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Photo uploaded successfully', response.data);
    } catch (err) {
      setError('Error uploading the photo. Please try again.');
      console.error('Error uploading the photo', err);
    }
  };

  return (
    <div>
      <h1>Capture and Upload Photo</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <video ref={videoRef} autoPlay />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      {!imageData && <button onClick={startCamera}>Start Camera</button>}
      {!imageData && <button onClick={capturePhoto}>Capture Photo</button>}
      {imageData && (
        <div>
          <img src={imageData} alt="Captured" />
          <button onClick={retakePhoto}>Retake Photo</button>
          <button onClick={uploadPhoto}>Submit Photo</button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
