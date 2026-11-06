import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vip-verify-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/vip/verify' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const code = (data.code || '').trim().toUpperCase();
                  res.setHeader('Content-Type', 'application/json');
                  if (code === 'LOP') {
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      trialDays: 3,
                      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                      message: 'تم تفعيل تجربة VIP لمدة 3 أيام بنجاح!'
                    }));
                  } else {
                    res.statusCode = 400;
                    res.end(JSON.stringify({
                      success: false,
                      message: 'رمز التفعيل غير صحيح، يرجى إدخال الرمز LOP للتفعيل.'
                    }));
                  }
                } catch {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'طلب غير صالح' }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
