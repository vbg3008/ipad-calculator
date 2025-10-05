import React, { useEffect, useRef, useState } from "react";
import { Colors } from "../constants";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Home = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(Colors[0].code);
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState(null);
  const [showCustomToast, setShowCustomToast] = useState(false);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.putImageData(imageData, 0, 0);
      canvas.style.background = "black";
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = selectedColor;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [selectedColor]);

  // Reset canvas
  useEffect(() => {
    if (reset) {
      resetCanvas();
      setResult(null);
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    setShowCustomToast(true); // Show toast on mount
    const timer = setTimeout(() => {
      setShowCustomToast(false); // Hide after 5 seconds
    }, 5000); // 5 seconds
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx?.beginPath();
    ctx?.moveTo(x, y);
    setIsDrawing(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendData = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/sendData`,
        {
          image: canvas.toDataURL("image/png"),
        }
      );
      setResult(response.data);
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error sending data:", error);
      if (error.response && error.response.status === 429) {
        toast.dismiss();
        toast.error(
          "You can only make one request every 24 hours. Please try again later.",
          {
            duration: 5000, // Duration in milliseconds (5 seconds)
            position: "top-center",
            style: {
              background: "#333",
              color: "#fff",
            },
          }
        );
      } else {
        toast.dismiss();
        toast.error("An error occurred while processing your request.", {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      }
    }
  };

  return (
    <>
      {/* Toaster Component for displaying notifications */}
      <Toaster />

      {showCustomToast && (
        <div
          className="fixed top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg animate-fade-in-out text-center"
          role="alert"
        >
          As I'm using a free AI model, I'm currently limiting user requests and
          using a <u>dumb</u> model just for testing.
        </div>
      )}
      {/* Controls */}
      <div className="fixed top-3 left-3 right-3 z-20 grid grid-cols-3 items-center gap-2 sm:gap-4 p-1 sm:p-0 bg-black/50 backdrop-blur-sm rounded-xl">
        {/* Reset Button */}
        <button
          className="bg-red-400 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-red-500 transition"
          onClick={() => setReset(true)}
        >
          Reset
        </button>

        {/* Color Selector */}
        <div className="flex overflow-x-auto gap-2 justify-center py-1 hide-scrollbar">
          {Colors.map((color) => (
            <div
              key={color.name}
              className={`w-8 h-8 sm:h-3 sm:w-3 rounded-full flex-shrink-0 cursor-pointer border-2 transition-transform duration-200
                ${
                  selectedColor === color.code
                    ? "border-white scale-125"
                    : "border-transparent hover:scale-110"
                }
              `}
              style={{ backgroundColor: color.code }}
              title={color.name}
              onClick={() => setSelectedColor(color.code)}
            />
          ))}
        </div>

        {/* Send / Calculate Button */}
        <button
          className="bg-sky-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-sky-600 transition"
          onClick={sendData}
        >
          Calculate
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full touch-none"
        style={{ background: "black" }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Result */}
      {result?.result && (
        <div className="absolute bottom-4 left-2 right-2 sm:left-10 sm:right-auto bg-black/80 backdrop-blur-md text-white p-4 sm:p-6 rounded-xl shadow-lg z-20 max-w-md border border-gray-700 mx-auto sm:mx-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white/90">
            Result
          </h3>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <p>
              <span className="font-medium text-gray-300">Expression:</span>{" "}
              <span className="font-mono text-blue-300">
                {result.result.recognized_expression}
              </span>
            </p>

            <p>
              <span className="font-medium text-gray-300">Solution:</span>{" "}
              <span className="font-mono text-green-300 text-lg">
                {result.result.solution}
              </span>
            </p>

            <div>
              <span className="font-medium text-gray-300">Steps:</span>
              <ul className="list-disc list-inside mt-1 text-gray-200">
                {result.result.steps?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            <p className="text-gray-400">
              <span className="font-medium">Type:</span>{" "}
              {result.result.type?.charAt(0).toUpperCase() +
                result.result.type?.slice(1)}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
