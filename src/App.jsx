import { useState, useEffect, useRef } from 'react';
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

  // Persist to localStorage whenever state changes
  useEffect(() => { localStorage.setItem('smartHome_devices', JSON.stringify(devices)); }, [devices]);
  useEffect(() => { localStorage.setItem('smartHome_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('smartHome_settings', JSON.stringify(userSettings)); }, [userSettings]);
  useEffect(() => { localStorage.setItem('smartHome_security', JSON.stringify(securityArmed)); }, [securityArmed]);

  // New Device Form State
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
    
    addLog(
      `${device.name} (${device.id}) was turned ${newState ? 'ON' : 'OFF'}`,
      newState ? 'on' : 'off'
    );

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

    const deviceToAdd = {
      ...newDevice,
      isOn: false,
      icon: randomColor.icon,
      color: randomColor.color,
      colorLight: randomColor.colorLight
    };

    setDevices([...devices, deviceToAdd]);
    addLog(`New device added: ${deviceToAdd.name} (${deviceToAdd.id})`, 'info');
    setNewDevice({ name: '', type: 'Lighting', id: '' });
  };

  const handleDeleteDevice = (id) => {
    const device = devices.find(d => d.id === id);
    setDevices(devices.filter(d => d.id !== id));
    addLog(`Device removed: ${device.name}`, 'info');
  };

  const toggleSecurity = () => {
    const newState = !securityArmed;
    setSecurityArmed(newState);
    addLog(`Security System ${newState ? 'ARMED' : 'DISARMED'}`, newState ? 'on' : 'off');
  };

  const saveSettings = (e) => {
    e.preventDefault();
    addLog(`User settings updated for ${userSettings.name}`, 'info');
    alert('Settings Saved Successfully!');
  };

  // --- Render Helpers ---

  const renderDashboard = () => (
    <div className="main-content">
      <div className="devices-grid">
        {devices.map(device => {
          const IconComponent = getIconComponent(device.icon);
          return (
            <div 
              key={device.id} 
              className={`device-card ${device.isOn ? 'is-on' : ''}`}
              style={{ '--card-color': device.color, '--card-color-light': device.colorLight }}
            >
              <div className="device-header">
                <div className="device-icon-wrapper">
                  <IconComponent size={28} />
                </div>
                <div 
                  className={`toggle-switch ${device.isOn ? 'is-on' : ''}`}
                  onClick={() => toggleDevice(device.id)}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-type">{device.type}</div>
              </div>
              <div className="device-footer">
                <span>Node: {device.id}</span>
                <span className="status-text">{device.isOn ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="logs-panel">
        <div className="logs-header">
          <List size={22} color="#6366f1" />
          Activity Log
        </div>
        <div className="logs-content">
          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div className={`log-icon-wrap ${log.type}`}>
                {log.type === 'info' ? <Zap size={16} /> : <Power size={16} />}
              </div>
              <div className="log-details">
                <div className="log-message">{log.msg}</div>
                <div className="log-time">{log.time}</div>
              </div>
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
            <div className="input-field">
              <label>Device ID (ESP32 Node ID)</label>
              <input type="text" value={newDevice.id} onChange={e => setNewDevice({...newDevice, id: e.target.value})} placeholder="e.g. SW-05" required />
            </div>
            <div className="input-field">
              <label>Device Name</label>
              <input type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} placeholder="e.g. Kitchen Light" required />
            </div>
            <div className="input-field">
              <label>Type</label>
              <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})}>
                <option>Lighting</option>
                <option>Climate</option>
                <option>Access</option>
                <option>System</option>
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
                  <div className="device-list-icon" style={{backgroundColor: dev.colorLight, color: dev.color}}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="fw-bold">{dev.name}</div>
                    <div className="text-sm text-muted">{dev.id} | {dev.type}</div>
                  </div>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteDevice(dev.id)}>
                  <Trash2 size={18} /> Remove
                </button>
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
        <div className="security-header">
          {securityArmed ? <Lock size={48} color="#ef4444" /> : <Unlock size={48} color="#10b981" />}
          <div>
            <h2 style={{ color: securityArmed ? '#991b1b' : '#065f46' }}>
              System is {securityArmed ? 'ARMED' : 'DISARMED'}
            </h2>
            <p style={{ color: securityArmed ? '#b91c1c' : '#047857' }}>
              {securityArmed ? 'Motion sensors and alarms are active.' : 'Alarms are disabled. Cameras are recording.'}
            </p>
          </div>
        </div>
        <button 
          className={`btn-large ${securityArmed ? 'btn-danger-large' : 'btn-success-large'}`}
          onClick={toggleSecurity}
        >
          {securityArmed ? 'DISARM SYSTEM' : 'ARM SYSTEM'}
        </button>
      </div>

      <div className="camera-grid">
        <div className="camera-feed">
          <div className="camera-placeholder">
            <Video size={48} color="#94a3b8" />
            <span>Front Gate - Live View</span>
            <div className="rec-dot">REC</div>
          </div>
        </div>
        <div className="camera-feed">
          <div className="camera-placeholder">
            <Video size={48} color="#94a3b8" />
            <span>Backyard - Live View</span>
            <div className="rec-dot">REC</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-page">
      <div className="card-box max-w-md">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <UserCircle size={64} color="#6366f1" />
          <div>
            <h2>User Profile</h2>
            <p className="text-muted">Manage your personal settings</p>
          </div>
        </div>

        <form onSubmit={saveSettings} className="form-group">
          <div className="input-field">
            <label>Display Name</label>
            <input 
              type="text" 
              value={userSettings.name} 
              onChange={e => setUserSettings({...userSettings, name: e.target.value})} 
            />
          </div>
          
          <div className="input-field">
            <label>Email Address</label>
            <input 
              type="email" 
              value={userSettings.email} 
              onChange={e => setUserSettings({...userSettings, email: e.target.value})} 
            />
          </div>

          <div className="setting-toggle-row">
            <div>
              <div className="fw-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {userSettings.notifications ? <Bell size={18} color="#10b981"/> : <BellOff size={18} color="#64748b"/>}
                Push Notifications
              </div>
              <div className="text-sm text-muted">Receive alerts for device activity and security.</div>
            </div>
            <div 
              className={`toggle-switch ${userSettings.notifications ? 'is-on' : ''}`}
              onClick={() => setUserSettings({...userSettings, notifications: !userSettings.notifications})}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" style={{ marginTop: '1.5rem' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Home size={28} color="#fff" />
          </div>
          WAVY HOME
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`} onClick={() => setActiveTab('devices')}>
            <Sliders size={20} />
            <span>Devices</span>
          </div>
          <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <ShieldCheck size={20} />
            <span>Security</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <p>ESP32 Controller v1.2</p>
          <p>Connected via WebSocket</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-container">
        <header className="header">
          <div className="header-title">
            <h1 style={{ textTransform: 'capitalize' }}>{activeTab}</h1>
            <div className="header-subtitle">
              {activeTab === 'dashboard' && 'Manage your connected devices'}
              {activeTab === 'devices' && 'Add or remove ESP32 nodes'}
              {activeTab === 'security' && 'Monitor cameras and alarm systems'}
              {activeTab === 'settings' && 'Update your profile and preferences'}
            </div>
          </div>
          
          <div className="system-status">
            <div className="status-badge">
              <span className="dot"></span>
              System Online
            </div>
            <div className="user-widget">
              <div className="avatar">{userSettings.name.charAt(0).toUpperCase()}</div>
              <span style={{fontWeight: 600, fontSize: '0.9rem', paddingRight: '0.5rem'}}>{userSettings.name}</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}

export default App;
