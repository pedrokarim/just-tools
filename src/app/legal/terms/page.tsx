import { Metadata } from "next";
import { LegalSignature } from "@/components/site/legal-signature";
import {
  ReadingColumn,
  ReadingSection,
  SiteShell,
} from "@/components/site/site-shell";
import { PROJECT_CONFIG } from "@/lib/constants";
import { tools } from "@/lib/tools-metadata";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Les conditions générales d'utilisation de Just Tools, suite d'outils de développement gratuits et open source : usage autorisé, responsabilité et droit applicable.",
  alternates: { canonical: "/legal/terms" },
};

const toolNames = tools.map((tool) => tool.name).join(", ");

export default function TermsPage() {
  return (
    <SiteShell>
      <ReadingColumn
        title="Conditions générales d'utilisation"
        updatedAt="1er novembre 2026"
      >
        <ReadingSection id="presentation" title="1. Présentation du service">
          <p>
            Just Tools est une suite d&apos;outils de développement gratuits
            accessible en ligne, développée par Ahmed Karim (PedroKarim) pour
            Ascencia. Le service propose une collection d&apos;outils pratiques
            et créatifs destinés à simplifier le travail quotidien des
            développeurs.
          </p>
          <p>Les outils disponibles sont les suivants&nbsp;: {toolNames}.</p>
        </ReadingSection>

        <ReadingSection id="acceptation" title="2. Acceptation des conditions">
          <p>
            L&apos;utilisation de Just Tools implique l&apos;acceptation pleine
            et entière des présentes conditions. Si tu ne les acceptes pas,
            merci de ne pas utiliser le service.
          </p>
        </ReadingSection>

        <ReadingSection id="utilisation" title="3. Utilisation du service">
          <p>
            <strong>Utilisation autorisée.</strong> Just Tools est destiné à un
            usage personnel et professionnel légitime. Tu peux utiliser les
            outils pour tes projets de développement, à des fins éducatives ou
            pour améliorer ta productivité.
          </p>
          <p>
            <strong>Utilisation interdite&nbsp;:</strong>
          </p>
          <ul>
            <li>utilisation à des fins illégales ou frauduleuses&nbsp;;</li>
            <li>tentative de compromission de la sécurité du service&nbsp;;</li>
            <li>utilisation excessive pouvant nuire aux autres utilisateurs&nbsp;;</li>
            <li>reproduction ou distribution non autorisée du contenu&nbsp;;</li>
            <li>utilisation des outils pour créer du contenu malveillant.</li>
          </ul>
        </ReadingSection>

        <ReadingSection id="propriete" title="4. Propriété intellectuelle">
          <p>
            Just Tools est un projet open source sous licence MIT. Le code source
            est disponible sur GitHub et peut être utilisé, modifié et distribué
            conformément aux termes de cette licence.
          </p>
          <p>
            Les marques, logos et noms commerciaux restent la propriété
            d&apos;Ascencia et ne peuvent être utilisés sans autorisation écrite.
          </p>
        </ReadingSection>

        <ReadingSection id="responsabilite" title="5. Limitation de responsabilité">
          <p>
            Just Tools est fourni «&nbsp;en l&apos;état&nbsp;», sans garantie
            d&apos;aucune sorte. Ascencia et Ahmed Karim ne peuvent être tenus
            responsables&nbsp;:
          </p>
          <ul>
            <li>
              des dommages directs ou indirects résultant de l&apos;utilisation
              du service&nbsp;;
            </li>
            <li>de la perte de données ou de la corruption de fichiers&nbsp;;</li>
            <li>des interruptions de service ou des dysfonctionnements&nbsp;;</li>
            <li>de l&apos;utilisation inappropriée des outils.</li>
          </ul>
        </ReadingSection>

        <ReadingSection id="donnees" title="6. Confidentialité et données">
          <p>
            Just Tools respecte ta vie privée. Les données que tu saisis dans
            les outils sont traitées localement dans ton navigateur et ne sont
            pas transmises à nos serveurs.
          </p>
          <p>
            Nous ne collectons aucune donnée personnelle identifiable. Les
            seules données collectées sont des statistiques d&apos;usage, qui servent à améliorer le
            service. Le détail figure dans la{" "}
            <a href="/legal/privacy">politique de confidentialité</a>.
          </p>
        </ReadingSection>

        <ReadingSection id="service" title="7. Modifications du service">
          <p>
            Nous nous réservons le droit de modifier, suspendre ou interrompre
            le service à tout moment, avec ou sans préavis. Nous nous efforçons
            de le maintenir disponible et fonctionnel, mais ne pouvons garantir
            une disponibilité continue.
          </p>
        </ReadingSection>

        <ReadingSection id="conditions" title="8. Modifications des conditions">
          <p>
            Ces conditions peuvent être modifiées à tout moment. Les
            modifications entrent en vigueur dès leur publication sur le site, et
            il t&apos;appartient de les consulter régulièrement.
          </p>
        </ReadingSection>

        <ReadingSection id="droit" title="9. Droit applicable">
          <p>
            Les présentes conditions sont régies par le droit français. Tout
            litige sera soumis à la compétence des tribunaux français.
          </p>
        </ReadingSection>

        <ReadingSection id="contact" title="10. Contact">
          <p>
            Pour toute question sur ces conditions, écris à{" "}
            <a href={`mailto:${PROJECT_CONFIG.contact.email}`}>
              {PROJECT_CONFIG.contact.email}
            </a>
            . Le service est édité par Ahmed Karim (PedroKarim) pour Ascencia (
            <a
              href={PROJECT_CONFIG.company.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              ascencia.re
            </a>
            ), et son code est public sur{" "}
            <a
              href={PROJECT_CONFIG.project.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </ReadingSection>

        <LegalSignature
          sibling={{
            href: "/legal/privacy",
            label: "Politique de confidentialité",
          }}
        />
      </ReadingColumn>
    </SiteShell>
  );
}
