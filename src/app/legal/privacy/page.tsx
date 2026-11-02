import { Metadata } from "next";
import Link from "next/link";
import { LegalSignature } from "@/components/site/legal-signature";
import {
  ReadingColumn,
  ReadingSection,
  SiteShell,
} from "@/components/site/site-shell";
import { PROJECT_CONFIG } from "@/lib/constants";
import { ANALYTICS_RETENTION_MONTHS } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Ce que Just Tools collecte, ce qu'il ne collecte pas, à quoi servent ces données et comment exercer tes droits sur elles, conformément au RGPD.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <ReadingColumn
        title="Politique de confidentialité"
        lead="Ce que nous collectons, ce que nous ne collectons pas, et comment exercer tes droits."
        updatedAt="2 novembre 2026"
      >
        <ReadingSection id="introduction" title="Introduction">
          <p>
            Chez {PROJECT_CONFIG.name}, nous respectons ta vie privée et nous
            nous engageons à protéger tes données personnelles. Cette politique
            explique comment nous collectons, utilisons et protégeons tes
            informations.
          </p>
          <p>
            En utilisant notre service, tu acceptes les pratiques décrites dans
            cette politique.
          </p>
        </ReadingSection>

        <ReadingSection id="collecte" title="Ce que nous collectons">
          <p>
            <strong>Données techniques&nbsp;:</strong>
          </p>
          <ul>
            <li>adresse IP tronquée, sans sa fin&nbsp;;</li>
            <li>type de navigateur et système d&apos;exploitation&nbsp;;</li>
            <li>pages visitées et temps passé&nbsp;;</li>
            <li>données de performance et erreurs techniques.</li>
          </ul>
          <p>
            <strong>Données d&apos;utilisation&nbsp;:</strong>
          </p>
          <ul>
            <li>outils utilisés et fréquence d&apos;utilisation&nbsp;;</li>
            <li>préférence de thème (clair ou sombre)&nbsp;;</li>
            <li>données de session temporaires.</li>
          </ul>
        </ReadingSection>

        <ReadingSection id="non-collecte" title="Ce que nous ne collectons pas">
          <ul>
            <li>informations personnelles (nom, adresse e-mail, etc.)&nbsp;;</li>
            <li>contenu que tu traites avec nos outils&nbsp;;</li>
            <li>cookies de suivi publicitaire&nbsp;;</li>
            <li>données de géolocalisation précises.</li>
          </ul>
          <p>
            Tes contenus sont traités dans ton navigateur. Les quelques cas où
            le réseau entre en jeu sont détaillés sur la{" "}
            <Link href="/about#traitement">page À propos</Link>.
          </p>
        </ReadingSection>

        <ReadingSection id="usage" title="À quoi servent ces données">
          <ul>
            <li>
              <strong>Amélioration du service&nbsp;:</strong> analyser
              l&apos;utilisation pour améliorer nos outils.
            </li>
            <li>
              <strong>Sécurité&nbsp;:</strong> détecter et prévenir les abus,
              fraudes et problèmes de sécurité.
            </li>
            <li>
              <strong>Support technique&nbsp;:</strong> résoudre les problèmes
              techniques et fournir une assistance.
            </li>
            <li>
              <strong>Statistiques&nbsp;:</strong> des mesures d&apos;audience pour
              comprendre l&apos;utilisation du service.
            </li>
          </ul>
        </ReadingSection>

        <ReadingSection id="conservation" title="Combien de temps nous les gardons">
          <p>
            La fin de ton adresse IP est retirée avant tout enregistrement. Le
            reste est effacé automatiquement&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Statistiques de visite&nbsp;:</strong>{" "}
              {ANALYTICS_RETENTION_MONTHS} mois après la visite.
            </li>
            <li>
              <strong>Visiteurs uniques&nbsp;:</strong>{" "}
              {ANALYTICS_RETENTION_MONTHS} mois après la dernière visite.
            </li>
            <li>
              <strong>Journaux de connexion à l&apos;administration&nbsp;:</strong>{" "}
              {ANALYTICS_RETENTION_MONTHS} mois. Ils ne concernent que les
              personnes qui ont tenté de s&apos;y connecter, avec leur compte
              Discord.
            </li>
          </ul>
        </ReadingSection>

        <ReadingSection id="cookies" title="Cookies et technologies similaires">
          <p>Nous utilisons des cookies essentiels au fonctionnement du service&nbsp;:</p>
          <ul>
            <li>
              <strong>Cookies de session&nbsp;:</strong> mémorisation de tes
              préférences (thème, langue).
            </li>
            <li>
              <strong>Cookies de sécurité&nbsp;:</strong> protection contre les
              attaques et les abus.
            </li>
            <li>
              <strong>Cookies analytiques&nbsp;:</strong> statistiques
              d&apos;utilisation.
            </li>
          </ul>
        </ReadingSection>

        <ReadingSection id="protection" title="Protection de tes données">
          <ul>
            <li>chiffrement HTTPS pour toutes les communications&nbsp;;</li>
            <li>protection contre les attaques XSS et CSRF&nbsp;;</li>
            <li>surveillance continue de la sécurité&nbsp;;</li>
            <li>sauvegardes régulières et sécurisées&nbsp;;</li>
            <li>accès limité au personnel autorisé, et audité régulièrement&nbsp;;</li>
            <li>formation à la sécurité du personnel&nbsp;;</li>
            <li>conformité au RGPD et aux autres réglementations.</li>
          </ul>
        </ReadingSection>

        <ReadingSection id="partage" title="Partage de tes données">
          <p>
            Nous ne vendons, ne louons ni ne partageons tes données personnelles
            avec des tiers, sauf dans les cas suivants&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Obligation légale&nbsp;:</strong> si la loi ou une autorité
              compétente l&apos;exige.
            </li>
            <li>
              <strong>Prestataires de services&nbsp;:</strong> hébergement et
              mesure d&apos;audience, avec des garanties de confidentialité.
            </li>
            <li>
              <strong>Protection de nos droits&nbsp;:</strong> en cas de
              violation des conditions d&apos;utilisation.
            </li>
          </ul>
          <p>
            <strong>Traduction de la synthèse vocale&nbsp;:</strong> quand tu la
            demandes, le texte à traduire est envoyé au service de traduction
            utilisé par l&apos;outil. Aucun autre outil n&apos;envoie ton
            contenu à un tiers.
          </p>
        </ReadingSection>

        <ReadingSection id="droits" title="Tes droits">
          <p>
            Conformément au RGPD et aux autres réglementations, tu disposes des
            droits suivants&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Droit d&apos;accès&nbsp;:</strong> demander une copie des
              données que nous détenons sur toi.
            </li>
            <li>
              <strong>Droit de rectification&nbsp;:</strong> corriger des données
              inexactes ou incomplètes.
            </li>
            <li>
              <strong>Droit à l&apos;effacement&nbsp;:</strong> demander la
              suppression de tes données personnelles.
            </li>
            <li>
              <strong>Droit d&apos;opposition&nbsp;:</strong> t&apos;opposer au
              traitement de tes données.
            </li>
          </ul>
        </ReadingSection>

        <ReadingSection id="contact" title="Nous contacter">
          <p>
            Pour toute question sur cette politique ou pour exercer tes droits,
            écris à{" "}
            <a href={`mailto:${PROJECT_CONFIG.contact.email}`}>
              {PROJECT_CONFIG.contact.email}
            </a>{" "}
            ou{" "}
            <a
              href={PROJECT_CONFIG.project.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              ouvre une issue sur GitHub
            </a>
            .
          </p>
        </ReadingSection>

        <ReadingSection id="modifications" title="Modifications de cette politique">
          <p>
            Nous pouvons mettre à jour cette politique de temps à autre. Les
            modifications importantes sont signalées sur cette page, avec une
            nouvelle date de mise à jour.
          </p>
        </ReadingSection>

        <LegalSignature
          sibling={{ href: "/legal/terms", label: "Conditions d'utilisation" }}
        />
      </ReadingColumn>
    </SiteShell>
  );
}
