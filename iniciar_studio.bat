@echo off
title Daiane Stefani - Studio & Beauty
cd /d "%~dp0"
echo ================================================================
echo   DAIANE STEFANI - STUDIO & BEAUTY
echo   Iniciando servidor local...
echo.
echo   No seu computador: http://localhost:8000
echo   No seu celular:    http://192.168.0.18:8000
echo   Painel Admin:      http://192.168.0.18:8000#admin
echo ================================================================
python server.py --open
pause
