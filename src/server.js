require('dotenv').config();
require('./cron/water.cron');
require(
  './modules/notification/notification.cron'
);

const express = require('express');

const { sequelize } = require('./database/models');

const routes = require('./routes');

const app = express();

app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
    });
});

const PORT = process.env.PORT || 5000;

async function connectWithRetry() {
    while (true) {
        try {
            await sequelize.authenticate();

            console.log('Database connected');

            app.listen(PORT, () => {
                console.log(
                    `Server started on port ${PORT}`
                );
            });

            break;
        } catch (error) {
            console.log(
                'Database not ready, retry in 5 seconds...'
            );

            await new Promise((resolve) =>
                setTimeout(resolve, 5000)
            );
        }
    }
}

connectWithRetry();