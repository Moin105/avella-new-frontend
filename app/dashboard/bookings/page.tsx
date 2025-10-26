'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { convertToTenantTimezone } from '../../lib/timezone';
import { 
  Calendar, 
  Search, 
  Filter,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const BookingsPage = () => {
  const { currentTenant } = useTenant();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newBooking, setNewBooking] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service: '',
    barber_id: '',
    date: '',
    time: '',
    duration: 30,
    notes: '',
    status: 'pending'
  });
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (currentTenant && !hasLoaded) {
      setHasLoaded(true);
      loadData();
    }
  }, [currentTenant, hasLoaded]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus, filterDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading bookings data...');
      
      const [bookingsRes, servicesRes, barbersRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/services'),
        apiClient.get('/barbers')
      ]);

      console.log('Bookings API responses:', {
        bookings: bookingsRes,
        services: servicesRes,
        barbers: barbersRes,
      });

      // Only set loading to false if we have at least one successful API call
      let hasSuccessfulCall = false;

      if (bookingsRes.success) {
        hasSuccessfulCall = true;
        // Map appointments to UI format with timezone conversion
        const serviceIdToName = new Map(servicesRes.success ? (servicesRes.data as any[]).map((s: any) => [s.id, s.name]) : []);
        const tenantTimezone = currentTenant?.timezone || 'America/New_York';
        
        const mapped = (bookingsRes.data as any[]).map((a: any) => {
          // Convert times to tenant timezone
          const startTimeConverted = convertToTenantTimezone(a.start_time, tenantTimezone);
          const endTimeConverted = convertToTenantTimezone(a.end_time, tenantTimezone);
          
          return {
            id: a.id,
            client_name: a.customer?.name || '',
            client_phone: a.customer?.phone || '',
            client_email: a.customer?.email || '',
            service: a.service_id, // store id; display name via map
            service_name: serviceIdToName.get(a.service_id) || a.service_id,
            barber_id: a.barber_id,
            date: startTimeConverted.date, // "Oct 22, 2025"
            time: startTimeConverted.time, // "2:00 PM"
            fullDateTime: startTimeConverted.fullDateTime,
            endTime: endTimeConverted.time,
            duration: Math.max(0, Math.round((new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 60000)),
            notes: a.notes || '',
            status: a.status || 'pending',
            timezone: tenantTimezone,
          };
        });
        setBookings(mapped);
        console.log('Bookings loaded and mapped with timezone:', mapped);
      } else {
        console.error('Bookings API error:', bookingsRes.error);
        setBookings([]);
      }
      
      if (servicesRes.success) {
        hasSuccessfulCall = true;
        setServices(servicesRes.data as any[]);
        console.log('Services loaded:', servicesRes.data);
      } else {
        console.error('Services API error:', servicesRes.error);
        setServices([]);
      }
      
      if (barbersRes.success) {
        hasSuccessfulCall = true;
        setBarbers(barbersRes.data as any[]);
        console.log('Barbers loaded:', barbersRes.data);
      } else {
        console.error('Barbers API error:', barbersRes.error);
        setBarbers([]);
      }
      
      // derive clients from appointments
      if (bookingsRes.success) {
        const map = new Map<string, any>();
        (bookingsRes.data as any[]).forEach((a: any) => {
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
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings.filter(booking =>
      booking.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.service_name || booking.service).toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client_phone.includes(searchTerm)
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter(booking => booking.date === filterDate);
    }

    setFilteredBookings(filtered);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      // Build payload as backend expects
      const start = new Date(`${newBooking.date}T${newBooking.time}:00`);
      const end = new Date(start.getTime() + (newBooking.duration || 30) * 60000);
      const payload: any = {
        service_id: newBooking.service,
        barber_id: newBooking.barber_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        customer: {
          name: newBooking.client_name,
          phone: newBooking.client_phone,
          email: newBooking.client_email || '',
          notes: newBooking.notes || ''
        },
        notes: newBooking.notes || '',
        status: newBooking.status || 'pending'
      };

      const response = await apiClient.post('/appointments', payload);
      if (response.success) {
        // Map created appointment into UI shape
        const a: any = response.data;
        const aStart = new Date(a.start_time);
        const created = {
          id: a.id,
          client_name: a.customer?.name || newBooking.client_name,
          client_phone: a.customer?.phone || newBooking.client_phone,
          client_email: a.customer?.email || newBooking.client_email,
          service: a.service_id || newBooking.service,
          barber_id: a.barber_id || newBooking.barber_id,
          date: (a.start_time ? aStart : start).toISOString().slice(0,10),
          time: (a.start_time ? aStart : start).toTimeString().slice(0,5),
          duration: newBooking.duration,
          notes: a.notes || newBooking.notes,
          status: a.status || newBooking.status
        };
        setBookings([...bookings, created]);
        setNewBooking({
          client_name: '',
          client_phone: '',
          client_email: '',
          service: '',
          barber_id: '',
          date: '',
          time: '',
          duration: 30,
          notes: '',
          status: 'pending'
        });
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    setNewBooking(booking);
    setShowBookingModal(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const start = new Date(`${newBooking.date}T${newBooking.time}:00`);
      const end = new Date(start.getTime() + (newBooking.duration || 30) * 60000);
      const payload: any = {
        service_id: newBooking.service,
        barber_id: newBooking.barber_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        customer: {
          name: newBooking.client_name,
          phone: newBooking.client_phone,
          email: newBooking.client_email || '',
          notes: newBooking.notes || ''
        },
        notes: newBooking.notes || '',
        status: newBooking.status
      };
      if (!selectedBooking) return;
      const response = await apiClient.put(`/appointments/${selectedBooking.id}`, payload);
      if (response.success) {
        const a: any = response.data;
        const aStart = new Date(a.start_time);
        const updated = {
          id: a.id,
          client_name: a.customer?.name || newBooking.client_name,
          client_phone: a.customer?.phone || newBooking.client_phone,
          client_email: a.customer?.email || newBooking.client_email,
          service: a.service_id || newBooking.service,
          barber_id: a.barber_id || newBooking.barber_id,
          date: (a.start_time ? aStart : start).toISOString().slice(0,10),
          time: (a.start_time ? aStart : start).toTimeString().slice(0,5),
          duration: newBooking.duration,
          notes: a.notes || newBooking.notes,
          status: a.status || newBooking.status
        };
        setBookings(bookings.map(b => b.id === selectedBooking.id ? updated : b));
        setShowBookingModal(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await apiClient.delete(`/appointments/${bookingId}`);
      if (response.success) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/appointments/${bookingId}`, { status: newStatus });
      if (response.success) {
        setBookings(bookings.map(b => b.id === bookingId ? response.data : b));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage your appointments and bookings</p>
        </div>
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBooking ? 'Edit Booking' : 'New Booking'}
              </DialogTitle>
              <DialogDescription>
                {selectedBooking ? 'Update booking details' : 'Create a new booking'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={selectedBooking ? handleUpdateBooking : handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={newBooking.client_name}
                    onChange={(e) => setNewBooking({...newBooking, client_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    value={newBooking.client_phone}
                    onChange={(e) => setNewBooking({...newBooking, client_phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newBooking.client_email}
                  onChange={(e) => setNewBooking({...newBooking, client_email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={newBooking.service} onValueChange={(value) => setNewBooking({...newBooking, service: value})}>
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
                  <Select value={newBooking.barber_id} onValueChange={(value) => setNewBooking({...newBooking, barber_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select barber" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map(barber => (
                        <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (selectedBooking ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-40"
        />
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(booking.status)}
                     <div>
                       <h3 className="font-semibold">{booking.client_name}</h3>
                       <p className="text-sm text-muted-foreground">{booking.service_name || booking.service}</p>
                     </div>
                  </div>
                   <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                     <div className="flex items-center space-x-1">
                       <Clock className="h-4 w-4" />
                       <span>{booking.time}</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <Calendar className="h-4 w-4" />
                       <span>{booking.date}</span>
                     </div>
                    {booking.client_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{booking.client_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBooking(booking)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {booking.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}
              <div className="mt-4 flex space-x-2">
                {booking.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(booking.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(booking.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first booking'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowBookingModal(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
