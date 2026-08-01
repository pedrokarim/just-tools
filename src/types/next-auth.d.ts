// L'import est requis pour que ce fichier soit traité comme un module :
// sans lui, `declare module` remplacerait la déclaration de next-auth au
// lieu de l'augmenter. Il est donc inutilisé par nature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
