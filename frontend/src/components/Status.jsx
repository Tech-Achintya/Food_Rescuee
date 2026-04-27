import { useEffect, useState } from 'react';
import { get } from '../api';

export default function Status() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await get('/packages');
        if (data.error) {
          console.error('Failed to fetch packages:', data.error);
        } else {
          setPackages(data || []);
        }
      } catch (err) {
        console.error('Error in Status fetch:', err);
      }
    };
    fetchPackages();
  }, []);

  const handlePackageClick = async (pkg) => {
    if (pkg.status === 'ACCEPTED') {
      setLoading(true);
      try {
        const delivery = await get(`/packages/${pkg.id}/delivery`);
        setDeliveryDetails(delivery);
        setSelectedPackage(pkg);
      } catch (error) {
        console.error('Failed to fetch delivery details:', error);
        alert('Failed to fetch delivery details');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedPackage(null);
    setDeliveryDetails(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="h-full">
      <div className="bg-linear-to-r from-[#a7c3ff] to-[#6d9bff] text-[#2C4A4E] p-4 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-2">Order status</h2>
        <p className="text-blue-100">Track your food rescue orders</p>
      </div>
      
      <div className="p-6 bg-white rounded-b-lg shadow-lg max-h-175 overflow-y-auto">
        {packages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No orders yet</div>
            <div className="text-gray-400 text-sm mt-2">Your orders will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  pkg.status === 'ACCEPTED' 
                    ? 'cursor-pointer hover:shadow-md hover:border-green-300' 
                    : ''
                }`}
                onClick={() => handlePackageClick(pkg)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{pkg.package_code}</h3>
                    <p className="text-gray-600">{pkg.hostel_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pkg.status)}`}>
                    {pkg.status}
                    {pkg.status === 'ACCEPTED' && (
                      <span className="ml-1 text-xs">👆 Click for details</span>
                    )}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm text-gray-500 mb-1">Items:</div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.items && pkg.items.map((item, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {item.food_name} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>
                
                {pkg.remarks && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Remarks:</span> {pkg.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      {selectedPackage && deliveryDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Delivery Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700">Package: {selectedPackage.package_code}</h4>
                <p className="text-gray-600">{selectedPackage.hostel_name}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Delivery Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">👤</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Delivery Person</div>
                      <div className="font-medium">{deliveryDetails.delivery_person_name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📞</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Contact</div>
                      <div className="font-medium">{deliveryDetails.delivery_person_contact}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm">🕒</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Arrival Time</div>
                      <div className="font-medium">
                        {new Date(deliveryDetails.arrival_time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {deliveryDetails.ngo_name && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 text-sm">🏢</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">NGO</div>
                        <div className="font-medium">{deliveryDetails.ngo_name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4">
            <div className="text-gray-600">Loading delivery details...</div>
          </div>
        </div>
      )}
    </div>
  );
}
