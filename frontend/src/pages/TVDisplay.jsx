import { useState, useEffect } from "react";

const TVDisplay = () => {
  const [queue, setQueue] = useState([]);
  const [previousFirstPatients, setPreviousFirstPatients] = useState({});

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch("http://192.168.110.35:5000/api/queue");
        const data = await response.json();
        console.log("Queue Data from API:", data);
        setQueue(data);
      } catch (error) {
        console.error("Error fetching queue:", error);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 1000);
    return () => clearInterval(interval);
  }, []);

  const cubicleOrder = [
    "Cubicle 1", "Cubicle 2", "Cubicle 3", "Cubicle 4", "Cubicle 5",
    "MCC", "MESRU", "MENTAL", "DENTAL"
  ];

  const groupedQueue = queue.reduce((acc, patient) => {
    const cubicle = patient.cubicle || "Unassigned";
    if (!acc[cubicle]) acc[cubicle] = [];
    acc[cubicle].unshift(patient);
    if (acc[cubicle].length > 3) acc[cubicle] = acc[cubicle].slice(0, 3);
    return acc;
  }, {});

  const cubiclesWithPatients = cubicleOrder.filter(
    (cubicle) => groupedQueue[cubicle] && groupedQueue[cubicle].length > 0
  );

  useEffect(() => {
    let hasChanged = false;
    cubiclesWithPatients.forEach((cubicle) => {
      const firstPatient = groupedQueue[cubicle]?.[0]?.name;
      if (firstPatient && previousFirstPatients[cubicle] !== firstPatient) {
        hasChanged = true;
        setPreviousFirstPatients((prev) => ({ ...prev, [cubicle]: firstPatient }));
      }
    });

    if (hasChanged) {
      const audio = new Audio("/alert.mp3");
      audio.play().catch((error) => console.error("Error playing sound:", error));
    }
  }, [queue]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      {/* Dynamic Grid: Adjusts Cubicle Layout */}
      <div 
        className={`grid gap-4 w-full max-w-12x2 ${
          cubiclesWithPatients.length === 1 
            ? "grid-cols-1" 
            : cubiclesWithPatients.length === 2 
            ? "grid-cols-2" 
            : "grid-cols-3"
        }`}
      >
        {cubiclesWithPatients.map((cubicle) => (
          <div 
            key={cubicle} 
            className={`bg-white p-4 rounded-lg shadow-lg border-4 border-green-400 ${
              cubiclesWithPatients.length === 1 ? "col-span-full" : ""
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-center text-white bg-green-600 p-2 rounded-md uppercase">
              {cubicle}
            </h2>
            <div className="max-h-48 sm:max-h-60 overflow-y-auto mt-2">
              <table className="w-full border-collapse border border-gray-400 text-sm sm:text-lg">
                <thead className="sticky top-0 bg-gray-300 text-black font-bold">
                  <tr>
                    <th className="p-2 border border-gray-300">#</th>
                    <th className="p-2 border border-gray-300">Name</th>
                    <th className="p-2 border border-gray-300">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedQueue[cubicle].map((patient, index) => (
                    <tr 
                      key={patient._id} 
                      className={`text-center ${
                        index === 0 ? "bg-yellow-300 text-black font-bold text-4xl animate-bounceSlow" 
                                    : "bg-white-100 text-black text-3xl font-semibold"
                      }`}
                    >
                      <td className="p-2 border border-gray-400">{index + 1}</td>
                      <td className="p-2 border border-gray-400">{patient.name}</td>
                      <td className="p-2 border border-gray-400 font-bold text-red-600">{patient.priority || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="mt-4 w-full text-center text-sm sm:text-lg bg-white p-2 border-t-4 border-blue-400 text-blue-600 font-bold">
        🔄 Patients will be called in order of priority
      </div>
    </div>
  );
};

export default TVDisplay;