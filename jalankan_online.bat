@echo off
title ZaynZulfikarStore - Hosting Online Cloudflare
color 0A

echo ========================================================
echo    ZaynZulfikarStore - Hosting Online Publik Cloudflare
echo ========================================================
echo.

echo [1/2] Memastikan Server Backend Aktif (Port 5000)...
start "ZaynStore - Server" cmd /k "cd /d %~dp0 && node backend/src/server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Mengaktifkan Tunnel Publik Cloudflare (Langsung Masuk Tanpa Verifikasi)...
start "ZaynStore - Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo ========================================================
echo  🚀 SERVER & CLOUDFLARE TUNNEL TELAH AKTIF!
echo ========================================================
echo.
echo  Link Publik Online (Bisa dibuka di HP luar toko):
echo  👉 https://barriers-deliver-developed-selective.trycloudflare.com
echo  
echo  Akses Lokal (WiFi Toko):
echo  👉 http://192.168.100.73:5000
echo  👉 http://localhost:5000
echo.
echo  =======================================================
echo  🔑 Akun Login Kasir / Admin:
echo  Username : ZaynZulfi23
echo  Password : #Arafat23
echo  =======================================================
echo.
pause
