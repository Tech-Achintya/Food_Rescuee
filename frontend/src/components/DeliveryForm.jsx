import { useEffect, useState } from 'react';
import { get, post } from '../api';

export default function DeliveryForm({ user }) {
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({}); // { category_id: [items] }
  const [rows, setRows] = useState([
    { type: 'VEG', category_id: '', item_id: '', quantity: 1 }
  ]);
  const [hostel, setHostel] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Load categories safely
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await get('/food/categories');
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Add a new row
  const addRow = () => {
    setRows((r) => [...r, { type: 'VEG', category_id: '', item_id: '', quantity: 1 }]);
  };

  // Remove a row
  const removeRow = (idx) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  // Update a row
  const onRowChange = (idx, key, val) => {
    const copy = [...rows];
    copy[idx][key] = val;
    setRows(copy);
  };

  // Handle category change per row and fetch items for that category
  const handleCategoryChange = async (idx, category_id, type) => {
    onRowChange(idx, 'category_id', category_id);
    onRowChange(idx, 'item_id', ''); // reset item selection

    if (!category_id) return;

    try {
      // Avoid fetching same category multiple times
      if (!itemsByCategory[category_id]) {
        const items = await get(`/food/items?category_id=${category_id}`);
        setItemsByCategory((prev) => ({ ...prev, [category_id]: items || [] }));
        if (items && items.length > 0) {
          onRowChange(idx, 'item_id', items[0].id);
        }
      } else {
        // Use cached items
        const items = itemsByCategory[category_id];
        if (items && items.length > 0) onRowChange(idx, 'item_id', items[0].id);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  // Submit the package
  const submit = async () => {
    try {
      const items = rows.map((r) => ({
        food_item_id: r.item_id,
        quantity: r.quantity
      }));

      const res = await post('/packages', {
        hostel_name: hostel,
        remarks,
        created_by: user.id,
        date,
        items
      });

      if (res.error) {
        alert('❌ Failed to create package: ' + res.error);
        return;
      }

      alert('Created package ' + res.package_code);
      // Optionally reset form
      setRows([{ type: 'VEG', category_id: '', item_id: '', quantity: 1 }]);
      setHostel('');
      setRemarks('');
    } catch (err) {
      console.error('Failed to create package:', err);
      alert('Failed to create package');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Create Food Package</h3>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        />
        <input
          type="text"
          placeholder="Hostel name"
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
          className="p-2 border rounded w-full md:flex-1"
        />
      </div>

      {rows.map((r, idx) => (
        <div className="flex flex-col md:flex-row gap-2 mb-2 items-center" key={idx}>
          {/* Type */}
          <select
            value={r.type}
            onChange={(e) => onRowChange(idx, 'type', e.target.value)}
            className="p-2 border rounded w-full md:w-auto"
          >
            <option value="VEG">Veg</option>
            <option value="NONVEG">Non-Veg</option>
          </select>

          {/* Category */}
          <select
            value={r.category_id}
            onChange={(e) => handleCategoryChange(idx, e.target.value, r.type)}
            className="p-2 border rounded w-full md:w-auto"
          >
            <option value="">Select Category</option>
            {categories
              .filter((c) => c.type === r.type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category}
                </option>
              ))}
          </select>

          {/* Item */}
          <select
            value={r.item_id}
            onChange={(e) => onRowChange(idx, 'item_id', e.target.value)}
            className="p-2 border rounded w-full md:w-auto"
          >
            <option value="">Select Item</option>
            {(itemsByCategory[r.category_id] || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            value={r.quantity}
            min={1}
            onChange={(e) => onRowChange(idx, 'quantity', +e.target.value)}
            className="w-full md:w-20 p-2 border rounded"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeRow(idx)}
            className="p-2 bg-red-500 text-white rounded"
          >
            -
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-3">
        <button type="button" onClick={addRow} className="p-2 bg-gray-300 rounded">
          + Add Row
        </button>
        <button type="button" onClick={submit} className="p-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
