-- Les sessions applicatives d'Ascencia ID.
--
-- Pourquoi une table : un magasin de sessions en mémoire repart vide à chaque
-- redémarrage du conteneur, donc à chaque déploiement, et tous les
-- utilisateurs se retrouvent déconnectés d'un coup.
--
-- Purement additif. Ne touche à aucune table existante.

CREATE TABLE IF NOT EXISTS "ascencia_sessions" (
  "id"         TEXT        PRIMARY KEY,
  "data"       TEXT        NOT NULL,
  "expiresAt"  TIMESTAMP(3) NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sert au ménage des sessions expirées, qui balaie par date.
CREATE INDEX IF NOT EXISTS "ascencia_sessions_expiresAt_idx"
  ON "ascencia_sessions" ("expiresAt");
