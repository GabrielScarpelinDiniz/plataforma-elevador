import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chart from 'chart.js/auto';
import { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';
import mqtt from 'mqtt';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function App() {
  const [data, setData] = useState([]);
  const [liveData, setLiveData] = useState();


  useEffect(() => {
    if (!liveData) return;
    
    const duplicatedData = [...data];
    
    console.log("Dados: ",duplicatedData, "Length: ", duplicatedData.length);

    if (duplicatedData.length > 14) {
      // Remove o item mais antigo (primeiro item do array)
      duplicatedData.shift();
    }
    setData([...duplicatedData, { time: new Date().toLocaleTimeString(), rssiValue: liveData }]);
  }, [liveData])


  useEffect(() => {
    const client = mqtt.connect ("wss://b5e5f624d0fd49fdad0c0c226b67d6ae.s1.eu.hivemq.cloud:8884/mqtt", {
      username: "prodesp32",
      password: "Elevador23"
    });
    client.on("connect", () => {
      console.log("connected");
      client.subscribe("esp32/rssi")
    });

    client.on("message", (topic, message) => {
      if (topic === "esp32/rssi"){
        const value = Number(message.toString());
        setLiveData(value);
      }
    });
    
    client.on("error", (error) => {
      console.log("Can't connect" + error);
    });

  }, [])
return (<div className='flex'>
<GaugeComponent className='w-[600px] flex flex-col gap-4 text-white font-bold' value={liveData} minValue={-100} maxValue={200} />
<LineChart width={800} height={400} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
    <Line type="monotone" dataKey="rssiValue" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey="time" />
    <YAxis />
    <Tooltip />
  </LineChart>
</div>)
}

export default App
