import ngrok from '@ngrok/ngrok';

const AUTHTOKEN = process.env.NGROK_AUTHTOKEN || '3J2DwP0lnKDFayroIAnkGrEfrie_VqW2wmxkRxDp2jp2AddN';
const PORT = parseInt(process.env.PORT || '5000', 10);

async function startTunnel() {
  try {
    console.log('====================================================');
    console.log('🚀 Menghubungkan Ngrok Tunnel dengan Akun Resmi...');
    console.log(`📍 Target: http://localhost:${PORT}`);
    console.log('====================================================');

    const listener = await ngrok.forward({
      addr: PORT,
      authtoken: AUTHTOKEN
    });

    console.log(`\n🎉 Ngrok Tunnel Berhasil Aktif!`);
    console.log(`👉 Link Website Toko Anda:`);
    console.log(`   ${listener.url()}\n`);
    console.log(`Akses ini permanen di akun Ngrok Anda.`);
    console.log(`Tekan CTRL + C untuk menghentikan tunnel.`);

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error('❌ Gagal menjalankan ngrok tunnel:', error.message);
  }
}

startTunnel();
