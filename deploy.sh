#!/bin/bash

# Script de déploiement pour Just Tools (avec Bun)
# Usage: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Just Tools - Déploiement Bun  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Vérification de Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
}

# Fonction de build
build() {
    print_message "Construction de l'image Docker..."
    docker-compose build --no-cache
    print_message "Build terminé avec succès !"
}

# Fonction de démarrage
start() {
    print_message "Démarrage de l'application..."
    docker-compose up -d
    print_message "Application démarrée !"
    print_message "Accédez à l'application sur: http://localhost:3000"
}

# Fonction d'arrêt
stop() {
    print_message "Arrêt de l'application..."
    docker-compose down
    print_message "Application arrêtée !"
}

# Fonction de redémarrage
restart() {
    print_message "Redémarrage de l'application..."
    docker-compose down
    docker-compose up -d
    print_message "Application redémarrée !"
}

# Fonction pour voir les logs
logs() {
    print_message "Affichage des logs..."
    docker-compose logs -f
}

# Fonction de nettoyage
clean() {
    print_warning "Nettoyage des images et conteneurs..."
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    print_message "Nettoyage terminé !"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  build    - Construire l'image Docker"
    echo "  start    - Démarrer l'application"
    echo "  stop     - Arrêter l'application"
    echo "  restart  - Redémarrer l'application"
    echo "  logs     - Afficher les logs"
    echo "  clean    - Nettoyer les images et conteneurs"
    echo "  help     - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 build"
    echo "  $0 start"
    echo "  $0 restart"
}

# Script principal
main() {
    print_header
    
    # Vérification de Docker
    check_docker
    
    # Gestion des arguments
    case "${1:-help}" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécution du script
main "$@" 