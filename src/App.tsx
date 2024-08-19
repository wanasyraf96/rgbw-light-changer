import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Color, Light, RGBColor } from './Light';
import Lights from './Light';
import dataColor from "./data/color.json"
import Loading from './Loading';

const defaultColor: Color = {
  red: 0,
  green: 0,
  blue: 0,
  white: 0
}

const sendRequest = async (payload: string, showToast: boolean) => {
  fetch(`${import.meta.env.VITE_MQTT_ADDR}`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ "topic": import.meta.env.VITE_MQTT_DMX_PUBLISH_TOPIC, "payload": `${payload}` })
  }).then(res => {
    if (res.ok) {
      return res.text()
    }
    throw new Error("request failed");
  }).then((text) => {
    console.log(text)
    if (showToast) {
      toast.info(`${payload} selected...`)
    }

  }).catch((error) => {
    if (showToast) {
      toast.error("Request failed")
    }
    console.error(error)
  }).finally(() => {
    console.log("light request finished")
  })
}

function App() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const colors = dataColor
  const [activeTab, setActiveTab] = useState<string>("default")
  const [color,] = useState<Color>(defaultColor);
  const [brightness, setBrightness] = useState<number>(100)
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isDimming, setIsDimming] = useState<boolean>(false)

  const [lights, setLights] = useState<Light[]>([
    { id: 1, label: "Light 1", switch: true, value: true, color: defaultColor },
    { id: 2, label: "Light 2", switch: true, value: true, color: defaultColor },
    { id: 3, label: "Light 3", switch: true, value: true, color: defaultColor },
    { id: 4, label: "Light 4", switch: true, value: true, color: defaultColor },
  ]);

  // const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  useEffect(() => {
    const id = setInterval(() => {
      if (brightness >= 100) {
        setIsDimming(() => true)
      } else if (brightness <= 0) {
        setIsDimming(() => false)
      }

      // Increasing brightness from 0 to 100 in 20 seconds
      if (isDimming) {
        setBrightness((brightness) => brightness - 5);
      } else {
        setBrightness((brightness) => brightness + 5);
      }
    }, 200); // Change brightness every 1 second
    return () => clearInterval(id);
  }, [brightness, isDimming]);

  const [loading, _] = useState(false)
  const handleSelectDimColor = async (colorName: string) => {
    setSelectedColor(colorName);
    setIsFocused(true);

    await sendRequest(colorName, false)


  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSaveButtonClick = async () => {
    // Check if any field is empty
    if (Object.values(color).some(value => (value === "" || Number.isNaN(value)))) {
      console.error(color)
      toast.error("Please fill in all fields.");
      return;
    }
    const promises = lights.
      filter(({ value }) => value). //filter enabled light
      map(({ id, color }) => {
        const rgb: RGBColor = { red: color.red, green: color.green, blue: color.blue }
        if (Object.values(rgb).every(value => value === 255)) {
          sendRequest(`"${id},${0},${0},${0},${255}"`, false)
        } else {
          sendRequest(`"${id},${rgb.red},${rgb.green},${rgb.blue},${0}"`, false)
        }
      }) // extract only id and color property

    await Promise.allSettled(promises)
  };

  const handleSwitchOff = async (id: number, switchState: boolean) => {
    if (switchState === true) {
      await sendRequest(`"${id},${0},${0},${0},${0}"`, false)
      toast.info("Switching light off...")
    } else {
      const light = lights.filter(({ id: light_id, value }) => light_id === id && value)
      if (light.length === 1) {
        const rgb: RGBColor = { red: color.red, green: color.green, blue: color.blue }
        if (Object.values(rgb).every(value => value === 255)) {
          await sendRequest(`"${id},${0},${0},${0},${255}"`, false)
        } else {
          await sendRequest(`"${id},${light[0].color.red},${light[0].color.green},${light[0].color.blue},${0}"`, false)
        }
        toast.info("Switching light on...")
      }
    }
    return
  }
  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }
  const handleSelectSolidColor = async (name: string) => {
    setSelectedColor(name)
    await sendRequest(name, true)
  }

  return (
    <>{loading && <Loading loading={loading} />}
      <div className="flex items-center justify-center min-h-screen md:mt-4">
        <div className="container max-w-md my-4 flex flex-col">
          <div className="flex w-full justify-between mx-auto top">
            <button className={`px-4 py-2 rounded-t-lg ${activeTab === "default" ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-800"}`} onClick={() => handleChangeTab("default")}>
              Default
            </button>
            <button className={`px-4 py-2 rounded-t-lg ${activeTab === "preset" ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-800"}`} onClick={() => handleChangeTab("preset")}>
              Preset
            </button>
            <button className={`px-4 py-2 rounded-t-lg ${activeTab === "dim" ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-800"} ${import.meta.env.VITE_ENABLE_THEMME === 'true' ? 'cursor-pointer' : 'cursor-not-allowed'} `} onClick={() => { import.meta.env.ENABLE_THEME === 'true' ? handleChangeTab("dim") : console.log("Theme is not enable") }}>
              Theme
            </button>
          </div>
          {activeTab === "default" &&
            <>
              <Lights lights={lights} setLights={setLights} switchLight={handleSwitchOff} />
              <div className="flex flex-col flex-grow">
                <div className="flex justify-center">
                  <div>
                    <button
                      className="bg-blue-800 hover:bg-blue-700 text-slate-200 py-2 px-6 rounded"
                      onClick={handleSaveButtonClick}>Save</button>
                    <ToastContainer autoClose={1000} />
                  </div>
                </div>
              </div>
            </>
          }
          {activeTab === "preset" &&
            <>
              <div className="container py-2 flex items-center justify-between">
                <div className="relative grid grid-cols-4 gap-4">
                  {colors.solid.map((color, index) => {
                    return (
                      <div
                        key={index}
                        className={`${isFocused && selectedColor === color.name ? 'ring-2 ring-blue-400' : ''} w-16 h-16 rounded cursor-pointer text-center content-center ${color.text}`}
                        style={{ backgroundColor: `rgba(${color.value.join(",")})` }}
                        onClick={() => handleSelectSolidColor(color.name)}
                      >{color.name}</div>
                    )
                  })}
                </div>
                <ToastContainer autoClose={1000} />
              </div>
            </>
          }
          {activeTab === "dim" && (
            <div className="container py-2 flex items-center justify-between">
              <div className="relative grid grid-cols-3 gap-12">
                {colors.dim.map((color, index) => (
                  color.name ? (
                    <div
                      key={index}
                      className={`${isFocused && selectedColor === color.name ? 'ring-2 ring-blue-400' : ''} w-32 h-32 rounded-lg cursor-pointer text-center content-center flex items-center justify-center p-3 transition-transform transform hover:scale-105 shadow-lg`}
                      onClick={() => handleSelectDimColor(color.value)}
                      onBlur={handleBlur}
                      tabIndex={0}
                      style={{
                        background: `${color.background || 'linear-gradient(135deg, #f5f5f5, #e0e0e0)'}`,
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        transition: 'background 0.3s ease-in-out',

                      }}
                    >
                      <span className="text-sm font-bold text-center leading-tight">{color.name}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}
          {activeTab === "dim" && <>
            <div className="relative grid grid-cols-4 gap-4">
              {colors.dim.map((color, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleSelectDimColor(color.name)}
                    onBlur={handleBlur}
                    tabIndex={0}
                  ></div>
                )
              })}
            </div>
          </>}
        </div>
      </div>
    </>
  );
}

export default App;
