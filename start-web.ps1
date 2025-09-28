Write-Host "🚀 Iniciando pagina web..." -ForegroundColor Cyan

if (Test-Path "Pagina") {
    Write-Host "📁 Carpeta Pagina encontrada" -ForegroundColor Green
    
    # Cambiar directorio a Pagina
    Push-Location "Pagina"
    
    # Mostrar contenido para verificar
    Write-Host "📄 Archivos en Pagina:" -ForegroundColor Yellow
    Get-ChildItem | Select-Object Name
    
    # Abrir navegador
    Write-Host "🌐 Abriendo http://localhost:8000" -ForegroundColor Green
    Start-Process "http://localhost:8000"
    
    # Esperar un momento
    Start-Sleep 2
    
    Write-Host "🎯 Iniciando servidor desde carpeta Pagina..." -ForegroundColor Magenta
    Write-Host "⚠️  Presiona Ctrl+C para detener" -ForegroundColor Yellow
    
    # Iniciar servidor HTTP
    python -m http.server 8000
} else {
    Write-Host "❌ Carpeta Pagina no encontrada" -ForegroundColor Red
}