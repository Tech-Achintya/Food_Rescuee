const express = require('express');
const router = express.Router();
const supabase = require('../db');

/** Get all categories (veg/nonveg + category) */
router.get('/categories', async (req,res) => {
  try {
    const { data: rows, error } = await supabase.from('food_categories').select('*');
    if (error) throw error;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** Add a category */
router.post('/categories', async (req,res) => {
  try {
    const { type, category } = req.body;
    const { data: row, error } = await supabase
      .from('food_categories')
      .insert([{ type, category }])
      .select();
    if (error) throw error;
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** Get items by category id or all */
router.get('/items', async (req,res) => {
  try {
    const { category_id } = req.query;
    let query = supabase.from('food_items').select(`
      *,
      food_categories (
        type,
        category
      )
    `);
    
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    
    const { data: rows, error } = await query;
    if (error) throw error;
    
    // Map data to match previous format if needed
    const formattedRows = rows.map(item => ({
      ...item,
      type: item.food_categories?.type,
      category_name: item.food_categories?.category
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** Add food item */
router.post('/items', async (req,res) => {
  try {
    const { category_id, name } = req.body;
    const { data: row, error } = await supabase
      .from('food_items')
      .insert([{ category_id, name }])
      .select();
    if (error) throw error;
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

