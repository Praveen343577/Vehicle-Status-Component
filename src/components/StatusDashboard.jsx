import { useState, useMemo } from 'react';
import { useVehicleTelematics } from '../hooks/useVehicleTelematics';
import { ToggleView } from './ToggleView';
import { StatusCard } from './StatusCard';

export const StatusDashboard = () => {
  const [viewMode, setViewMode] = useState('platform');
  const { vehicles, loading, error } = useVehicleTelematics();

  const { aggregatedData, maxTotal } = useMemo(() => {
    if (!vehicles.length) return { aggregatedData: [], maxTotal: 0 };

    const groups = {};

    vehicles.forEach((vehicle) => {
      // Exclude test vehicles per initial report requirements
      if ((vehicle.device_type_name || '').toString().toLowerCase() === 'test') return;

      const key = viewMode === 'platform' 
        ? vehicle.device_type_name || 'N/A' 
        : vehicle.fleet || 'N/A';

      if (!groups[key]) {
        groups[key] = { title: key, active: 0, inactive: 0, noGps: 0, total: 0 };
      }

      groups[key].total += 1;

      if (vehicle.mode === 'active') groups[key].active += 1;
      else if (vehicle.mode === 'nogps') groups[key].noGps += 1;
      else groups[key].inactive += 1; // Catches 'inactive' and initial 'pending' states
    });

    const dataArray = Object.values(groups).sort((a, b) => b.total - a.total);
    const max = dataArray.length > 0 ? Math.max(...dataArray.map(d => d.total)) : 0;

    return { aggregatedData: dataArray, maxTotal: max };
  }, [vehicles, viewMode]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center' }}>Initializing telemetry connection...</div>;
  if (error) return <div style={{ color: '#ef4444', textAlign: 'center' }}>Data Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <ToggleView viewMode={viewMode} setViewMode={setViewMode} />
      {aggregatedData.map((data) => (
        <StatusCard
          key={data.title}
          title={data.title}
          active={data.active}
          inactive={data.inactive}
          noGps={data.noGps}
          total={data.total}
          maxTotal={maxTotal}
        />
      ))}
      {aggregatedData.length === 0 && (
        <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No production vehicles found.
        </div>
      )}
    </div>
  );
};