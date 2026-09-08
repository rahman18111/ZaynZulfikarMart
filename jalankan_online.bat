@echo off
title ZaynZulfikarStore - Hosting Online Kasir
color 0A

echo ========================================================
echo    ZaynZulfikarStore - Hosting Online Kasir Toko
echo ========================================================
echo.

echo [1/3] Menjalankan Server Backend Toko (Port 5000)...
start "ZaynStore - Server" cmd /k "cd /d %~dp0 && node backend/src/server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Mengaktifkan Tunnel Link Nama Toko (loca.lt)...
start "ZaynStore - Link Nama Toko" cmd /k "npx --yes localtunnel --port 5000 --subdomain zaynzulfikar-mart"

timeout /t 2 /nobreak >nul

echo [3/3] Mengaktifkan Tunnel Ngrok Resmi Akun Rahman Abdur...
start "ZaynStore - Ngrok Akun" cmd /k "cd /d %~dp0 && node ngrok_tunnel.js"

echo.
echo ========================================================
echo  🚀 SERVER & SEMUA LINK ONLINE TELAH AKTIF!
echo ========================================================
echo.
echo  PILIHAN 1 (Nama Toko Sesuai Request Anda):
echo  👉 https://zaynzulfikar-mart.loca.lt
echo.
echo  PILIHAN 2 (Link Akun Resmi Ngrok Anda):
echo  👉 https://gullible-pecan-moneyless.ngrok-free.dev
echo.
echo  PILIHAN 3 (Akses WiFi Lokal Toko):
echo  👉 http://192.168.100.73:5000
echo.
echo  =======================================================
echo  🔑 Akun Login Kasir / Admin:
echo  Username : ZaynZulfi23
echo  Password : #Arafat23
echo  =======================================================
echo.
pause
