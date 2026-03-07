import React from 'react';
import { Button } from "@/components/ui/button";
import { Country } from "@/data/countryConfig";

interface CountrySwitcherProps {
  country: Country;
  onCountryChange: (country: Country) => void;
}

const CountrySwitcher: React.FC<CountrySwitcherProps> = ({ country, onCountryChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md border border-border">
      <Button
        variant={country === 'ro' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCountryChange('ro')}
        className={`rounded-full px-4 gap-2 transition-all ${
          country === 'ro' 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'hover:bg-muted'
        }`}
      >
        <span className="text-lg">🇷🇴</span>
        <span className="font-medium">România</span>
      </Button>
      <Button
        variant={country === 'uk' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCountryChange('uk')}
        className={`rounded-full px-4 gap-2 transition-all ${
          country === 'uk' 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'hover:bg-muted'
        }`}
      >
        <span className="text-lg">🇬🇧</span>
        <span className="font-medium">United Kingdom</span>
      </Button>
    </div>
  );
};

export default CountrySwitcher;
