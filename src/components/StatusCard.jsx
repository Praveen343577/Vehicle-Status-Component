import { Bus } from 'lucide-react';

export const StatusCard = ({ title, active, inactive, noGps, total, maxTotal }) => {
  const safeMax = maxTotal > 0 ? maxTotal : 1;

  const getStyle = (count) => {
    if (count === 0) return {};
    return { width: `${(count / safeMax) * 100}%` };
  };

  return (
    <div className="status-card">
      <div className="card-avatar">
        <Bus size={28} color="#6b7280" />
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="card-title">{title}</span>
          
          <div className="progress-track-wrapper">
            <div className="progress-track">
              <div 
                className={`progress-segment active ${active === 0 ? 'zero-state' : ''}`} 
                style={getStyle(active)} 
              />
              <div 
                className={`progress-segment inactive ${inactive === 0 ? 'zero-state' : ''}`} 
                style={getStyle(inactive)} 
              />
              <div 
                className={`progress-segment nogps ${noGps === 0 ? 'zero-state' : ''}`} 
                style={getStyle(noGps)} 
              />
            </div>
          </div>
        </div>

        <div className="card-legend">
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot active" />
              Active {active}
            </div>
            <div className="legend-item">
              <span className="legend-dot inactive" />
              Inactive {inactive}
            </div>
            <div className="legend-item">
              <span className="legend-dot nogps" />
              No GPS {noGps}
            </div>
          </div>
          <div className="legend-total">
            Total {total}
          </div>
        </div>
      </div>
    </div>
  );
};