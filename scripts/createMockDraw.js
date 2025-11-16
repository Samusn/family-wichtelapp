/**
 * Test Script: Secret Santa Ziehung für alle Nutzer (JavaScript)
 * 
 * Voraussetzungen:
 * 1. Node.js installiert
 * 2. Firebase Admin SDK installiert:
 *    npm install firebase-admin
 * 3. Service Account Key JSON im Projektordner (serviceAccountKey.json)
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Hilfsfunktion: zufälliges Element aus Array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runTestDraw() {
  // 1️⃣ Alle User laden
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.role === 'user');

  // 2️⃣ Alle bisher gezogenen Namen laden
  const drawnSnap = await db.collection('drawnNames').get();
  const takenNames = drawnSnap.docs.map(d => d.id);

  for (const user of users) {
    // User hat schon gezogen?
    const userDrawRef = db.collection('draws').doc(user.id);
    const userDrawSnap = await userDrawRef.get();
    const drawnNames = userDrawSnap.data()?.drawnNames || [];

    if (drawnNames.length > 0) {
      console.log(`${user.name} hat bereits gezogen: ${drawnNames[0]}`);
      continue;
    }

    // Verfügbare Teilnehmer: nicht der eigene Name & noch nicht gezogen
    const available = users
      .filter(u => u.id !== user.id)
      .filter(u => !takenNames.includes(u.name));

    if (available.length === 0) {
      console.log(`Keine verfügbaren Teilnehmer für ${user.name}`);
      continue;
    }

    const random = getRandom(available);

    // 3️⃣ Transaction: atomar speichern
    await db.runTransaction(async (transaction) => {
      const globalRef = db.collection('drawnNames').doc(random.name);
      const globalSnap = await transaction.get(globalRef);

      if (globalSnap.exists) {
        throw new Error(`Name ${random.name} wurde schon gezogen!`);
      }

      // Global speichern
      transaction.set(globalRef, { userId: user.id, timestamp: admin.firestore.FieldValue.serverTimestamp() });

      // User-spezifisch speichern
      transaction.set(userDrawRef, { drawnNames: [random.name] }, { merge: true });
    });

    // Name merken, damit keine doppelten gezogen werden
    takenNames.push(random.name);
    console.log(`${user.name} zieht -> ${random.name}`);
  }

  console.log('🎄 Test-Ziehung abgeschlossen!');
}

// Script ausführen
runTestDraw().catch(console.error);
