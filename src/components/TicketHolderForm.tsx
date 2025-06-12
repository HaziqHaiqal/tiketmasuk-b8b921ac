import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import EventOptionsSection from '@/components/EventOptionsSection';
import CountryPhoneSelector from '@/components/CountryPhoneSelector';
import DateOfBirthPicker from '@/components/DateOfBirthPicker';

interface TicketHolderFormProps {
  ticketIndex: number;
  ticketType: string;
  eventId: string;
  register: any;
  setValue: any;
  errors: any;
  watch: any;
}

const TicketHolderForm: React.FC<TicketHolderFormProps> = ({
  ticketIndex,
  ticketType,
  eventId,
  register,
  setValue,
  errors,
  watch
}) => {
  const fieldPrefix = `ticketHolders.${ticketIndex}`;
  const [countryCode, setCountryCode] = useState('+60'); // Default to Malaysia

  // Watch form values for phone and DOB
  const phoneNumber = watch(`${fieldPrefix}.phone`) || '';
  const dateOfBirth = watch(`${fieldPrefix}.dateOfBirth`);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Please enter a valid email address';
  };

  const validateICPassport = (value: string) => {
    // Remove all non-alphanumeric characters for validation
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanValue.length < 6) {
      return 'IC/Passport number must be at least 6 characters';
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return 'Please enter a valid phone number';
    }
    return true;
  };

  const handlePhoneChange = (phone: string) => {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    setValue(`${fieldPrefix}.phone`, cleanPhone);
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    setValue(`${fieldPrefix}.countryCode`, code);
  };

  const handleDateOfBirthChange = (date: Date | undefined) => {
    setValue(`${fieldPrefix}.dateOfBirth`, date ? date.toISOString().split('T')[0] : '');
  };

  const handleICPassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove hyphens and spaces, keep only alphanumeric
    const cleanValue = e.target.value.replace(/[-\s]/g, '');
    setValue(`${fieldPrefix}.icPassport`, cleanValue);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <User className="w-5 h-5 mr-2" />
          {ticketType} - Ticket #{ticketIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="font-medium text-base mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${fieldPrefix}.fullName`}>Full Name *</Label>
                <Input
                  id={`${fieldPrefix}.fullName`}
                  {...register(`${fieldPrefix}.fullName`, { required: 'Full name is required' })}
                  className={errors?.ticketHolders?.[ticketIndex]?.fullName ? 'border-red-500' : ''}
                />
                {errors?.ticketHolders?.[ticketIndex]?.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.email`}>Email *</Label>
                <Input
                  id={`${fieldPrefix}.email`}
                  type="email"
                  {...register(`${fieldPrefix}.email`, { 
                    required: 'Email is required',
                    validate: validateEmail
                  })}
                  className={errors?.ticketHolders?.[ticketIndex]?.email ? 'border-red-500' : ''}
                />
                {errors?.ticketHolders?.[ticketIndex]?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.phone`}>Mobile Number *</Label>
                <CountryPhoneSelector
                  phoneNumber={phoneNumber}
                  countryCode={countryCode}
                  onPhoneChange={handlePhoneChange}
                  onCountryChange={handleCountryCodeChange}
                  error={errors?.ticketHolders?.[ticketIndex]?.phone?.message}
                />
                <input
                  type="hidden"
                  {...register(`${fieldPrefix}.phone`, { 
                    required: 'Mobile number is required',
                    validate: validatePhone
                  })}
                />
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.icPassport`}>IC/Passport Number *</Label>
                <Input
                  id={`${fieldPrefix}.icPassport`}
                  placeholder="Without hyphens or spaces"
                  onChange={handleICPassportChange}
                  className={errors?.ticketHolders?.[ticketIndex]?.icPassport ? 'border-red-500' : ''}
                />
                <input
                  type="hidden"
                  {...register(`${fieldPrefix}.icPassport`, { 
                    required: 'IC/Passport number is required',
                    validate: validateICPassport
                  })}
                />
                {errors?.ticketHolders?.[ticketIndex]?.icPassport && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].icPassport.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.dateOfBirth`}>Date of Birth *</Label>
                <DateOfBirthPicker
                  value={dateOfBirth ? new Date(dateOfBirth) : undefined}
                  onChange={handleDateOfBirthChange}
                  error={errors?.ticketHolders?.[ticketIndex]?.dateOfBirth?.message}
                />
                <input
                  type="hidden"
                  {...register(`${fieldPrefix}.dateOfBirth`, { required: 'Date of birth is required' })}
                />
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.gender`}>Gender *</Label>
                <Select onValueChange={(value) => setValue(`${fieldPrefix}.gender`, value)}>
                  <SelectTrigger className={errors?.ticketHolders?.[ticketIndex]?.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register(`${fieldPrefix}.gender`, { required: 'Gender is required' })}
                />
                {errors?.ticketHolders?.[ticketIndex]?.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].gender.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.country`}>Country *</Label>
                <Select onValueChange={(value) => setValue(`${fieldPrefix}.country`, value)} defaultValue="Malaysia">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Malaysia">Malaysia</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="Thailand">Thailand</SelectItem>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}.state`}>State *</Label>
                <Input
                  id={`${fieldPrefix}.state`}
                  {...register(`${fieldPrefix}.state`, { required: 'State is required' })}
                  className={errors?.ticketHolders?.[ticketIndex]?.state ? 'border-red-500' : ''}
                />
                {errors?.ticketHolders?.[ticketIndex]?.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].state.message}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor={`${fieldPrefix}.address`}>Address *</Label>
              <Input
                id={`${fieldPrefix}.address`}
                {...register(`${fieldPrefix}.address`, { required: 'Address is required' })}
                className={errors?.ticketHolders?.[ticketIndex]?.address ? 'border-red-500' : ''}
              />
              {errors?.ticketHolders?.[ticketIndex]?.address && (
                <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].address.message}</p>
              )}
            </div>
            <div className="mt-4">
              <Label htmlFor={`${fieldPrefix}.postcode`}>Postcode *</Label>
              <Input
                id={`${fieldPrefix}.postcode`}
                {...register(`${fieldPrefix}.postcode`, { required: 'Postcode is required' })}
                className={errors?.ticketHolders?.[ticketIndex]?.postcode ? 'border-red-500' : ''}
              />
              {errors?.ticketHolders?.[ticketIndex]?.postcode && (
                <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].postcode.message}</p>
              )}
            </div>
          </div>

          {/* Event Options for this ticket holder */}
          <div>
            <h4 className="font-medium text-base mb-3">Event Options & Add-ons</h4>
            <div className="border rounded-lg p-4 bg-gray-50">
              <EventOptionsSection eventId={eventId} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketHolderForm;
