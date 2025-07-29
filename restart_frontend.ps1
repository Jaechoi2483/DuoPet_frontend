# Frontend Restart Script for Port Fix

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Restarting Frontend with Fixed Port" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`nFixed Issues:" -ForegroundColor Yellow
Write-Host "- Changed Python AI server port from 8000 to 13592" -ForegroundColor Green
Write-Host "- Updated all AI diagnosis endpoints in healthApi.js" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Stop the current frontend server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Restart frontend with: npm start" -ForegroundColor White

Write-Host "`nImportant:" -ForegroundColor Red
Write-Host "- Make sure Python AI server is running on port 13592" -ForegroundColor Yellow
Write-Host "- Check console for any CORS errors" -ForegroundColor Yellow

Write-Host "`nPress Enter to continue..."
Read-Host