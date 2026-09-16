import { supabase } from '../supabase';

/**
 * Načíta všetky uložené výnimky kapacity dielne (deň → počet ľudí).
 * Dni bez záznamu používajú v appke predvolenú hodnotu.
 */
export async function nacitajKapacitu() {
  const { data, error } = await supabase
    .from('kapacita_dielne')
    .select('datum, pocet_ludi');

  if (error) throw error;

  const mapa = {};
  for (const row of data || []) {
    mapa[row.datum] = row.pocet_ludi;
  }
  return mapa;
}

/**
 * Nastaví (alebo prepíše) kapacitu pre konkrétny deň.
 */
export async function nastavKapacitu(datum, pocetLudi) {
  const { error } = await supabase
    .from('kapacita_dielne')
    .upsert({ datum, pocet_ludi: pocetLudi }, { onConflict: 'datum' });

  if (error) throw error;
  return true;
}
