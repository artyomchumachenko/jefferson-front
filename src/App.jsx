import { useState } from "react";
import CryptoForm from "./components/CryptoForm";
import CryptoLogs from "./components/CryptoLogs";

export default function App() {
  const [logs, setLogs] = useState(null);

  return (
    <main className="min-h-screen flex flex-col lg:flex-row items-start justify-center bg-slate-100 text-slate-800 p-4 gap-8">
      <div className="w-full lg:w-1/2 px-4">
        <CryptoForm onLogs={setLogs} />
      </div>
      <div className="w-full lg:w-1/2 px-4">
        <CryptoLogs disks={logs} />
      </div>
    </main>
  );
}