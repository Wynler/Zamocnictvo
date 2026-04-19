import { supabase } from '../supabase';

/**
 * Načíta všetky aktívne zákazky s etapami a ich progres výroby
 * Progres = % dielcov kde poskladane=true AND zvarene=true
 */
export async function nacitajTimelineData() {
  const { data: zakazky, error: zErr } = await supabase
    .from('zakazky')
    .select('id, nazov, stav')
    .neq('stav', 'vymazane')
    .order('created_at', { ascending: false });

  if (zErr) throw zErr;

  const result = await Promise.all((zakazky || []).map(async (z) => {
    const { data: etapy, error: eErr } = await supabase
      .from('etapy')
      .select('id, nazov, stav, datum_zaciatku, deadline, clovekohod, pocet_ludi')
      .eq('zakazka_id', z.id)
      .order('created_at', { ascending: true });

    if (eErr) throw eErr;

    const etapyData = await Promise.all((etapy || []).map(async (e) => {
      if (!e.datum_zaciatku || !e.deadline) {
        return { ...e, progresVyroby: null };
      }

      // Načítaj dielce_casti pre túto etapu
      const { data: dielce, error: dErr } = await supabase
        .from('dielce_casti')
        .select('poskladane, zvarene, casti_etapy!inner(etapa_id)')
        .eq('casti_etapy.etapa_id', e.id);

      if (dErr) throw dErr;

      if (!dielce || dielce.length === 0) {
        return { ...e, progresVyroby: 0 };
      }

      const hotove = dielce.filter(d => d.poskladane && d.zvarene).length;
      const progres = Math.round((hotove / dielce.length) * 100);

      return { ...e, progresVyroby: progres };
    }));

    return { ...z, etapy: etapyData };
  }));

  return result;
}
