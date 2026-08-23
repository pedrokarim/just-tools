-- Les sessions applicatives d'Ascencia ID.
--
-- Pourquoi une table : Just Tools tourne sur Vercel, donc en serverless. Un
-- magasin de sessions en mémoire repart vide à chaque démarrage à froid, et
-- l'utilisateur se retrouve déconnecté au hasard — un symptôme qui ressemble à
-- un caprice plutôt qu'à une panne.
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
