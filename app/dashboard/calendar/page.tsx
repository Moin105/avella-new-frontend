'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { convertToTenantTimezone } from '../../lib/timezone';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const CalendarPage = () => {
  const { currentTenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

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
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
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

      // Only set loading to false if we have at least one successful API call
      let hasSuccessfulCall = false;

      if (appointmentsRes.success) {
        hasSuccessfulCall = true;
        // Convert appointments to tenant timezone
        const tenantTimezone = currentTenant?.timezone || 'America/New_York';
        const processedAppointments = appointmentsRes.data.map((appointment: any) => {
          const startTimeConverted = convertToTenantTimezone(appointment.start_time, tenantTimezone);
          const endTimeConverted = convertToTenantTimezone(appointment.end_time, tenantTimezone);
          
          return {
            ...appointment,
            time: startTimeConverted.time,
            date: startTimeConverted.date,
            fullDateTime: startTimeConverted.fullDateTime,
            endTime: endTimeConverted.time,
            timezone: tenantTimezone,
          };
        });
        
        setAppointments(processedAppointments);
        console.log('Appointments loaded with timezone:', processedAppointments);
      } else {
        console.error('Appointments API error:', appointmentsRes.error);
        setAppointments([]);
      }
      
      if (barbersRes.success) {
        hasSuccessfulCall = true;
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }, ...barbersRes.data]);
        console.log('Barbers loaded:', barbersRes.data);
      } else {
        console.error('Barbers API error:', barbersRes.error);
        setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
      }
      
      if (servicesRes.success) {
        hasSuccessfulCall = true;
        setServices(servicesRes.data);
        console.log('Services loaded:', servicesRes.data);
      } else {
        console.error('Services API error:', servicesRes.error);
        setServices([]);
      }
      
      // derive clients from appointments
      if (appointmentsRes.success) {
        const map = new Map<string, any>();
        (appointmentsRes.data as any[]).forEach((a: any) => {
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

      // Only set loading to false if we have at least one successful call
      if (hasSuccessfulCall) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load calendar data');
      setLoading(false);
    }
  };

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

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString() &&
        (selectedBarber === 'all' || appointment.barber_id === selectedBarber);
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute
        });
      }
    }
    return slots;
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await apiClient.post('/appointments', {
        ...appointmentForm,
        date: selectedSlot?.date || new Date().toISOString().split('T')[0],
        time: selectedSlot?.time || '09:00'
      });
      
      if (response.success) {
        setAppointments([...appointments, response.data]);
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
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      client_name: appointment.client_name,
      client_phone: appointment.client_phone,
      client_email: appointment.client_email,
      service: appointment.service,
      barber_id: appointment.barber_id,
      duration: appointment.duration,
      notes: appointment.notes,
      send_sms: false
    });
    setShowAppointmentModal(true);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await apiClient.put(`/appointments/${selectedAppointment.id}`, appointmentForm);
      
      if (response.success) {
        setAppointments(appointments.map(a => a.id === selectedAppointment.id ? response.data : a));
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`);
      if (response.success) {
        setAppointments(appointments.filter(a => a.id !== appointmentId));
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <Select value={viewMode} onValueChange={setViewMode}>
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment ? 'Update appointment details' : 'Create a new appointment'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment} className="space-y-4">
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
                          <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
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
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
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

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {getWeekDays().map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          return (
            <Card key={index} className="min-h-[120px]">
              <CardHeader className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.getDate()}</span>
                  {day.toDateString() === new Date().toDateString() && (
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-2 bg-primary/10 rounded text-xs cursor-pointer hover:bg-primary/20"
                    onClick={() => handleEditAppointment(appointment)}
                  >
                    <div className="font-medium truncate">{appointment.client_name}</div>
                    <div className="text-muted-foreground">{appointment.time}</div>
                    <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;
