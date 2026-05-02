const express = require('express');
const router = express.Router();
const supabase = require('../db');

// ✅ Fetch all NGO users
// Get all users (optionally filtered by role)
router.get("/users", async (req, res) => {
  try {
    const { role } = req.query;
    console.log("🔍 Received role query:", role);

    let query = supabase.from('users').select('id, name, contact, role, created_at');

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    console.log("✅ Fetched users:", users);
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});


// Simple login/create by name+contact+role
router.post('/register', async (req, res) => {
  try {
    const { name, contact, role } = req.body;

    if (!name || !contact || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existing, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('contact', contact.trim())
      .eq('role', role);

    if (findError) throw findError;

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'User already registered. Please login.' });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { 
          name: name.trim(), 
          contact: contact.trim(), 
          role: role
        }
      ])
      .select();

    if (insertError) throw insertError;

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0],
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { name, contact, role } = req.body;

    // Check all fields
    if (!name || !contact || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Check if user exists
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('contact', contact.trim())
      .eq('role', role);

    if (error) throw error;

    // ❌ If no user found → return error
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not registered. Please register first.' });
    }

    // ✅ If found → send user data
    res.json(users[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});


module.exports = router;

