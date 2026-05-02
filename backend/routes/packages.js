const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { v4: uuidv4 } = require('uuid');

// ✅ DELETE package by ID
router.delete("/:packageId", async (req, res) => {
  const { packageId } = req.params; // this is like "PKG-1761908124772"

  try {
    // First, find the internal ID of the package
    const { data: packages, error: findError } = await supabase
      .from('packages')
      .select('id')
      .eq('package_code', packageId);

    if (findError) throw findError;

    if (!packages || packages.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    const internalId = packages[0].id;

    // Delete child records first (Supabase handles this if ON DELETE CASCADE is set, 
    // but for consistency with existing logic we do it manually or assume it's needed)
    const { error: delDevError } = await supabase.from('deliveries').delete().eq('package_id', internalId);
    if (delDevError) throw delDevError;

    const { error: delItemsError } = await supabase.from('package_items').delete().eq('package_id', internalId);
    if (delItemsError) throw delItemsError;

    // Finally, delete the package itself
    const { data: result, error: delPkgError } = await supabase.from('packages').delete().eq('id', internalId).select();
    if (delPkgError) throw delPkgError;

    if (result && result.length > 0) {
      res.status(200).json({ message: "Package deleted successfully." });
    } else {
      res.status(404).json({ message: "Package not found." });
    }
  } catch (err) {
    console.error("Error deleting package:", err);
    res.status(500).json({ message: "Server error deleting package: " + err.message });
  }
});

/** Create a package (mess head creates) with items array: [{food_item_id,quantity}] */
router.post('/', async (req,res) => {
  try {
    const { hostel_name, remarks, created_by, date, items } = req.body;
    const package_code = 'PKG-' + Date.now(); // simple unique code
    
    const { data: pkgData, error: pkgError } = await supabase
      .from('packages')
      .insert([{
        package_code,
        hostel_name,
        remarks,
        created_by,
        date,
        status: 'AVAILABLE'
      }])
      .select();

    if (pkgError) throw pkgError;
    const packageId = pkgData[0].id;

    const itemsToInsert = items.map(it => ({
      package_id: packageId,
      food_item_id: it.food_item_id,
      quantity: it.quantity || 1
    }));

    const { error: itemsError } = await supabase.from('package_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    res.json(pkgData[0]);
  } catch(err){
    console.error(err); 
    res.status(500).json({error: err.message || 'server error'});
  }
});

/** Get all packages (for status page) with items */
router.get('/', async (req,res) => {
  try {
    const { data: rows, error } = await supabase
      .from('packages')
      .select(`
        *,
        created_by_user:users!packages_created_by_fkey (name),
        package_items (
          *,
          food_items (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format data to match previous structure
    const formattedRows = rows.map(r => ({
      ...r,
      created_by_name: r.created_by_user?.name,
      items: r.package_items.map(pi => ({
        ...pi,
        food_name: pi.food_items?.name
      }))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** NGO accepts a package and posts delivery details */
router.post('/:id/accept', async (req,res) => {
  try {
    const packageId = req.params.id;
    const { ngo_id, delivery_person_name, delivery_person_contact, arrival_time } = req.body;
    
    // Update package status to ACCEPTED and store the NGO ID
    const { error: updateError } = await supabase
      .from('packages')
      .update({ status: 'ACCEPTED', accepted_by: ngo_id })
      .eq('id', packageId);

    if (updateError) throw updateError;

    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert([{
        package_id: packageId,
        ngo_id,
        delivery_person_name,
        delivery_person_contact,
        arrival_time
      }])
      .select();

    if (deliveryError) throw deliveryError;

    res.json(delivery[0]);
  } catch(err){
    console.error(err); 
    res.status(500).json({error: err.message || 'server error'});
  }
});

/** Get delivery details for a specific package */
router.get('/:id/delivery', async (req,res) => {
  try {
    const packageId = req.params.id;
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        ngo:users!deliveries_ngo_id_fkey (name, contact)
      `)
      .eq('package_id', packageId);
    
    if (error) throw error;

    if (!delivery || delivery.length === 0) {
      return res.status(404).json({error: 'No delivery details found'});
    }
    
    const result = {
      ...delivery[0],
      ngo_name: delivery[0].ngo?.name,
      ngo_contact: delivery[0].ngo?.contact
    };

    res.json(result);
  } catch(err){
    console.error(err); 
    res.status(500).json({error: err.message || 'server error'});
  }
});

/** NGO submits feedback and rating for a package */
router.post('/:id/feedback', async (req, res) => {
  try {
    const packageId = req.params.id;
    const { rating, comment, ngo_id } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Update package with rating and comment
    const { data: updatedPackage, error } = await supabase
      .from('packages')
      .update({
        rating: rating,
        feedback: comment || '',
        feedback_by: ngo_id
      })
      .eq('id', packageId)
      .select();
    
    if (error) throw error;
    
    if (!updatedPackage || updatedPackage.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(updatedPackage[0]);
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: err.message || 'Server error submitting feedback' });
  }
});

module.exports = router;

