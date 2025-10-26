'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Mail, Phone, ArrowLeft, ArrowRight, Upload, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Step6StaffEnhancedProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  isActive: boolean;
}

const Step6StaffEnhanced: React.FC<Step6StaffEnhancedProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [staff, setStaff] = useState<Staff[]>(
    data?.staff || []
  );

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: '',
    email: '',
    phone: '',
    role: 'barber',
    specialties: [],
    isActive: true
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImportModal, setShowImportModal] = useState(false);

  const roles = [
    { value: 'barber', label: 'Barber' },
    { value: 'stylist', label: 'Stylist' },
    { value: 'manager', label: 'Manager' },
    { value: 'receptionist', label: 'Receptionist' }
  ];

  const specialtyOptions = [
    'Haircuts', 'Beard Trims', 'Styling', 'Color', 'Perms', 'Designs', 'Kids Cuts', 'Hot Towel Shave'
  ];

  const addStaff = () => {
    if (!newStaff.name?.trim()) {
      setErrors({ name: 'Staff name is required' });
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

    const staffMember: Staff = {
      id: Date.now().toString(),
      name: newStaff.name!,
      email: newStaff.email!,
      phone: newStaff.phone!,
      role: newStaff.role!,
      specialties: newStaff.specialties || [],
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

  const updateStaff = (id: string, field: keyof Staff, value: any) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const handleSpecialtyToggle = (staffId: string, specialty: string) => {
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

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedStaff: Staff[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 2) {
          const staffMember: Staff = {
            id: Date.now().toString() + i,
            name: values[0].trim(),
            email: values[1].trim(),
            phone: values[2]?.trim() || '',
            role: values[3]?.trim() || 'barber',
            specialties: values[4]?.split(';').map(s => s.trim()).filter(Boolean) || [],
            isActive: true
          };
          importedStaff.push(staffMember);
        }
      }
      
      setStaff(prev => [...prev, ...importedStaff]);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const csvContent = [
      'full_name,email,phone,role,specialties',
      ...staff.map(member => `${member.name},${member.email},${member.phone},${member.role},${member.specialties.join(';')}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <p className="text-gray-600">Add your team members (minimum 2, up to 5)</p>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {member.email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {member.phone}
                    </span>
                    <span className="capitalize">{member.role}</span>
                  </div>
                  
                  {/* Specialties */}
                  <div className="mt-3">
                    <Label className="text-sm font-medium">Specialties:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {specialtyOptions.map((specialty) => (
                        <label key={specialty} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={member.specialties.includes(specialty)}
                            onChange={() => handleSpecialtyToggle(member.id, specialty)}
                            className="rounded"
                          />
                          <span className="text-sm">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
      </div>

      {/* Add Staff Form */}
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
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
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
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newStaff.specialties?.includes(specialty) || false}
                      onChange={(e) => {
                        const specialties = newStaff.specialties || [];
                        const updatedSpecialties = e.target.checked
                          ? [...specialties, specialty]
                          : specialties.filter(s => s !== specialty);
                        setNewStaff(prev => ({ ...prev, specialties: updatedSpecialties }));
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

      {/* Action Buttons */}
      {!showAddForm && (
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Staff from CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with columns: full_name, email, phone, role, specialties
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

export default Step6StaffEnhanced;
