import React, { useState } from "react"
import colorPrefix from './data/color.json'

export type Color = {
    red: number | string
    green: number | string
    blue: number | string
    white: number | string
}

export type Light2 = {
    id: number
    label: string
    switch: boolean
    value: boolean
    color: Color
}

interface LightComponentProps {
    light: Light2
    onToggle: (id: number) => void
    onToggleSwitch: (id: number) => void
    onColorChange: (id: number, color: Color) => void
    onPreviewChange: (id: number, color: Color) => void
}

const LightComponent: React.FC<LightComponentProps> = ({ light, onToggle, onToggleSwitch, onColorChange, onPreviewChange }) => {
    const toggleLight = () => { onToggle(light.id) }
    const toggleLightSwitch = () => { onToggleSwitch(light.id) }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, colorKey: keyof Color) => {
        const { value } = e.target;
        const parsedValue = Number.isNaN(value) ? NaN : parseInt(value, 10);
        const clampedValue = Number.isNaN(parsedValue) ? "" : Math.min(Math.max(parsedValue, 0), 255); // Clamp value between 0 and 255
        const newColor = { ...light.color, [colorKey]: clampedValue }
        onColorChange(light.id, newColor)
    }

    const handleDefaultColorChange = (id: number, color: Color) => {
        onPreviewChange(id, color)
    }
    
    return (
        <div className="flex items-center justify-between">
            <div className="p-2 flex flex-col border m-4 rounded w-full">
                <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                        <label htmlFor="one">
                            <input type="checkbox" name="one" id="one" checked={light.value} onChange={() => light.value} onClick={toggleLight} /> {light.label}
                        </label>
                    </div>
                    <div className="flex-end">
                        <label htmlFor="on-off">
                            <input type="checkbox" className="on-off" name="on-off" id="on-off" checked={light.switch} onChange={() => light.switch} onClick={toggleLightSwitch} />
                        </label>
                    </div>
                </div>
                <div className="flex flex-col w-full items-center">
                    < ColorPreview color={light.color} id={light.id} onPreviewChange={handleDefaultColorChange} />
                    <div className="flex flex-row items-center justify-center m-2 w-full">
                        <div className="flex flex-col flex-auto items-center">
                            <label htmlFor="red" className="capitalize">red</label>
                            <input type="number" className="w-14 h-8 rounded text-center" min={0} max={255} value={light.color.red} onChange={(e) => handleColorChange(e, "red")} />
                        </div>
                        <div className="flex flex-col flex-auto items-center">
                            <label htmlFor="green" className="capitalize ">green</label>
                            <input type="number" className="w-14 h-8 rounded text-center" min={0} max={255} value={light.color.green} onChange={(e) => handleColorChange(e, "green")} />
                        </div>
                        <div className="flex flex-col flex-auto items-center">
                            <label htmlFor="blue" className="capitalize ">blue</label>
                            <input type="number" className="w-14 h-8 rounded text-center" min={0} max={255} value={light.color.blue} onChange={(e) => handleColorChange(e, "blue")} />
                        </div>
                        <div className="flex flex-col flex-auto items-center">
                            <label htmlFor="white" className="capitalize ">white</label>
                            <input type="number" className="w-14 h-8 rounded text-center" min={0} max={255} value={light.color.white} onChange={(e) => handleColorChange(e, "white")} />
                        </div>
                        {/* <div className="flex flex-col flex-auto items-center">
                            <label htmlFor="white" className="capitalize ">white</label>
                            <input type="range" className="w-14 h-8 rounded text-center" min={0} max={255} step={1} value={light.color.white} onChange={(e) => handleColorChange(e, "white")} />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ColorPreviewProps {
    id: number
    color: Color
    onPreviewChange: (id: number, color: Color) => void
}

export type RGBColor = Omit<Color, "white">

const ColorPreview: React.FC<ColorPreviewProps> = ({ id, color, onPreviewChange }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen)
    }

    const handleColorPreviewClick = () => {
        toggleDropdown()
    }

    const handleDropdownItemClick = (color: Number[]) => {
        onPreviewChange(id, {
            red: color[0] as number,
            green: color[1] as number,
            blue: color[2] as number,
            white: color[3] as number,
        })
        toggleDropdown()
    }

    // const white = (1-((color.white as number / 255) * 100) * (1 / 100)).toFixed(2)
    const rgb: RGBColor = { red: color.red, green: color.green, blue: color.blue }
    let { red, green, blue } = color
    if (Object.values(rgb).every(value => value === 0)) {
        red = green = blue = 255
    }

    const dropdownColor = colorPrefix.solid
    return (
        <div className="container py-2 flex items-center justify-center">
            <div className="relative">
                <div
                    className="w-24 h-8 rounded cursor-pointer"
                    style={{ backgroundColor: `rgba(${red}, ${green}, ${blue})` }}
                    onClick={handleColorPreviewClick}
                ></div>
                {dropdownOpen && (
                    <div className="absolute top-full left-0 z-10 border-rounded mt-1 bg-white shadow-md rounded-md">
                        <div className="py-1">
                            {dropdownColor.map((def, index) => (
                                <button
                                    key={index}
                                    className={`w-24 h-8 block w-full text-left px-4 py-2 text-sm cursor-pointer font-semibold text-center ${def.text}`}
                                    style={{ backgroundColor: `rgba(${def.value.join(",")})` }}
                                    onClick={() => handleDropdownItemClick(def.value)}
                                >
                                    {def.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface LightsProps {
    lights: Light2[]
    setLights: React.Dispatch<React.SetStateAction<Light2[]>>
    switchLight: (id: number, switchState: boolean) => Promise<void>
}

const defaultColor = { red: 0, green: 0, blue: 0, white: 0 };

const Lights2: React.FC<LightsProps> = ({ lights, setLights, switchLight }) => {
  const [selectedId, setSelectedId] = useState<number>(1); // Dropdown-controlled Light ID

  const toggleLight = (id: number) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, value: !light.value } : light
      )
    );
  };

  const toggleLightSwitch = async (id: number) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, switch: !light.switch } : light
      )
    );
    const light = lights.find((light) => light.id === id);
    if (light) {
      await switchLight(id, !light.switch);
    }
  };

  const handleColorChange = (id: number, color: Color) => {
    setLights((prevLights) =>
      prevLights.map((light) => (light.id === id ? { ...light, color } : light))
    );
  };

  const handlePreviewChange = (id: number, color: Color) => {
    setLights((prevLights) =>
      prevLights.map((light) => (light.id === id ? { ...light, color } : light))
    );
    return color;
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedId(id);
    if (!lights.some((light) => light.id === id)) {
      // Add new light to the list if not present
      setLights((prevLights) => [
        ...prevLights,
        { id, label: `Light ${id}`, switch: true, value: true, color: defaultColor },
      ]);
    }
  };

  // Get the light object corresponding to the selected ID
  const selectedLight = lights.find((light) => light.id === selectedId);

  return (
    <div className="flex flex-col items-center">
      {/* Dropdown to select Light ID */}
      <select
        value={selectedId}
        onChange={handleDropdownChange}
        className="border border-gray-300 rounded p-2 mb-4"
      >
        {Array.from({ length: 22 }, (_, index) => index + 1).map((id) => (
          <option key={id} value={id}>
            Light {id}
          </option>
        ))}
      </select>

      {selectedLight && (
        <LightComponent
          light={selectedLight}
          onToggle={toggleLight}
          onToggleSwitch={toggleLightSwitch}
          onColorChange={handleColorChange}
          onPreviewChange={handlePreviewChange}
        />
      )}
    </div>
  );
};

export default Lights2
