/**
 * Neue Ziehung für alle User mit folgenden Regeln:
 * - Keine Person darf mehrmals gezogen werden
 * - Keine Person darf sich selbst ziehen
 * - Keine Person darf die Person vom letzten Jahr nochmals ziehen
 * - Darun, Dara, Sreipou, Alex, Silvan behalten ihre jetzigen Lose
 * 
 * ZUERST NUR LESEN UND AUSGEBEN - NACH BESTÄTIGUNG ERST AUSFÜHREN!
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key
const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Letztes Jahr Ziehungen laden
const lastYearDraws = JSON.parse(fs.readFileSync('lastYearDraws.json', 'utf8')).lastYearDraws;

// Personen, die ihre Lose behalten sollen
const KEEP_DRAWS = ['Darun', 'Dara', 'Sreipou', 'Alex', 'Silvan'];

// Hilfsfunktion: Array mischen (Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Backtracking Algorithmus für Zuweisung
function assignDraws(users, keepDraws, lastYearDraws) {
  const assignments = {};
  const taken = new Set();
  
  // Zuerst die Personen, die ihre Lose behalten sollen
  const keepUsers = users.filter(u => keepDraws.includes(u.name));
  const otherUsers = users.filter(u => !keepDraws.includes(u.name));
  
  // Aktuelle Draws für die Keep-User beibehalten
  for (const user of keepUsers) {
    if (user.currentDraw) {
      assignments[user.name] = user.currentDraw;
      taken.add(user.currentDraw);
    }
  }
  
  // Shuffle andere User für bessere Zufälligkeit
  const shuffledUsers = shuffleArray(otherUsers);
  
  // Backtracking Funktion
  function backtrack(index) {
    if (index >= shuffledUsers.length) {
      return true; // Alle zugewiesen
    }
    
    const user = shuffledUsers[index];
    const available = users
      .filter(u => 
        u.name !== user.name && // Nicht sich selbst
        !taken.has(u.name) && // Noch nicht vergeben
        (!lastYearDraws[user.name] || lastYearDraws[user.name] !== u.name) // Nicht letztes Jahr
      )
      .map(u => u.name);
    
    // Shuffle verfügbare Optionen für Zufälligkeit
    const shuffledAvailable = shuffleArray(available);
    
    for (const target of shuffledAvailable) {
      assignments[user.name] = target;
      taken.add(target);
      
      if (backtrack(index + 1)) {
        return true;
      }
      
      // Backtrack
      taken.delete(target);
      delete assignments[user.name];
    }
    
    return false;
  }
  
  if (backtrack(0)) {
    return assignments;
  }
  
  return null; // Keine Lösung gefunden
}

async function redrawAll(dryRun = true) {
  console.log('\n🎄 === NEUE ZIEHUNG VORBEREITEN ===\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODUS - Keine Änderungen werden vorgenommen!\n');
  }
  
  // 1️⃣ Alle User laden
  console.log('📋 Lade alle User...');
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs
    .map(d => ({ id: d.id, name: d.data().name, role: d.data().role }))
    .filter(u => u.name && u.role === 'user');
  
  console.log(`   ✅ ${users.length} User gefunden\n`);
  
  // 2️⃣ Aktuelle Draws laden
  console.log('📋 Lade aktuelle Draws...');
  const drawsSnap = await db.collection('draws').get();
  const currentDraws = {};
  drawsSnap.docs.forEach(doc => {
    const data = doc.data();
    const drawnNames = data.drawnNames || [];
    if (drawnNames.length > 0) {
      const userName = users.find(u => u.id === doc.id)?.name;
      if (userName) {
        currentDraws[userName] = drawnNames[0];
      }
    }
  });
  
  // User mit aktuellen Draws erweitern
  const usersWithDraws = users.map(u => ({
    ...u,
    currentDraw: currentDraws[u.name] || null
  }));
  
  console.log(`   ✅ ${Object.keys(currentDraws).length} aktuelle Draws gefunden\n`);
  
  // 3️⃣ Personen, die ihre Lose behalten sollen
  const keepUsers = usersWithDraws.filter(u => KEEP_DRAWS.includes(u.name));
  const keepUsersWithDraws = keepUsers.filter(u => u.currentDraw).length;
  console.log(`🔒 ${keepUsers.length} Personen sollen ihre Lose behalten (${keepUsersWithDraws} haben bereits Lose)\n`);
  
  // 4️⃣ Neue Zuweisungen berechnen
  console.log('🎲 Berechne neue Zuweisungen...\n');
  const newAssignments = assignDraws(usersWithDraws, KEEP_DRAWS, lastYearDraws);
  
  if (!newAssignments) {
    console.log('❌ FEHLER: Keine gültige Zuweisung möglich!');
    console.log('   Mögliche Gründe:');
    console.log('   - Zu viele Einschränkungen');
    console.log('   - Zu viele Personen behalten ihre Lose');
    console.log('   - Letztes Jahr Ziehungen blockieren zu viele Optionen\n');
    return;
  }
  
  // 5️⃣ Zähle Änderungen (ohne Details auszugeben)
  const changed = [];
  const unchanged = [];
  
  for (const user of users) {
    const oldDraw = currentDraws[user.name] || null;
    const newDraw = newAssignments[user.name];
    
    if (oldDraw === newDraw) {
      unchanged.push({ user: user.name, draw: newDraw });
    } else {
      changed.push({ user: user.name, old: oldDraw, new: newDraw });
    }
  }
  
  // 6️⃣ Validierung
  console.log('🔍 === VALIDIERUNG ===\n');
  
  // Prüfe: Jeder nur einmal gezogen?
  const drawnCounts = {};
  Object.values(newAssignments).forEach(name => {
    drawnCounts[name] = (drawnCounts[name] || 0) + 1;
  });
  const duplicates = Object.entries(drawnCounts).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log('❌ FEHLER: Personen wurden mehrmals gezogen:');
    duplicates.forEach(([name, count]) => {
      console.log(`   ${name}: ${count} mal`);
    });
    console.log('');
  } else {
    console.log('✅ Jede Person wurde genau einmal gezogen\n');
  }
  
  // Prüfe: Hat sich jemand selbst gezogen?
  const selfDraws = Object.entries(newAssignments).filter(([user, draw]) => user === draw);
  if (selfDraws.length > 0) {
    console.log('❌ FEHLER: Personen haben sich selbst gezogen:');
    selfDraws.forEach(([user]) => {
      console.log(`   ${user}`);
    });
    console.log('');
  } else {
    console.log('✅ Niemand hat sich selbst gezogen\n');
  }
  
  // Prüfe: Letztes Jahr wiederholt?
  const lastYearRepeats = Object.entries(newAssignments).filter(
    ([user, draw]) => lastYearDraws[user] === draw
  );
  if (lastYearRepeats.length > 0) {
    console.log(`❌ FEHLER: ${lastYearRepeats.length} Wiederholung(en) vom letzten Jahr gefunden\n`);
  } else {
    console.log('✅ Keine Wiederholungen vom letzten Jahr\n');
  }
  
  // Prüfe: Keep-User behalten ihre Lose?
  const keepViolations = keepUsers.filter(u => {
    if (!u.currentDraw) return false; // Hatte kein Los, kann nicht verletzt werden
    return newAssignments[u.name] !== u.currentDraw;
  });
  if (keepViolations.length > 0) {
    console.log(`❌ FEHLER: ${keepViolations.length} Keep-User haben andere Lose bekommen\n`);
  } else {
    console.log('✅ Alle Keep-User behalten ihre Lose\n');
  }
  
  // 7️⃣ Zusammenfassung
  console.log('📈 === ZUSAMMENFASSUNG ===\n');
  console.log(`   Gesamt User: ${users.length}`);
  console.log(`   Neue Zuweisungen: ${changed.length}`);
  console.log(`   Beibehaltene Zuweisungen: ${unchanged.length}`);
  console.log(`   Keep-User: ${keepUsers.length}`);
  console.log('');
  
  // Prüfe ob alle Validierungen bestanden
  const allValid = duplicates.length === 0 && 
                   selfDraws.length === 0 && 
                   lastYearRepeats.length === 0 && 
                   keepViolations.length === 0;
  
  if (!allValid) {
    console.log('❌ === VALIDIERUNG FEHLGESCHLAGEN ===\n');
    console.log('Die Ziehung wurde nicht durchgeführt, da nicht alle Anforderungen erfüllt wurden.\n');
    return;
  }
  
  console.log('✅ === ALLE ANFORDERUNGEN ERFÜLLT ===\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODUS - Keine Änderungen wurden vorgenommen!\n');
  } else {
    console.log('🚀 === FÜHRE ÄNDERUNGEN DURCH ===\n');
    
    // Alle Draws und drawnNames löschen
    console.log('🗑️  Lösche alte Draws...');
    const batch = db.batch();
    
    // Lösche alle draws
    const allDraws = await db.collection('draws').get();
    allDraws.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Lösche alle drawnNames
    const allDrawnNames = await db.collection('drawnNames').get();
    allDrawnNames.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('   ✅ Alte Draws gelöscht\n');
    
    // Neue Draws speichern
    console.log('💾 Speichere neue Draws...');
    const newBatch = db.batch();
    
    for (const user of users) {
      const drawnName = newAssignments[user.name];
      
      // User-spezifisch speichern
      const userDrawRef = db.collection('draws').doc(user.id);
      newBatch.set(userDrawRef, { drawnNames: [drawnName] });
      
      // Global speichern
      const globalDrawRef = db.collection('drawnNames').doc(drawnName);
      newBatch.set(globalDrawRef, { 
        userId: user.id, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
    }
    
    await newBatch.commit();
    console.log('   ✅ Neue Draws gespeichert\n');
    
    console.log('✅ === FERTIG ===\n');
  }
}

// Script ausführen
redrawAll(false).catch(console.error);

