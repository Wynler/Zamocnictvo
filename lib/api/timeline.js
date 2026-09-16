import { supabase } from '../supabase';
import { naplanujCasti } from '../planovanie/vyrobaCasti';

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

/**
 * Načíta harmonogram výroby na úrovni častí naprieč všetkými zákazkami.
 * Časti sa v rámci etapy plánujú sekvenčne, s dobou trvania podľa pomeru
 * hmotnosti dielcov v časti oproti celkovej hmotnosti etapy.
 */
export async function nacitajTimelineVyroby() {
  const { data: etapy, error: eErr } = await supabase
    .from('etapy')
    .select('id, nazov, clovekohod, pocet_ludi, datum_vyroby_od, datum_povrchovej_upravy_od, zinkovanie_dni, farba_dni, pieskovanie_dni, zakazky!inner(nazov, stav), dielce(mnozstvo, hmotnost_jedneho_ks)')
    .neq('zakazky.stav', 'vymazane');

  if (eErr) throw eErr;

  const etapaIds = (etapy || []).map(e => e.id);
  if (etapaIds.length === 0) return { riadky: [], kapacita: {} };

  const { data: casti, error: cErr } = await supabase
    .from('casti_etapy')
    .select('id, etapa_id, nazov, poradie, pocet_ludi, start_override')
    .in('etapa_id', etapaIds)
    .order('poradie', { ascending: true });

  if (cErr) throw cErr;

  const castIds = (casti || []).map(c => c.id);

  let dielceCasti = [];
  if (castIds.length > 0) {
    const { data, error } = await supabase
      .from('dielce_casti')
      .select('cast_id, mnozstvo, dielce(hmotnost_jedneho_ks)')
      .in('cast_id', castIds);

    if (error) throw error;
    dielceCasti = data || [];
  }

  const hmotnostCasti = {};
  for (const dc of dielceCasti) {
    const h = (dc.dielce?.hmotnost_jedneho_ks || 0) * Number(dc.mnozstvo || 0);
    hmotnostCasti[dc.cast_id] = (hmotnostCasti[dc.cast_id] || 0) + h;
  }

  const riadky = [];
  for (const etapa of etapy) {
    const sumaHmotnostiEtapy = (etapa.dielce || []).reduce(
      (s, d) => s + (d.hmotnost_jedneho_ks || 0) * Number(d.mnozstvo || 0), 0
    );

    const castiEtapy = (casti || [])
      .filter(c => c.etapa_id === etapa.id)
      .map(c => ({
        id: c.id,
        nazov: c.nazov,
        poradie: c.poradie,
        pocetLudi: c.pocet_ludi,
        startOverride: c.start_override,
        hmotnost: hmotnostCasti[c.id] || 0
      }));

    if (castiEtapy.length === 0) continue;

    const naplanovane = naplanujCasti(castiEtapy, {
      etapaClovekohod: etapa.clovekohod,
      sumaHmotnostiEtapy,
      etapaPocetLudi: etapa.pocet_ludi,
      etapaStart: etapa.datum_vyroby_od
    });

    const etapaPovrchDni = (etapa.zinkovanie_dni || 0) + (etapa.farba_dni || 0) + (etapa.pieskovanie_dni || 0);

    for (const c of naplanovane) {
      riadky.push({
        castId: c.id,
        castNazov: c.nazov,
        etapaId: etapa.id,
        etapaNazov: etapa.nazov,
        zakazkaNazov: etapa.zakazky?.nazov,
        etapaPovrchOd: etapa.datum_povrchovej_upravy_od,
        etapaPovrchDni,
        poradie: c.poradie,
        pocetLudi: c.pocetLudi,
        startOverride: c.startOverride,
        hodiny: c.hodiny,
        dni: c.dni,
        start: c.start,
        koniec: c.koniec,
        blokovane: c.blokovane
      });
    }
  }

  const { data: kapData, error: kErr } = await supabase
    .from('kapacita_dielne')
    .select('datum, pocet_ludi');

  if (kErr) throw kErr;

  const kapacita = {};
  for (const row of kapData || []) kapacita[row.datum] = row.pocet_ludi;

  return { riadky, kapacita };
}

