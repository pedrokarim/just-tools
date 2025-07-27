# Guide de Déploiement Docker - Just Tools (avec Bun)

Ce guide vous explique comment déployer l'application Just Tools sur un serveur Linux en utilisant Docker avec Bun pour des performances optimales.

## 📋 Prérequis

- Docker installé sur votre serveur Linux
- Docker Compose installé
- Git (pour cloner le projet)

**Note** : Cette configuration utilise Bun au lieu de npm pour des performances améliorées.

## 🚀 Déploiement Rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd just-tools
```

### 2. Rendre le script de déploiement exécutable
```bash
chmod +x deploy.sh
```

### 3. Construire et démarrer l'application
```bash
./deploy.sh build
./deploy.sh start
```

L'application sera accessible sur `http://votre-serveur:3000`

## 🔧 Commandes Disponibles

Le script `deploy.sh` offre plusieurs commandes :

```bash
./deploy.sh build    # Construire l'image Docker
./deploy.sh start    # Démarrer l'application
./deploy.sh stop     # Arrêter l'application
./deploy.sh restart  # Redémarrer l'application
./deploy.sh logs     # Afficher les logs
./deploy.sh clean    # Nettoyer les images et conteneurs
./deploy.sh help     # Afficher l'aide
```

## 🐳 Déploiement Manuel avec Docker

Si vous préférez utiliser Docker directement :

### Construction de l'image
```bash
docker build -t just-tools .
```

### Lancement du conteneur
```bash
docker run -d \
  --name just-tools-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  just-tools
```

## 🐳 Déploiement avec Docker Compose

### Lancement
```bash
docker-compose up -d
```

### Arrêt
```bash
docker-compose down
```

### Voir les logs
```bash
docker-compose logs -f
```

## 🔒 Configuration de Production

### Variables d'environnement

Vous pouvez créer un fichier `.env` pour configurer l'application :

```env
NODE_ENV=production
PORT=3000
# Ajoutez d'autres variables selon vos besoins
```

### Reverse Proxy avec Nginx

Pour une configuration de production, il est recommandé d'utiliser Nginx comme reverse proxy :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring et Logs

### Vérifier l'état du conteneur
```bash
docker ps
docker stats just-tools-app
```

### Health Check
L'application expose un endpoint de santé sur `/api/health` qui retourne :
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

### Logs en temps réel
```bash
docker-compose logs -f just-tools
```

## 🔧 Maintenance

### Mise à jour de l'application
```bash
# Arrêter l'application
./deploy.sh stop

# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
./deploy.sh build
./deploy.sh start
```

### Nettoyage
```bash
# Nettoyer les images et conteneurs inutilisés
./deploy.sh clean
```

## 🛠️ Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier quel processus utilise le port 3000
   sudo netstat -tulpn | grep :3000
   
   # Tuer le processus si nécessaire
   sudo kill -9 <PID>
   ```

2. **Permissions Docker**
   ```bash
   # Ajouter l'utilisateur au groupe docker
   sudo usermod -aG docker $USER
   # Redémarrer la session
   ```

3. **Espace disque insuffisant**
   ```bash
   # Nettoyer Docker
   docker system prune -a
   ```

### Logs d'erreur
```bash
# Voir les logs d'erreur
docker-compose logs --tail=100 just-tools | grep ERROR
```

## 📈 Optimisations

### Limites de ressources
Le `docker-compose.yml` inclut des limites de ressources :
- Mémoire : 512MB max, 256MB réservé
- CPU : 0.5 core max, 0.25 core réservé

### Optimisations de l'image
- Utilisation d'images Alpine Linux légères avec Bun
- Build multi-stage pour réduire la taille
- Utilisateur non-root pour la sécurité
- Bun pour des installations et exécutions plus rapides

## 🔐 Sécurité

- L'application s'exécute avec un utilisateur non-root
- Headers de sécurité configurés dans Next.js
- Health check pour détecter les problèmes
- Limites de ressources pour éviter les abus

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `./deploy.sh logs`
2. Consultez la documentation Next.js
3. Vérifiez la configuration Docker

---

**Note** : Ce guide suppose que vous déployez sur un serveur Linux. Pour d'autres systèmes, certaines commandes peuvent nécessiter des ajustements. 