#!/bin/bash
# Script post-deploy para abrir la página web automáticamente

echo "🚀 Deploy completado exitosamente!"
echo ""
echo "📋 Información del proyecto:"
echo "  • Backend: Deployado en AWS"
echo "  • Frontend: Listo en carpeta Pagina/"
echo ""
echo "🌐 Iniciando servidor web local..."

# Cambiar a la carpeta de la página
cd Pagina

# Verificar si Python está disponible
if command -v python &> /dev/null; then
    echo "✅ Python encontrado, iniciando servidor..."
    echo "🌍 Página disponible en: http://localhost:8000"
    echo ""
    echo "⚠️  Para detener el servidor presiona Ctrl+C"
    echo "🔄 Para reiniciar: cd Pagina && python -m http.server 8000"
    echo ""
    
    # Esperar un momento y abrir el navegador
    sleep 2
    
    # Intentar abrir el navegador automáticamente
    if command -v start &> /dev/null; then
        start http://localhost:8000  # Windows
    elif command -v open &> /dev/null; then
        open http://localhost:8000   # macOS
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000  # Linux
    fi
    
    # Iniciar el servidor HTTP
    python -m http.server 8000
else
    echo "❌ Python no encontrado."
    echo "💡 Para ver la página web:"
    echo "   1. cd Pagina"
    echo "   2. Abrir index.html en tu navegador"
    echo "   3. O usar otro servidor web local"
fi