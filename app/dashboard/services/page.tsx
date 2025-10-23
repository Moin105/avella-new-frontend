'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { 
  Scissors, 
  Search, 
  Plus, 
  Clock,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const ServicesPage = () => {
  const { currentTenant } = useTenant();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    is_active: true
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (currentTenant && !hasLoaded) {
      setHasLoaded(true);
      loadServices();
    }
  }, [currentTenant, hasLoaded]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const loadServices = async () => {
    try {
      setLoading(true);
      console.log('Loading services...');
      const response = await apiClient.get('/services');
      console.log('Services API response:', response);
      if (response.success) {
        setServices(response.data);
        console.log('Services loaded:', response.data);
      } else {
        console.error('Services API error:', response.error);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/services', newService);
      if (response.success) {
        setServices([...services, response.data]);
        setNewService({
          name: '',
          description: '',
          duration: 30,
          price: 0,
          is_active: true
        });
        setShowServiceModal(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setNewService(service);
    setShowServiceModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/services/${selectedService.id}`, newService);
      if (response.success) {
        setServices(services.map(s => s.id === selectedService.id ? response.data : s));
        setShowServiceModal(false);
        setSelectedService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const response = await apiClient.delete(`/services/${serviceId}`);
      if (response.success) {
        setServices(services.filter(s => s.id !== serviceId));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
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
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
              <DialogDescription>
                {selectedService ? 'Update service information' : 'Add a new service to your offerings'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={selectedService ? handleUpdateService : handleAddService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedService ? 'Update' : 'Add'} Service
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
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.is_active)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(service.is_active)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {service.description && (
                <p className="text-sm text-muted-foreground">{service.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${service.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No services found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first service'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowServiceModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
