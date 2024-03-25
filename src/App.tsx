import mqtt, { MqttClient, IClientOptions, OnErrorCallback, Client } from 'mqtt';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ColorPreviewProps {
  color: Color
}

type Color = {
  red: number | string
  green: number | string
  blue: number | string
  white: number | string
}

type InputGroup = {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const defaultColor: Color = {
  red: 0,
  green: 0,
  blue: 0,
  white: 0
}

const mqtt_protocol = import.meta.env.VITE_MQTT_PROTOCOL
const mqtt_address = import.meta.env.VITE_MQTT_ADDR
const mqtt_port = import.meta.env.VITE_MQTT_PORT
const mqttHostUrl: string = `${mqtt_protocol}://${mqtt_address}:${mqtt_port}/mqtt`

const mqttOption: IClientOptions = {

  protocolId: "MQTT",
  protocolVersion: 5,
  clientId: "react_light_" + Math.random().toString(16).substring(2, 8)
}

function App() {

  const [color, setColor] = useState<Color>(defaultColor);
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connectStatus, setConnectStatus] = useState<string>("Disconnected")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = Number.isNaN(value) ? NaN : parseInt(value, 10);
    const clampedValue = Number.isNaN(parsedValue) ? "" : Math.min(Math.max(parsedValue, 0), 255); // Clamp value between 0 and 255
    setColor(prevColor => ({
      ...prevColor,
      [name]: clampedValue,
    }));
  };

  const handleSaveButtonClick = () => {
    // Check if any field is empty
    if (Object.values(color).some(value => (value === "" || Number.isNaN(value)))) {
      console.error(color)
      toast.error("Please fill in all fields.");
      return;
    }
    if (connectStatus === "Disconnected") {
      mqttConnect(mqttHostUrl, mqttOption)
    }

    client?.publish("testtopic/ok", JSON.stringify(color))
    toast.info("Sending...")
  };



  const mqttConnect = (host: string, mqttOption: IClientOptions) => {
    setConnectStatus('Connecting');
    // const newClient = await mqtt.connectAsync(host, mqttOption)
    const newClient = mqtt.connect(host, mqttOption)

    newClient.on("connect", () => {
      toast.success("Connected")
      setClient(newClient)
      setConnectStatus("Connected")
    })

    newClient.on("error", (error: Error) => {
      setConnectStatus("Disconnected")
      toast.error(error.message)
    })

    newClient.on("close", () => {
      setConnectStatus("Disconnected")
      toast.warning("MQTT Connection closed")
    })

    newClient.on("offline", () => {
      setConnectStatus("Disconnected")
      toast.warning("MQTT Connection Offline")
    })
  };

  useEffect(() => {
    const initializeConnection = () => {
      if (!client) {
        mqttConnect(mqttHostUrl, mqttOption); // Call mqttConnect only if client is not already set
      }
    };

    initializeConnection();

    // Cleanup function
    return () => {
      if (client) {
        client.end(); // Close the MQTT connection when the component unmounts
      }
    };
  }, [client]); // Dependency array ensures this effect runs when the 'client' state changes

  const InputGroup = ({ label, name, value, onChange }: InputGroup) => {
    return (
      <div className="container py-2 flex items-center justify-center">
        <label htmlFor={name} className="w-2/12 mr-2">
          {label}
        </label>
        <input
          name={name}
          type="number"
          min="0"
          max="255"
          className="w-1/8 flex"
          value={value}
          onChange={handleInputChange}
        />
      </div>
    );
  };

  const ColorPreview: React.FC<ColorPreviewProps> = ({ color }) => {
    const white = (((color.white as number / 255) * 100) * (1 / 100)).toFixed(2)
    return (
      <div className="container py-4 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded"
          // style={{ backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})` }}
          style={{ backgroundColor: `rgba(${color.red}, ${color.green}, ${color.blue}, ${white})` }}
        ></div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="container max-w-md mx-4 border">
          <div className="container py-4">
            {/* <InputGroup label="Red" name="red" value={color.red} onChange={handleInputChange} />
            <InputGroup label="Green" name="green" value={color.green} onChange={handleInputChange} />
            <InputGroup label="Blue" name="blue" value={color.blue} onChange={handleInputChange} />
            <InputGroup label="White" name="white" value={color.white} onChange={handleInputChange} /> */}

            <div className="container py-2 flex items-center justify-center">
              <label htmlFor={"red"} className="w-2/12 mr-2">
                {"Red"}
              </label>
              <input
                name={"red"}
                type="number"
                min="0"
                max="255"
                className="w-1/8 flex"
                value={color.red}
                onChange={handleInputChange}
              />
            </div>
            <div className="container py-2 flex items-center justify-center">
              <label htmlFor={"green"} className="w-2/12 mr-2">
                {"Green"}
              </label>
              <input
                name={"green"}
                type="number"
                min="0"
                max="255"
                className="w-1/8 flex"
                value={color.green}
                onChange={handleInputChange}
              />
            </div>
            <div className="container py-2 flex items-center justify-center">
              <label htmlFor={"blue"} className="w-2/12 mr-2">
                {"Blue"}
              </label>
              <input
                name={"blue"}
                type="number"
                min="0"
                max="255"
                className="w-1/8 flex"
                value={color.blue}
                onChange={handleInputChange}
              />
            </div>
            <div className="container py-2 flex items-center justify-center">
              <label htmlFor={"white"} className="w-2/12 mr-2">
                {"White"}
              </label>
              <input
                name={"white"}
                type="number"
                min="0"
                max="255"
                className="w-1/8 flex"
                value={color.white}
                onChange={handleInputChange}
              />
            </div>
            < ColorPreview color={color} />
            <div className="py-4 flex justify-center">
              <div>
                <button
                  className="bg-blue-800 hover:bg-blue-700 text-slate-200 py-2 px-6 rounded"
                  onClick={handleSaveButtonClick}>Save</button>
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
