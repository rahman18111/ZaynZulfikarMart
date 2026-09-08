@echo off
title ZaynZulfikarStore - Sistem Kasir & Stok
color 0E

echo ========================================================
echo    ZaynZulfikarStore - Memulai Sistem Kasir & Stok
echo ========================================================
echo.

echo [1/3] Menjalankan Backend API (Port 5000)...
start "ZaynStore - Backend API" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 2 /nobreak >nul

echo [2/3] Menjalankan Frontend React + Vite (Port 5173)...
start "ZaynStore - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Membuka Website di Browser...
start http://localhost:5173

echo.
echo ========================================================
echo  Sistem Berhasil Dijalankan!
echo  Akses Laptop: http://localhost:5173
echo  Username:     ZaynZulfi23
echo  Password:     #Arafat23
echo ========================================================
echo.
pause
