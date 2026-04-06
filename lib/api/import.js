import { supabase } from '../supabase';
import * as XLSX from 'xlsx';

// ============================================
// IMPORT VYKAZ_DIELCOV
// ============================================
export async function importujVykazDielcov(file, etapaId) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Preskočíme header (riadok 0) a prázdne riadky
  const dielce = [];
  for (const row of rows.slice(1)) {
    const cisloDielca = row[0];
    
    // Preskočíme prázdne riadky a "5% REZERVA"
    if (!cisloDielca || typeof cisloDielca !== 'string' || cisloDielca.includes('REZERVA')) continue;

    dielce.push({
      etapa_id: etapaId,
      cislo_dielca: String(row[0]),
      mnozstvo: row[1] || 1,
      nazov: row[2] || '',
      profil: row[3] || null,
      material: row[4] || null,
      celkova_plocha: row[5] || null,
      hmotnost_jedneho_ks: row[6] || null,
      hmotnost_celkova: row[7] || null,
      jednotka: 'ks',
    });
  }

  const { error } = await supabase.from('dielce').insert(dielce);
  if (error) throw error;

  return dielce.length;
}

// ============================================
// IMPORT VYKAZ_KUSOVNIK
// ============================================
export async function importujKusovnik(file, etapaId) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let aktualnyDielecId = null;
  let celkomDielcov = 0;
  let celkomPoloziek = 0;

  for (const row of rows) {
    const prvaBunka = row[0];
    const druhaBunka = row[1];

    // Prázdny riadok — preskočíme
    if (!prvaBunka && !druhaBunka) continue;

    // Header riadok kusovníka — preskočíme
    if (prvaBunka === 'Dílec') continue;

    // Riadok dielca — prvá bunka obsahuje kód (A1, A2...)
    if (prvaБunka && !druhaBunka && typeof prvaBunka === 'string' && !prvaBunka.includes('REZERVA')) {
      const { data: novyDielec, error } = await supabase
        .from('dielce')
        .insert([{
          etapa_id: etapaId,
          cislo_dielca: String(prvaBunka),
          mnozstvo: row[2] || 1,
          hmotnost_jedneho_ks: row[7] || null,
          hmotnost_celkova: row[8] || null,
          nazov: '',
          jednotka: 'ks',
        }])
        .select()
        .single();

      if (error) throw error;
      aktualnyDielecId = novyDielec.id;
      celkomDielcov++;
      continue;
    }

    // Riadok materiálovej položky — prvá bunka je null, druhá je kód položky
    if (!prvaBunka && druhaBunka && aktualnyDielecId) {
      const { error } = await supabase
        .from('polozky_kusovnika')
        .insert([{
          dielec_id: aktualnyDielecId,
          polozka: String(druhaBunka),
          pocet: row[2] || null,
          profil: row[3] || null,
          norma: row[4] || null,
          material: row[5] || null,
          dlzka_mm: row[6] || null,
          hmotnost_1ks: row[7] || null,
          hmotnost_celkova: row[8] || null,
          poznamka: row[9] || null,
        }]);

      if (error) throw error;
      celkomPoloziek++;
    }
  }

  return { celkomDielcov, celkomPoloziek };
}
