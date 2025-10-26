'use client';

import React, { useState } from 'react';
import { Scissors, Plus, Trash2, DollarSign, Clock, ArrowLeft, ArrowRight, Upload, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';

interface Step5ServicesEnhancedProps {
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

const Step5ServicesEnhanced: React.FC<Step5ServicesEnhancedProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [services, setServices] = useState<Service[]>(
    data?.services || []
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImportModal, setShowImportModal] = useState(false);

  // Predefined service categories with checkboxes
  const serviceCategories = {
    // Men's Services
    'Men\'s Haircuts': [
      { name: 'Regular Cut', defaultPrice: 25, defaultDuration: 30 },
      { name: 'Skin Fade', defaultPrice: 30, defaultDuration: 45 },
      { name: 'Taper', defaultPrice: 25, defaultDuration: 30 },
      { name: 'Scissor Cut', defaultPrice: 25, defaultDuration: 30 },
      { name: 'Buzz Cut', defaultPrice: 20, defaultDuration: 20 },
      { name: 'Head Shave', defaultPrice: 15, defaultDuration: 15 }
    ],
    'Men\'s Beard/Grooming': [
      { name: 'Beard Trim', defaultPrice: 15, defaultDuration: 20 },
      { name: 'Hot Towel Shave', defaultPrice: 25, defaultDuration: 30 },
      { name: 'Line-Up/Shape-Up', defaultPrice: 15, defaultDuration: 15 },
      { name: 'Nose/Ear Wax', defaultPrice: 10, defaultDuration: 10 },
      { name: 'Eyebrow Clean-up', defaultPrice: 10, defaultDuration: 10 }
    ],
    'Men\'s Combos': [
      { name: 'Haircut + Beard', defaultPrice: 35, defaultDuration: 50 },
      { name: 'Haircut + Hot Towel Shave', defaultPrice: 40, defaultDuration: 60 },
      { name: 'Kid\'s Cut + Design', defaultPrice: 20, defaultDuration: 30 }
    ],
    'Men\'s Styling/Finish': [
      { name: 'Wash & Style', defaultPrice: 20, defaultDuration: 30 },
      { name: 'Blow-Dry', defaultPrice: 15, defaultDuration: 20 },
      { name: 'Straight Razor Finish', defaultPrice: 10, defaultDuration: 10 },
      { name: 'Enhancements (fibers/pencil)', defaultPrice: 15, defaultDuration: 15 }
    ],
    
    // Women's Services
    'Women\'s Haircuts': [
      { name: 'Women\'s Regular Cut', defaultPrice: 40, defaultDuration: 45 },
      { name: 'Women\'s Scissor Cut', defaultPrice: 50, defaultDuration: 60 },
      { name: 'Women\'s Bob Cut', defaultPrice: 45, defaultDuration: 50 },
      { name: 'Women\'s Pixie Cut', defaultPrice: 40, defaultDuration: 45 },
      { name: 'Women\'s Layered Cut', defaultPrice: 55, defaultDuration: 70 },
      { name: 'Women\'s Bangs Trim', defaultPrice: 15, defaultDuration: 20 }
    ],
    'Women\'s Styling/Finish': [
      { name: 'Women\'s Wash & Style', defaultPrice: 60, defaultDuration: 75 },
      { name: 'Women\'s Blow-Dry', defaultPrice: 35, defaultDuration: 45 },
      { name: 'Women\'s Curl Set', defaultPrice: 50, defaultDuration: 60 },
      { name: 'Women\'s Updo', defaultPrice: 70, defaultDuration: 90 },
      { name: 'Women\'s Wedding Style', defaultPrice: 120, defaultDuration: 150 },
      { name: 'Women\'s Special Occasion', defaultPrice: 80, defaultDuration: 100 }
    ],
    'Women\'s Color/Chemical': [
      { name: 'Women\'s Full Color', defaultPrice: 120, defaultDuration: 120 },
      { name: 'Women\'s Highlights', defaultPrice: 150, defaultDuration: 150 },
      { name: 'Women\'s Balayage', defaultPrice: 180, defaultDuration: 180 },
      { name: 'Women\'s Ombre', defaultPrice: 160, defaultDuration: 160 },
      { name: 'Women\'s Root Touch-up', defaultPrice: 80, defaultDuration: 60 },
      { name: 'Women\'s Color Correction', defaultPrice: 200, defaultDuration: 240 },
      { name: 'Women\'s Perm', defaultPrice: 100, defaultDuration: 180 },
      { name: 'Women\'s Keratin Treatment', defaultPrice: 200, defaultDuration: 180 },
      { name: 'Women\'s Brazilian Blowout', defaultPrice: 250, defaultDuration: 240 }
    ],
    'Women\'s Specialty': [
      { name: 'Women\'s Braids', defaultPrice: 80, defaultDuration: 120 },
      { name: 'Women\'s Twists', defaultPrice: 70, defaultDuration: 100 },
      { name: 'Women\'s Silk Press', defaultPrice: 70, defaultDuration: 90 },
      { name: 'Women\'s Loc Maintenance', defaultPrice: 60, defaultDuration: 90 },
      { name: 'Women\'s Extensions (install)', defaultPrice: 200, defaultDuration: 240 },
      { name: 'Women\'s Weave Install', defaultPrice: 150, defaultDuration: 180 },
      { name: 'Women\'s Hair Art/Designs', defaultPrice: 60, defaultDuration: 90 }
    ],
    'Women\'s Treatments': [
      { name: 'Women\'s Deep Conditioning', defaultPrice: 40, defaultDuration: 60 },
      { name: 'Women\'s Hair Mask Treatment', defaultPrice: 50, defaultDuration: 75 },
      { name: 'Women\'s Scalp Treatment', defaultPrice: 60, defaultDuration: 90 },
      { name: 'Women\'s Hair Repair Treatment', defaultPrice: 80, defaultDuration: 120 },
      { name: 'Women\'s Protein Treatment', defaultPrice: 70, defaultDuration: 100 }
    ],
    
    // Unisex Services
    'Kids': [
      { name: 'Kid\'s Cut (under 12)', defaultPrice: 20, defaultDuration: 30 },
      { name: 'Kid\'s Skin Fade', defaultPrice: 25, defaultDuration: 35 },
      { name: 'Kid\'s Design', defaultPrice: 30, defaultDuration: 40 },
      { name: 'Girl\'s Haircut', defaultPrice: 25, defaultDuration: 35 },
      { name: 'Girl\'s Styling', defaultPrice: 35, defaultDuration: 45 }
    ],
    'Add-Ons': [
      { name: 'Shampoo', defaultPrice: 10, defaultDuration: 15 },
      { name: 'Steam/Facial', defaultPrice: 25, defaultDuration: 30 },
      { name: 'Black Mask', defaultPrice: 30, defaultDuration: 45 },
      { name: 'Beard Hot Towel', defaultPrice: 15, defaultDuration: 20 },
      { name: 'Scalp Massage', defaultPrice: 20, defaultDuration: 25 },
      { name: 'Neck Cleanup', defaultPrice: 10, defaultDuration: 10 },
      { name: 'Eyebrow Shaping', defaultPrice: 15, defaultDuration: 20 },
      { name: 'Facial Hair Removal', defaultPrice: 20, defaultDuration: 30 }
    ]
  };

  const [selectedServices, setSelectedServices] = useState<{[key: string]: boolean}>({});

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

  const handleCategoryServiceToggle = (category: string, serviceName: string, defaultPrice: number, defaultDuration: number) => {
    const serviceKey = `${category}-${serviceName}`;
    const isSelected = selectedServices[serviceKey];
    
    if (isSelected) {
      // Remove service
      setServices(prev => prev.filter(service => service.name !== serviceName));
      setSelectedServices(prev => ({ ...prev, [serviceKey]: false }));
    } else {
      // Add service
      const service: Service = {
        id: Date.now().toString() + Math.random(),
        name: serviceName,
        description: `${serviceName} service`,
        duration: defaultDuration,
        price: defaultPrice,
        category: category,
        isActive: true
      };
      setServices(prev => [...prev, service]);
      setSelectedServices(prev => ({ ...prev, [serviceKey]: true }));
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedServices: Service[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
          const service: Service = {
            id: Date.now().toString() + i,
            name: values[0].trim(),
            description: values[0].trim() + ' service',
            duration: parseInt(values[1]) || 30,
            price: parseFloat(values[2]) || 0,
            category: 'Imported',
            isActive: true
          };
          importedServices.push(service);
        }
      }
      
      setServices(prev => [...prev, ...importedServices]);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const csvContent = [
      'service_name,duration_min,price',
      ...services.map(service => `${service.name},${service.duration},${service.price}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
        <p className="text-gray-600">Select services and set pricing. Check all that apply.</p>
      </div>

      {/* Service Categories */}
      <div className="space-y-6">
        {Object.entries(serviceCategories).map(([category, categoryServices]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryServices.map((service) => {
                  const serviceKey = `${category}-${service.name}`;
                  const isSelected = selectedServices[serviceKey];
                  const existingService = services.find(s => s.name === service.name);
                  
                  return (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={serviceKey}
                          checked={isSelected}
                          onCheckedChange={() => handleCategoryServiceToggle(
                            category, 
                            service.name, 
                            service.defaultPrice, 
                            service.defaultDuration
                          )}
                        />
                        <Label htmlFor={serviceKey} className="text-sm font-medium">
                          {service.name}
                        </Label>
                      </div>
                      
                      {isSelected && existingService && (
                        <div className="ml-6 space-y-2">
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              <Label className="text-xs">Price ($)</Label>
                              <Input
                                type="number"
                                value={existingService.price}
                                onChange={(e) => updateService(existingService.id, 'price', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs">Duration (min)</Label>
                              <Input
                                type="number"
                                value={existingService.duration}
                                onChange={(e) => updateService(existingService.id, 'duration', parseInt(e.target.value) || 0)}
                                className="h-8 text-sm"
                                min="5"
                                step="5"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Services */}
      <Card>
        <CardHeader>
          <CardTitle>Other (Custom Services)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.filter(s => s.category === 'Other' || s.category === 'Imported').map((service) => (
            <div key={service.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{service.name}</h4>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>${service.price}</span>
                  <span>{service.duration} min</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeService(service.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {showAddForm && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customServiceName">Service Name *</Label>
                  <Input
                    id="customServiceName"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter custom service name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customServicePrice">Price ($) *</Label>
                  <Input
                    id="customServicePrice"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customServiceDuration">Duration (min) *</Label>
                  <Input
                    id="customServiceDuration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="5"
                    step="5"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addService}>
                  Add Service
                </Button>
              </div>
            </div>
          )}

          {!showAddForm && (
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Service
              </Button>
              <Button variant="outline" onClick={() => setShowImportModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Services from CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with columns: service_name, duration_min, price
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

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

export default Step5ServicesEnhanced;

