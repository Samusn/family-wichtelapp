/**
 * Prüft Secret Santa Ziehungen
 * - Wer hat noch nicht gezogen?
 * - Wurde jemand doppelt gezogen?
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDraws() {
  // 1️⃣ Alle User laden
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.role === 'user');

  // 2️⃣ Alle User-Ziehungen laden
  const drawsSnap = await db.collection('draws').get();
  const userDraws = drawsSnap.docs.map(d => ({
    userId: d.id,
    drawnNames: d.data().drawnNames || []
  }));

  // 3️⃣ Wer hat noch nicht gezogen?
  const notDrawn = users
    .filter(u => !userDraws.some(d => d.userId === u.id && d.drawnNames.length > 0))
    .map(u => u.name);

  console.log('👀 User, die noch nicht gezogen haben:');
  if (notDrawn.length === 0) {
    console.log('✅ Alle haben gezogen!');
  } else {
    console.log(notDrawn.join(', '));
  }

  // 4️⃣ Prüfen, ob jemand doppelt gezogen wurde
  const allDrawn = userDraws.flatMap(d => d.drawnNames);
  const duplicates = allDrawn.filter((name, index, arr) => arr.indexOf(name) !== index);

  console.log('\n🔍 Doppelte Ziehungen:');
  if (duplicates.length === 0) {
    console.log('✅ Keine doppelten Ziehungen gefunden.');
  } else {
    console.log(duplicates.join(', '));
  }
}

// Script ausführen
checkDraws().catch(console.error);
