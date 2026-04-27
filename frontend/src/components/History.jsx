import { useEffect, useState } from 'react';
import { get } from '../api';

export default function History({ user }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // CSS for background gradient
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)',
    minHeight: '100vh',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    position: 'relative',
  };

  // Add overlay pattern
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(#8DBFC3 0.5px, transparent 0.5px), radial-gradient(#A8E0A3 0.5px, transparent 0.5px)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
    opacity: 0.1,
    pointerEvents: 'none',
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const allPackages = await get('/packages');
        if (allPackages.error) {
           console.error('Failed to fetch history:', allPackages.error);
           return;
        }
        // Filter packages created by this user (mess head)
        const userPackages = allPackages.filter(pkg => pkg.created_by === user.id);
        setPackages(userPackages);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '🔵';
      case 'ACCEPTED':
        return '✅';
      default:
        return '⏳';
    }
  };

  const filteredPackages = filter === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.status === filter.toUpperCase());

  if (loading) {
    return (
      <div style={backgroundStyle} className="p-4 md:p-6">
        <div style={overlayStyle}></div>
        <div className="flex items-center justify-center h-48 bg-white/50 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8DBFC3] mb-3"></div>
            <div className="text-[#5B7A83] font-medium">Loading your history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={backgroundStyle} className="p-4 md:p-6">
      <div style={overlayStyle}></div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 relative">
        <div>
          <h2 className="text-2xl font-bold text-[#2C4A4E] flex items-center gap-2">
            <span className="text-3xl">📋</span> Order History
          </h2>
          <p className="text-[#5B7A83] mt-1">View and track all your food rescue packages</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-[#8DBFC3] text-white shadow-md' 
                : 'bg-white/70 text-[#5B7A83] hover:bg-[#8DBFC3]/20'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('available')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'available' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-blue-100/70 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Available
          </button>
          <button 
            onClick={() => setFilter('accepted')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'accepted' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-green-100/70 text-green-800 hover:bg-green-100'
            }`}
          >
            Accepted
          </button>
        </div>
      </div>
      
      {filteredPackages.length === 0 ? (
        <div className="bg-white/80 rounded-xl shadow-md backdrop-blur-sm p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-[#2C4A4E] text-xl font-semibold mb-2">No packages found</div>
          <div className="text-[#5B7A83] max-w-md mx-auto">
            {filter === 'all' 
              ? "You haven't created any food rescue packages yet." 
              : `You don't have any ${filter.toLowerCase()} packages.`}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white/90 rounded-xl shadow-md backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#A8E0A3]/80 to-[#8DBFC3]/80 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2C4A4E] flex items-center gap-2">
                    <span className="inline-flex items-center justify-center bg-white/80 h-6 w-6 rounded-full text-xs">
                      📦
                    </span>
                    {pkg.package_code}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pkg.status)} flex items-center gap-1`}>
                    {getStatusIcon(pkg.status)} {pkg.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-[#5B7A83]">
                  <span className="text-sm">📍</span>
                  <span className="font-medium">{pkg.hostel_name}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-[#2C4A4E] mb-2 flex items-center gap-1">
                    <span className="text-sm">🍽️</span> Items:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.items && pkg.items.map((item, index) => (
                      <span key={index} className="bg-[#EEF2E0] px-2.5 py-1 rounded-lg text-sm text-[#5B7A83] border border-[#C9EAB0]/30">
                        {item.food_name} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>
                
                {pkg.remarks && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-[#2C4A4E] flex items-center gap-1 mb-1">
                      <span className="text-sm">📝</span> Remarks:
                    </h4>
                    <p className="text-[#5B7A83] text-sm">{pkg.remarks}</p>
                  </div>
                )}
                
                {/* Display Rating if available */}
                {pkg.rating > 0 && (
                  <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <h4 className="font-medium text-[#2C4A4E] flex items-center gap-1 mb-1">
                      <span className="text-sm">⭐</span> NGO Rating:
                    </h4>
                    <div className="flex items-center gap-1">
                      <div className="text-yellow-500 text-lg">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < pkg.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <span className="text-[#5B7A83] text-sm ml-2">({pkg.rating}/5)</span>
                    </div>
                    {pkg.feedback && (
                      <div className="mt-2">
                        <p className="text-[#5B7A83] text-sm italic">"{pkg.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-[#5B7A83] mt-3 pt-3 border-t border-gray-100 flex items-center gap-1">
                  <span className="text-xs">🕒</span>
                  Created: {new Date(pkg.created_at).toLocaleDateString()} at {new Date(pkg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}