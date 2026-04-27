import { useEffect, useState } from 'react';
import { get, post } from '../api';

export default function NGOView({user}) {
  const [packages, setPackages] = useState([]);
  const [showAcceptFor, setShowAcceptFor] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({name:'', contact:'', arrival_time:''});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await get('/packages');
        if (data.error) {
          console.error('Failed to fetch packages:', data.error);
        } else {
          setPackages(data || []);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const openAccept = (pkg) => { 
    setShowAcceptFor(pkg);
    setDeliveryInfo({name:'', contact:'', arrival_time:''});
  }

  const closeAccept = () => {
    setShowAcceptFor(null);
    setDeliveryInfo({name:'', contact:'', arrival_time:''});
  }

  const submitAccept = async () => {
    if (!deliveryInfo.name || !deliveryInfo.contact || !deliveryInfo.arrival_time) {
      alert('Please fill in all delivery information');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ngo_id: user.id,
        delivery_person_name: deliveryInfo.name,
        delivery_person_contact: deliveryInfo.contact,
        arrival_time: deliveryInfo.arrival_time
      };
      const res = await post(`/packages/${showAcceptFor.id}/accept`, payload);
      
      if (res.error) {
        alert('❌ Failed to accept package: ' + res.error);
        return;
      }

      alert('✅ Package accepted successfully!');
      setShowAcceptFor(null);
      setDeliveryInfo({name:'', contact:'', arrival_time:''});
      // Refresh packages
      get('/packages').then(data => {
        if (!data.error) setPackages(data);
      });
    } catch (error) {
      console.error('Acceptance error:', error);
      alert('❌ Failed to accept package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availablePackages = packages.filter(p=>p.status==='AVAILABLE');

  return (
    <div className="p-4 md:p-6">
      {availablePackages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No packages available</h3>
          <p className="text-sm text-gray-500">Check back later for new food rescue opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availablePackages.map(p=>(
            <div key={p.id} className="bg-linear-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {p.package_code}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        📍 {p.hostel_name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Items: </span>
                      {p.items.map(i=>`${i.food_name} (${i.quantity})`).join(', ')}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        🕒 Available for pickup
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    {showAcceptFor && showAcceptFor.id === p.id ? (
                      <button 
                        onClick={closeAccept}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button 
                        onClick={()=>openAccept(p)} 
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                      >
                        <span>✓</span>
                        Accept Package
                      </button>
                    )}
                  </div>
                </div>
                
                {showAcceptFor && showAcceptFor.id === p.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      🚚 Delivery Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Person Name</label>
                        <input 
                          placeholder="Enter full name" 
                          value={deliveryInfo.name} 
                          onChange={e=>setDeliveryInfo({...deliveryInfo,name:e.target.value})} 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
                        <input 
                          placeholder="Phone number" 
                          value={deliveryInfo.contact} 
                          onChange={e=>setDeliveryInfo({...deliveryInfo,contact:e.target.value})} 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Time</label>
                        <input 
                          type="datetime-local" 
                          value={deliveryInfo.arrival_time} 
                          onChange={e=>setDeliveryInfo({...deliveryInfo,arrival_time:e.target.value})} 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button 
                        onClick={submitAccept} 
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            Confirm Acceptance
                          </>
                        )}
                      </button>
                      <button 
                        onClick={closeAccept}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
