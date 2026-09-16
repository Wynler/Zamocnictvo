import { pridajPracovneDni, pracovneDniMedzi, neskorsiDatum } from './kalendar';

// Default trvania povrchových úprav v pracovných dňoch. Slúžia len ako
// predvyplnená hodnota — pre konkrétny projekt sa dá vždy prepísať.
export const ZINKOVANIE_DNI = { nic: 0, ponorove: 5, galvanicke: 5 };
export const FARBA_DNI = { nic: 0, praskova: 5, mokra: 3, protipoziar: 7 };
export const PIESKOVANIE_DNI_DEFAULT = 5;

/**
 * Vypočíta celý výrobný reťazec etapy: materiál → výroba → povrchová úprava
 * → montáž, a rezervu oproti termínu od zákazníka.
 *
 * Vstup (etapa) očakáva polia:
 *   datumMaterialu, zelanyStartVyroby, clovekohod, pocetLudi,
 *   zinkovanie, zinkovanieDni, farba, farbaDni, pieskovanie, pieskovanieDni,
 *   montazDni, deadline (termín od zákazníka)
 */
export function vypocitajVyrobnyPlan(etapa) {
  const clovekohod = parseFloat(etapa.clovekohod) || 0;
  const pocetLudi = parseInt(etapa.pocetLudi) || 0;
  const montazDni = parseInt(etapa.montazDni) || 0;

  const zinkovanieDni = etapa.zinkovanieDni != null && etapa.zinkovanieDni !== ''
    ? parseFloat(etapa.zinkovanieDni)
    : (ZINKOVANIE_DNI[etapa.zinkovanie] ?? 0);

  const farbaDni = etapa.farbaDni != null && etapa.farbaDni !== ''
    ? parseFloat(etapa.farbaDni)
    : (FARBA_DNI[etapa.farba] ?? 0);

  const pieskovanieDni = etapa.pieskovanie
    ? (etapa.pieskovanieDni != null && etapa.pieskovanieDni !== '' ? parseFloat(etapa.pieskovanieDni) : PIESKOVANIE_DNI_DEFAULT)
    : 0;

  const povrchDni = zinkovanieDni + farbaDni + pieskovanieDni;
  const trvanieVyroby = clovekohod > 0 && pocetLudi > 0 ? Math.ceil(clovekohod / (pocetLudi * 8)) : 0;

  const startVyroby = neskorsiDatum(etapa.datumMaterialu, etapa.zelanyStartVyroby);
  const posunuteMaterialom = !!(
    etapa.zelanyStartVyroby && etapa.datumMaterialu && etapa.datumMaterialu > etapa.zelanyStartVyroby
  );

  if (!startVyroby || trvanieVyroby === 0) {
    return {
      startVyroby, trvanieVyroby, zinkovanieDni, farbaDni, pieskovanieDni, povrchDni, montazDni,
      posunuteMaterialom,
      koniecVyroby: null, zaciatokPovrchu: null, koniecPovrchu: null,
      zaciatokMontaze: null, koniecMontaze: null, rezervaDni: null
    };
  }

  // pridajPracovneDni(x, N) vráti dátum N pracovných dní PO x (nepočíta x).
  // "Trvanie N dní" ale znamená, že x je prvý z tých N dní — koniec je preto
  // (N-1) pracovných dní po štarte, nie N.
  const koniecVyroby = pridajPracovneDni(startVyroby, trvanieVyroby - 1);
  const zaciatokPovrchu = koniecVyroby;
  const koniecPovrchu = povrchDni > 0 ? pridajPracovneDni(zaciatokPovrchu, povrchDni - 1) : zaciatokPovrchu;
  const zaciatokMontaze = koniecPovrchu;
  const koniecMontaze = montazDni > 0 ? pridajPracovneDni(zaciatokMontaze, montazDni - 1) : zaciatokMontaze;

  const rezervaDni = etapa.deadline ? pracovneDniMedzi(koniecMontaze, etapa.deadline) : null;

  return {
    startVyroby, trvanieVyroby, zinkovanieDni, farbaDni, pieskovanieDni, povrchDni, montazDni,
    posunuteMaterialom,
    koniecVyroby, zaciatokPovrchu, koniecPovrchu, zaciatokMontaze, koniecMontaze, rezervaDni
  };
}
