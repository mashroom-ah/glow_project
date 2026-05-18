require('dotenv').config();

const express = require('express');
const sequelize = require('./database/sequelize');

const app = express();

const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Database connaction error:', error);
    }
}


startServer();