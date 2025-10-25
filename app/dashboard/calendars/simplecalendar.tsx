"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { useTenant } from '../../contexts/TenantContext';
import { convertToTenantTimezone } from '../../lib/timezone';
import { buildSlotUTCISO, convertUTCToTenantDate, convertUTCToTenantTime, bookingToCalendarEvent } from '../../lib/timezone-utils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Clock,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces
interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  barber: string;
  barberId: string;
  client: string;
  service: string;
  status: string;
  phone?: string;
  email?: string;
  notes?: string;
  displayTime: string;
  displayDate: string;
  displayDateTime: string;
  timezone: string;
  start_time: string;
  end_time: string;
  channel?: string;
  startTenantISO?: string;
  endTenantISO?: string;
}

interface Barber {
  id: string;
  name: string;
  color?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface SelectedSlot {
  date: Date;
  time: Date;
  displayTime: string;
  displayDate: string;
}

interface AppointmentForm {
  client_name: string;
  client_phone: string;
  client_email: string;
  service: string;
  barber_id: string;
  duration: number;
  notes: string;
  send_sms: boolean;
}

const SimpleCalendar = () => {
  const { currentTenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([{ id: 'all', name: 'All Barbers' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Create form (from AA)
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
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

  // Disable mock mode to use real API
  useEffect(() => {
    // Remove mock mode to use real API calls
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_mode');
      console.log('Mock mode disabled - using real API calls');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api');
    }
  }, []);

  // Load barbers + services + clients
  useEffect(() => {
    if (currentTenant) {
      loadBarbers();
      loadServices();
      loadClients();
    }
  }, [currentTenant]);

  // Load appointments when date or barber filter changes
  useEffect(() => {
    if (currentTenant) {
      loadAppointments();
    }
  }, [currentTenant, currentDate, viewMode]);

  const authHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': currentTenant?.id
    };
  };

  const loadServices = async () => {
    try {
      const response = await apiClient.get('/services');
      if (response.success) {
        setServices(Array.isArray(response.data) ? response.data : []);
        console.log('Services loaded:', response.data);
        console.log('Services count:', Array.isArray(response.data) ? response.data.length : 0);
      } else {
        console.error('Error loading services:', response.error);
        setServices([]);
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setServices([]);
    }
  };

  const loadClients = async () => {
    try {
      const response = await apiClient.get('/clients');
      if (response.success) {
        setClients(Array.isArray(response.data) ? response.data : []);
        console.log('Clients loaded:', response.data);
      } else {
        console.error('Error loading clients:', response.error);
        setClients([]);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setClients([]);
    }
  };

  const loadBarbers = async () => {
    try {
      const response = await apiClient.get('/barbers');
      if (response.success) {
        const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'];
        const barberList = (Array.isArray(response.data) ? response.data : []).map((barber: any, index: number) => ({
          id: barber.id,
          name: barber.name,
          color: colors[index % colors.length]
        }));
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }, ...barberList]);
        console.log('Barbers loaded:', response.data);
      } else {
        console.error('Error loading barbers:', response.error);
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
      }
    } catch (err) {
      console.error('Error loading barbers:', err);
      setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to view appointments');
        setLoading(false);
        return;
      }

      console.log('Loading appointments for:', {
        viewMode,
        currentDate: currentDate.toISOString(),
        tenant: currentTenant?.id
      });

      // Calculate date range based on view mode
      let startDate, endDate;
      if (viewMode === 'week') {
        const weekDays = getWeekDays(currentDate);
        startDate = new Date(weekDays[0]);
        startDate.setHours(0, 0, 0, 0); // Start of first day
        endDate = new Date(weekDays[6]);
        endDate.setHours(23, 59, 59, 999); // End of last day
      } else if (viewMode === 'month') {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0); // Start of month
        endDate = new Date(year, month + 1, 0);
        endDate.setHours(23, 59, 59, 999); // End of month
      } else {
        // day
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0); // Start of day
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999); // End of day
      }

      // For debugging: Check if we're looking at the right date for Fizza's appointment
      const fizzaTargetDate = new Date('2025-10-27');
      const isViewingFizzaDate = currentDate.toDateString() === fizzaTargetDate.toDateString();
      if (isViewingFizzaDate) {
        console.log('🔍 VIEWING FIZZA DATE:', {
          currentDate: currentDate.toDateString(),
          fizzaTargetDate: fizzaTargetDate.toDateString(),
          startDate: startDate.toDateString(),
          endDate: endDate.toDateString(),
          viewMode
        });
      }

      console.log('Date range:', {
        viewMode,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toLocaleString(),
        endDateLocal: endDate.toLocaleString(),
        startDateNY: startDate.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        endDateNY: endDate.toLocaleString('en-US', { timeZone: 'America/New_York' })
      });

      // Special debugging for Fizza's appointment date
      const fizzaDate = new Date('2025-10-27T19:00:00Z'); // UTC time from API
      const fizzaDateNY = fizzaDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
      console.log('🔍 FIZZA DATE DEBUG:', {
        fizzaUTC: fizzaDate.toISOString(),
        fizzaNY: fizzaDateNY,
        fizzaDate: fizzaDate.toDateString(),
        fizzaDateNYDate: new Date(fizzaDate.toLocaleString('en-US', { timeZone: 'America/New_York' })).toDateString(),
        isInRange: fizzaDate >= startDate && fizzaDate <= endDate,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        currentDate: currentDate.toDateString(),
        viewMode
      });

      const response = await apiClient.get(`/appointments?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);

      console.log('Appointments API response:', response);

      if (!response.success) {
        console.error('Failed to load appointments:', response.error);
        setAppointments([]);
        setError('Failed to load appointments: ' + response.error);
        return;
      }

      // Transform appointments using the new bookingToCalendarEvent function
      const tenantTimezone = currentTenant?.timezone || 'America/New_York';
      const data = response.data || [];

      console.log('Processing appointments with new timezone handling:', {
        count: Array.isArray(data) ? data.length : 0,
        tenantTimezone,
        sampleAppointment: Array.isArray(data) ? data[0] : null
      });

      // Special debugging for the specific case mentioned
      if (Array.isArray(data)) {
        const fizzaAppointment = data.find((apt: any) => apt.customer?.name === 'fizza' || apt.client?.name === 'fizza');
        if (fizzaAppointment) {
          console.log('🔍 FIZZA APPOINTMENT DEBUG:', {
            originalData: fizzaAppointment,
            start_time: fizzaAppointment.start_time,
            end_time: fizzaAppointment.end_time,
            tenantTimezone,
            currentDate: currentDate.toISOString(),
            viewMode
          });
        }
      }

      const transformedAppointments = (Array.isArray(data) ? data : []).map((apt: any) => {
        try {
          // Use the new bookingToCalendarEvent function for proper timezone handling
          const event = bookingToCalendarEvent(apt, tenantTimezone);
          
          // Add console logging for debugging (as requested)
          if (Array.isArray(data) && data.indexOf(apt) === 0) { // Log only the first event for debugging
            console.log('🔍 DEBUG: First loaded event details:', {
              eventId: event.id,
              client: event.client,
              start: event.start,
              end: event.end,
              startISO: event.start.toISOString(),
              endISO: event.end.toISOString(),
              displayTime: event.displayTime,
              displayDate: event.displayDate,
              startTenantISO: event.startTenantISO,
              endTenantISO: event.endTenantISO
            });
          }
          
          return event;
        } catch (error) {
          console.error('Error processing appointment:', apt, error);
          return null;
        }
      }).filter(Boolean);

      console.log('Final transformed appointments:', transformedAppointments);
      setAppointments(transformedAppointments.filter(Boolean) as Appointment[]);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setAppointments([]);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots based on tenant availability
  const generateTimeSlots = () => {
    // Default working hours (can be customized based on tenant settings)
    const startHour = 8; // 8 AM
    const endHour = 20;  // 8 PM
    const slotDuration = 30; // 30 minutes
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = ((hour % 12) === 0) ? 12 : (hour % 12);
        const displayMinute = minute.toString().padStart(2, '0');
        slots.push({
          time: `${displayHour}:${displayMinute} ${period}`,
          hour,
          minute
        });
      }
    }
    
    // Debug: Log time slots for Fizza's appointment (3:00 PM = 15:00)
    console.log('🔍 TIME SLOTS DEBUG:', {
      totalSlots: slots.length,
      slotsFor3PM: slots.filter(slot => slot.hour === 15 && slot.minute === 0),
      allSlots: slots.map(slot => `${slot.hour}:${slot.minute} (${slot.time})`)
    });
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  const getAppointmentsForDay = (date: Date) => {
    console.log('🔍 GET APPOINTMENTS FOR DAY:', {
      targetDate: date.toDateString(),
      targetDateISO: date.toISOString(),
      totalAppointments: appointments.length,
      appointments: appointments.map(apt => ({
        client: apt.client,
        start: apt.start.toDateString(),
        startTime: apt.start.toLocaleString(),
        startISO: apt.start.toISOString(),
        startNY: apt.start.toLocaleString('en-US', { timeZone: 'America/New_York' })
      }))
    });

    const dayAppointments = appointments.filter(apt => {
      // Use the original start_time for date comparison to avoid timezone issues
      const aptDate = new Date(apt.start_time);
      const targetDate = new Date(date);
      
      // Compare dates in UTC to avoid timezone conversion issues
      const aptDateUTC = new Date(aptDate.getUTCFullYear(), aptDate.getUTCMonth(), aptDate.getUTCDate());
      const targetDateUTC = new Date(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
      
      const isSameDay = aptDateUTC.getTime() === targetDateUTC.getTime();
      
      // Special debugging for Fizza's appointment
      if (apt.client === 'fizza') {
        console.log('🔍 FIZZA DAY FILTER DEBUG:', {
          appointment: apt.client,
          aptDate: aptDate.toDateString(),
          aptDateUTC: aptDateUTC.toDateString(),
          targetDate: targetDate.toDateString(),
          targetDateUTC: targetDateUTC.toDateString(),
          isSameDay,
          aptStartTime: apt.start_time,
          aptStartNY: apt.start.toLocaleString('en-US', { timeZone: 'America/New_York' })
        });
      }
      
      console.log('Checking appointment for day:', {
        appointment: apt.client,
        aptDate: aptDate.toDateString(),
        aptDateLocal: aptDate.toLocaleString(),
        aptDateNY: aptDate.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        targetDate: targetDate.toDateString(),
        targetDateLocal: targetDate.toLocaleString(),
        targetDateNY: targetDate.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        isSameDay,
        aptStart: apt.start.toLocaleString(),
        aptStartTime: apt.start_time
      });
      
      return isSameDay;
    });
    
    console.log(`Found ${dayAppointments.length} appointments for ${date.toDateString()}`);
    return dayAppointments;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    
    console.log('Slot clicked:', {
      originalDate: date,
      slotTime: slotTime,
      hour,
      minute,
      slotTimeISO: slotTime.toISOString(),
      slotTimeLocal: slotTime.toLocaleString()
    });
    
    // Don't convert timezone for display - show the actual selected time
    const displayTime = slotTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const displayDate = slotTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    setSelectedSlot({ 
      date, 
      time: slotTime,
      displayTime: displayTime,
      displayDate: displayDate
    });
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setShowAppointmentModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      // TODO: implement cancel API call if available
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      setShowCancelConfirm(false);
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error canceling appointment:', err);
    }
  };

  // Create appointment (from AA, adapted to axios + headers)
  const handleCreateAppointment = async () => {
    if (!selectedSlot) return;
    try {
      setFormLoading(true);
      // Create appointment in tenant timezone
      const tenantTimezone = currentTenant?.timezone || 'America/New_York';
      
      // Get date string in YYYY-MM-DD format
      const dateStr = selectedSlot.date.toISOString().split('T')[0];
      const slotHour = selectedSlot.time.getHours();
      const slotMinute = selectedSlot.time.getMinutes();
      
      console.log('Tenant selection:', { 
        date: dateStr, 
        slotHour, 
        slotMinute, 
        tenantTimezone 
      });
      
      // Convert tenant-local time to UTC using Luxon
      const { startISO, endISO } = buildSlotUTCISO(
        dateStr, 
        slotHour, 
        slotMinute, 
        tenantTimezone, 
        appointmentForm.duration
      );
      
      console.log('Converted to UTC:', { startISO, endISO });
      
      const payload = {
        customer_name: appointmentForm.client_name,
        customer_phone: appointmentForm.client_phone,
        customer_email: appointmentForm.client_email,
        barber_id: appointmentForm.barber_id,
        service_id: appointmentForm.service,
        start_time: startISO,
        end_time: endISO,
        customer: {
          name: appointmentForm.client_name,
          phone: appointmentForm.client_phone,
          email: appointmentForm.client_email
        },
        notes: appointmentForm.notes,
        status: 'confirmed'
      };
      console.log('Sending appointment to REAL API:', payload);
      console.log('Service ID being sent:', appointmentForm.service);
      console.log('Barber ID being sent:', appointmentForm.barber_id);
      const response = await apiClient.post('/appointments', payload);
      console.log('Real API Response:', response);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create appointment');
      }
         await loadAppointments();
         // Force refresh the calendar view
         setCurrentDate(new Date(currentDate));
         setShowAppointmentModal(false);
         setSelectedSlot(null);
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
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAppointmentHover = (appointment: Appointment, event: React.MouseEvent) => {
    setHoveredAppointment(appointment);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleAppointmentLeave = () => setHoveredAppointment(null);

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

  const renderDayView = () => {
    const currentDay = new Date(currentDate);
    return (
      <div className="h-full overflow-auto">
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10"></div>
            {timeSlots.filter((slot, index) => slot.minute === 0).map((slot, index) => (
              <div key={index} className="h-16 border-b border-gray-200 p-2 text-sm text-gray-500">
                {slot.time}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="bg-white relative">
            {/* Day header */}
            <div className="h-16 border-b border-gray-200 p-2 text-center sticky top-0 bg-white z-10">
              <div className="text-sm font-medium text-gray-900">
                {currentDay.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className={`text-2xl font-semibold ${
                currentDay.toDateString() === new Date().toDateString()
                  ? 'text-blue-600'
                  : 'text-gray-900'
              }`}>
                {currentDay.getDate()}
              </div>
            </div>

            {/* Time slots (30 min) - Full height with scroll */}
            <div className="relative" style={{ height: `${timeSlots.length * 32}px` }}>
              {timeSlots.map((slot, index) => (
                <div 
                  key={index} 
                  className="absolute w-full h-8 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors" 
                  style={{ top: `${index * 32}px` }}
                  onClick={() => handleSlotClick(currentDay, slot.hour, slot.minute)}
                />
              ))}

              {/* Appointments for this day */}
              {getAppointmentsForDay(currentDay).map((appointment) => {
                if (selectedBarber !== 'all' && appointment.barberId !== selectedBarber) return null;

                // Use appointment start/end times directly for positioning
                const startHour = appointment.start.getHours();
                const startMinute = appointment.start.getMinutes();
                const duration = (appointment.end.getTime() - appointment.start.getTime()) / (1000 * 60);

                // Calculate position based on time slots (8 AM = 0, 8:30 AM = 1, etc.)
                const slotIndex = timeSlots.findIndex(slot => 
                  slot.hour === startHour && slot.minute === startMinute
                );
                
                // If exact slot found, use it; otherwise calculate position
                const topPosition = slotIndex >= 0 ? slotIndex * 32 : ((startHour - 8) * 64) + (startMinute * 64 / 60);
                const height = Math.max((duration * 64 / 60), 40);

                console.log('Appointment positioning:', {
                  appointment: appointment.client,
                  startHour,
                  startMinute,
                  slotIndex,
                  topPosition,
                  height,
                  start: appointment.start.toLocaleString(),
                  end: appointment.end.toLocaleString(),
                  timeSlotsLength: timeSlots.length
                });

                // Don't render if position is invalid
                if (topPosition < 0 || topPosition > timeSlots.length * 32) {
                  console.log('Skipping appointment - invalid position:', topPosition);
                  return null;
                }

                const barber = barbers.find(b => b.id === appointment.barberId || b.name === appointment.barber);

                return (
                  <div
                    key={appointment.id}
                    className="absolute left-2 right-2 rounded-lg p-3 text-sm text-white cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-md overflow-hidden"
                    style={{
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      backgroundColor: barber ? barber.color : '#3B82F6',
                      opacity: appointment.status === 'confirmed' ? 1 : 0.7
                    }}
                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(appointment); }}
                    onMouseEnter={(e) => handleAppointmentHover(appointment, e)}
                    onMouseLeave={handleAppointmentLeave}
                  >
                    <div className="font-semibold truncate">{appointment.client}</div>
                    {height > 55 && (
                      <>
                        <div className="text-xs opacity-90 truncate">{appointment.service}</div>
                        {height > 70 && (
                          <div className="text-xs opacity-90 mt-1 truncate">{appointment.displayTime}</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="h-full overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10"></div>
            {timeSlots.filter(slot => slot.minute === 0).map((slot, index) => (
              <div key={index} className="h-16 border-b border-gray-200 p-2 text-xs text-gray-500">
                {slot.time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            // Debug all days
            console.log('🔍 WEEK DAY DEBUG:', {
              dayIndex,
              day: day.toDateString(),
              dayISO: day.toISOString(),
              isMonday: day.toDateString() === 'Mon Oct 27 2025',
              isFizzaDay: day.toDateString() === 'Mon Oct 27 2025'
            });
            
            // Special debugging for Fizza's appointment day
            if (day.toDateString() === 'Mon Oct 27 2025') {
              console.log('🔍 CHECKING FIZZA DAY:', {
                day: day.toDateString(),
                dayIndex,
                isFizzaDay: day.toDateString() === 'Mon Oct 27 2025'
              });
            }
            
            return (
              <div key={dayIndex} className="bg-white relative">
              {/* Day header */}
              <div className="h-16 border-b border-gray-200 p-2 text-center sticky top-0 bg-white z-10">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  day.toDateString() === new Date().toDateString()
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Time slots (30 min) - Full height with scroll */}
              <div className="relative" style={{ height: `${timeSlots.length * 32}px` }}>
                {timeSlots.map((slot, index) => (
                  <div 
                    key={index} 
                    className="absolute w-full h-8 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors" 
                    style={{ top: `${index * 32}px` }}
                    onClick={() => handleSlotClick(day, slot.hour, slot.minute)}
                  />
                ))}

                {/* Appointments for this day */}
                {getAppointmentsForDay(day).map((appointment) => {
                  if (selectedBarber !== 'all' && appointment.barberId !== selectedBarber) return null;

                  // Convert UTC time to tenant timezone for positioning
                  const originalStartTime = appointment.start_time;
                  const utcDate = new Date(originalStartTime);
                  
                  // Convert to tenant timezone (America/New_York)
                  const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                  const startHour = tenantDate.getHours();
                  const startMinute = tenantDate.getMinutes();
                  const duration = (appointment.end.getTime() - appointment.start.getTime()) / (1000 * 60);

                  // Debug all appointments positioning
                  console.log('🔍 APPOINTMENT POSITIONING DEBUG:', {
                    client: appointment.client,
                    startHour,
                    startMinute,
                    originalStartTime: appointment.start_time,
                    utcDate: utcDate.toISOString(),
                    tenantDate: tenantDate.toISOString(),
                    startTime: appointment.start.toLocaleString(),
                    startTimeNY: appointment.start.toLocaleString('en-US', { timeZone: 'America/New_York' }),
                    duration
                  });

                  // Special debugging for Fizza's appointment
                  if (appointment.client === 'fizza') {
                    console.log('🔍 FIZZA CALENDAR POSITIONING DEBUG:', {
                      appointment: appointment.client,
                      startHour,
                      startMinute,
                      duration,
                      startTime: appointment.start.toLocaleString(),
                      startTimeNY: appointment.start.toLocaleString('en-US', { timeZone: 'America/New_York' }),
                      day: day.toDateString(),
                      timeSlotsLength: timeSlots.length
                    });
                  }

                  // Calculate position based on time slots (8 AM = 0, 8:30 AM = 1, etc.)
                  const slotIndex = timeSlots.findIndex(slot => 
                    slot.hour === startHour && slot.minute === startMinute
                  );
                  
                  // If exact slot found, use it; otherwise calculate position
                  const topPosition = slotIndex >= 0 ? slotIndex * 32 : ((startHour - 8) * 64) + (startMinute * 64 / 60);
                  const height = Math.max((duration * 64 / 60), 30);

                  // Special debugging for Fizza's appointment positioning
                  if (appointment.client === 'fizza') {
                    console.log('🔍 FIZZA POSITIONING CALCULATION:', {
                      slotIndex,
                      topPosition,
                      height,
                      timeSlotsLength: timeSlots.length,
                      maxPosition: timeSlots.length * 32,
                      isValidPosition: topPosition >= 0 && topPosition <= timeSlots.length * 32
                    });
                  }

                  // Don't render if position is invalid
                  if (topPosition < 0 || topPosition > timeSlots.length * 32) {
                    console.log('Skipping appointment in week view - invalid position:', topPosition);
                    if (appointment.client === 'fizza') {
                      console.log('🔍 FIZZA APPOINTMENT SKIPPED - Invalid position:', {
                        topPosition,
                        maxPosition: timeSlots.length * 32,
                        startHour,
                        startMinute,
                        timeSlotsLength: timeSlots.length,
                        isVisible: topPosition >= 0 && topPosition <= timeSlots.length * 32
                      });
                    }
                    return null;
                  }

                  // Special debugging for Fizza's appointment - check if it's in visible area
                  if (appointment.client === 'fizza') {
                    console.log('🔍 FIZZA APPOINTMENT RENDERED:', {
                      appointment: appointment.client,
                      topPosition,
                      height,
                      isInVisibleArea: topPosition >= 0 && topPosition <= 1000, // Assuming 1000px is visible height
                      scrollPosition: 'Check if user needs to scroll down to see 3:00 PM'
                    });
                  }

                  const barber = barbers.find(b => b.id === appointment.barberId || b.name === appointment.barber);

                  // Special debugging for Fizza's appointment rendering
                  if (appointment.client === 'fizza') {
                    console.log('🔍 FIZZA APPOINTMENT RENDERING:', {
                      appointment: appointment.client,
                      topPosition,
                      height,
                      barber: barber?.name,
                      barberColor: barber?.color,
                      willRender: true
                    });
                  }

                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity z-10 overflow-hidden"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: barber ? barber.color : '#3B82F6',
                        opacity: appointment.status === 'confirmed' ? 1 : 0.7
                      }}
                      title={`${appointment.client}\n${appointment.service}\n${formatTime(appointment.start)} - ${formatTime(appointment.end)}\nStatus: ${appointment.status}\nTimezone: ${appointment.timezone || 'America/New_York'}`}
                      onClick={(e) => { e.stopPropagation(); handleAppointmentClick(appointment); }}
                      onMouseEnter={(e) => handleAppointmentHover(appointment, e)}
                      onMouseLeave={handleAppointmentLeave}
                    >
                      <div className="font-medium truncate">{appointment.client}</div>
                      {height > 40 && (
                        <>
                          <div className="truncate">{appointment.service}</div>
                          {height > 55 && <div className="truncate">{formatTime(appointment.start)}</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
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

    // leading blanks
    for (let i = 0; i < startingDayOfWeek; i++) currentWeek.push(null);

    // days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    // trailing blanks
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return (
      <div className="h-full overflow-auto p-4">
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

                  const dayAppointments = getAppointmentsForDay(day);
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
                          if (selectedBarber !== 'all' && apt.barberId !== selectedBarber) return null;
                          const barber = barbers.find(b => b.id === apt.barberId || b.name === apt.barber);
                          return (
                            <div
                              key={apt.id}
                              className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: barber ? barber.color : '#3B82F6', color: 'white' }}
                              onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                              onMouseEnter={(e) => handleAppointmentHover(apt, e)}
                              onMouseLeave={handleAppointmentLeave}
                            >
                              {formatTime(apt.start)} {apt.client}
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

  return (
    <div className="h-full flex flex-col" data-testid="calendar-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>

          {/* Navigation */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Button 
              onClick={() => navigateDate('prev')} 
              variant="ghost" 
              size="icon-sm"
              className="hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
              onClick={() => navigateDate('next')} 
              variant="ghost" 
              size="icon-sm"
              className="hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="default"
            size="sm"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barber Filter */}
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Barber" />
            </SelectTrigger>
            <SelectContent>
              {barbers.map(barber => (
                <SelectItem key={barber.id} value={barber.id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((mode) => (
              <Button
                key={mode}
                onClick={() => setViewMode(mode)}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                className={`px-3 py-1 text-sm ${
                  viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>

          <Button 
            onClick={() => {
              const now = new Date();
              setSelectedSlot({ 
                date: now, 
                time: now,
                displayTime: now.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }),
                displayDate: now.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              });
              setSelectedAppointment(null);
              setShowAppointmentModal(true);
            }}
            variant="default"
            size="default"
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
        <p className="text-red-700">{error}</p>
      </div>
      )}

      {/* Debug panel - show appointments */}
      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug: Appointments ({appointments.length})</h3>
        <div className="text-sm text-yellow-700">
          {appointments.length > 0 ? (
            <div className="space-y-1">
              {appointments.map((apt, index) => (
                <div key={index} className="flex justify-between">
                  <span>{apt.client} - {apt.service}</span>
                  <span>{apt.start_time} ({apt.start?.toLocaleString('en-US', { timeZone: 'America/New_York' })})</span>
                </div>
              ))}
            </div>
          ) : (
            <span>No appointments found</span>
          )}
        </div>
        <div className="mt-2 text-xs text-yellow-600">
          <p><strong>Current Date:</strong> {currentDate.toLocaleDateString()}</p>
          <p><strong>View Mode:</strong> {viewMode}</p>
          <p><strong>Selected Barber:</strong> {selectedBarber}</p>
        </div> */}
        
        {/* Special notice for Fizza's appointment */}
        {/* {appointments.some(apt => apt.client === 'fizza') && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="font-semibold text-blue-800">📍 Fizza's Appointment Notice:</p>
            <p className="text-blue-700">Fizza's appointment is at 3:00 PM on October 27, 2025.</p>
            <p className="text-blue-700">You need to <strong>scroll down</strong> in the calendar to see the 3:00 PM time slot!</p>
          </div>
        )} */}
      {/* </div> */}

      {/* Loading state & Calendar Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'month' && renderMonthView()}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border-t p-4">
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

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAppointment ? (
              /* View/Cancel Existing Appointment */
              <>
                <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                      <p className="text-gray-900">{selectedAppointment.client}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                      <p className="text-gray-900">{selectedAppointment.service}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
                      <p className="text-gray-900">{selectedAppointment.barber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">{selectedAppointment.start.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <p className="text-gray-900">
                        {formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}
                      </p>
                    </div>
                  </div>
                  {selectedAppointment.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                  )}
                  {selectedAppointment.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedAppointment.email}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => { setShowAppointmentModal(false); setSelectedAppointment(null); }}
                    variant="outline"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="destructive"
                  >
                    Cancel Appointment
                  </Button>
                </div>
              </>
            ) : selectedSlot ? (
              /* Create New Appointment (from AA) */
              <>
                <h2 className="text-xl font-semibold mb-4">Create New Appointment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selected Time</label>
                    <p className="text-gray-900 bg-blue-50 p-2 rounded">
                      {selectedSlot.displayDate || selectedSlot.date.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })} at {selectedSlot.displayTime || formatTime(selectedSlot.time)}
                    </p>
                    {/* Debug info */}
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p><strong>Debug Info:</strong></p>
                      <p>Slot Hour: {selectedSlot.time.getHours()}</p>
                      <p>Slot Minute: {selectedSlot.time.getMinutes()}</p>
                      <p>Display Time: {selectedSlot.displayTime}</p>
                      <p>Tenant Timezone: {currentTenant?.timezone || 'America/New_York'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input
                        type="text"
                        value={appointmentForm.client_name}
                        onChange={(e) => setAppointmentForm({...appointmentForm, client_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={appointmentForm.client_phone}
                        onChange={(e) => setAppointmentForm({...appointmentForm, client_phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={appointmentForm.client_email}
                      onChange={(e) => setAppointmentForm({...appointmentForm, client_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                      <select
                        value={appointmentForm.service}
                        onChange={(e) => {
                          const selectedServiceId = e.target.value;
                          const selectedService = services.find(s => s.id === selectedServiceId);
                          setAppointmentForm({
                            ...appointmentForm, 
                            service: selectedServiceId,
                            duration: selectedService?.duration || 30
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select service</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text sm font-medium text-gray-700 mb-1">Barber *</label>
                      <select
                        value={appointmentForm.barber_id}
                        onChange={(e) => setAppointmentForm({...appointmentForm, barber_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select barber</option>
                        {barbers.filter(b => b.id !== 'all').map(barber => (
                          <option key={barber.id} value={barber.id}>{barber.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={appointmentForm.duration}
                      onChange={(e) => setAppointmentForm({...appointmentForm, duration: parseInt(e.target.value || '0') || 30})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="15"
                      step="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any special requests or notes..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={appointmentForm.send_sms}
                      onChange={(e) => setAppointmentForm({...appointmentForm, send_sms: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Send SMS confirmation to client
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setSelectedSlot(null);
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
                    }}
                    variant="outline"
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAppointment}
                    disabled={formLoading || !appointmentForm.client_name || !appointmentForm.client_phone || !appointmentForm.service || !appointmentForm.barber_id}
                    variant="default"
                  >
                    {formLoading ? 'Creating...' : 'Create Appointment'}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment with {selectedAppointment?.client}?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
              >
                No, Keep It
              </Button>
              <Button
                onClick={handleCancelAppointment}
                variant="destructive"
              >
                Yes, Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredAppointment && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{hoveredAppointment.client}</h3>
              <p className="text-sm text-gray-600">{hoveredAppointment.service}</p>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{formatDate(hoveredAppointment.start)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  {formatTime(hoveredAppointment.start)} - {formatTime(hoveredAppointment.end)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{hoveredAppointment.barber}</span>
              </div>
            </div>

            {/* Contact Information */}
            {(hoveredAppointment.phone || hoveredAppointment.email) && (
              <div className="border-t border-gray-100 pt-2 space-y-2">
                {hoveredAppointment.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.phone}</span>
                  </div>
                )}
                {hoveredAppointment.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {hoveredAppointment.notes && (
              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{hoveredAppointment.notes}</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${hoveredAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {hoveredAppointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleCalendar;
