import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Worker {
  id: string;
  // Personal Info
  profile_photo: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  residential_address: string | null;
  digital_address: string | null;
  
  // Profession
  primary_profession: string;
  secondary_profession: string | null;
  business_certificate: string | null; // Image URL
  
  // Identification
  id_card_type: string;
  id_card_front: string | null; // Image URL
  id_card_back: string | null; // Image URL
  
  // Additional Info
  status: 'active' | 'inactive' | 'on-leave';
  rating: number;
  completed_jobs: number;
  is_online: boolean;
  is_available: boolean;
  verified_worker: boolean;
  premium_service: boolean;
  bio: string;
  join_date: string;
}

interface WorkerListProps {
  onLogout: () => void;
}

const WorkerList: React.FC<WorkerListProps> = ({ onLogout }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const mockWorkers: Worker[] = [
    {
      id: 'w1-2023-001',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      phone: '+233 24 123 4567',
      residential_address: '123 Main Street, Accra, Ghana',
      digital_address: 'GA-123-4567',
      
      // Profession
      primary_profession: 'Software Engineer',
      secondary_profession: 'Mobile App Developer',
      business_certificate: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
      
      // Identification
      id_card_type: 'Ghana Card',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      
      // Additional Info
      status: 'active',
      rating: 4.8,
      completed_jobs: 45,
      is_online: true,
      is_available: true,
      verified_worker: true,
      premium_service: true,
      bio: 'Experienced software engineer specializing in web and mobile development.',
      join_date: '2023-01-15'
    },
    {
      id: 'w1-2023-002',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b577?w=150&h=150&fit=crop&crop=face',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+233 20 234 5678',
      residential_address: '456 Oak Avenue, Kumasi, Ghana',
      digital_address: 'AK-456-7890',
      
      // Profession
      primary_profession: 'Graphic Designer',
      secondary_profession: 'UI/UX Designer',
      business_certificate: 'https://images.unsplash.com/photo-1554224154-26032fced4dd?w=400&h=300&fit=crop',
      
      // Identification
      id_card_type: 'Ghana Card',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      
      // Additional Info
      status: 'active',
      rating: 4.9,
      completed_jobs: 38,
      is_online: false,
      is_available: true,
      verified_worker: true,
      premium_service: false,
      bio: 'Creative graphic designer with expertise in branding and digital design.',
      join_date: '2022-08-20'
    },
    {
      id: 'w1-2023-003',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+233 26 345 6789',
      residential_address: '789 Palm Street, Tamale, Ghana',
      digital_address: 'NT-789-0123',
      
      // Profession
      primary_profession: 'Electrician',
      secondary_profession: null,
      business_certificate: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      
      // Identification
      id_card_type: 'Voter ID',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: null,
      
      // Additional Info
      status: 'on-leave',
      rating: 4.5,
      completed_jobs: 22,
      is_online: false,
      is_available: false,
      verified_worker: true,
      premium_service: false,
      bio: 'Licensed electrician with 10+ years of experience in residential and commercial work.',
      join_date: '2023-03-10'
    },
    {
      id: 'w1-2022-004',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+233 27 456 7890',
      residential_address: '321 Cedar Road, Cape Coast, Ghana',
      digital_address: 'CR-321-4567',
      
      // Profession
      primary_profession: 'Hair Stylist',
      secondary_profession: 'Makeup Artist',
      business_certificate: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=300&fit=crop',
      
      // Identification
      id_card_type: 'Ghana Card',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      
      // Additional Info
      status: 'active',
      rating: 4.7,
      completed_jobs: 67,
      is_online: true,
      is_available: true,
      verified_worker: true,
      premium_service: true,
      bio: 'Professional hair stylist and makeup artist specializing in bridal and event styling.',
      join_date: '2022-11-05'
    },
    {
      id: 'w1-2021-005',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.wilson@email.com',
      phone: '+233 23 567 8901',
      residential_address: null,
      digital_address: null,
      
      // Profession
      primary_profession: 'Plumber',
      secondary_profession: 'HVAC Technician',
      business_certificate: null,
      
      // Identification
      id_card_type: 'Driver\'s License',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      
      // Additional Info
      status: 'inactive',
      rating: 4.2,
      completed_jobs: 15,
      is_online: false,
      is_available: false,
      verified_worker: false,
      premium_service: false,
      bio: 'Skilled plumber with experience in residential and commercial plumbing systems.',
      join_date: '2021-12-01'
    },
    {
      id: 'w1-2022-006',
      // Personal Info
      profile_photo: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      first_name: 'Lisa',
      last_name: 'Anderson',
      email: 'lisa.anderson@email.com',
      phone: '+233 25 678 9012',
      residential_address: '654 Mango Lane, Ho, Ghana',
      digital_address: 'VR-654-9012',
      
      // Profession
      primary_profession: 'Event Planner',
      secondary_profession: 'Catering Service',
      business_certificate: 'https://images.unsplash.com/photo-1554224154-26032fced4dd?w=400&h=300&fit=crop',
      
      // Identification
      id_card_type: 'Ghana Card',
      id_card_front: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=250&fit=crop',
      
      // Additional Info
      status: 'active',
      rating: 4.9,
      completed_jobs: 89,
      is_online: true,
      is_available: true,
      verified_worker: true,
      premium_service: true,
      bio: 'Professional event planner with expertise in weddings, corporate events, and catering.',
      join_date: '2022-04-18'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadWorkers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkers(mockWorkers);
      setIsLoading(false);
    };

    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const fullName = `${worker.first_name} ${worker.last_name}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.primary_profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (worker.secondary_profession && worker.secondary_profession.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         worker.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || worker.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'on-leave':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const openWorkerModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const closeWorkerModal = () => {
    setSelectedWorker(null);
    setIsModalOpen(false);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeWorkerModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Worker Management</h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search workers by name, email, profession, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Worker Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      src={worker.profile_photo}
                      alt={`${worker.first_name} ${worker.last_name}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.first_name + ' ' + worker.last_name)}&size=48&background=4f46e5&color=ffffff`;
                      }}
                    />
                    {worker.is_online && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{worker.first_name} {worker.last_name}</h3>
                      {worker.verified_worker && (
                        <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={getStatusBadge(worker.status)}>
                        {worker.status.replace('-', ' ')}
                      </span>
                      {worker.premium_service && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800 bg-blue-100 px-2 py-1 rounded-full truncate">{worker.primary_profession}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{worker.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{worker.completed_jobs} jobs</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.4 11.392a11.097 11.097 0 006.208 6.208l2.005-3.824a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{worker.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openWorkerModal(worker)}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Profile
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workers.length}</div>
              <div className="text-sm text-gray-500">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {workers.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {workers.filter(w => w.status === 'on-leave').length}
              </div>
              <div className="text-sm text-gray-500">On Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {workers.filter(w => w.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {workers.filter(w => w.verified_worker).length}
              </div>
              <div className="text-sm text-gray-500">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {workers.filter(w => w.is_online).length}
              </div>
              <div className="text-sm text-gray-500">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Profile Modal */}
      {isModalOpen && selectedWorker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeWorkerModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                    src={selectedWorker.profile_photo}
                    alt={`${selectedWorker.first_name} ${selectedWorker.last_name}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWorker.first_name + ' ' + selectedWorker.last_name)}&size=64&background=4f46e5&color=ffffff`;
                    }}
                  />
                  {selectedWorker.is_online && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedWorker.first_name} {selectedWorker.last_name}</h2>
                    {selectedWorker.verified_worker && (
                      <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {selectedWorker.premium_service && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Premium Service
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={getStatusBadge(selectedWorker.status)}>
                      {selectedWorker.status.replace('-', ' ')}
                    </span>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{selectedWorker.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500 ml-1">({selectedWorker.completed_jobs} jobs completed)</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closeWorkerModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              <div className="space-y-6">
                {/* 1. Personal Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Profile Photo</label>
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-200"
                          src={selectedWorker.profile_photo}
                          alt={`${selectedWorker.first_name} ${selectedWorker.last_name}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWorker.first_name + ' ' + selectedWorker.last_name)}&size=64&background=4f46e5&color=ffffff`;
                          }}
                        />
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Full Size</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                      <p className="text-gray-700">{selectedWorker.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Phone Number</label>
                      <p className="text-gray-700">{selectedWorker.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Member Since</label>
                      <p className="text-gray-700">{new Date(selectedWorker.join_date).toLocaleDateString()}</p>
                    </div>
                    {selectedWorker.residential_address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-blue-800 mb-1">Residential Address</label>
                        <p className="text-gray-700">{selectedWorker.residential_address}</p>
                      </div>
                    )}
                    {selectedWorker.digital_address && (
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">Digital Address</label>
                        <p className="text-gray-700 font-mono">{selectedWorker.digital_address}</p>
                      </div>
                    )}
                    {selectedWorker.bio && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-blue-800 mb-1">Bio</label>
                        <p className="text-gray-700 leading-relaxed">{selectedWorker.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Professional Details */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-1">Primary Profession</label>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{selectedWorker.primary_profession}</span>
                    </div>
                    {selectedWorker.secondary_profession && (
                      <div>
                        <label className="block text-sm font-medium text-green-800 mb-1">Secondary Profession</label>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{selectedWorker.secondary_profession}</span>
                      </div>
                    )}
                    {selectedWorker.business_certificate && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-green-800 mb-1">Business Certificate/Proof of Work</label>
                        <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Business Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Identification */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0h6z" />
                    </svg>
                    Identification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-800 mb-1">ID Card Type</label>
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{selectedWorker.id_card_type}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-800 mb-1">ID Card Images</label>
                      <div className="flex space-x-4">
                        {selectedWorker.id_card_front && (
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Front
                          </button>
                        )}
                        {selectedWorker.id_card_back && (
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Back
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Worker
                </button>
                <button className="flex-1 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Assign Job
                </button>
                <button 
                  onClick={closeWorkerModal}
                  className="px-6 bg-gray-200 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList;
