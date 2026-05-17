require('dotenv').config();

const express = require('express');
const sequelize = require('./database/sequelize');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Server started on poost ${PORT}`);
        });
    }
    catch (error) {
        console.error('Database connaction error:', error);
    }
}

startServer();