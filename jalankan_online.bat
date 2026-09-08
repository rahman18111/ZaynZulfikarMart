@echo off
title ZaynZulfikarStore - Hosting Online
color 0A

echo ========================================================
echo    ZaynZulfikarStore - Hosting Online Kasir Toko
echo ========================================================
echo.

echo [1/3] Memastikan Server Aktif (Port 5000)...
start "ZaynStore - Server" cmd /k "cd /d %~dp0 && node backend/src/server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Mengaktifkan Tunnel Link Cantik (loca.lt)...
start "ZaynStore - Link Cantik" cmd /k "npx --yes localtunnel --port 5000 --subdomain zaynzulfikar-mart"

timeout /t 2 /nobreak >nul

echo [3/3] Mengaktifkan Cloudflare Tunnel Backup...
start "ZaynStore - Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo ========================================================
echo  Server Sedang Berjalan!
echo  
echo  LINK UTAMA (Nama Cantik Sesuai Toko):
echo  👉 https://zaynzulfikar-mart.loca.lt
echo  
echo  Link Cadangan (Cloudflare):
echo  👉 https://barriers-deliver-developed-selective.trycloudflare.com
echo  
echo  Akses Lokal (WiFi Toko):
echo  👉 http://192.168.100.73:5000
echo.
echo  Akun Login Admin:
echo  Username: ZaynZulfi23
echo  Password: #Arafat23
echo ========================================================
echo.
pause
