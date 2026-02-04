package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

// Upgrader untuk WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Struct untuk Data Statistik (WebSocket)
type Stats struct {
	CPU float64 `json:"cpu"`
	RAM float64 `json:"ram"`
}

// Struct untuk Data Proses (HTTP)
type ProcessInfo struct {
	PID    int32   `json:"pid"`
	Name   string  `json:"name"`
	CPU    float64 `json:"cpu"`
	Memory float32 `json:"memory"`
}

// Middleware untuk menangani CORS secara global
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// Handler WebSocket untuk data real-time
func handleStats(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WS Upgrade Error:", err)
		return
	}
	defer conn.Close()

	for {
		cpuPercent, _ := cpu.Percent(time.Second, false)
		vMem, _ := mem.VirtualMemory()

		data := Stats{
			CPU: cpuPercent[0],
			RAM: vMem.UsedPercent,
		}

		if err := conn.WriteJSON(data); err != nil {
			break
		}
		time.Sleep(2 * time.Second)
	}
}

// Handler HTTP untuk mendapatkan daftar proses
func getProcesses(w http.ResponseWriter, r *http.Request) {
	allProcs, err := process.Processes()
	if err != nil {
		http.Error(w, "Failed to get processes", http.StatusInternalServerError)
		return
	}

	var results []ProcessInfo
	count := 0
	for _, p := range allProcs {
		if count >= 50 { // Ambil 50 proses saja agar performa tetap terjaga
			break
		}

		name, errName := p.Name()
		if errName != nil {
			continue // Lewati jika proses tidak bisa diakses
		}

		cpuP, _ := p.CPUPercent()
		memP, _ := p.MemoryPercent()

		results = append(results, ProcessInfo{
			PID:    p.Pid,
			Name:   name,
			CPU:    cpuP,
			Memory: memP,
		})
		count++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// Handler HTTP untuk mematikan proses
func killProcess(w http.ResponseWriter, r *http.Request) {
	pidQuery := r.URL.Query().Get("pid")
	pid, err := strconv.Atoi(pidQuery)
	if err != nil {
		http.Error(w, "Invalid PID", http.StatusBadRequest)
		return
	}

	p, err := process.NewProcess(int32(pid))
	if err != nil {
		http.Error(w, "Process not found", http.StatusNotFound)
		return
	}

	if err := p.Kill(); err != nil {
		http.Error(w, "Failed to kill process", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Process %d terminated", pid)
}

func main() {
	// Menghubungkan handler dengan middleware CORS
	http.HandleFunc("/ws", handleStats) // WebSocket biasanya tidak butuh CORS manual ini
	http.HandleFunc("/processes", enableCORS(getProcesses))
	http.HandleFunc("/kill", enableCORS(killProcess))

	fmt.Println("------------------------------------")
	fmt.Println(" GAZE ENGINE IS RUNNING ")
	fmt.Println(" URL: http://localhost:8080")
	fmt.Println("------------------------------------")

	log.Fatal(http.ListenAndServe(":8080", nil))
}