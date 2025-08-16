// Cache LRU (Least Recently Used) réutilisable
export class LRUCache<T = any> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number; // Time to live en millisecondes

  constructor(maxSize: number = 1000, ttl: number = 24 * 60 * 60 * 1000) {
    // 24h par défaut
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Récupère une valeur du cache
   * @param key - Clé de l'élément
   * @returns La valeur ou null si non trouvée/expirée
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Vérifier si l'item a expiré
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Déplacer l'item en fin de Map (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }

  /**
   * Ajoute ou met à jour une valeur dans le cache
   * @param key - Clé de l'élément
   * @param value - Valeur à stocker
   */
  set(key: string, value: T): void {
    // Si la clé existe déjà, la supprimer d'abord
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Si le cache est plein, supprimer l'item le plus ancien
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  /**
   * Vérifie si une clé existe dans le cache
   * @param key - Clé à vérifier
   * @returns true si la clé existe et n'est pas expirée
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Vérifier si l'item a expiré
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Supprime un élément du cache
   * @param key - Clé de l'élément à supprimer
   * @returns true si l'élément était présent
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retourne le nombre d'éléments dans le cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Retourne la taille maximale du cache
   */
  getMaxSize(): number {
    return this.maxSize;
  }

  /**
   * Retourne le TTL en millisecondes
   */
  getTTL(): number {
    return this.ttl;
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      size: this.size(),
      maxSize: this.maxSize,
      ttl: this.ttl,
      ttlHours: Math.round(this.ttl / (1000 * 60 * 60)),
    };
  }

  /**
   * Nettoie les éléments expirés du cache
   * @returns Nombre d'éléments supprimés
   */
  cleanup(): number {
    let deletedCount = 0;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
