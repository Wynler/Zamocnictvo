import { supabase } from '../supabase';

/**
 * Načíta zoznam položiek kusovníka pre konkrétnu časť etapy
 * Agreguje rovnaké položky (profil + dĺžka + materiál) dohromady
 * Množstvo = polozka.pocet × počet kusov dielca v tejto časti
 */
export async function nacitajMaterialCasti(castId) {
  // 1. Načítame dielce v tejto časti
  const { data: dielceCasti, error: errDC } = await supabase
    .from('dielce_casti')
    .select('dielec_id, mnozstvo')
    .eq('cast_id', castId);

  if (errDC) throw errDC;
  if (!dielceCasti || dielceCasti.length === 0) return { tyc: [], platne: [] };

  // 2. Pre každý dielec načítame položky kusovníka
  const vsetkyPolozky = [];

  for (const dc of dielceCasti) {
    const { data: polozky, error: errP } = await supabase
      .from('polozky_kusovnika')
      .select('*')
      .eq('dielec_id', dc.dielec_id);

    if (errP) throw errP;

    for (const p of polozky || []) {
      vsetkyPolozky.push({
        polozka: p.polozka,
        profil: p.profil,
        material: p.material,
        dlzka_mm: p.dlzka_mm,
        hmotnost_1ks: p.hmotnost_1ks,
        // Množstvo = počet ks položky × počet dielcov v časti
        pocet: (p.pocet || 1) * dc.mnozstvo,
        hmotnost_celkova: (p.hmotnost_celkova || 0) * dc.mnozstvo,
      });
    }
  }

  // 3. Agregujeme podľa profil + dlzka_mm + material
  const agregovane = {};
  for (const p of vsetkyPolozky) {
    const kluc = `${p.profil}__${p.dlzka_mm}__${p.material}`;
    if (agregovane[kluc]) {
      agregovane[kluc].pocet += p.pocet;
      agregovane[kluc].hmotnost_celkova += p.hmotnost_celkova;
    } else {
      agregovane[kluc] = { ...p };
    }
  }

  const zoznam = Object.values(agregovane);

  // 4. Rozdelíme na platne (PL) a tyčový materiál
  const platne = zoznam
    .filter(p => p.profil?.toUpperCase().startsWith('PL'))
    .sort((a, b) => (a.profil || '').localeCompare(b.profil || ''));

  const tyc = zoznam
    .filter(p => !p.profil?.toUpperCase().startsWith('PL'))
    .sort((a, b) => (a.profil || '').localeCompare(b.profil || ''));

  return { tyc, platne };
}
