'use client';

import React, { useState } from 'react';
import { Scissors, Plus, Trash2, DollarSign, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface Step5ServicesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const Step5Services: React.FC<Step5ServicesProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [services, setServices] = useState<Service[]>(
    data?.services || [
      // Men's Services
      {
        id: '1',
        name: 'Regular Cut',
        description: 'Professional men\'s haircut service',
        duration: 30,
        price: 25,
        category: 'Men\'s Haircuts',
        isActive: true
      },
      {
        id: '2',
        name: 'Skin Fade',
        description: 'Professional skin fade haircut',
        duration: 45,
        price: 35,
        category: 'Men\'s Haircuts',
        isActive: true
      },
      {
        id: '3',
        name: 'Beard Trim',
        description: 'Professional beard trimming and styling',
        duration: 20,
        price: 15,
        category: 'Men\'s Beard/Grooming',
        isActive: true
      },
      {
        id: '4',
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel shave service',
        duration: 30,
        price: 25,
        category: 'Men\'s Beard/Grooming',
        isActive: true
      },
      {
        id: '5',
        name: 'Haircut + Beard',
        description: 'Combined haircut and beard service',
        duration: 50,
        price: 35,
        category: 'Men\'s Combos',
        isActive: true
      },
      
      // Women's Services
      {
        id: '6',
        name: 'Women\'s Haircut',
        description: 'Professional women\'s haircut service',
        duration: 45,
        price: 40,
        category: 'Women\'s Haircuts',
        isActive: true
      },
      {
        id: '7',
        name: 'Women\'s Scissor Cut',
        description: 'Precision scissor cut for women',
        duration: 60,
        price: 50,
        category: 'Women\'s Haircuts',
        isActive: true
      },
      {
        id: '8',
        name: 'Wash & Style',
        description: 'Hair wash and professional styling',
        duration: 75,
        price: 60,
        category: 'Women\'s Styling/Finish',
        isActive: true
      },
      {
        id: '9',
        name: 'Blow-Dry',
        description: 'Professional blow-dry styling',
        duration: 45,
        price: 35,
        category: 'Women\'s Styling/Finish',
        isActive: true
      },
      {
        id: '10',
        name: 'Full Color',
        description: 'Complete hair coloring service',
        duration: 120,
        price: 120,
        category: 'Women\'s Color/Chemical',
        isActive: true
      },
      {
        id: '11',
        name: 'Highlights',
        description: 'Professional hair highlighting',
        duration: 150,
        price: 150,
        category: 'Women\'s Color/Chemical',
        isActive: true
      },
      {
        id: '12',
        name: 'Keratin Treatment',
        description: 'Smoothing keratin treatment',
        duration: 180,
        price: 200,
        category: 'Women\'s Color/Chemical',
        isActive: true
      },
      {
        id: '13',
        name: 'Braids',
        description: 'Professional braiding service',
        duration: 120,
        price: 80,
        category: 'Women\'s Specialty',
        isActive: true
      },
      {
        id: '14',
        name: 'Silk Press',
        description: 'Silk press straightening service',
        duration: 90,
        price: 70,
        category: 'Women\'s Specialty',
        isActive: true
      },
      {
        id: '15',
        name: 'Kid\'s Cut (under 12)',
        description: 'Children\'s haircut service',
        duration: 30,
        price: 20,
        category: 'Kids',
        isActive: true
      },
      {
        id: '16',
        name: 'Shampoo',
        description: 'Professional shampoo service',
        duration: 15,
        price: 10,
        category: 'Add-Ons',
        isActive: true
      },
      {
        id: '17',
        name: 'Scalp Massage',
        description: 'Relaxing scalp massage',
        duration: 20,
        price: 15,
        category: 'Add-Ons',
        isActive: true
      }
    ]
  );

  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'Men\'s Haircuts',
    isActive: true
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const categories = [
    // Men's Categories
    'Men\'s Haircuts',
    'Men\'s Beard/Grooming',
    'Men\'s Combos',
    'Men\'s Styling/Finish',
    
    // Women's Categories
    'Women\'s Haircuts',
    'Women\'s Styling/Finish',
    'Women\'s Color/Chemical',
    'Women\'s Specialty',
    
    // Unisex Categories
    'Kids',
    'Add-Ons',
    'Other'
  ];

  const addService = () => {
    if (!newService.name?.trim()) {
      setErrors({ name: 'Service name is required' });
      return;
    }

    if (!newService.price || newService.price <= 0) {
      setErrors({ price: 'Price must be greater than 0' });
      return;
    }

    if (!newService.duration || newService.duration <= 0) {
      setErrors({ duration: 'Duration must be greater than 0' });
      return;
    }

    const service: Service = {
      id: Date.now().toString(),
      name: newService.name!,
      description: newService.description || '',
      duration: newService.duration!,
      price: newService.price!,
      category: newService.category!,
      isActive: true
    };

    setServices(prev => [...prev, service]);
    setNewService({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: 'Men\'s Haircuts',
      isActive: true
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const validateForm = () => {
    if (services.length === 0) {
      alert('Please add at least one service');
      return false;
    }

    const hasActiveService = services.some(service => service.isActive);
    if (!hasActiveService) {
      alert('Please have at least one active service');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        services
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Scissors className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <p className="text-gray-600">Add the services you offer to your customers</p>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${service.price}
                    </span>
                    <span className="text-sm text-gray-500">{service.category}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeService(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Haircut, Beard Trim"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Category</Label>
                  <select
                    id="serviceCategory"
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDuration">Duration (minutes) *</Label>
                  <Input
                    id="serviceDuration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="15"
                    step="15"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicePrice">Price ($) *</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this service includes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addService}>
                  Add Service
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step5Services;
