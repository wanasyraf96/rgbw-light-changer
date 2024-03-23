import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Color = {
  red: number
  green: number
  blue: number
  white: number
}

const defaultColor: Color = {
  red:0,
  green:0,
  blue:0,
  white:0
}
function App() {

  const [color, setColor] = useState<Color>(defaultColor);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = Number.isNaN(value) ? NaN : parseInt(value, 10);
    const clampedValue = Number.isNaN(parsedValue) ? NaN : Math.min(Math.max(parsedValue, 0), 255); // Clamp value between 0 and 255
    setColor(prevColor => ({
      ...prevColor,
      [name]: clampedValue,
    }));
  };

  const handleSaveButtonClick = () => {
    // Check if any field is empty
    if (Object.values(color).some(value => Number.isNaN(value))) {
      console.error(color)
      toast.error("Please fill in all fields.");
      return;
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="container max-w-md mx-8">
          <div className="container py-2 flex items-center justify-center">
            <label htmlFor="red" className="w-2/12 mr-2">
              Red
            </label>
            <input
              name="red"
              type="number"
              min="0"
              max="255"
              className="w-1/8 flex"
              value={color.red}
              onChange={handleInputChange}
            />
          </div>
          <div className="container py-2 flex items-center justify-center">
            <label htmlFor="green" className="w-2/12 mr-2">
              Green
            </label>
            <input
              name="green"
              type="number"
              min="0"
              max="255"
              className="w-1/8 flex"
              value={color.green}
              onChange={handleInputChange}
            />
          </div>
          <div className="container py-2 flex items-center justify-center">
            <label htmlFor="blue" className="w-2/12 mr-2">
              Blue
            </label>
            <input
              name="blue"
              type="number"
              min="0"
              max="255"
              className="w-1/8 flex"
              value={color.blue}
              onChange={handleInputChange}
            />
          </div>
          <div className="container py-2 flex items-center justify-center">
            <label htmlFor="white" className="w-2/12 mr-2">
              White
            </label>
            <input
              name="white"
              type="number"
              min="0"
              max="255"
              className="w-1/8 flex"
              value={color.white}
              onChange={handleInputChange}
            />
          </div>
          {/* Repeat similar structure for other color inputs */}
          <div className="container py-4 flex justify-center">
            <div>
              <button
                className="bg-blue-800 hover:bg-blue-700 text-slate-200 py-2 px-6 rounded"
                onClick={handleSaveButtonClick}>Save</button>
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
