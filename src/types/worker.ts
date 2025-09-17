export interface Worker {
  id: string;
  // Personal Info
  profile_photo: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  residential_address: string | null;
  digital_address: string | null;
  bio: string;
  
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
  join_date: string;
}
