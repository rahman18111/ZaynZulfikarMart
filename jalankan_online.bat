@echo off
title ZaynZulfikarStore - Hosting Online Cloudflare
color 0A

echo ========================================================
echo    ZaynZulfikarStore - Hosting Online Publik Cloudflare
echo ========================================================
echo.

echo [1/2] Memastikan Server Aktif (Port 5000)...
start "ZaynStore - Server" cmd /k "cd /d %~dp0backend && node src/server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Mengaktifkan Tunnel Publik Cloudflare (Bebas Bad Gateway)...
start "ZaynStore - Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://localhost:5000"

echo.
echo ========================================================
echo  Server & Cloudflare Tunnel Sedang Berjalan!
echo  
echo  Link Aktif Saat Ini:
echo  https://brooks-comply-experiments-cuisine.trycloudflare.com
echo  
echo  Akses Lokal (WiFi Toko / HP):
echo  http://192.168.1.15:5000
echo.
echo  Akun Login:
echo  Username: ZaynZulfi23
echo  Password: #Arafat23
echo ========================================================
echo.
pause
