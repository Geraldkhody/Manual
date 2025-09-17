import React, { useState, useEffect } from 'react';
import type { Worker } from '../types/worker';
import { apiClient, endpoints } from '../utils/api';
import { compressImage, validateBusinessCertificate, validateImageFile, formatFileSize } from '../utils/fileUtils';

interface SimpleAddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: (worker: Worker) => void;
}

const SimpleAddWorkerModal: React.FC<SimpleAddWorkerModalProps> = ({ isOpen, onClose, onWorkerAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    identification_card: '',
    primary_profession: '',
    digital_address: '',
    street_address: '',
    gender: '',
    professional_categories: [] as string[],
    photo: null as File | null,
    business_certificate: null as File | null,
    id_card_front: null as File | null,
    id_card_back: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [professions, setProfessions] = useState<Array<{id: string, name: string}>>([]);
  const [loadingProfessions, setLoadingProfessions] = useState(false);
  const [fileUploads, setFileUploads] = useState<Record<string, {file: File, compressed: boolean, size: number}>>({});

  // Gender options
  const genderOptions = ['Male', 'Female', 'Other'];

  // ID card types
  const idCardTypes = ['Ghana Card', 'Passport', 'Driver\'s License', 'Voter ID'];

  // Load professions from API
  useEffect(() => {
    const loadProfessions = async () => {
      setLoadingProfessions(true);
      try {
        const response = await apiClient.get(endpoints.professions);
        setProfessions(response.data.data || []);
      } catch (error) {
        console.error('Failed to load professions:', error);
        // Fallback to empty array if API fails
        setProfessions([]);
      } finally {
        setLoadingProfessions(false);
      }
    };

    if (isOpen) {
      loadProfessions();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        identification_card: '',
        primary_profession: '',
        digital_address: '',
        street_address: '',
        gender: '',
        professional_categories: [],
        photo: null,
        business_certificate: null,
        id_card_front: null,
        id_card_back: null,
      });
      setErrors({});
      setIsSubmitting(false);
      setFileUploads({});
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
    
    // Filter phone number to only allow digits
    if (name === 'phone_number') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    let isValid = false;
    if (fieldName === 'business_certificate') {
      isValid = validateBusinessCertificate(file);
    } else {
      isValid = validateImageFile(file);
    }

    if (!isValid) {
      setErrors(prev => ({ 
        ...prev, 
        [fieldName]: fieldName === 'business_certificate' 
          ? 'Please select a valid PDF, DOC, or image file'
          : 'Please select a valid image file'
      }));
      return;
    }

    // Clear previous error
    setErrors(prev => ({ ...prev, [fieldName]: '' }));

    try {
      let processedFile = file;
      let compressed = false;

      // Compress images (not business certificate if it's a document)
      if (fieldName !== 'business_certificate' || file.type.startsWith('image/')) {
        const compressedResult = await compressImage(file, 500);
        processedFile = compressedResult.compressedFile;
        compressed = true;
        
        console.log(`File compressed: ${compressedResult.originalSize.toFixed(1)}KB → ${compressedResult.compressedSize.toFixed(1)}KB (${compressedResult.compressionRatio.toFixed(1)}% reduction)`);
      }

      setFormData(prev => ({ ...prev, [fieldName]: processedFile }));
      setFileUploads(prev => ({
        ...prev,
        [fieldName]: {
          file: processedFile,
          compressed,
          size: processedFile.size / 1024
        }
      }));
    } catch (error) {
      console.error('File processing error:', error);
      setErrors(prev => ({ ...prev, [fieldName]: 'Failed to process file' }));
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, professional_categories: selectedOptions }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.identification_card.trim()) newErrors.identification_card = 'Identification card is required';
    if (!formData.primary_profession.trim()) newErrors.primary_profession = 'Primary profession is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    if (!formData.digital_address.trim()) newErrors.digital_address = 'Digital address is required';
    if (!formData.street_address.trim()) newErrors.street_address = 'Street address is required';
    if (formData.professional_categories.length === 0) newErrors.professional_categories = 'At least one professional category is required';
    if (!formData.photo) newErrors.photo = 'Photo is required';
    if (!formData.business_certificate) newErrors.business_certificate = 'Business certificate is required';

    // Phone validation - exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Phone number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare FormData for file uploads
      const formDataPayload = new FormData();
      
      // Add text fields
      formDataPayload.append('first_name', formData.first_name.trim());
      formDataPayload.append('last_name', formData.last_name.trim());
      formDataPayload.append('phone_number', formData.phone_number.trim());
      formDataPayload.append('identification_card', formData.identification_card.trim());
      formDataPayload.append('primary_profession', formData.primary_profession.trim());
      formDataPayload.append('gender', formData.gender.trim());
      
      // Add optional text fields
      if (formData.digital_address.trim()) {
        formDataPayload.append('digital_address', formData.digital_address.trim());
      }
      if (formData.street_address.trim()) {
        formDataPayload.append('street_address', formData.street_address.trim());
      }
      
      // Add professional categories as JSON string
      if (formData.professional_categories.length > 0) {
        formDataPayload.append('professional_categories', JSON.stringify(formData.professional_categories));
      }
      
      // Add files
      if (formData.photo) {
        formDataPayload.append('photo', formData.photo);
      }
      if (formData.business_certificate) {
        formDataPayload.append('business_certificate', formData.business_certificate);
      }
      if (formData.id_card_front) {
        formDataPayload.append('id_card_front', formData.id_card_front);
      }
      if (formData.id_card_back) {
        formDataPayload.append('id_card_back', formData.id_card_back);
      }

      try {
        // Submit to API with FormData
        const response = await apiClient.post(endpoints.createWorker, formDataPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Worker created successfully:', response.data);
        
        // Transform API response to Worker format for local state
        const newWorker: Worker = {
          id: response.data.id || response.data.user?.id,
          profile_photo: response.data.user?.profile_photo || `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=3B82F6&color=fff`,
          first_name: response.data.user?.first_name || formData.first_name.trim(),
          last_name: response.data.user?.last_name || formData.last_name.trim(),
          email: response.data.user?.email || '',
          phone: response.data.user?.phone || formData.phone_number.trim(),
          residential_address: response.data.user?.residential_address || formData.street_address.trim(),
          digital_address: response.data.user?.digital_address || formData.digital_address.trim(),
          bio: response.data.user?.bio || '',
          primary_profession: response.data.primary_profession?.name || formData.primary_profession.trim(),
          secondary_profession: response.data.secondary_profession?.name || null,
          business_certificate: response.data.business_certificate || formData.business_certificate.trim(),
          id_card_type: response.data.user?.id_card_type || formData.identification_card.trim(),
          id_card_front: response.data.id_card_front || formData.id_card_front.trim(),
          id_card_back: response.data.id_card_back || formData.id_card_back.trim(),
          status: response.data.user?.status || 'active',
          rating: response.data.user?.rating || 0,
          completed_jobs: response.data.user?.completed_jobs || 0,
          is_online: response.data.user?.is_online || false,
          is_available: response.data.user?.is_available || true,
          verified_worker: response.data.user?.verified_worker || false,
          premium_service: response.data.user?.premium_service || false,
          join_date: response.data.user?.join_date || new Date().toISOString().split('T')[0]
        };
        
        onWorkerAdded(newWorker);
      } catch (apiError) {
        console.error('❌ API submission failed:', apiError);
        setErrors({ phone_number: 'Failed to create worker. Please try again.' });
        return;
      }

      onClose();
    } catch (error) {
      console.error('❌ Failed to create worker:', error);
      setErrors({ phone_number: 'Failed to create worker. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Worker</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0241234567"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter exactly 10 digits (e.g., 0241234567)</p>
                  {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identification Card <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="identification_card"
                    value={formData.identification_card}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.identification_card ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select ID type</option>
                    {idCardTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.identification_card && <p className="mt-1 text-sm text-red-600">{errors.identification_card}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Categories <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="professional_categories"
                    multiple
                    value={formData.professional_categories}
                    onChange={handleMultiSelectChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.professional_categories ? 'border-red-500' : 'border-gray-300'
                    }`}
                    size={3}
                  >
                    {professions.map(profession => (
                      <option key={profession.id} value={profession.name}>
                        {profession.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
                  {errors.professional_categories && <p className="mt-1 text-sm text-red-600">{errors.professional_categories}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Digital Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="digital_address"
                    value={formData.digital_address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.digital_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., GA-123-4567"
                  />
                  {errors.digital_address && <p className="mt-1 text-sm text-red-600">{errors.digital_address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.street_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 123 Main Street, Accra"
                  />
                  {errors.street_address && <p className="mt-1 text-sm text-red-600">{errors.street_address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Profession <span className="text-red-500">*</span>
                </label>
                <select
                  name="primary_profession"
                  value={formData.primary_profession}
                  onChange={handleInputChange}
                  disabled={loadingProfessions}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.primary_profession ? 'border-red-500' : 'border-gray-300'
                  } ${loadingProfessions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingProfessions ? 'Loading professions...' : 'Select profession'}
                  </option>
                  {professions.map(profession => (
                    <option key={profession.id} value={profession.id}>
                      {profession.name}
                    </option>
                  ))}
                </select>
                {errors.primary_profession && <p className="mt-1 text-sm text-red-600">{errors.primary_profession}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Image, max 500KB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.photo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fileUploads.photo && (
                    <div className="mt-1 text-xs text-gray-600">
                      {fileUploads.photo.file.name} ({formatFileSize(fileUploads.photo.size)})
                      {fileUploads.photo.compressed && <span className="text-green-600 ml-1">✓ Compressed</span>}
                    </div>
                  )}
                  {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Certificate <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(PDF, DOC, or Image, max 500KB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => handleFileChange(e, 'business_certificate')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.business_certificate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fileUploads.business_certificate && (
                    <div className="mt-1 text-xs text-gray-600">
                      {fileUploads.business_certificate.file.name} ({formatFileSize(fileUploads.business_certificate.size)})
                      {fileUploads.business_certificate.compressed && <span className="text-green-600 ml-1">✓ Compressed</span>}
                    </div>
                  )}
                  {errors.business_certificate && <p className="mt-1 text-sm text-red-600">{errors.business_certificate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Card Front <span className="text-xs text-gray-500">(Image, max 500KB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'id_card_front')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.id_card_front ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fileUploads.id_card_front && (
                    <div className="mt-1 text-xs text-gray-600">
                      {fileUploads.id_card_front.file.name} ({formatFileSize(fileUploads.id_card_front.size)})
                      {fileUploads.id_card_front.compressed && <span className="text-green-600 ml-1">✓ Compressed</span>}
                    </div>
                  )}
                  {errors.id_card_front && <p className="mt-1 text-sm text-red-600">{errors.id_card_front}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Card Back <span className="text-xs text-gray-500">(Image, max 500KB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'id_card_back')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.id_card_back ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fileUploads.id_card_back && (
                    <div className="mt-1 text-xs text-gray-600">
                      {fileUploads.id_card_back.file.name} ({formatFileSize(fileUploads.id_card_back.size)})
                      {fileUploads.id_card_back.compressed && <span className="text-green-600 ml-1">✓ Compressed</span>}
                    </div>
                  )}
                  {errors.id_card_back && <p className="mt-1 text-sm text-red-600">{errors.id_card_back}</p>}
                </div>
              </div>

            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
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
  );
};

export default SimpleAddWorkerModal;
