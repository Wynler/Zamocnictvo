import { pridajPracovneDni } from './kalendar';

/**
 * Rozvrhne časti jednej etapy sekvenčne (idú cez tú istú čatu ľudí, jedna za druhou).
 *
 * casti: [{ id, nazov, poradie, pocetLudi, hmotnost, startOverride }] — zoradené podľa poradia.
 * hodiny na časť = etapaClovekohod × (hmotnost časti / súčet hmotnosti všetkých dielcov etapy).
 * dni na časť = hodiny / (pocetLudi × 8), zaokrúhlené nahor.
 * Ak je pocetLudi 0, časť je "blokovaná" (nemá koniec) a bez vlastného startOverride
 * ňou zostáva blokovaná aj celý zvyšok reťazca za ňou.
 */
export function naplanujCasti(casti, { etapaClovekohod, sumaHmotnostiEtapy, etapaPocetLudi, etapaStart }) {
  let predchadzajuciKoniec = etapaStart || null;
  const vysledok = [];

  for (const c of casti) {
    const pocetLudi = (c.pocetLudi != null ? c.pocetLudi : etapaPocetLudi) || 0;
    const podiel = sumaHmotnostiEtapy > 0 ? (c.hmotnost / sumaHmotnostiEtapy) : 0;
    const hodiny = (parseFloat(etapaClovekohod) || 0) * podiel;
    const dni = pocetLudi > 0 ? Math.ceil(hodiny / (pocetLudi * 8)) : null;

    const start = c.startOverride || predchadzajuciKoniec;
    const blokovane = dni === null || !start;
    const koniec = !blokovane ? pridajPracovneDni(start, dni) : null;

    vysledok.push({ ...c, pocetLudi, hodiny, dni, start, koniec, blokovane });

    predchadzajuciKoniec = koniec;
  }

  return vysledok;
}
