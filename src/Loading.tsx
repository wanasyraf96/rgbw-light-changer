import { useState, useEffect } from 'react'
interface LoadingProps {
    loading: boolean
}
const Loading: React.FC<LoadingProps> = ({ loading }) => {
    const [second, setSecond] = useState(40)
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (loading) {
            intervalId = setInterval(() => {
                setSecond(prevSecond => prevSecond - 1);
            }, 1000);
        } else {
            setSecond(40); // Reset seconds when loading is false
        }

        return () => clearInterval(intervalId); // Cleanup interval on component unmount or loading change
    }, [loading]);
    return (
        <div
            className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 ${loading ? 'block' : 'hidden'
                }`}
        >
            <div className="bg-white p-8 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                    <svg
                        className="animate-spin h-8 w-8 mr-3 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V2.83A10 10 0 002 12h2zm16 0a8 8 0 01-8 8V21.17A10 10 0 0022 12h-2zM12 20a8 8 0 01-8-8H2a10 10 0 0010 10v-2zm0-16a8 8 0 018 8h2a10 10 0 00-10-10v2z"
                        ></path>
                    </svg>
                    <span className="font-semibold text-lg">{second}</span>
                </div>
                <p className="text-gray-700">Please wait while we process your request.</p>
            </div>
        </div>
    );
};

export default Loading