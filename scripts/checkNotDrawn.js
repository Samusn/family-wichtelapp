/**
 * Prüft welche Person noch nicht gezogen wurde
 * NUR LESEN - keine Änderungen!
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkNotDrawn() {
  // 1️⃣ Alle User laden
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs
    .map(d => ({ id: d.id, name: d.data().name, role: d.data().role }))
    .filter(u => u.name && u.role === 'user'); // Nur normale User

  const allUserNames = users.map(u => u.name);

  // 2️⃣ Alle gezogenen Namen aus der 'drawnNames' Collection laden
  const drawnNamesSnap = await db.collection('drawnNames').get();
  const drawnNames = drawnNamesSnap.docs.map(d => d.id);

  // 3️⃣ Alternativ: Auch aus 'draws' Collection prüfen
  const drawsSnap = await db.collection('draws').get();
  const drawnFromDraws = drawsSnap.docs
    .flatMap(d => d.data().drawnNames || [])
    .filter(Boolean);

  // Alle gezogenen Namen kombinieren (ohne Duplikate)
  const allDrawnNames = [...new Set([...drawnNames, ...drawnFromDraws])];

  // 4️⃣ Personen finden, die noch nicht gezogen wurden
  const notDrawn = allUserNames.filter(name => !allDrawnNames.includes(name));

  console.log('\n📋 Übersicht:');
  console.log(`   Gesamt User: ${allUserNames.length}`);
  console.log(`   Bereits gezogen: ${allDrawnNames.length}`);
  console.log(`   Noch nicht gezogen: ${notDrawn.length}\n`);

  console.log('👤 Personen, die noch NICHT gezogen wurden:');
  if (notDrawn.length === 0) {
    console.log('✅ Alle Personen wurden bereits gezogen!');
  } else {
    notDrawn.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
  }

  console.log('\n✅ Script abgeschlossen (nur gelesen, keine Änderungen)\n');
}

// Script ausführen
checkNotDrawn().catch(console.error);

