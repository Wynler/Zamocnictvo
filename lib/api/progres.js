import { supabase } from '../supabase';

/**
 * Načíta progres etapy — % hotových dielcov naprieč všetkými časťami
 * Dielec je "hotový" ak má všetky fázy zaškrtnuté
 */
export async function nacitajProgresEtapy(etapaId) {
  const { data, error } = await supabase
    .from('dielce_casti')
    .select('poskladane, zvarene, povrchova_uprava, vyvezene, namontovane, casti_etapy!inner(etapa_id)')
    .eq('casti_etapy.etapa_id', etapaId);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const hotove = data.filter(dc =>
    dc.poskladane && dc.zvarene && dc.povrchova_uprava && dc.vyvezene && dc.namontovane
  ).length;

  return Math.round((hotove / data.length) * 100);
}

/**
 * Aktualizuje počet ľudí na etape
 */
export async function aktualizujPocetLudi(etapaId, pocetLudi) {
  const { error } = await supabase
    .from('etapy')
    .update({ pocet_ludi: parseInt(pocetLudi) })
    .eq('id', etapaId);

  if (error) throw error;
  return true;
}
