import React, { useState } from 'react';
import '../styles/FilterPanel.css';

const FilterPanel = ({
  cities = [],
  channels = [],
  skus = [],
  onFilterChange,
  defaultSelectedCities = [],
  defaultSelectedChannels = [],
  defaultSelectedSkus = [],
  showCities = false
}) => {
  const [selectedCities, setSelectedCities] = useState(defaultSelectedCities.length > 0 ? defaultSelectedCities : cities);
  const [selectedChannels, setSelectedChannels] = useState(defaultSelectedChannels.length > 0 ? defaultSelectedChannels : channels);
  const [selectedSkus, setSelectedSkus] = useState(defaultSelectedSkus.length > 0 ? defaultSelectedSkus : skus);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCityChange = (city) => {
    const updated = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    setSelectedCities(updated);
    onFilterChange({ cities: updated, channels: selectedChannels, skus: selectedSkus });
  };

  const handleChannelChange = (channel) => {
    const updated = selectedChannels.includes(channel)
      ? selectedChannels.filter(c => c !== channel)
      : [...selectedChannels, channel];
    setSelectedChannels(updated);
    onFilterChange({ cities: selectedCities, channels: updated, skus: selectedSkus });
  };

  const handleSkuChange = (sku) => {
    const updated = selectedSkus.includes(sku)
      ? selectedSkus.filter(s => s !== sku)
      : [...selectedSkus, sku];
    setSelectedSkus(updated);
    onFilterChange({ cities: selectedCities, channels: selectedChannels, skus: updated });
  };

  const handleSelectAll = (type) => {
    if (type === 'cities') {
      if (selectedCities.length === cities.length) {
        setSelectedCities([]);
        onFilterChange({ cities: [], channels: selectedChannels, skus: selectedSkus });
      } else {
        setSelectedCities(cities);
        onFilterChange({ cities: cities, channels: selectedChannels, skus: selectedSkus });
      }
    } else if (type === 'channels') {
      if (selectedChannels.length === channels.length) {
        setSelectedChannels([]);
        onFilterChange({ cities: selectedCities, channels: [], skus: selectedSkus });
      } else {
        setSelectedChannels(channels);
        onFilterChange({ cities: selectedCities, channels: channels, skus: selectedSkus });
      }
    } else if (type === 'skus') {
      if (selectedSkus.length === skus.length) {
        setSelectedSkus([]);
        onFilterChange({ cities: selectedCities, channels: selectedChannels, skus: [] });
      } else {
        setSelectedSkus(skus);
        onFilterChange({ cities: selectedCities, channels: selectedChannels, skus: skus });
      }
    }
  };

  const handleReset = () => {
    setSelectedCities(cities);
    setSelectedChannels(channels);
    setSelectedSkus(skus);
    onFilterChange({ cities: cities, channels: channels, skus: skus });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="filter-title">🔍 Filter Data</span>
        <span className="filter-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Cities Filter */}
          {showCities && cities.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-header">
                <h3>📍 Cities</h3>
                <button
                  className="select-all-btn"
                  onClick={() => handleSelectAll('cities')}
                  title={selectedCities.length === cities.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedCities.length === cities.length ? '✓ All' : 'Select All'}
                </button>
              </div>
              <div className="filter-options">
                {cities.map(city => (
                  <label key={city} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => handleCityChange(city)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Channels Filter */}
          {channels.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-header">
                <h3>📦 Channels</h3>
                <button
                  className="select-all-btn"
                  onClick={() => handleSelectAll('channels')}
                  title={selectedChannels.length === channels.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedChannels.length === channels.length ? '✓ All' : 'Select All'}
                </button>
              </div>
              <div className="filter-options">
                {channels.map(channel => (
                  <label key={channel} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel)}
                      onChange={() => handleChannelChange(channel)}
                    />
                    <span>{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SKUs Filter */}
          {skus.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-header">
                <h3>🍦 SKUs</h3>
                <button
                  className="select-all-btn"
                  onClick={() => handleSelectAll('skus')}
                  title={selectedSkus.length === skus.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedSkus.length === skus.length ? '✓ All' : 'Select All'}
                </button>
              </div>
              <div className="filter-options">
                {skus.map(sku => (
                  <label key={sku} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSkus.includes(sku)}
                      onChange={() => handleSkuChange(sku)}
                    />
                    <span>{sku}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button className="reset-btn" onClick={handleReset}>
            ↺ Reset Filters
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {isExpanded && (
        <div className="active-filters">
          {showCities && selectedCities.length > 0 && (
            <div className="filter-badge-group">
              <span className="badge-label">Cities:</span>
              {selectedCities.map(city => (
                <span key={city} className="filter-badge">{city}</span>
              ))}
            </div>
          )}
          {selectedChannels.length > 0 && (
            <div className="filter-badge-group">
              <span className="badge-label">Channels:</span>
              {selectedChannels.map(channel => (
                <span key={channel} className="filter-badge">{channel}</span>
              ))}
            </div>
          )}
          {selectedSkus.length > 0 && (
            <div className="filter-badge-group">
              <span className="badge-label">SKUs:</span>
              {selectedSkus.map(sku => (
                <span key={sku} className="filter-badge">{sku}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
