import { Metadata } from "next";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions générales d'utilisation de Just Tools - Suite d'outils de développement gratuits",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl pt-24">
        <div className="border border-border bg-card rounded-xl p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Conditions Générales d'Utilisation
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>Dernière mise à jour :</strong> 15 août 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Présentation du Service
              </h2>
              <p className="text-muted-foreground mb-4">
                Just Tools est une suite d'outils de développement gratuits
                accessible en ligne, développée par Ahmed Karim (PedroKarim)
                pour Ascencia. Le service propose une collection d'outils
                pratiques et créatifs destinés à simplifier le workflow
                quotidien des développeurs.
              </p>
              <p className="text-muted-foreground">
                Les outils disponibles incluent : convertisseur Base64,
                formateur de code, générateur de palette, validateur JSON,
                générateur de mots de passe, éditeur Markdown, éditeur de
                motifs, effet de trame, extracteur de couleurs, et synthèse
                vocale.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Acceptation des Conditions
              </h2>
              <p className="text-muted-foreground">
                L'utilisation de Just Tools implique l'acceptation pleine et
                entière des présentes conditions générales d'utilisation. Si
                vous n'acceptez pas ces conditions, veuillez ne pas utiliser le
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Utilisation du Service
              </h2>
              <h3 className="text-xl font-medium text-foreground mb-3">
                3.1 Utilisation Autorisée
              </h3>
              <p className="text-muted-foreground mb-4">
                Just Tools est destiné à un usage personnel et professionnel
                légitime. Vous pouvez utiliser les outils pour vos projets de
                développement, à des fins éducatives ou pour améliorer votre
                productivité.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">
                3.2 Utilisation Interdite
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Utilisation à des fins illégales ou frauduleuses</li>
                <li>Tentative de compromission de la sécurité du service</li>
                <li>
                  Utilisation excessive pouvant nuire aux autres utilisateurs
                </li>
                <li>Reproduction ou distribution non autorisée du contenu</li>
                <li>
                  Utilisation des outils pour créer du contenu malveillant
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Propriété Intellectuelle
              </h2>
              <p className="text-muted-foreground mb-4">
                Just Tools est un projet open source sous licence MIT. Le code
                source est disponible sur GitHub et peut être utilisé, modifié
                et distribué conformément aux termes de la licence MIT.
              </p>
              <p className="text-muted-foreground">
                Les marques, logos et noms commerciaux restent la propriété
                d'Ascencia et ne peuvent être utilisés sans autorisation écrite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Limitation de Responsabilité
              </h2>
              <p className="text-muted-foreground mb-4">
                Just Tools est fourni "en l'état" sans garantie d'aucune sorte.
                Ascencia et Ahmed Karim ne peuvent être tenus responsables :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>
                  Des dommages directs ou indirects résultant de l'utilisation
                  du service
                </li>
                <li>De la perte de données ou de la corruption de fichiers</li>
                <li>Des interruptions de service ou des dysfonctionnements</li>
                <li>
                  De l'utilisation inappropriée des outils par les utilisateurs
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Confidentialité et Données
              </h2>
              <p className="text-muted-foreground mb-4">
                Just Tools respecte votre vie privée. Les données que vous
                saisissez dans les outils sont traitées localement dans votre
                navigateur et ne sont pas transmises à nos serveurs.
              </p>
              <p className="text-muted-foreground">
                Nous ne collectons aucune donnée personnelle identifiable. Les
                seules données collectées sont anonymes et utilisées pour
                améliorer le service (statistiques d'utilisation).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Modifications du Service
              </h2>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier, suspendre ou
                interrompre le service à tout moment, avec ou sans préavis. Nous
                nous efforçons de maintenir le service disponible et
                fonctionnel, mais ne pouvons garantir une disponibilité
                continue.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Modifications des Conditions
              </h2>
              <p className="text-muted-foreground">
                Ces conditions peuvent être modifiées à tout moment. Les
                modifications entrent en vigueur dès leur publication sur le
                site. Il est de votre responsabilité de consulter régulièrement
                ces conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Droit Applicable
              </h2>
              <p className="text-muted-foreground">
                Les présentes conditions sont régies par le droit français. Tout
                litige sera soumis à la compétence des tribunaux français.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Contact
              </h2>
              <p className="text-muted-foreground">
                Pour toute question concernant ces conditions, vous pouvez nous
                contacter :
              </p>
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Développeur :</strong> Ahmed Karim (PedroKarim)
                  <br />
                  <strong>Entreprise :</strong> Ascencia
                  <br />
                  <strong>Site web :</strong>{" "}
                  <a
                    href="https://ascencia.re"
                    className="text-primary hover:underline"
                  >
                    https://ascencia.re
                  </a>
                  <br />
                  <strong>Projet GitHub :</strong>{" "}
                  <a
                    href="https://github.com/pedrokarim/just-tools"
                    className="text-primary hover:underline"
                  >
                    https://github.com/pedrokarim/just-tools
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
