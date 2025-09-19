#!/bin/bash

# 🚀 Script de desarrollo con Docker para Bus Detection Mobile App
# Este script facilita el uso de Docker para desarrollo

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        print_info "Instala Docker desde: https://www.docker.com/get-started"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        print_info "Instala Docker Compose desde: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_message "Docker y Docker Compose están instalados"
}

# Función para construir la imagen
build_image() {
    print_info "Construyendo imagen de Docker..."
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        print_message "Imagen construida correctamente"
    else
        print_error "Error construyendo la imagen"
        exit 1
    fi
}

# Función para iniciar el contenedor
start_container() {
    print_info "Iniciando contenedor..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_message "Contenedor iniciado correctamente"
        print_info "La aplicación está disponible en:"
        print_info "  - Metro Bundler: http://localhost:19000"
        print_info "  - Expo DevTools: http://localhost:19001"
        print_info "  - Expo DevTools (alt): http://localhost:19002"
    else
        print_error "Error iniciando el contenedor"
        exit 1
    fi
}

# Función para ver logs
show_logs() {
    print_info "Mostrando logs del contenedor..."
    docker-compose logs -f bus-detection-app
}

# Función para detener el contenedor
stop_container() {
    print_info "Deteniendo contenedor..."
    docker-compose down
    
    if [ $? -eq 0 ]; then
        print_message "Contenedor detenido correctamente"
    else
        print_error "Error deteniendo el contenedor"
        exit 1
    fi
}

# Función para limpiar todo
cleanup() {
    print_warning "Limpiando contenedores e imágenes..."
    docker-compose down -v --rmi all
    
    if [ $? -eq 0 ]; then
        print_message "Limpieza completada"
    else
        print_error "Error durante la limpieza"
        exit 1
    fi
}

# Función para ejecutar comandos dentro del contenedor
exec_container() {
    print_info "Ejecutando comando en el contenedor..."
    docker-compose exec bus-detection-app "$@"
}

# Función para mostrar estado
show_status() {
    print_info "Estado de los contenedores:"
    docker-compose ps
    
    echo ""
    print_info "Uso de recursos:"
    docker stats --no-stream bus-detection-mobile 2>/dev/null || print_warning "Contenedor no está ejecutándose"
}

# Función para mostrar ayuda
show_help() {
    echo "🐳 Bus Detection Mobile - Script de Docker"
    echo "=========================================="
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build     - Construir la imagen de Docker"
    echo "  start     - Iniciar el contenedor"
    echo "  stop      - Detener el contenedor"
    echo "  restart   - Reiniciar el contenedor"
    echo "  logs      - Mostrar logs del contenedor"
    echo "  status    - Mostrar estado de los contenedores"
    echo "  exec      - Ejecutar comando en el contenedor"
    echo "  cleanup   - Limpiar contenedores e imágenes"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build                    # Construir imagen"
    echo "  $0 start                    # Iniciar aplicación"
    echo "  $0 exec npm install         # Instalar dependencias"
    echo "  $0 exec npx expo start      # Iniciar Expo manualmente"
    echo "  $0 logs                     # Ver logs en tiempo real"
    echo ""
}

# Función principal
main() {
    # Verificar Docker
    check_docker
    
    # Procesar argumentos
    case "${1:-help}" in
        "build")
            build_image
            ;;
        "start")
            start_container
            ;;
        "stop")
            stop_container
            ;;
        "restart")
            stop_container
            start_container
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "exec")
            shift
            exec_container "$@"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"
