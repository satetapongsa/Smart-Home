import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt/dist/mqtt'; // Use browser build for Vite
import { 
  Lightbulb, Fan, Home, Power, List, Zap, 
  LayoutDashboard, Settings, Sliders, ShieldCheck, 
  Plus, Video, Lock, Unlock, UserCircle, Bell, BellOff, Trash2
} from 'lucide-react';
import './App.css';

const initialDevices = [
  { id: 'SW-01', name: 'Living Room Light', type: 'Lighting', isOn: true, icon: 'Lightbulb', color: '#f59e0b', colorLight: '#fef3c7' },
  { id: 'SW-02', name: 'Bedroom AC', type: 'Climate', isOn: false, icon: 'Fan', color: '#3b82f6', colorLight: '#dbeafe' },
  { id: 'SW-03', name: 'Garage Door', type: 'Access', isOn: false, icon: 'Home', color: '#8b5cf6', colorLight: '#ede9fe' },
  { id: 'SW-04', name: 'Main Power', type: 'System', isOn: true, icon: 'Zap', color: '#ef4444', colorLight: '#fee2e2' },
];

const getIconComponent = (iconName) => {
  switch(iconName) {
    case 'Lightbulb': return Lightbulb;
    case 'Fan': return Fan;
    case 'Home': return Home;
    case 'Zap': return Zap;
    default: return Power;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mqttClient, setMqttClient] = useState(null);
  
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('smartHome_devices');
    return saved ? JSON.parse(saved) : initialDevices;
  });
  
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('smartHome_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: new Date().toLocaleTimeString(), msg: 'System initialized. Ready for connections.', type: 'info' }
    ];
  });
  
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('smartHome_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Admin',
      email: 'admin@smarthome.local',
      notifications: true
    };
  });

  const [securityArmed, setSecurityArmed] = useState(() => {
    const saved = localStorage.getItem('smartHome_security');
    return saved ? JSON.parse(saved) : false;
  });

  // --- MQTT LOGIC (HiveMQ Cloud) ---
  useEffect(() => {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    const username = import.meta.env.VITE_MQTT_USER;
    const password = import.meta.env.VITE_MQTT_PASS;

    if (!mqttUrl || username === 'YOUR_USERNAME') {
      console.warn('MQTT Credentials not set in .env file');
      return;
    }

    const client = mqtt.connect(mqttUrl, {
      username: username,
      password: password,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    client.on('connect', () => {
      console.log('Connected to HiveMQ Cloud');
      addLog('Connected to HiveMQ Cloud Securely.', 'info');
      client.subscribe('wavyhome/devices/+/status');
    });

    client.on('message', (topic, message) => {
      const parts = topic.split('/');
      if (parts.length >= 4 && parts[3] === 'status') {
        const deviceId = parts[2];
        const status = message.toString() === 'ON';
        setDevices(prev => prev.map(dev => 
          dev.id === deviceId ? { ...dev, isOn: status } : dev
        ));
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      addLog('MQTT Error: ' + err.message, 'off');
    });

    setMqttClient(client);

    return () => {
      if (client) client.end();
    };
  }, []);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('smartHome_devices', JSON.stringify(devices)); }, [devices]);
  useEffect(() => { localStorage.setItem('smartHome_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('smartHome_settings', JSON.stringify(userSettings)); }, [userSettings]);
  useEffect(() => { localStorage.setItem('smartHome_security', JSON.stringify(securityArmed)); }, [securityArmed]);

  const [newDevice, setNewDevice] = useState({ name: '', type: 'Lighting', id: '' });
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [
      ...prev, 
      { id: Date.now(), time: new Date().toLocaleTimeString(), msg, type }
    ]);
  };

  const toggleDevice = (id) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    const newState = !device.isOn;
    const commandStr = newState ? 'ON' : 'OFF';

    // Publish to HiveMQ
    if (mqttClient) {
      mqttClient.publish(`wavyhome/devices/${id}/command`, commandStr, { qos: 1 });
      addLog(`Command Sent to ${device.name}: ${commandStr}`, newState ? 'on' : 'off');
    } else {
      addLog(`Failed to send command: MQTT Not Connected`, 'off');
    }

    // Optimistic Update
    setDevices(prev => prev.map(dev => 
      dev.id === id ? { ...dev, isOn: newState } : dev
    ));
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.id) return;
    const colors = [
      { color: '#f59e0b', colorLight: '#fef3c7', icon: 'Lightbulb' },
      { color: '#3b82f6', colorLight: '#dbeafe', icon: 'Fan' },
      { color: '#10b981', colorLight: '#d1fae5', icon: 'Power' },
      { color: '#ec4899', colorLight: '#fce7f3', icon: 'Zap' }
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const deviceToAdd = { ...newDevice, isOn: false, icon: randomColor.icon, color: randomColor.color, colorLight: randomColor.colorLight };
    setDevices([...devices, deviceToAdd]);
    addLog(`New device added: ${deviceToAdd.name}`, 'info');
    setNewDevice({ name: '', type: 'Lighting', id: '' });
  };

  const handleDeleteDevice = (id) => {
    setDevices(devices.filter(d => d.id !== id));
    addLog(`Device removed.`, 'info');
  };

  const toggleSecurity = () => {
    const newState = !securityArmed;
    setSecurityArmed(newState);
    addLog(`Security System ${newState ? 'ARMED' : 'DISARMED'}`, newState ? 'on' : 'off');
  };

  const saveSettings = (e) => {
    e.preventDefault();
    addLog(`Settings updated.`, 'info');
    alert('Settings Saved!');
  };

  const renderDashboard = () => (
    <div className="main-content">
      <div className="devices-grid">
        {devices.map(device => {
          const IconComponent = getIconComponent(device.icon);
          return (
            <div key={device.id} className={`device-card ${device.isOn ? 'is-on' : ''}`} style={{ '--card-color': device.color, '--card-color-light': device.colorLight }}>
              <div className="device-header">
                <div className="device-icon-wrapper"><IconComponent size={28} /></div>
                <div className={`toggle-switch ${device.isOn ? 'is-on' : ''}`} onClick={() => toggleDevice(device.id)}><div className="toggle-knob"></div></div>
              </div>
              <div className="device-info"><div className="device-name">{device.name}</div><div className="device-type">{device.type}</div></div>
              <div className="device-footer"><span>Node: {device.id}</span><span className="status-text">{device.isOn ? 'ON' : 'OFF'}</span></div>
            </div>
          );
        })}
      </div>
      <div className="logs-panel">
        <div className="logs-header"><List size={22} color="#6366f1" /> Activity Log</div>
        <div className="logs-content">
          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div className={`log-icon-wrap ${log.type}`}>{log.type === 'info' ? <Zap size={16} /> : <Power size={16} />}</div>
              <div className="log-details"><div className="log-message">{log.msg}</div><div className="log-time">{log.time}</div></div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="settings-page">
      <div className="card-box mb-2">
        <h2>Add New Device</h2>
        <form onSubmit={handleAddDevice} className="form-group">
          <div className="input-row">
            <div className="input-field"><label>Device ID</label><input type="text" value={newDevice.id} onChange={e => setNewDevice({...newDevice, id: e.target.value})} placeholder="e.g. SW-05" required /></div>
            <div className="input-field"><label>Name</label><input type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} placeholder="e.g. Kitchen Light" required /></div>
            <div className="input-field">
              <label>Type</label>
              <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})}>
                <option>Lighting</option><option>Climate</option><option>Access</option><option>System</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary"><Plus size={18} /> Add Device</button>
        </form>
      </div>
      <div className="card-box">
        <h2>Manage Devices</h2>
        <div className="device-list">
          {devices.map(dev => {
            const Icon = getIconComponent(dev.icon);
            return (
              <div key={dev.id} className="device-list-item">
                <div className="device-list-info">
                  <div className="device-list-icon" style={{backgroundColor: dev.colorLight, color: dev.color}}><Icon size={20} /></div>
                  <div><div className="fw-bold">{dev.name}</div><div className="text-sm text-muted">{dev.id}</div></div>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteDevice(dev.id)}><Trash2 size={18} /> Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-page">
      <div className="security-status-card" style={{ backgroundColor: securityArmed ? '#fee2e2' : '#d1fae5', borderColor: securityArmed ? '#fca5a5' : '#6ee7b7' }}>
        <div className="security-header">{securityArmed ? <Lock size={48} color="#ef4444" /> : <Unlock size={48} color="#10b981" />}<div><h2 style={{ color: securityArmed ? '#991b1b' : '#065f46' }}>System is {securityArmed ? 'ARMED' : 'DISARMED'}</h2><p>Monitoring active.</p></div></div>
        <button className={`btn-large ${securityArmed ? 'btn-danger-large' : 'btn-success-large'}`} onClick={toggleSecurity}>{securityArmed ? 'DISARM' : 'ARM'}</button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-page">
      <div className="card-box max-w-md">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}><UserCircle size={64} color="#6366f1" /><div><h2>User Profile</h2></div></div>
        <form onSubmit={saveSettings} className="form-group">
          <div className="input-field"><label>Display Name</label><input type="text" value={userSettings.name} onChange={e => setUserSettings({...userSettings, name: e.target.value})} /></div>
          <div className="input-field"><label>Email</label><input type="email" value={userSettings.email} onChange={e => setUserSettings({...userSettings, email: e.target.value})} /></div>
          <div className="setting-toggle-row">
            <div><div className="fw-bold">Notifications</div></div>
            <div className={`toggle-switch ${userSettings.notifications ? 'is-on' : ''}`} onClick={() => setUserSettings({...userSettings, notifications: !userSettings.notifications})}><div className="toggle-knob"></div></div>
          </div>
          <button type="submit" className="btn-primary w-full">Save Changes</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="brand-icon"><Home size={28} color="#fff" /></div>WAVY HOME</div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /><span>Dashboard</span></div>
          <div className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`} onClick={() => setActiveTab('devices')}><Sliders size={20} /><span>Devices</span></div>
          <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><ShieldCheck size={20} /><span>Security</span></div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /><span>Settings</span></div>
        </nav>
        <div className="sidebar-footer"><p>MQTT Secure Mode</p></div>
      </aside>
      <div className="dashboard-container">
        <header className="header">
          <div className="header-title"><h1 style={{ textTransform: 'capitalize' }}>{activeTab}</h1></div>
          <div className="system-status"><div className="status-badge"><span className="dot"></span>System Online</div><div className="user-widget"><div className="avatar">{userSettings.name.charAt(0)}</div><span>{userSettings.name}</span></div></div>
        </header>
        {activeTab === 'dashboard' && renderDashboard()}{activeTab === 'devices' && renderDevices()}{activeTab === 'security' && renderSecurity()}{activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}

export default App;
