'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { convertToTenantTimezone } from '../../lib/timezone';

// Type definitions
interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  service?: {
    name?: string;
  };
  barber?: {
    name?: string;
  };
  barber_id?: string;
  service_id?: string;
  status: string;
  notes?: string;
  time?: string;
  displayTime?: string;
}

interface Barber {
  id: string;
  name: string;
  color: string;
}

interface Service {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  timezone?: string;
}
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const EnhancedCalendarView = () => {
  const { currentTenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: Date;
    fullTime: string;
    hour: number;
    minute: number;
  } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service: '',
    barber_id: '',
    duration: 30,
    notes: '',
    send_sms: true
  });
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (currentTenant && !hasLoaded) {
      setHasLoaded(true);
      loadData();
    }
  }, [currentTenant, hasLoaded]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading calendar data...');
      
      const [appointmentsRes, barbersRes, servicesRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/barbers'),
        apiClient.get('/services')
      ]);

      console.log('Calendar API responses:', {
        appointments: appointmentsRes,
        barbers: barbersRes,
        services: servicesRes,
      });

      let hasSuccessfulCall = false;

      if (appointmentsRes.success) {
        hasSuccessfulCall = true;
        const tenantTimezone = (currentTenant as any)?.timezone || 'America/New_York';
        const processedAppointments = (appointmentsRes.data as Appointment[]).map((appointment: Appointment) => {
          const startTimeConverted = convertToTenantTimezone(appointment.start_time, tenantTimezone);
          const endTimeConverted = convertToTenantTimezone(appointment.end_time, tenantTimezone);
          
          // Create a proper display time from the original appointment time
          const appointmentStart = new Date(appointment.start_time);
          const displayTime = appointmentStart.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          console.log('Appointment time processing:', {
            originalStartTime: appointment.start_time,
            appointmentStart: appointmentStart.toISOString(),
            displayTime: displayTime,
            convertedTime: startTimeConverted.time
          });
          
          return {
            ...appointment,
            time: startTimeConverted.time,
            displayTime: displayTime, // Use the properly formatted display time
            date: startTimeConverted.date,
            fullDateTime: startTimeConverted.fullDateTime,
            endTime: endTimeConverted.time,
            timezone: tenantTimezone,
            start: new Date(appointment.start_time),
            end: new Date(appointment.end_time)
          };
        });
        
        setAppointments(processedAppointments);
        console.log('Appointments loaded with timezone:', processedAppointments);
        
        // Debug: Show all appointments for current date
        const currentDateStr = currentDate.toDateString();
        const currentDateAppointments = processedAppointments.filter(apt => {
          const aptDate = new Date(apt.start_time);
          return aptDate.toDateString() === currentDateStr;
        });
        console.log(`Appointments for ${currentDateStr}:`, currentDateAppointments);
        
        // Debug: Show specific appointment times
        currentDateAppointments.forEach(apt => {
          const aptStart = new Date(apt.start_time);
          console.log(`Appointment ${apt.customer?.name}:`, {
            startTime: apt.start_time,
            hour: aptStart.getHours(),
            minute: aptStart.getMinutes(),
            displayTime: apt.displayTime || apt.time
          });
        });
      } else {
        console.error('Appointments API error:', appointmentsRes.error);
        setAppointments([]);
      }
      
      if (barbersRes.success) {
        hasSuccessfulCall = true;
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }, ...(barbersRes.data as Barber[])]);
        console.log('Barbers loaded:', barbersRes.data);
      } else {
        console.error('Barbers API error:', barbersRes.error);
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
      }
      
      if (servicesRes.success) {
        hasSuccessfulCall = true;
        setServices(servicesRes.data as Service[]);
        console.log('Services loaded:', servicesRes.data);
      } else {
        console.error('Services API error:', servicesRes.error);
        setServices([]);
      }
      
      if (appointmentsRes.success) {
        const map = new Map<string, Client>();
        (appointmentsRes.data as Appointment[]).forEach((a: Appointment) => {
          const c = a.customer || {};
          const key = c.email || c.phone || c.name;
          if (!key) return;
          if (!map.has(key)) {
            map.set(key, { id: key, name: c.name || 'Unknown' });
          }
        });
        setClients(Array.from(map.values()));
      } else {
        setClients([]);
      }

      if (hasSuccessfulCall) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load calendar data');
      setLoading(false);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    // Extended hours from 6 AM to 10 PM to cover all possible appointments
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = ((hour % 12) === 0) ? 12 : (hour % 12);
        const displayMinute = minute.toString().padStart(2, '0');
        slots.push({
          time: `${displayHour}:${displayMinute} ${period}`,
          hour,
          minute,
          fullTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      
      // Convert appointment time to tenant timezone for comparison
      const tenantTimezone = (currentTenant as any)?.timezone || 'America/New_York';
      const appointmentInTenantTimezone = new Date(appointmentStart.toLocaleString('en-US', { timeZone: tenantTimezone }));
      
      return appointmentInTenantTimezone.toDateString() === date.toDateString() &&
        (selectedBarber === 'all' || appointment.barber_id === selectedBarber);
    });
  };

  const getAppointmentForSlot = (date: Date, hour: number, minute: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    
    console.log('Checking slot:', {
      slotDate: slotDate.toISOString(),
      hour,
      minute,
      date: date.toDateString()
    });
    
    return appointments.find(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Convert appointment time to tenant timezone for comparison
      const tenantTimezone = (currentTenant as any)?.timezone || 'America/New_York';
      const appointmentInTenantTimezone = new Date(appointmentStart.toLocaleString('en-US', { timeZone: tenantTimezone }));
      
      console.log('Checking appointment:', {
        appointmentId: appointment.id,
        customerName: appointment.customer?.name,
        appointmentStartUTC: appointmentStart.toISOString(),
        appointmentStartLocal: appointmentStart.toString(),
        appointmentInTenantTimezone: appointmentInTenantTimezone.toString(),
        appointmentHour: appointmentInTenantTimezone.getHours(),
        appointmentMinute: appointmentInTenantTimezone.getMinutes(),
        appointmentDate: appointmentInTenantTimezone.toDateString(),
        slotHour: hour,
        slotMinute: minute,
        slotDate: slotDate.toDateString()
      });
      
      // Check if it's the same date (compare in tenant timezone)
      const isSameDate = appointmentInTenantTimezone.toDateString() === date.toDateString();
      
      // Check if the appointment starts at this exact hour and minute (in tenant timezone)
      const isExactTimeMatch = appointmentInTenantTimezone.getHours() === hour && 
                               appointmentInTenantTimezone.getMinutes() === minute;
      
      // Check barber filter
      const matchesBarber = selectedBarber === 'all' || appointment.barber_id === selectedBarber;
      
      const matches = isSameDate && isExactTimeMatch && matchesBarber;
      
      console.log('Match result for', appointment.customer?.name, ':', {
        isSameDate,
        isExactTimeMatch,
        matchesBarber,
        matches,
        slotHour: hour,
        slotMinute: minute,
        appointmentHour: appointmentInTenantTimezone.getHours(),
        appointmentMinute: appointmentInTenantTimezone.getMinutes(),
        tenantTimezone
      });
      
      return matches;
    });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      if (!selectedSlot) {
        console.error('No slot selected');
        return;
      }
      
      // Get tenant timezone
      const tenantTimezone = (currentTenant as any)?.timezone || 'America/New_York';
      console.log('Tenant timezone:', tenantTimezone);
      
      // Create the appointment date in the tenant's timezone
      // The key issue: we need to create a date that represents the selected time in the tenant's timezone
      // When user selects 9:00 AM, we want 9:00 AM in the tenant's timezone, not the browser's timezone
      
      // Get the selected date components
      const selectedDate = new Date(selectedSlot.date);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Create a date string in ISO format that represents the time in tenant timezone
      const dateTimeString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${selectedSlot.hour.toString().padStart(2, '0')}:${selectedSlot.minute.toString().padStart(2, '0')}:00`;
      
      // The key insight: we need to create a date that represents the selected time in the tenant's timezone
      // We'll use a simple approach: create a date and then convert it to the tenant's timezone
      
      // Create a date object that represents the selected time
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
      
      // Now we need to convert this to represent the same moment in the tenant's timezone
      // We'll use the Intl API to get the timezone offset for the tenant's timezone
      const now = new Date();
      const browserOffset = now.getTimezoneOffset(); // in minutes
      
      // Get the timezone offset for the tenant's timezone
      // We'll create a test date in the tenant's timezone and compare it to UTC
      const testDate = new Date(dateTimeString);
      const utcTime = testDate.getTime();
      
      // Create a date in the tenant's timezone to get the offset
      const tenantDate = new Date(testDate.toLocaleString('en-US', { timeZone: tenantTimezone }));
      const tenantOffset = (utcTime - tenantDate.getTime()) / (1000 * 60); // in minutes
      
      // Adjust the appointment date to account for the timezone difference
      const adjustedAppointmentDate = new Date(appointmentDate.getTime() + (tenantOffset * 60 * 1000));
      
      // Calculate end time
      const endTime = new Date(adjustedAppointmentDate.getTime() + (appointmentForm.duration || 30) * 60000);
      
      console.log('Creating appointment:', {
        selectedSlot,
        dateTimeString,
        appointmentDate: adjustedAppointmentDate.toISOString(),
        appointmentDateLocal: adjustedAppointmentDate.toString(),
        endTime: endTime.toISOString(),
        endTimeLocal: endTime.toString(),
        selectedHour: selectedSlot?.hour,
        selectedMinute: selectedSlot?.minute,
        tenantTimezone,
        browserOffset,
        tenantOffset,
        utcTime: testDate.getTime()
      });
      
      const payload = {
        service_id: appointmentForm.service,
        barber_id: appointmentForm.barber_id,
        start_time: adjustedAppointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        customer: {
          name: appointmentForm.client_name,
          phone: appointmentForm.client_phone,
          email: appointmentForm.client_email || '',
          notes: appointmentForm.notes || ''
        },
        notes: appointmentForm.notes || '',
        status: 'confirmed'
      };

      const response = await apiClient.post('/appointments', payload);
      if (response.success) {
        await loadData(); // Reload data
        setShowAppointmentModal(false);
        setAppointmentForm({
          client_name: '',
          client_phone: '',
          client_email: '',
          service: '',
          barber_id: '',
          duration: 30,
          notes: '',
          send_sms: true
        });
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      client_name: appointment.customer?.name || '',
      client_phone: appointment.customer?.phone || '',
      client_email: appointment.customer?.email || '',
      service: appointment.service_id || '',
      barber_id: appointment.barber_id || '',
      duration: Math.max(0, Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 60000)),
      notes: appointment.notes || '',
      send_sms: false
    });
    setShowAppointmentModal(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (!selectedAppointment) return;
      const start = new Date(selectedAppointment.start_time);
      const end = new Date(start.getTime() + (appointmentForm.duration || 30) * 60000);
      
      const payload = {
        service_id: appointmentForm.service,
        barber_id: appointmentForm.barber_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        customer: {
          name: appointmentForm.client_name,
          phone: appointmentForm.client_phone,
          email: appointmentForm.client_email || '',
          notes: appointmentForm.notes || ''
        },
        notes: appointmentForm.notes || '',
        status: selectedAppointment?.status || 'confirmed'
      };
      
      const response = await apiClient.put(`/appointments/${selectedAppointment?.id}`, payload);
      if (response.success) {
        await loadData(); // Reload data
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`);
      if (response.success) {
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, { status: newStatus });
      if (response.success) {
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const response = await apiClient.put(`/appointments/${selectedAppointment.id}`, { 
        status: 'cancelled' 
      });
      if (response.success) {
        await loadData(); // Reload data
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    // Create a new date object to avoid mutating the original
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    
    console.log('Slot clicked:', {
      originalDate: date,
      slotDate: slotDate,
      hour,
      minute,
      dateString: slotDate.toISOString().split('T')[0],
      timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      slotDateISO: slotDate.toISOString(),
      slotDateLocal: slotDate.toLocaleString()
    });
    
    setSelectedSlot({ 
      date: slotDate, 
      time: slotDate,
      fullTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour: hour,
      minute: minute
    });
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-center font-semibold">
              Time
            </div>
            {timeSlots.filter((slot, index) => slot.minute === 0).map((slot, index) => (
              <div key={index} className="h-16 border-b border-gray-200 p-2 text-sm text-gray-500 flex items-center">
                {slot.time}
              </div>
            ))}
          </div>
          
          {/* Appointments column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-center font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            {timeSlots.filter((slot, index) => slot.minute === 0).map((slot, index) => {
              const appointment = getAppointmentForSlot(currentDate, slot.hour, slot.minute);
              const isCurrentHour = new Date().getHours() === slot.hour && 
                                   new Date().toDateString() === currentDate.toDateString();
              
              console.log(`Slot ${slot.hour}:${slot.minute} - Appointment found:`, !!appointment);
              
              return (
                <div 
                  key={index} 
                  className={`h-16 border-b border-gray-200 relative ${
                    isCurrentHour ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {appointment ? (
                    <div 
                      className="absolute inset-1 bg-primary/10 border border-primary/20 rounded p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <span className="text-sm font-medium truncate">
                            {appointment.customer?.name || 'Client'}
                          </span>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                      </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {appointment.service?.name || 'Service'} • {appointment.displayTime || appointment.time}
                        </div>
                    </div>
                  ) : (
                    <div 
                      className="h-full w-full cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
                    >
                      <div className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const getWeekDays = () => {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
      }
      return days;
    };

    const timeSlots = getTimeSlots();
    const weekDays = getWeekDays();
    
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-center font-semibold">
              Time
            </div>
            {timeSlots.filter((slot, index) => slot.minute === 0).map((slot, index) => (
              <div key={index} className="h-16 border-b border-gray-200 p-2 text-sm text-gray-500 flex items-center">
                {slot.time}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={dayIndex} className="bg-white">
                <div className={`h-16 border-b border-gray-200 sticky top-0 z-10 flex items-center justify-center font-semibold ${
                  isToday ? 'bg-blue-50 text-blue-700' : ''
                }`}>
                  <div className="text-center">
                    <div className="text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-lg font-bold">{day.getDate()}</div>
                  </div>
                </div>
                {timeSlots.filter((slot, index) => slot.minute === 0).map((slot, index) => {
                  const appointment = getAppointmentForSlot(day, slot.hour, slot.minute);
                  
                  return (
                    <div 
                      key={index} 
                      className="h-16 border-b border-gray-200 relative hover:bg-gray-50"
                    >
                      {appointment ? (
                        <div 
                          className="absolute inset-1 bg-primary/10 border border-primary/20 rounded p-1 cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <div className="text-xs font-medium truncate">
                            {appointment.customer?.name || 'Client'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {appointment.displayTime || appointment.time}
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="h-full w-full cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSlotClick(day, slot.hour, slot.minute)}
                        >
                          <div className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
                            <Plus className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];

    // Leading blanks
    for (let i = 0; i < startingDayOfWeek; i++) currentWeek.push(null);

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Trailing blanks
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-rows-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="min-h-[120px] bg-gray-50 border-r last:border-r-0"></div>;
                  }

                  const dayAppointments = getAppointmentsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={dayIndex} 
                      className="min-h-[120px] border-r last:border-r-0 p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSlotClick(day, 9, 0)}
                    >
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-white bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map(apt => {
                          if (selectedBarber !== 'all' && apt.barber_id !== selectedBarber) return null;
                          const barber = barbers.find(b => b.id === apt.barber_id);
                          return (
                            <div
                              key={apt.id}
                              className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: barber ? barber.color : '#3B82F6', color: 'white' }}
                              onClick={(e) => { e.stopPropagation(); handleEditAppointment(apt); }}
                            >
                              {apt.displayTime || apt.time} {apt.customer?.name || 'Client'}
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">+{dayAppointments.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and schedule</p>
        </div>
        <div className="flex space-x-2">
          <Select value={viewMode} onValueChange={(value: 'day' | 'week' | 'month') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedAppointment ? 'Appointment Details' : 'New Appointment'}
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment ? 'View and manage appointment details' : 'Create a new appointment'}
                </DialogDescription>
              </DialogHeader>
              {selectedAppointment ? (
                // View/Edit Existing Appointment
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Client</Label>
                      <p className="text-gray-900">{selectedAppointment.customer?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Service</Label>
                      <p className="text-gray-900">{selectedAppointment.service?.name || 'Service'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Barber</Label>
                      <p className="text-gray-900">{selectedAppointment.barber?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedAppointment.status)}>
                          {selectedAppointment.status}
                        </Badge>
                        <Select value={selectedAppointment.status} onValueChange={(value) => handleStatusChange(selectedAppointment.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Date</Label>
                      <p className="text-gray-900">{new Date(selectedAppointment.start_time).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Time</Label>
                      <p className="text-gray-900">
                        {selectedAppointment.displayTime || selectedAppointment.time}
                      </p>
                    </div>
                  </div>
                  {selectedAppointment.customer?.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{selectedAppointment.customer.phone}</p>
                    </div>
                  )}
                  {selectedAppointment.customer?.email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{selectedAppointment.customer.email}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Notes</Label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
                      Close
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setAppointmentForm({
                        client_name: selectedAppointment.customer?.name || '',
                        client_phone: selectedAppointment.customer?.phone || '',
                        client_email: selectedAppointment.customer?.email || '',
                        service: selectedAppointment.service_id || '',
                        barber_id: selectedAppointment.barber_id || '',
                        duration: Math.max(0, Math.round((new Date(selectedAppointment.end_time).getTime() - new Date(selectedAppointment.start_time).getTime()) / 60000)),
                        notes: selectedAppointment.notes || '',
                        send_sms: false
                      });
                      setShowAppointmentModal(false);
                      setShowAppointmentModal(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </div>
                </div>
              ) : (
                // Create New Appointment
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                {/* Debug info for selected slot */}
                {selectedSlot && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Date:</strong> {selectedSlot.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Selected Time:</strong> {selectedSlot.fullTime} (Hour: {selectedSlot.hour}, Minute: {selectedSlot.minute})
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>ISO String:</strong> {selectedSlot.date.toISOString()}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={appointmentForm.client_name}
                      onChange={(e) => setAppointmentForm({...appointmentForm, client_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Phone</Label>
                    <Input
                      id="client_phone"
                      value={appointmentForm.client_phone}
                      onChange={(e) => setAppointmentForm({...appointmentForm, client_phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={appointmentForm.client_email}
                    onChange={(e) => setAppointmentForm({...appointmentForm, client_email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select value={appointmentForm.service} onValueChange={(value) => setAppointmentForm({...appointmentForm, service: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barber_id">Barber</Label>
                    <Select value={appointmentForm.barber_id} onValueChange={(value) => setAppointmentForm({...appointmentForm, barber_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select barber" />
                      </SelectTrigger>
                      <SelectContent>
                        {barbers.filter(b => b.id !== 'all').map(barber => (
                          <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAppointmentModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? 'Saving...' : (selectedAppointment ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              No, Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Yes, Cancel Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'day' && { weekday: 'long', day: 'numeric' })
            })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
            className="ml-4"
          >
            Today
          </Button>
        </div>
        <Select value={selectedBarber} onValueChange={setSelectedBarber}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {barbers.map(barber => (
              <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Debug panel - show all appointments for current date */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug: Appointments for {currentDate.toLocaleDateString()}</h3>
        <div className="text-sm text-yellow-700">
          {getAppointmentsForDate(currentDate).length > 0 ? (
            <div className="space-y-1">
              {getAppointmentsForDate(currentDate).map((apt, index) => (
                <div key={index} className="flex justify-between">
                  <span>{apt.customer?.name || 'Unknown'} - {apt.service?.name || 'Service'}</span>
                  <span>{apt.displayTime || apt.time} ({new Date(apt.start_time).getHours()}:{new Date(apt.start_time).getMinutes().toString().padStart(2, '0')})</span>
                </div>
              ))}
            </div>
          ) : (
            <span>No appointments found for this date</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>

      {/* Legend */}
      <div className="bg-white border-t p-4 rounded-lg">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-600">Barbers:</span>
          {barbers.filter(b => b.id !== 'all').map(barber => (
            <div key={barber.id} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: barber.color }}></div>
              <span className="text-gray-700">{barber.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendarView;