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

  const dielce = [];
  for (const row of rows.slice(1)) {
    const cisloDielca = row[0];
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
  const polozkyBuffer = [];

  for (const row of rows) {
    const prvaBunka = row[0];
    const druhaBunka = row[1];

    if (!prvaBunka && !druhaBunka) continue;
    if (prvaBunka === 'Dílec') continue;

    // Riadok dielca — prvá bunka obsahuje kód (A1, A2...)
    if (prvaBunka && !druhaBunka && typeof prvaBunka === 'string' && !prvaBunka.includes('REZERVA')) {

      // Pred vytvorením nového dielca — ulož buffered položky predošlého
      if (polozkyBuffer.length > 0) {
        const { error } = await supabase.from('polozky_kusovnika').insert(polozkyBuffer);
        if (error) throw error;
        celkomPoloziek += polozkyBuffer.length;
        polozkyBuffer.length = 0;
      }

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

    // Materiálová položka — pridaj do buffera
    if (!prvaBunka && druhaBunka && aktualnyDielecId) {
      polozkyBuffer.push({
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
      });
    }
  }

  // Ulož zvyšné položky posledného dielca
  if (polozkyBuffer.length > 0) {
    const { error } = await supabase.from('polozky_kusovnika').insert(polozkyBuffer);
    if (error) throw error;
    celkomPoloziek += polozkyBuffer.length;
  }

  return { celkomDielcov, celkomPoloziek };
}
