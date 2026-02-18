import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PROJECT_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description:
    "Politique de confidentialité et protection des données de Just Tools",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-muted-foreground">
              Protection de vos données et respect de votre vie privée
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Dernière mise à jour : 15 août 2025
            </div>
          </div>

          {/* Content */}
          <div className="border border-border bg-card rounded-xl p-8">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Chez {PROJECT_CONFIG.name}, nous respectons votre vie privée et
                nous nous engageons à protéger vos données personnelles. Cette
                politique de confidentialité explique comment nous collectons,
                utilisons et protégeons vos informations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                En utilisant notre service, vous acceptez les pratiques décrites
                dans cette politique de confidentialité.
              </p>
            </section>

            {/* Informations collectées */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Informations que nous collectons
              </h2>
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Données techniques
                  </h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Adresse IP (anonymisée)</li>
                    <li>• Type de navigateur et système d'exploitation</li>
                    <li>• Pages visitées et temps passé</li>
                    <li>• Données de performance et erreurs techniques</li>
                  </ul>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Données d'utilisation
                  </h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Outils utilisés et fréquence d'utilisation</li>
                    <li>• Préférences de thème (clair/sombre)</li>
                    <li>• Données de session temporaires</li>
                  </ul>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Ce que nous NE collectons PAS
                  </h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Informations personnelles (nom, email, etc.)</li>
                    <li>
                      • Données de contenu que vous traitez avec nos outils
                    </li>
                    <li>• Cookies de suivi publicitaire</li>
                    <li>• Données de géolocalisation précises</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Comment nous utilisons vos données
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Amélioration du service
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Analyser l'utilisation pour améliorer nos outils et
                    l'expérience utilisateur.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Sécurité
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Détecter et prévenir les abus, fraudes et problèmes de
                    sécurité.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Support technique
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Résoudre les problèmes techniques et fournir une assistance.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Analytics
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Statistiques anonymes pour comprendre l'utilisation du
                    service.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Cookies et technologies similaires
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous utilisons des cookies essentiels pour le bon fonctionnement
                du service :
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Cookies de session :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Mémorisation de vos préférences (thème, langue)
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Cookies de sécurité :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Protection contre les attaques et abus
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Cookies analytiques :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Statistiques anonymes d'utilisation
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Protection des données */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Protection de vos données
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Mesures de sécurité
                  </h3>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Chiffrement HTTPS pour toutes les communications</li>
                    <li>• Protection contre les attaques XSS et CSRF</li>
                    <li>• Surveillance continue de la sécurité</li>
                    <li>• Sauvegardes régulières et sécurisées</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Accès aux données
                  </h3>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Accès limité au personnel autorisé</li>
                    <li>• Audit régulier des accès</li>
                    <li>• Formation à la sécurité du personnel</li>
                    <li>• Conformité RGPD et autres réglementations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Partage des données */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Partage de vos données
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous ne vendons, ne louons ni ne partageons vos données
                personnelles avec des tiers, sauf dans les cas suivants :
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Obligation légale :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Si requis par la loi ou une autorité compétente
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Prestataires de services :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Hébergement, analytics (avec garanties de confidentialité)
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">
                      Protection de nos droits :
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      En cas de violation des conditions d'utilisation
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Vos droits */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Vos droits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément au RGPD et autres réglementations, vous disposez
                des droits suivants :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Droit d'accès
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Demander une copie des données que nous détenons sur vous.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Droit de rectification
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Corriger des données inexactes ou incomplètes.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Droit à l'effacement
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Demander la suppression de vos données personnelles.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Droit d'opposition
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Vous opposer au traitement de vos données.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Nous contacter
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute question concernant cette politique de
                confidentialité ou pour exercer vos droits, contactez-nous :
              </p>
              <div className="bg-secondary rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Email
                    </h3>
                    <a
                      href={`mailto:${PROJECT_CONFIG.contact.email}`}
                      className="text-muted-foreground hover:underline"
                    >
                      {PROJECT_CONFIG.contact.email}
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      GitHub
                    </h3>
                    <a
                      href={PROJECT_CONFIG.project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:underline"
                    >
                      Ouvrir une issue
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Modifications de cette politique
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité de
                temps à autre. Les modifications importantes seront notifiées
                sur cette page avec une nouvelle date de mise à jour. Nous vous
                encourageons à consulter régulièrement cette politique.
              </p>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-6 mt-8">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Cette politique de confidentialité est conforme au RGPD et aux
                  autres réglementations applicables.
                </p>
                <div className="mt-4">
                  <Link
                    href="/legal/terms"
                    className="text-foreground dark:text-blue-400 hover:underline text-sm"
                  >
                    ← Retour aux Conditions d'Utilisation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
