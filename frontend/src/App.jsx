import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Activity, Cpu, HardDrive, Bell } from "lucide-react";

function App() {
  const [data, setData] = useState([]);
  const [currentStats, setCurrentStats] = useState({ cpu: 0, ram: 0 });

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      const stats = JSON.parse(event.data);
      const timestamp = new Date().toLocaleTimeString();

      setCurrentStats(stats);
      setData((prev) => [...prev.slice(-19), { time: timestamp, ...stats }]);
    };

    return () => socket.close();
  }, []);

  const isAlert = currentStats.cpu > 90;

  return (
    <div className="min-h-screen p-6 lg:p-12 transition-colors duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gaze <span className="text-blue-500">Dashboard</span>
          </h1>
          <p className="text-slate-400">Real-time system health monitoring</p>
        </div>
        {isAlert && (
          <div className="flex items-center gap-2 bg-red-500/20 text-red-500 px-4 py-2 rounded-full border border-red-500 animate-pulse">
            <Bell size={18} />
            <span className="font-bold text-sm">CRITICAL CPU LOAD!</span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard
          title="CPU Usage"
          value={`${currentStats.cpu.toFixed(1)}%`}
          icon={<Cpu className="text-blue-500" />}
          color="blue"
          percentage={currentStats.cpu}
        />
        <StatCard
          title="Memory RAM"
          value={`${currentStats.ram.toFixed(1)}%`}
          icon={<Activity className="text-emerald-500" />}
          color="emerald"
          percentage={currentStats.ram}
        />
      </div>

      {/* Main Chart */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <HardDrive size={20} className="text-slate-400" />
          Performance History
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCpu)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="ram"
                stroke="#10b981"
                fillOpacity={0}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Sub-component untuk Card
function StatCard({ title, value, icon, color, percentage }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-900 rounded-lg">{icon}</div>
        <span className="text-2xl font-bold tracking-tighter">{value}</span>
      </div>
      <p className="text-slate-400 font-medium mb-4">{title}</p>
      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color === "blue" ? "bg-blue-500" : "bg-emerald-500"}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default App;
