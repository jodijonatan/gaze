import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Cpu,
  HardDrive,
  Bell,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react";

function App() {
  const [data, setData] = useState([]);
  const [currentStats, setCurrentStats] = useState({ cpu: 0, ram: 0 });
  const [processes, setProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // WebSocket for Real-time Stats
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.onmessage = (event) => {
      const stats = JSON.parse(event.data);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentStats(stats);
      setData((prev) => [...prev.slice(-20), { time: timestamp, ...stats }]);
    };
    return () => socket.close();
  }, []);

  // Fetch Processes
  const fetchProcesses = async () => {
    try {
      const res = await fetch("http://localhost:8080/processes");
      const d = await res.json();
      setProcesses(d);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid) => {
    if (window.confirm(`Terminate process ${pid}?`)) {
      await fetch(`http://localhost:8080/kill?pid=${pid}`, {
        method: "DELETE",
      });
      fetchProcesses();
    }
  };

  const filteredProcesses = useMemo(
    () =>
      processes.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [processes, searchTerm],
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Glow Effect Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">
                Live System Feed
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              GAZE<span className="text-blue-500">.</span>IO
            </h1>
          </div>

          {currentStats.cpu > 80 && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-400 animate-bounce">
              <Bell className="animate-swing" />
              <span className="font-bold">System Overload Detected</span>
            </div>
          )}
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="CPU Load"
            value={currentStats.cpu}
            color="#3b82f6"
            icon={<Cpu size={20} />}
          />
          <StatCard
            title="RAM Usage"
            value={currentStats.ram}
            color="#10b981"
            icon={<Activity size={20} />}
          />
        </div>

        {/* Chart Section */}
        <section className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <HardDrive className="text-slate-400" /> Performance Metrics
            </h2>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#blueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="ram"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Process Table Section */}
        <section className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between gap-4 bg-slate-800/20">
            <h2 className="text-xl font-bold text-white">Running Processes</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Filter processes..."
                  className="bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={fetchProcesses}
                className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Process Name</th>
                  <th className="p-4 font-semibold text-center">PID</th>
                  <th className="p-4 font-semibold text-center">CPU %</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredProcesses.map((proc) => (
                  <tr
                    key={proc.pid}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 font-medium text-blue-100">
                      {proc.name || "Unknown"}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-500 text-xs">
                      {proc.pid}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold ${proc.cpu > 5 ? "bg-orange-500/20 text-orange-400" : "bg-slate-700/50 text-slate-400"}`}
                      >
                        {proc.cpu.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleKill(proc.pid)}
                        className="hover:bg-red-500/20 p-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden group">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-tighter">
            {title}
          </p>
          <h3 className="text-4xl font-black text-white">
            {value.toFixed(1)}%
          </h3>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/50 text-slate-400 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
      <div className="mt-6 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 15px ${color}`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default App;
