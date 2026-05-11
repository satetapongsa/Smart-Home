# ⚡ SmartHub: ESP32 IoT Dashboard

A beautiful, minimal, and responsive web dashboard designed to seamlessly monitor and control ESP32-based Smart Home IoT devices. Built with modern web technologies (React, Vite, CSS), this dashboard provides an elegant interface for home automation systems.

---

## ✨ Features

- **🎛️ Device Management:** Add, configure, and monitor IoT nodes (ESP32) dynamically via the UI.
- **🛡️ Security System:** Arm/Disarm security modes with integrated camera placeholder views.
- **📊 Real-time Activity Log:** Keep track of all system events, connections, and user actions.
- **💾 Persistent State:** Device status and user configurations are safely stored in the browser's Local Storage (no data loss upon refresh).
- **🎨 Minimalist UI:** A clean, modern user interface utilizing `lucide-react` icons and a curated color palette.

## 🛠️ Technology Stack

- **Frontend Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Vanilla CSS (Custom Properties, Flexbox, CSS Grid)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/esp32-smarthub.git
   cd esp32-smarthub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173/`.

---

## 🔗 Integration with ESP32 Hardware

To connect this dashboard to real physical ESP32 devices, you will need to establish a communication protocol (such as WebSockets, MQTT, or HTTP REST APIs).

*Example Concept (WebSocket):*
Update the `toggleDevice` function in `src/App.jsx` to send a payload directly to your ESP32 IP address or your centralized MQTT Broker:

```javascript
const toggleDevice = (id) => {
  // 1. Establish your WebSocket connection
  // 2. Send command to the specific node
  // socket.send(JSON.stringify({ deviceId: id, command: 'TOGGLE' }));
};
```

---

## 🔒 Security Best Practices

When deploying this system to production or exposing your ESP32 to the internet, please adhere to the following safety guidelines:

1. **Environment Variables:** Never hardcode sensitive API keys, Wi-Fi credentials, or IP addresses in your React components. Use `.env` files (which are ignored by Git).
2. **Authentication:** Implement a robust login system (e.g., JWT, OAuth 2.0) before exposing the dashboard to the public web.
3. **Secure Protocols:** Always serve the frontend over **HTTPS** and use Secure WebSockets (**WSS**) or Secure MQTT (**MQTTS**) to encrypt payload data in transit.
4. **Network Isolation:** Consider running your IoT devices on an isolated VLAN separate from your main home network.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
