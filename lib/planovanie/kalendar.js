// Čisté funkcie na prácu s pracovnými dňami (bez Supabase).
// Zatiaľ berie do úvahy len víkendy — sviatky SR pribudnú neskôr.

export function jePracovny(datum) {
  const d = new Date(datum);
  const den = d.getDay();
  return den !== 0 && den !== 6;
}

/**
 * Pridá k dátumu daný počet pracovných dní.
 */
export function pridajPracovneDni(datumStr, pocetDni) {
  if (!datumStr || !pocetDni || pocetDni <= 0) return datumStr || null;
  const d = new Date(datumStr);
  let zostava = pocetDni;
  while (zostava > 0) {
    d.setDate(d.getDate() + 1);
    if (jePracovny(d)) zostava--;
  }
  return d.toISOString().split('T')[0];
}

/**
 * Počet pracovných dní medzi dvoma dátumami — znamienkový.
 * Kladné číslo = doDatum je za odDatum (rezerva), záporné = pred (meškanie).
 */
export function pracovneDniMedzi(odStr, doStr) {
  if (!odStr || !doStr) return null;
  const od = new Date(odStr);
  const dokedy = new Date(doStr);
  od.setHours(0, 0, 0, 0);
  dokedy.setHours(0, 0, 0, 0);
  if (od.getTime() === dokedy.getTime()) return 0;

  const smer = dokedy > od ? 1 : -1;
  let pocet = 0;
  const d = new Date(od);
  while (d.getTime() !== dokedy.getTime()) {
    d.setDate(d.getDate() + smer);
    if (jePracovny(d)) pocet += smer;
  }
  return pocet;
}

/**
 * Neskorší z dvoch dátumov (ignoruje prázdne hodnoty).
 */
export function neskorsiDatum(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  return a >= b ? a : b;
}
