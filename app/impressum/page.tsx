import Link from 'next/link'

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-800 text-yellow-100 p-8">
      <div className="max-w-3xl mx-auto bg-red-800/30 backdrop-blur-xl border border-yellow-500/40 rounded-2xl shadow-[0_0_25px_#ffbb33] p-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Impressum</h1>

        {/* Verantwortlich */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Verantwortlich</h2>
          <p className="mt-2 text-yellow-100/90">
            Samuel Soun<br />
            Tramstrasse 64<br />
            5034 Suhr<br />
            Schweiz<br />
            E-Mail: <a href="mailto:familie@muster.ch" className="underline text-yellow-300">sounsamuel07@gmail.com</a>
          </p>
          <p className="text-sm text-yellow-200/70 mt-2">
            Diese Anwendung wird privat betrieben und richtet sich ausschliesslich an Familienmitglieder sowie an enge
            Bekannte, Freunde und vertraute Personen des Familienkreises.
          </p>
        </section>

        {/* Zweck */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Zweck der Anwendung</h2>
          <p className="mt-2">
            Diese Anwendung dient der internen Kommunikation, Organisation und Unterhaltung innerhalb der Familie und des
            engeren Bekanntenkreises. Sie wurde mit erheblichem Entwicklungsaufwand erstellt und basiert technisch auf einer
            modernen Webarchitektur mit <strong>Next.js</strong> und <strong>React</strong>. Die App verwendet verschiedene
            eigene Komponenten und wird ausschliesslich privat genutzt. Eine kommerzielle Nutzung oder Weitergabe ist
            ausdrücklich untersagt.
          </p>
        </section>

        {/* Hosting & Datenverarbeitung */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Hosting und Datenverarbeitung</h2>
          <p className="mt-2">
            Die App nutzt <strong>Firebase</strong> (Google Cloud) für Hosting, Authentifizierung und Datenbankdienste.
            Daten werden dort ausschliesslich zur Bereitstellung der App-Funktionalität gespeichert. Eine Auswertung oder
            Weitergabe zu anderen Zwecken erfolgt nicht.
          </p>
          <p className="mt-2">
            Die Nutzung von Firebase erfolgt im sogenannten „Pay-as-you-go“-Modell. Dies bedeutet, dass durch übermässige
            oder unsachgemässe Nutzung unerwartete Kosten entstehen könnten. Nutzer verpflichten sich daher, die App im
            Rahmen eines normalen, vernünftigen Gebrauchs zu verwenden.
          </p>
        </section>

        {/* Chatbot */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Chatbot und KI-Nutzung</h2>
          <p className="mt-2">
            Die App enthält einen Chatbot, der die <strong>OpenAI API</strong> verwendet. Anfragen an den Chatbot werden
            über eine verschlüsselte Verbindung an die Server von OpenAI übermittelt und dort verarbeitet. Inhalte des
            Chats werden nicht zu Analyse- oder Werbezwecken weiterverwendet, sondern ausschliesslich zur Beantwortung
            der jeweiligen Anfrage.
          </p>
          <p className="mt-2 text-sm text-yellow-200/70">
            Nutzer sind angehalten, den Chatbot verantwortungsvoll und gemäss den Nutzungsbedingungen der App zu verwenden.
          </p>
        </section>

        {/* Datenspeicherung */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Datenspeicherung und Löschfristen</h2>
          <p className="mt-2">
            Sämtliche in der App gespeicherten Daten (z. B. Familienprofile, Nachrichten, Chatverläufe) werden ausschliesslich
            für die familiäre und freundschaftliche Nutzung vorgehalten. Drei Monate nach Weihnachten werden alle Daten aus
            der Datenbank gelöscht, um ein sauberes Neuaufsetzen der App für das folgende Jahr zu gewährleisten.
          </p>
          <p className="mt-2">
            Die Löschung erfolgt automatisiert oder manuell durch den Betreiber. Nach der Löschung können Daten nicht wiederhergestellt werden.
          </p>
        </section>

        {/* Datenschutz */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Datenschutzrechtliche Hinweise</h2>
          <p className="mt-2">
            Der Betrieb erfolgt gemäss dem revidierten Schweizer Datenschutzgesetz (FADP). Es werden nur solche
            personenbezogenen Daten verarbeitet, die für die Nutzung der App erforderlich sind. Nutzer haben das
            Recht auf Auskunft, Berichtigung und Löschung ihrer gespeicherten Daten.
          </p>
          <p className="mt-2">
            Anfragen zum Datenschutz können jederzeit an <a href="mailto:datenschutz@familie.ch" className="underline text-yellow-300">wichtelparty4family@gmail.com</a> gerichtet werden.
          </p>
        </section>

        {/* Haftung */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-300">Haftungsausschluss</h2>
          <p className="mt-2">
            Der Betreiber übernimmt keine Haftung für Schäden oder Kosten, die durch fehlerhafte Nutzung der App entstehen.
            Es wird keine Gewähr für die ständige Verfügbarkeit oder fehlerfreie Funktion übernommen. Alle Inhalte werden
            nach bestem Wissen und Gewissen bereitgestellt.
          </p>
        </section>

        {/* Stand */}
        <section>
          <h2 className="text-xl font-semibold text-yellow-300">Stand und Kontakt</h2>
          <p className="mt-2">
            Letzte Aktualisierung: {new Date().toLocaleDateString('de-CH')}<br />
            Kontaktadresse: <a href="mailto:familie@muster.ch" className="underline text-yellow-300">sounsamuel07@gmail.com</a>
          </p>
        </section>

        <div className="border-t border-yellow-400/50 my-6" />

        <div className="flex justify-center">
          <Link
            href="/home"
            className="px-6 py-3 bg-yellow-400 text-red-900 font-semibold rounded-xl shadow-[0_0_20px_#ffbb33] hover:bg-yellow-500 hover:shadow-[0_0_30px_#ffd966] transition"
          >
            Zurück zur Startseite
          </Link>
        </div>

        {/* Versteckter Hinweis */}
        <p className="text-xs text-yellow-200/40 mt-8 text-center italic select-none">
          Hinweis: Teile dieses Impressums wurden mithilfe von ChatGPT formuliert und können inhaltliche oder formale Fehler enthalten.
        </p>
      </div>
    </main>
  )
}
