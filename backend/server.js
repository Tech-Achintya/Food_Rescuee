const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const packageRoutes = require('./routes/packages');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/packages', packageRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>console.log(`Server listening on ${PORT}`));
