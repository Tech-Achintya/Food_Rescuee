const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// ✅ DELETE package by ID
router.delete("/:packageId", async (req, res) => {
  const { packageId } = req.params; // this is like "PKG-1761908124772"

  try {
    // First, find the internal ID of the package
    const [packages] = await pool.query(
      "SELECT id FROM packages WHERE package_code = ?",
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    const internalId = packages[0].id;

    // Delete child records first
    await pool.query("DELETE FROM deliveries WHERE package_id = ?", [internalId]);
    await pool.query("DELETE FROM package_items WHERE package_id = ?", [internalId]);

    // Finally, delete the package itself
    const [result] = await pool.query(
      "DELETE FROM packages WHERE id = ?",
      [internalId]
    );

    if (result.affectedRows > 0) {
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
    const [r] = await pool.query('INSERT INTO packages (package_code,hostel_name,remarks,created_by,date) VALUES (?,?,?,?,?)', [package_code,hostel_name,remarks,created_by,date]);
    const packageId = r.insertId;
    for (const it of items) {
      await pool.query('INSERT INTO package_items (package_id,food_item_id,quantity) VALUES (?,?,?)', [packageId, it.food_item_id, it.quantity||1]);
    }
    const [p] = await pool.query('SELECT * FROM packages WHERE id=?',[packageId]);
    res.json(p[0]);
  } catch(err){console.error(err); res.status(500).json({error:'server error'});}
});

/** Get all packages (for status page) with items */
router.get('/', async (req,res) => {
  const [rows] = await pool.query(`SELECT p.*, u.name AS created_by_name FROM packages p LEFT JOIN users u ON p.created_by = u.id ORDER BY p.created_at DESC`);
  for (const r of rows) {
    const [items] = await pool.query(`SELECT pi.*, fi.name AS food_name FROM package_items pi JOIN food_items fi ON pi.food_item_id = fi.id WHERE pi.package_id = ?`, [r.id]);
    r.items = items;
  }
  res.json(rows);
});

/** NGO accepts a package and posts delivery details */
router.post('/:id/accept', async (req,res) => {
  try {
    const packageId = req.params.id;
    const { ngo_id, delivery_person_name, delivery_person_contact, arrival_time } = req.body;
    
    // Update package status to ACCEPTED and store the NGO ID
    await pool.query('UPDATE packages SET status = ?, accepted_by = ? WHERE id = ?', 
      ['ACCEPTED', ngo_id, packageId]);
    const [r] = await pool.query('INSERT INTO deliveries (package_id, ngo_id, delivery_person_name, delivery_person_contact, arrival_time) VALUES (?,?,?,?,?)', [packageId, ngo_id, delivery_person_name, delivery_person_contact, arrival_time]);
    const [d] = await pool.query('SELECT * FROM deliveries WHERE id=?',[r.insertId]);
    res.json(d[0]);
  } catch(err){console.error(err); res.status(500).json({error:'server error'});}
});

/** Get delivery details for a specific package */
router.get('/:id/delivery', async (req,res) => {
  try {
    const packageId = req.params.id;
    const [delivery] = await pool.query(`
      SELECT d.*, n.name AS ngo_name, n.contact AS ngo_contact 
      FROM deliveries d 
      LEFT JOIN users n ON d.ngo_id = n.id 
      WHERE d.package_id = ?
    `, [packageId]);
    
    if (delivery.length === 0) {
      return res.status(404).json({error: 'No delivery details found'});
    }
    
    res.json(delivery[0]);
  } catch(err){
    console.error(err); 
    res.status(500).json({error:'server error'});
  }
});

/** Additional endpoints you may need: update status, get deliveries, delete package, etc. */

/** NGO submits feedback and rating for a package */
router.post('/:id/feedback', async (req, res) => {
  try {
    const packageId = req.params.id;
    const { rating, comment, ngo_id } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Update package with rating and comment
    await pool.query(
      'UPDATE packages SET rating = ?, feedback = ?, feedback_by = ? WHERE id = ?', 
      [rating, comment || '', ngo_id, packageId]
    );
    
    // Get updated package
    const [updatedPackage] = await pool.query('SELECT * FROM packages WHERE id = ?', [packageId]);
    
    if (updatedPackage.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(updatedPackage[0]);
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
});

module.exports = router;
