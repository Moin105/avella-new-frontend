'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Mail, Phone, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Step6StaffProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  isActive: boolean;
}

const Step6Staff: React.FC<Step6StaffProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [staff, setStaff] = useState<StaffMember[]>(
    data?.staff || [
      {
        id: '1',
        name: '',
        email: '',
        phone: '',
        role: 'barber',
        specialties: [],
        isActive: true
      }
    ]
  );

  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    phone: '',
    role: 'barber',
    specialties: [],
    isActive: true
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const roles = [
    { value: 'barber', label: 'Barber' },
    { value: 'stylist', label: 'Stylist' },
    { value: 'manager', label: 'Manager' },
    { value: 'receptionist', label: 'Receptionist' }
  ];

  const specialties = ['Haircuts', 'Beard Trims', 'Styling', 'Coloring', 'Treatments', 'Shaves'];

  const addStaff = () => {
    if (!newStaff.name?.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    if (!newStaff.email?.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!newStaff.phone?.trim()) {
      setErrors({ phone: 'Phone is required' });
      return;
    }

    const staffMember: StaffMember = {
      id: Date.now().toString(),
      name: newStaff.name!,
      email: newStaff.email!,
      phone: newStaff.phone!,
      role: newStaff.role!,
      specialties: newStaff.specialties!,
      isActive: true
    };

    setStaff(prev => [...prev, staffMember]);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: 'barber',
      specialties: [],
      isActive: true
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeStaff = (id: string) => {
    setStaff(prev => prev.filter(member => member.id !== id));
  };

  const updateStaff = (id: string, field: keyof StaffMember, value: any) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const toggleSpecialty = (staffId: string, specialty: string) => {
    setStaff(prev => prev.map(member => {
      if (member.id === staffId) {
        const specialties = member.specialties.includes(specialty)
          ? member.specialties.filter(s => s !== specialty)
          : [...member.specialties, specialty];
        return { ...member, specialties };
      }
      return member;
    }));
  };

  const validateForm = () => {
    if (staff.length === 0) {
      alert('Please add at least one staff member');
      return false;
    }

    const hasActiveStaff = staff.some(member => member.isActive);
    if (!hasActiveStaff) {
      alert('Please have at least one active staff member');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        staff
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <UserCheck className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Staff Members</h2>
        <p className="text-gray-600">Add your team members who will be providing services</p>
      </div>

      <div className="space-y-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{member.name || 'New Staff Member'}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-1" />
                      {member.email || 'No email'}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-1" />
                      {member.phone || 'No phone'}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                  </div>
                  {member.specialties.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Specialties: </span>
                      <span className="text-sm text-gray-700">{member.specialties.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeStaff(member.id)}
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
              <CardTitle>Add New Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName">Full Name *</Label>
                  <Input
                    id="staffName"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffEmail">Email *</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffPhone">Phone *</Label>
                  <Input
                    id="staffPhone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffRole">Role</Label>
                  <Select 
                    value={newStaff.role} 
                    onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialties.map(specialty => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStaff.specialties?.includes(specialty) || false}
                        onChange={(e) => {
                          const specialties = newStaff.specialties || [];
                          if (e.target.checked) {
                            setNewStaff(prev => ({ 
                              ...prev, 
                              specialties: [...specialties, specialty] 
                            }));
                          } else {
                            setNewStaff(prev => ({ 
                              ...prev, 
                              specialties: specialties.filter(s => s !== specialty) 
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addStaff}>
                  Add Staff Member
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
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

export default Step6Staff;
