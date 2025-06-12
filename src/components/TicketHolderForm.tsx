
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface TicketHolderFormProps {
  ticketIndex: number;
  ticketType: string;
  formData: any;
  register: any;
  setValue: any;
  errors: any;
}

const TicketHolderForm: React.FC<TicketHolderFormProps> = ({
  ticketIndex,
  ticketType,
  register,
  setValue,
  errors
}) => {
  const fieldPrefix = `ticketHolders.${ticketIndex}`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <User className="w-5 h-5 mr-2" />
          {ticketType} - Ticket #{ticketIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              {...register(`${fieldPrefix}.email`, { required: 'Email is required' })}
              className={errors?.ticketHolders?.[ticketIndex]?.email ? 'border-red-500' : ''}
            />
            {errors?.ticketHolders?.[ticketIndex]?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}.phone`}>Mobile Number *</Label>
            <Input
              id={`${fieldPrefix}.phone`}
              {...register(`${fieldPrefix}.phone`, { required: 'Mobile number is required' })}
              className={errors?.ticketHolders?.[ticketIndex]?.phone ? 'border-red-500' : ''}
            />
            {errors?.ticketHolders?.[ticketIndex]?.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}.icPassport`}>IC/Passport Number *</Label>
            <Input
              id={`${fieldPrefix}.icPassport`}
              {...register(`${fieldPrefix}.icPassport`, { required: 'IC/Passport number is required' })}
              className={errors?.ticketHolders?.[ticketIndex]?.icPassport ? 'border-red-500' : ''}
            />
            {errors?.ticketHolders?.[ticketIndex]?.icPassport && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].icPassport.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}.dateOfBirth`}>Date of Birth *</Label>
            <Input
              id={`${fieldPrefix}.dateOfBirth`}
              type="date"
              {...register(`${fieldPrefix}.dateOfBirth`, { required: 'Date of birth is required' })}
              className={errors?.ticketHolders?.[ticketIndex]?.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors?.ticketHolders?.[ticketIndex]?.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketHolders[ticketIndex].dateOfBirth.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}.gender`}>Gender *</Label>
            <Select onValueChange={(value) => setValue(`${fieldPrefix}.gender`, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
      </CardContent>
    </Card>
  );
};

export default TicketHolderForm;
