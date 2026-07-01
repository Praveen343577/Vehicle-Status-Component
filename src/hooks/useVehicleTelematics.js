import { useState, useEffect, useRef } from 'react';

const username = import.meta.env.VITE_TEST_USERNAME;

const applySocketData = (vehicle, data) => {
  const parsedLat = Number.parseFloat(data.latitude);
  const parsedLng = Number.parseFloat(data.longitude);

  vehicle.latitude = Number.isNaN(parsedLat) ? vehicle.latitude : parsedLat;
  vehicle.longitude = Number.isNaN(parsedLng) ? vehicle.longitude : parsedLng;
  vehicle.is_connected = data.is_connected ?? vehicle.is_connected;

  if (parsedLat === 0 || parsedLng === 0 || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    vehicle.mode = 'nogps';
  } else if (vehicle.is_connected) {
    vehicle.mode = 'active';
  } else {
    vehicle.mode = 'inactive';
  }
};

export const useVehicleTelematics = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchDevices = async () => {
      try {
        const res = await fetch(`/api/devices/?username=${username}`);
        if (!res.ok) throw new Error('REST API fetch failed');
        const data = await res.json();

        const initialVehicles = data.map(device => ({
          ...device,
          mode: 'pending',
          latitude: 0,
          longitude: 0,
          is_connected: false
        }));

        setVehicles(initialVehicles);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    if (loading || error || wsRef.current) return;

    const wsUrl = `ws://${window.location.host}/ws-proxy/ws/live-data/`;
    // const wsUrl = `ws://${window.location.host}/ws-proxy`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    let snapshotReceived = false;

    ws.onopen = () => {
      ws.send(JSON.stringify({ username }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const updates = Array.isArray(message?.data) ? message.data : [];

        if (message.type === 'snapshot') {
          setVehicles(prev => {
            const snapshotIds = new Set();
            const next = prev.map(v => ({ ...v }));

            updates.forEach(data => {
              const deviceId = data.imei || data.device_id;
              if (!deviceId) return;
              snapshotIds.add(deviceId);

              const vehicle = next.find(v => v.device_id === deviceId);
              if (vehicle) applySocketData(vehicle, data);
            });

            next.forEach(v => {
              if (!snapshotIds.has(v.device_id)) v.mode = 'nogps';
            });

            return next;
          });
          snapshotReceived = true;
        }
        else if (message.type === 'delta') {
          if (!snapshotReceived) return;

          setVehicles(prev => {
            const next = prev.map(v => ({ ...v }));
            updates.forEach(data => {
              const deviceId = data.imei || data.device_id;
              if (!deviceId) return;

              const vehicle = next.find(v => v.device_id === deviceId);
              if (vehicle) applySocketData(vehicle, data);
            });
            return next;
          });
        }
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [loading, error]);

  return { vehicles, loading, error };
};