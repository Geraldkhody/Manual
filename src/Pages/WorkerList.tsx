import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, endpoints } from '../utils/api';
import type { Worker } from '../types/worker';
import WorkerCard from '../components/WorkerCard';
import WorkerModal from '../components/WorkerModal';
import SimpleAddWorkerModal from '../components/SimpleAddWorkerModal';
import SearchFilter from '../components/SearchFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import APIStatusBanner from '../components/APIStatusBanner';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const navigate = useNavigate();

  // Fallback mock data - used when API fails
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
      bio: 'Experienced software engineer with 8+ years in full-stack development.',
      
      // Profession
      primary_profession: 'Software Engineer',
      secondary_profession: 'Mobile App Developer',
      business_certificate: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
      
      // Identification
      id_card_type: 'Ghana Card',
      id_card_front: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=300&h=200&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1554224154-26032fced4dd?w=300&h=200&fit=crop',
      
      // Additional Info
      status: 'active',
      rating: 4.8,
      completed_jobs: 127,
      is_online: true,
      is_available: true,
      verified_worker: true,
      premium_service: true,
      join_date: '2020-03-15'
    },
    {
      id: 'w2-2023-002',
      profile_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+233 24 234 5678',
      residential_address: '456 Oak Avenue, Kumasi, Ghana',
      digital_address: 'AK-456-7890',
      bio: 'Professional graphic designer specializing in brand identity and digital marketing.',
      
      primary_profession: 'Graphic Designer',
      secondary_profession: 'UI/UX Designer',
      business_certificate: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      
      id_card_type: 'Passport',
      id_card_front: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop',
      id_card_back: null,
      
      status: 'active',
      rating: 4.9,
      completed_jobs: 89,
      is_online: false,
      is_available: true,
      verified_worker: true,
      premium_service: false,
      join_date: '2021-07-22'
    },
    {
      id: 'w3-2023-003',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+233 24 345 6789',
      residential_address: '789 Pine Street, Takoradi, Ghana',
      digital_address: 'WR-789-0123',
      bio: 'Skilled electrician with expertise in residential and commercial electrical installations.',
      
      primary_profession: 'Electrician',
      secondary_profession: 'Solar Panel Installer',
      business_certificate: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop',
      
      id_card_type: 'Driver\'s License',
      id_card_front: 'https://images.unsplash.com/photo-1554224155-3d0f20ff0fb0?w=300&h=200&fit=crop',
      id_card_back: 'https://images.unsplash.com/photo-1554224155-0d20ff0fb50?w=300&h=200&fit=crop',
      
      status: 'on-leave',
      rating: 4.7,
      completed_jobs: 156,
      is_online: false,
      is_available: false,
      verified_worker: true,
      premium_service: true,
      join_date: '2019-11-08'
    }
  ];

  useEffect(() => {
    // Load workers from API
    const loadWorkers = async () => {
      setIsLoading(true);
      setApiError(null);
      setUsingFallback(false);
      
      try {
        console.log('Fetching workers from API:', `${apiClient.defaults.baseURL}${endpoints.workers}`);
        const response = await apiClient.get(endpoints.workers);
        console.log('Workers API response:', response.data);
        console.log('Workers data:', response.data.results);
        
        // Transform API data to match our interface if needed
        const workersData = response.data.results || response.data.data || response.data || [];
        
        if (Array.isArray(workersData)) {
          setWorkers(workersData);
          console.log(`✅ Loaded ${workersData.length} workers from API`);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('❌ Failed to load workers from API:', error);
        
        // Set error message for user feedback
        if (error instanceof Error) {
          setApiError(`API Error: ${error.message}`);
        } else {
          setApiError('Failed to connect to the server');
        }
        
        // Fallback to mock data
        console.log('🔄 Using fallback mock data...');
        setWorkers(mockWorkers);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkers();
  }, []);

  console.log('Workers data:', workers);

  const filteredWorkers = workers.filter(worker => {
    const fullName = `${worker.first_name} ${worker.last_name}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.primary_profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (worker.secondary_profession && worker.secondary_profession.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         worker.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         worker.status === filterStatus ||
                         (filterStatus === 'online' && worker.is_online) ||
                         (filterStatus === 'verified' && worker.verified_worker) ||
                         (filterStatus === 'premium' && worker.premium_service);
    
    return matchesSearch && matchesFilter;
  });

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

  const openAddWorkerModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddWorkerModal = () => {
    setIsAddModalOpen(false);
  };

  const handleWorkerAdded = (newWorker: Worker) => {
    setWorkers(prev => [newWorker, ...prev]);
    console.log('✅ New worker added:', newWorker);
  };

  const refreshWorkers = () => {
    // Trigger useEffect to reload workers
    setIsLoading(true);
    setApiError(null);
    setUsingFallback(false);
    
    const loadWorkers = async () => {
      try {
        console.log('Refreshing workers from API...');
        const response = await apiClient.get(endpoints.workers);
        console.log('Workers API response:', response.data);
        
        const workersData = response.data.results || response.data.data || response.data || [];
        
        if (Array.isArray(workersData)) {
          setWorkers(workersData);
          console.log(`✅ Refreshed ${workersData.length} workers from API`);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('❌ Failed to refresh workers from API:', error);
        
        if (error instanceof Error) {
          setApiError(`API Error: ${error.message}`);
        } else {
          setApiError('Failed to connect to the server');
        }
        
        setWorkers(mockWorkers);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkers();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading workers..." size="lg" />
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
            <div className="flex items-center space-x-3">
              <button
                onClick={openAddWorkerModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Worker
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Status Banner */}
        <APIStatusBanner 
          apiError={apiError}
          usingFallback={usingFallback}
          isLoading={isLoading}
          onRetry={refreshWorkers}
        />
        
        {/* Search and Filter */}
        <SearchFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          totalResults={filteredWorkers.length}
        />

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <WorkerCard 
              key={worker.id}
              worker={worker}
              onViewProfile={openWorkerModal}
            />
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
              <div className="text-sm text-gray-600">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{workers.filter(w => w.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{workers.filter(w => w.is_online).length}</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workers.filter(w => w.verified_worker).length}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{workers.filter(w => w.premium_service).length}</div>
              <div className="text-sm text-gray-600">Premium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{workers.filter(w => w.is_available).length}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Profile Modal */}
      <WorkerModal 
        worker={selectedWorker}
        isOpen={isModalOpen}
        onClose={closeWorkerModal}
      />

      {/* Add Worker Modal */}
      <SimpleAddWorkerModal 
        isOpen={isAddModalOpen}
        onClose={closeAddWorkerModal}
        onWorkerAdded={handleWorkerAdded}
      />
    </div>
  );
};

export default WorkerList;