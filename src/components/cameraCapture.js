import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import "../components/cameraCapture.css"

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    // Obtener lista de dispositivos multimedia
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId); // Seleccionar la primera cámara por defecto
        }
      } catch (err) {
        setError("Error retrieving media devices.");
        console.error("Error retrieving media devices", err);
      }
    };

    getDevices();
  }, []);

  const startCamera = async () => {
    setError(""); // Limpiar errores anteriores
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError(
        "Error accessing the camera. Please ensure you have granted camera permissions."
      );
      console.error("Error accessing the camera", err);
    }
  };

  const capturePhoto = () => {
    setError(""); // Limpiar errores anteriores
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setImageData(dataUrl);
    } catch (err) {
      setError("Error capturing the photo. Please try again.");
      console.error("Error capturing the photo", err);
    }
  };

  const retakePhoto = () => {
    setImageData(null); // Reiniciar la foto capturada
    setError(""); // Limpiar errores anteriores
  };

  const uploadPhoto = async () => {
    setError(""); // Limpiar errores anteriores
    try {
      if (!imageData) {
        throw new Error("No photo to upload.");
      }

      const formData = new FormData();
      formData.append("image", imageData);

      const response = await axios.post("YOUR_API_ENDPOINT", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Photo uploaded successfully", response.data);
    } catch (err) {
      setError("Error uploading the photo. Please try again.");
      console.error("Error uploading the photo", err);
    }
  };

  return (
    <div className="container">
      {error && <p style={{ color: "red" }}>{error}</p>}

      {devices.length > 1 && (
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      )}

      <div>
        {!imageData && <video ref={videoRef} autoPlay />}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {!imageData && <button id="startCamera" onClick={startCamera}>Iniciar Cámara</button>}
      {!imageData && <button id="capturePhoto" onClick={capturePhoto}>Tomar Imágen</button>}
      {imageData && <img src={imageData} alt="Captured" />}
      {imageData && (
        <div>
          <button id="retakePhoto" onClick={retakePhoto}>🔄</button>
          <button id="uploadPhoto" onClick={uploadPhoto}>⬆️</button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
