export const ToggleView = ({ viewMode, setViewMode }) => {
  return (
    <div className="toggle-container">
      <button
        className={`toggle-btn ${viewMode === 'platform' ? 'active' : ''}`}
        onClick={() => setViewMode('platform')}
      >
        Platform
      </button>
      <button
        className={`toggle-btn ${viewMode === 'fleet' ? 'active' : ''}`}
        onClick={() => setViewMode('fleet')}
      >
        Fleet
      </button>
    </div>
  );
};