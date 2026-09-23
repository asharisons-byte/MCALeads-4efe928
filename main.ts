import { app } from './server';
import { initDatabaseDefaults } from './src/db/repository';

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    initDatabaseDefaults().catch((err) => {
        console.error('[Cloud SQL Initializer Warning]:', err);
    });
});
