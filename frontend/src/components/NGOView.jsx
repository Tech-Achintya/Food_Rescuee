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
  const myAcceptedPackages = packages.filter(p=>p.status==='ACCEPTED' && p.accepted_by == user.id);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-green-100 rounded-lg">🥗</span> Available for Rescue
          </h2>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-green-600 font-bold hover:underline"
          >
            Refresh List
          </button>
        </div>

        {availablePackages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No packages currently available</h3>
            <p className="text-sm text-gray-500">Check back later or try refreshing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePackages.map(p=>(
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider mb-2">
                        {p.package_code}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">📍 {p.hostel_name}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <span className="font-bold block mb-1 text-gray-700">📦 Items:</span>
                      {p.items?.map(i=>`${i.food_name} (${i.quantity})`).join(', ') || 'No items listed'}
                    </div>
                  </div>

                  {showAcceptFor && showAcceptFor.id === p.id ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-800 mb-3 text-sm">🚚 Enter Delivery Details</h4>
                        <div className="space-y-3">
                          <input 
                            placeholder="Delivery Person Name" 
                            value={deliveryInfo.name} 
                            onChange={e=>setDeliveryInfo({...deliveryInfo,name:e.target.value})} 
                            className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-hidden text-sm"
                          />
                          <input 
                            placeholder="Contact Number" 
                            value={deliveryInfo.contact} 
                            onChange={e=>setDeliveryInfo({...deliveryInfo,contact:e.target.value})} 
                            className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-hidden text-sm"
                          />
                          <input 
                            type="datetime-local" 
                            value={deliveryInfo.arrival_time} 
                            onChange={e=>setDeliveryInfo({...deliveryInfo,arrival_time:e.target.value})} 
                            className="w-full p-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-hidden text-sm"
                          />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={submitAccept} 
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm"
                          >
                            {loading ? 'Processing...' : 'Confirm Acceptance'}
                          </button>
                          <button 
                            onClick={closeAccept}
                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={()=>openAccept(p)} 
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      Accept Package
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {myAcceptedPackages.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="p-2 bg-blue-100 rounded-lg">🚚</span> Your Accepted Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAcceptedPackages.map(p => (
              <div key={p.id} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase">{p.package_code}</div>
                  <div className="font-bold text-gray-800">{p.hostel_name}</div>
                </div>
                <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  ACCEPTED
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
