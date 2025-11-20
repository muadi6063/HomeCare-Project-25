export interface AppointmentDto {
  appointmentId: number;
  clientId: string;                     
  clientName: string | null;
  clientEmail: string | null;
  availableDayId: number;
  availableDayDate: string | null;
  healthcarePersonnelName: string | null;
  startTime: string;
  endTime: string;
  taskDescription: string;
}

export interface AvailableDayDto {
  availableDayId: number;
  healthcarePersonnelId: number;        
  healthcarePersonnelName: string | null;
  healthcarePersonnelEmail: string | null;
  date: string;
  startTime: string;
  endTime: string;
}

export interface UserDto {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface AvailableDaysGrouped {
  healthcarePersonnel: UserDto;
  availableDays: AvailableDayDto[];
}
