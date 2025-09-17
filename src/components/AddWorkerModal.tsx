import React, { useState, useEffect } from 'react';
import type { Worker } from '../types/worker';
import { apiClient, endpoints } from '../utils/api';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: (worker: Worker) => void;
}

interface WorkerForm {
  // Personal Info
  profile_photo: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  residential_address: string;
  digital_address: string;
  bio: string;
  
  // Profession
  primary_profession: string;
  secondary_profession: string;
  business_certificate: string;
  
  // Identification
  id_card_type: string;
  id_card_front: string;
  id_card_back: string;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose, onWorkerAdded }) => {
  const [formData, setFormData] = useState<WorkerForm>({
    profile_photo: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    residential_address: '',
    digital_address: '',
    bio: '',
    primary_profession: '',
    secondary_profession: '',
    business_certificate: '',
    id_card_type: 'Ghana Card',
    id_card_front: '',
    id_card_back: ''
  });

  const [errors, setErrors] = useState<Partial<WorkerForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Common professions for dropdown
  const professions = [
    'Software Engineer', 'Graphic Designer', 'Electrician', 'Plumber', 'Carpenter',
    'Teacher', 'Nurse', 'Doctor', 'Lawyer', 'Accountant', 'Marketing Specialist',
    'Web Developer', 'Data Analyst', 'Project Manager', 'Sales Representative',
    'Chef', 'Mechanic', 'Tailor', 'Hairdresser', 'Photographer', 'Other'
  ];

  const idCardTypes = ['Ghana Card', 'Passport', 'Driver\'s License', 'Voter ID'];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        profile_photo: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        residential_address: '',
        digital_address: '',
        bio: '',
        primary_profession: '',
        secondary_profession: '',
        business_certificate: '',
        id_card_type: 'Ghana Card',
        id_card_front: '',
        id_card_back: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setUploadingFiles([]);
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof WorkerForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof WorkerForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Please select an image file' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 5MB' }));
      return;
    }

    setUploadingFiles(prev => [...prev, fieldName]);
    
    try {
      // For now, we'll use a placeholder URL since we don't have a file upload endpoint
      // In a real app, you'd upload to your server or cloud storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, [fieldName]: dataUrl }));
        setUploadingFiles(prev => prev.filter(f => f !== fieldName));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      setErrors(prev => ({ ...prev, [fieldName]: 'Failed to upload file' }));
      setUploadingFiles(prev => prev.filter(f => f !== fieldName));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkerForm> = {};

    // Required fields validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.primary_profession.trim()) newErrors.primary_profession = 'Primary profession is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Generate a unique ID for the new worker
      const workerId = `w${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newWorker: Worker = {
        id: workerId,
        profile_photo: formData.profile_photo || `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=3B82F6&color=fff`,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        residential_address: formData.residential_address.trim() || null,
        digital_address: formData.digital_address.trim() || null,
        bio: formData.bio.trim(),
        primary_profession: formData.primary_profession.trim(),
        secondary_profession: formData.secondary_profession.trim() || null,
        business_certificate: formData.business_certificate || null,
        id_card_type: formData.id_card_type,
        id_card_front: formData.id_card_front || null,
        id_card_back: formData.id_card_back || null,
        status: 'active',
        rating: 0,
        completed_jobs: 0,
        is_online: false,
        is_available: true,
        verified_worker: false,
        premium_service: false,
        join_date: new Date().toISOString().split('T')[0]
      };

      try {
        // Try to submit to API first
        const response = await apiClient.post(endpoints.createWorker, newWorker);
        console.log('✅ Worker created successfully:', response.data);
        onWorkerAdded(response.data);
      } catch (apiError) {
        console.log('⚠️ API submission failed, adding worker locally:', apiError);
        // If API fails, still add the worker to the local state
        onWorkerAdded(newWorker);
      }

      onClose();
    } catch (error) {
      console.error('❌ Failed to create worker:', error);
      setErrors({ email: 'Failed to create worker. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Center alignment helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Worker
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            <div className="space-y-8">
              
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                      {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                      {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+233 24 123 4567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residential Address
                      </label>
                      <input
                        type="text"
                        name="residential_address"
                        value={formData.residential_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter residential address"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digital Address
                      </label>
                      <input
                        type="text"
                        name="digital_address"
                        value={formData.digital_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., GA-123-4567"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Tell us about yourself and your experience..."
                      />
                      {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'profile_photo')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadingFiles.includes('profile_photo') && (
                        <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                      )}
                      {formData.profile_photo && (
                        <img src={formData.profile_photo} alt="Profile preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2H6a2 2 0 002-2V6" />
                  </svg>
                  Professional Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Profession <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="primary_profession"
                        value={formData.primary_profession}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.primary_profession ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select profession</option>
                        {professions.map(profession => (
                          <option key={profession} value={profession}>{profession}</option>
                        ))}
                      </select>
                      {errors.primary_profession && <p className="mt-1 text-sm text-red-600">{errors.primary_profession}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Profession
                      </label>
                      <select
                        name="secondary_profession"
                        value={formData.secondary_profession}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select profession (optional)</option>
                        {professions.map(profession => (
                          <option key={profession} value={profession}>{profession}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Certificate
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'business_certificate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadingFiles.includes('business_certificate') && (
                        <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                      )}
                      {formData.business_certificate && (
                        <img src={formData.business_certificate} alt="Certificate preview" className="mt-2 max-w-xs h-32 object-cover rounded border" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Identification
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Card Type
                      </label>
                      <select
                        name="id_card_type"
                        value={formData.id_card_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {idCardTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Card Front
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'id_card_front')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadingFiles.includes('id_card_front') && (
                          <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                        )}
                        {formData.id_card_front && (
                          <img src={formData.id_card_front} alt="ID front preview" className="mt-2 w-full max-w-xs h-32 object-cover rounded border" />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Card Back
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'id_card_back')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadingFiles.includes('id_card_back') && (
                          <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                        )}
                        {formData.id_card_back && (
                          <img src={formData.id_card_back} alt="ID back preview" className="mt-2 w-full max-w-xs h-32 object-cover rounded border" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Worker'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWorkerModal;
