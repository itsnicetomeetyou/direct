const localtunnel = require('localtunnel');

const SUBDOMAIN = 'direct-api-tunnel';
const PORT = 3001;

async function startTunnel() {
  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: SUBDOMAIN,
    });

    console.log(`\n  Tunnel URL: ${tunnel.url}\n`);
    console.log(`  Forwarding ${tunnel.url} => http://localhost:${PORT}\n`);

    tunnel.on('close', () => {
      console.log('  Tunnel closed. Restarting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.log(`  Tunnel error: ${err.message}. Restarting in 3 seconds...`);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.log(`  Failed to start tunnel: ${err.message}. Retrying in 5 seconds...`);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
