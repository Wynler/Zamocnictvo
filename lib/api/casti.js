import { supabase } from '../supabase';

/**
 * Načíta všetky časti etapy vrátane priradených dielcov
 */
export async function nacitajCastiEtapy(etapaId) {
  const { data: casti, error } = await supabase
    .from('casti_etapy')
    .select('*')
    .eq('etapa_id', etapaId)
    .order('poradie', { ascending: true });

  if (error) throw error;

  const castiSDielcami = await Promise.all(
    (casti || []).map(async (cast) => {
      const { data: dielceCasti, error: err } = await supabase
        .from('dielce_casti')
        .select('*, dielce(*)')
        .eq('cast_id', cast.id);

      if (err) throw err;

      return { ...cast, dielce: dielceCasti || [] };
    })
  );

  return castiSDielcami;
}

/**
 * Vytvorí novú časť etapy s priradenými dielcami
 */
export async function vytvorCast(etapaId, nazov, poradie, priradenia) {
  const { data: novaCast, error } = await supabase
    .from('casti_etapy')
    .insert([{ etapa_id: etapaId, nazov, poradie }])
    .select()
    .single();

  if (error) throw error;

  if (priradenia.length > 0) {
    const { error: errPriradenia } = await supabase
      .from('dielce_casti')
      .insert(
        priradenia.map(p => ({
          cast_id: novaCast.id,
          dielec_id: p.dielec_id,
          mnozstvo: p.mnozstvo
        }))
      );

    if (errPriradenia) throw errPriradenia;
  }

  return novaCast;
}

/**
 * Aktualizuje jeden checkbox stavu dielca v časti
 * pole: 'poskladane' | 'zvarene' | 'povrchova_uprava' | 'vyvezene' | 'namontovane'
 */
export async function aktualizujStavDielcaCasti(dielecCastiId, pole, hodnota) {
  const { error } = await supabase
    .from('dielce_casti')
    .update({ [pole]: hodnota })
    .eq('id', dielecCastiId);

  if (error) throw error;
  return true;
}

/**
 * Vymaže časť etapy (cascade vymaže aj dielce_casti)
 */
export async function vymazCast(castId) {
  const { error } = await supabase
    .from('casti_etapy')
    .delete()
    .eq('id', castId);

  if (error) throw error;
  return true;
}

/**
 * Vypočíta koľko kusov z každého dielca je už zaradených do častí
 */
export async function nacitajZaradenie(etapaId) {
  const { data, error } = await supabase
    .from('dielce_casti')
    .select('dielec_id, mnozstvo, casti_etapy!inner(etapa_id)')
    .eq('casti_etapy.etapa_id', etapaId);

  if (error) throw error;

  const zaradenie = {};
  for (const row of data || []) {
    zaradenie[row.dielec_id] = (zaradenie[row.dielec_id] || 0) + Number(row.mnozstvo);
  }

  return zaradenie;
}
