
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface CountryPhoneSelectorProps {
  phoneNumber: string;
  countryCode: string;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (country: string) => void;
  error?: string;
  className?: string;
}

const countries = [
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
];

const CountryPhoneSelector: React.FC<CountryPhoneSelectorProps> = ({
  phoneNumber,
  countryCode,
  onPhoneChange,
  onCountryChange,
  error,
  className
}) => {
  return (
    <div className={className}>
      <div className="flex space-x-2">
        <Select value={countryCode} onValueChange={onCountryChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center space-x-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="123456789"
          className={`flex-1 ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default CountryPhoneSelector;
