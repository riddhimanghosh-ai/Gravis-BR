import React, { useState } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';
import '../styles/FilterPanel.css';

const FilterPanel = ({
  cities    = [],
  channels  = [],
  skus      = [],
  onFilterChange,
  defaultSelectedCities   = [],
  defaultSelectedChannels = [],
  defaultSelectedSkus     = [],
  showCities = false,
}) => {
  const [selectedCities,   setSelectedCities]   = useState(defaultSelectedCities.length   > 0 ? defaultSelectedCities   : cities);
  const [selectedChannels, setSelectedChannels] = useState(defaultSelectedChannels.length > 0 ? defaultSelectedChannels : channels);
  const [selectedSkus,     setSelectedSkus]     = useState(defaultSelectedSkus.length     > 0 ? defaultSelectedSkus     : skus);

  const handleChannels = next => {
    setSelectedChannels(next);
    onFilterChange({ cities: selectedCities, channels: next, skus: selectedSkus });
  };

  const handleSkus = next => {
    setSelectedSkus(next);
    onFilterChange({ cities: selectedCities, channels: selectedChannels, skus: next });
  };

  const handleCities = next => {
    setSelectedCities(next);
    onFilterChange({ cities: next, channels: selectedChannels, skus: selectedSkus });
  };

  const handleReset = () => {
    setSelectedCities(cities);
    setSelectedChannels(channels);
    setSelectedSkus(skus);
    onFilterChange({ cities, channels, skus });
  };

  return (
    <div className="filter-panel">
      <div className="fp-row">
        {showCities && cities.length > 0 && (
          <MultiSelectDropdown
            label="📍 Cities"
            options={cities}
            selected={selectedCities}
            onChange={handleCities}
            allLabel="All Cities"
          />
        )}
        {channels.length > 0 && (
          <MultiSelectDropdown
            label="🏪 Channels"
            options={channels}
            selected={selectedChannels}
            onChange={handleChannels}
            allLabel="All Channels"
          />
        )}
        {skus.length > 0 && (
          <MultiSelectDropdown
            label="🍦 SKUs"
            options={skus}
            selected={selectedSkus}
            onChange={handleSkus}
            allLabel="All SKUs"
          />
        )}
        <button className="fp-reset-btn" onClick={handleReset} type="button">
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
