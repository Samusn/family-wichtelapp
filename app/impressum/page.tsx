import Link from "next/link";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";
import Card from "@components/ui/Card";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_NAME } from "./contact";
import { ProtectedEmail, ProtectedLines, ProtectedText } from "./Protected";

export default function ImpressumPage() {
  return (
    <Page wide>
      <header className="text-center">
        <Title>Impressum</Title>
      </header>

      <Card className="flex flex-col gap-6">
        <section>
          <h2 className="text-lg font-bold text-gold">Verantwortlich</h2>
          <p className="mt-2 text-cream/80">
            <ProtectedText value={CONTACT_NAME} />
            <br />
            <ProtectedLines values={CONTACT_ADDRESS} />
            <br />
            E-Mail: <ProtectedEmail value={CONTACT_EMAIL} />
          </p>
          <p className="mt-2 text-sm text-cream/60">
            Diese Anwendung wird privat betrieben und richtet sich
            ausschliesslich an Familienmitglieder sowie an enge Bekannte,
            Freunde und vertraute Personen des Familienkreises.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">Zweck der Anwendung</h2>
          <p className="mt-2 text-cream/80">
            Diese Anwendung dient der internen Kommunikation, Organisation und
            Unterhaltung innerhalb der Familie und des engeren Bekanntenkreises.
            Sie wurde mit erheblichem Entwicklungsaufwand erstellt und basiert
            technisch auf einer modernen Webarchitektur mit{" "}
            <strong>Next.js</strong>, <strong>React</strong> und{" "}
            <strong>PostgreSQL</strong>. Die App verwendet verschiedene eigene
            Komponenten und wird ausschliesslich privat genutzt. Eine
            kommerzielle Nutzung oder Weitergabe ist ausdrücklich untersagt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">
            Hosting und Datenverarbeitung
          </h2>
          <p className="mt-2 text-cream/80">
            Die App nutzt <strong>Vercel</strong> für Hosting und{" "}
            <strong>Neon (PostgreSQL)</strong> für die Datenbankdienste. Daten
            werden dort ausschliesslich zur Bereitstellung der
            App-Funktionalität gespeichert. Eine Auswertung oder Weitergabe zu
            anderen Zwecken erfolgt nicht.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">
            Datenspeicherung und Löschfristen
          </h2>
          <p className="mt-2 text-cream/80">
            Sämtliche in der App gespeicherten Daten (z.&nbsp;B.
            Familienprofile, Wunschlisten, Zuordnungen) werden ausschliesslich
            für die familiäre und freundschaftliche Nutzung vorgehalten. Drei
            Monate nach Weihnachten werden alle Daten aus der Datenbank
            gelöscht, um ein sauberes Neuaufsetzen der App für das folgende Jahr
            zu gewährleisten.
          </p>
          <p className="mt-2 text-cream/80">
            Die Löschung erfolgt automatisiert oder manuell durch den Betreiber.
            Nach der Löschung können Daten nicht wiederhergestellt werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">
            Datenschutzrechtliche Hinweise
          </h2>
          <p className="mt-2 text-cream/80">
            Der Betrieb erfolgt gemäss dem revidierten Schweizer
            Datenschutzgesetz (FADP). Es werden nur solche personenbezogenen
            Daten verarbeitet, die für die Nutzung der App erforderlich sind.
            Nutzer haben das Recht auf Auskunft, Berichtigung und Löschung ihrer
            gespeicherten Daten.
          </p>
          <p className="mt-2 text-cream/80">
            Anfragen zum Datenschutz können jederzeit an{" "}
            <ProtectedEmail value={CONTACT_EMAIL} /> gerichtet werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">Haftungsausschluss</h2>
          <p className="mt-2 text-cream/80">
            Der Betreiber übernimmt keine Haftung für Schäden oder Kosten, die
            durch fehlerhafte Nutzung der App entstehen. Es wird keine Gewähr
            für die ständige Verfügbarkeit oder fehlerfreie Funktion übernommen.
            Alle Inhalte werden nach bestem Wissen und Gewissen bereitgestellt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gold">Stand und Kontakt</h2>
          <p className="mt-2 text-cream/80">
            Letzte Aktualisierung: Oktober 2026
            <br />
            Kontaktadresse: <ProtectedEmail value={CONTACT_EMAIL} />
          </p>
        </section>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-cream/40 text-center italic">
            Hinweis: Teile dieses Impressums wurden mithilfe von KI formuliert
            und können inhaltliche oder formale Fehler enthalten.
          </p>
        </div>
      </Card>

      <div className="flex justify-center">
        <Link
          href="/"
          className="text-[15px] font-semibold text-gold transition-colors hover:text-gold-soft"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </Page>
  );
}
