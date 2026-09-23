import { app } from './server';
import { createServer } from 'vite';
import { initDatabaseDefaults } from './src/db/repository';

async function startDev() {
  const vite = await createServer({
    server: { 
      middlewareMode: true,
      hmr: false
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  
  const PORT = 3000;
  console.log(`Starting server on port ${PORT}. Environment PORT: ${process.env.PORT}`);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dev server running on port ${PORT}`);
    initDatabaseDefaults().catch((err) => {
      console.error('[Cloud SQL Initializer Warning]:', err);
    });
  });
}
startDev();
