# Gaze - Real-time System Health Monitoring Dashboard

[![Go Version](https://img.shields.io/badge/Go-1.24.4-blue.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF.svg)](https://vitejs.dev/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

A modern, real-time system health monitoring dashboard that provides live insights into your computer's CPU and RAM usage. Built with Go backend and React frontend for optimal performance and user experience.

## ✨ Features

- **Real-time Monitoring**: Live CPU and RAM usage tracking via WebSocket connections
- **Interactive Charts**: Beautiful area charts showing performance history over time
- **Critical Alerts**: Automatic alerts when CPU usage exceeds 90%
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern UI**: Dark theme with smooth animations and professional design
- **Lightweight**: Minimal resource usage while monitoring system performance
- **Cross-platform**: Supports Windows, macOS, and Linux

## 🏗️ Architecture

### Backend (Go)

- WebSocket server for real-time data streaming
- System metrics collection using `gopsutil` library
- CORS enabled for frontend communication
- Runs on port 8080

### Frontend (React + Vite)

- Modern React application with hooks
- Real-time data visualization using Recharts
- Responsive design with Tailwind CSS
- WebSocket client for live updates

## 🚀 Quick Start

### Prerequisites

- Go 1.24.4 or higher
- Node.js 18+ and npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jodijonatan/gaze.git
   cd gaze
   ```

2. **Backend Setup**

   ```bash
   cd backend
   go mod download
   go run main.go
   ```

3. **Frontend Setup** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Dashboard**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 📊 Usage

Once running, the dashboard will automatically:

- Connect to the backend WebSocket server
- Display current CPU and RAM usage
- Show performance history in interactive charts
- Alert when CPU usage is critically high

## 🛠️ Development

### Backend Development

```bash
cd backend
# Run with hot reload (if using tools like air)
air
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure

```
gaze/
├── backend/
│   ├── go.mod
│   ├── go.sum
│   └── main.go          # WebSocket server
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx      # Main dashboard component
│   │   ├── main.jsx     # React entry point
│   │   └── index.css    # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── README.md        # Frontend-specific docs
└── README.md            # Main project documentation
```

## 🛡️ Security

- No sensitive data is stored or transmitted
- WebSocket connections are local only (localhost)
- CORS is configured for development environment
- All dependencies are from trusted sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [gopsutil](https://github.com/shirou/gopsutil) for system monitoring
- [Gorilla WebSocket](https://github.com/gorilla/websocket) for WebSocket implementation
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for system administrators and developers who need real-time insights into their system's health.**
