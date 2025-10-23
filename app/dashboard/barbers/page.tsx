'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Link
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';

const BarbersPage = () => {
  const { currentTenant } = useTenant();
  const [barbers, setBarbers] = useState([]);
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    bio: '',
    is_active: true
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (currentTenant && !hasLoaded) {
      setHasLoaded(true);
      loadBarbers();
    }
  }, [currentTenant, hasLoaded]);

  useEffect(() => {
    filterBarbers();
  }, [barbers, searchTerm]);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/barbers');
      if (response.success) {
        setBarbers(response.data);
      }
    } catch (error) {
      console.error('Error loading barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBarbers = () => {
    const filtered = barbers.filter(barber =>
      barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.phone.includes(searchTerm)
    );
    setFilteredBarbers(filtered);
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/barbers', newBarber);
      if (response.success) {
        setBarbers([...barbers, response.data]);
        setNewBarber({
          name: '',
          email: '',
          phone: '',
          specialties: [],
          bio: '',
          is_active: true
        });
        setShowBarberModal(false);
      }
    } catch (error) {
      console.error('Error adding barber:', error);
    }
  };

  const handleEditBarber = (barber) => {
    setSelectedBarber(barber);
    setNewBarber(barber);
    setShowBarberModal(true);
  };

  const handleUpdateBarber = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/barbers/${selectedBarber.id}`, newBarber);
      if (response.success) {
        setBarbers(barbers.map(b => b.id === selectedBarber.id ? response.data : b));
        setShowBarberModal(false);
        setSelectedBarber(null);
      }
    } catch (error) {
      console.error('Error updating barber:', error);
    }
  };

  const handleDeleteBarber = async (barberId) => {
    try {
      const response = await apiClient.delete(`/barbers/${barberId}`);
      if (response.success) {
        setBarbers(barbers.filter(b => b.id !== barberId));
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
    }
  };

  const getStatusIcon = (isActive) => {
    if (isActive) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
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
          <h1 className="text-3xl font-bold">Barbers</h1>
          <p className="text-muted-foreground">Manage your barber team</p>
        </div>
        <Dialog open={showBarberModal} onOpenChange={setShowBarberModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Barber
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBarber ? 'Edit Barber' : 'Add New Barber'}
              </DialogTitle>
              <DialogDescription>
                {selectedBarber ? 'Update barber information' : 'Add a new barber to your team'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={selectedBarber ? handleUpdateBarber : handleAddBarber} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({...newBarber, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newBarber.email}
                  onChange={(e) => setNewBarber({...newBarber, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newBarber.phone}
                  onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newBarber.bio}
                  onChange={(e) => setNewBarber({...newBarber, bio: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={newBarber.is_active}
                  onCheckedChange={(checked) => setNewBarber({...newBarber, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowBarberModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedBarber ? 'Update' : 'Add'} Barber
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
            placeholder="Search barbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBarbers.map((barber) => (
          <Card key={barber.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(barber.is_active)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(barber.is_active)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditBarber(barber)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBarber(barber.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{barber.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{barber.phone}</span>
              </div>
              {barber.bio && (
                <p className="text-sm text-muted-foreground">{barber.bio}</p>
              )}
              {barber.specialties && barber.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBarbers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No barbers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first barber'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowBarberModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Barber
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BarbersPage;
