import React from 'react';
import type { Worker } from '../types/worker';

interface WorkerCardProps {
  worker: Worker;
  onViewProfile: (worker: Worker) => void;
}
const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onViewProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          <img
            src={worker.profile_photo}
            alt={`${worker.first_name} ${worker.last_name}`}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${worker.first_name}+${worker.last_name}&background=3B82F6&color=fff`;
            }}
          />
        </div>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {worker.first_name || ''} {worker.last_name || ''}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{worker.primary_profession || 'Worker'}</p>
            </div>
            
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              worker.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : worker.status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : worker.status === 'on-leave'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {worker.status || 'Unknown'}
            </span>
          </div>

          {/* Rating and Jobs */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm text-gray-700">{worker.rating || 0}</span>
            </div>
            <div className="text-sm text-gray-600">
              {worker.completed_jobs || 0} jobs completed
            </div>
          </div>

          {/* Contact and Availability */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              📞 {worker.phone || 'No phone'}
            </div>
            <div className="flex items-center space-x-2">
              {worker.is_online && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  🟢 Online
                </span>
              )}
              {worker.verified_worker && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  ✓ Verified
                </span>
              )}
              {worker.premium_service && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  ⭐ Premium
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={() => onViewProfile(worker)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
