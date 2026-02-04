package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Izinkan koneksi dari frontend
}

type Stats struct {
	CPU float64 `json:"cpu"`
	RAM float64 `json:"ram"`
}

func handleStats(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		// Ambil data CPU
		cpuPercent, _ := cpu.Percent(time.Second, false)
		// Ambil data RAM
		vMem, _ := mem.VirtualMemory()

		data := Stats{
			CPU: cpuPercent[0],
			RAM: vMem.UsedPercent,
		}

		// Kirim ke Frontend
		err := conn.WriteJSON(data)
		if err != nil {
			log.Println("Write error:", err)
			break
		}
		time.Sleep(2 * time.Second)
	}
}

func main() {
	http.HandleFunc("/ws", handleStats)
	fmt.Println("Backend jalan di :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}