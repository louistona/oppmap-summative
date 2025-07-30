import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import './App.css'; // For custom styling
import L from 'leaflet'; // Import Leaflet for custom icon

import { supabase } from './supabase/client'; // Import our Supabase client

// Fix for default Leaflet marker icon issues with Webpack
delete L.Icon.Default.prototype._get_icon_root;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


function App() {
  // Supabase user session state
  const [session, setSession] = useState(null);

  // Map state (Kigali defaults)
  const [center, setCenter] = useState([-1.9403, 29.8739]); // Approximate center of Rwanda
  const [zoom, setZoom] = useState(8);

  // Authentication message state
  const [authMessage, setAuthMessage] = useState('');

  // --- Supabase Authentication Logic ---
  useEffect(() => {
    // Function to get current session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };

    getSession();

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
            setAuthMessage('Please log in or register.');
        } else {
            setAuthMessage(`Logged in as: ${session.user.email}`);
        }
      }
    );

    return () => subscription.unsubscribe(); // Cleanup subscription
  }, []); // Empty dependency array means this runs once on mount

  const handleLogin = async (email, password) => {
    setAuthMessage('Logging in...');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Session state will be updated by onAuthStateChange listener
    } catch (error) {
      setAuthMessage(`Login failed: ${error.message}`);
      console.error('Login error:', error.message);
    }
  };

  const handleRegister = async (email, password) => {
    setAuthMessage('Registering...');
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setAuthMessage('Registration successful! Check your email to confirm your account (if email confirmation is enabled in Supabase).');
      // Session state will be updated by onAuthStateChange listener
    } catch (error) {
      setAuthMessage(`Registration failed: ${error.message}`);
      console.error('Register error:', error.message);
    }
  };

  const handleLogout = async () => {
    setAuthMessage('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthMessage('Logged out successfully.');
      setSession(null); // Clear session immediately
    } catch (error) {
      setAuthMessage(`Logout failed: ${error.message}`);
      console.error('Logout error:', error.message);
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h1>Opportunity Map</h1>
        <p className="auth-message">{authMessage}</p>

        {!session ? (
          <div className="auth-form-container">
            <h2>Login / Register</h2>
            <input type="email" placeholder="Email" id="auth-email" />
            <input type="password" placeholder="Password" id="auth-password" />
            <button onClick={() => handleLogin(
              document.getElementById('auth-email').value,
              document.getElementById('auth-password').value
            )}>Login</button>
            <button onClick={() => handleRegister(
              document.getElementById('auth-email').value,
              document.getElementById('auth-password').value
            )}>Register</button>
          </div>
        ) : (
          <div className="user-dashboard">
            <p>Welcome, {session.user.email}!</p>
            <button onClick={handleLogout}>Logout</button>
            {/* Placeholder for future user dashboard content */}
            <p>More user features will go here...</p>
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Example marker (Kigali City Tower) */}
          <Marker position={[-1.9547, 30.0606]}>
            <Popup>
              A sample location in Kigali.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;