import { supabase } from '../supabase';

export async function pridajEtapu(zakazkaId, etapa) {
  try {
    const { error } = await supabase.from('etapy').insert([{
      zakazka_id: zakazkaId,
      nazov: etapa.nazov,
      kontaktna_osoba: etapa.kontaktnaOsoba,
      telefon: etapa.telefon,
      email: etapa.email,
      hmotnost_podla_vykazu: etapa.hmotnostPodlaVykazu || null,
      datum_ukoncenia: etapa.datumUkoncenia || null,
      datum_vyroby_od: etapa.datumVyrobyOd || null,
      datum_vyroby_do: etapa.datumVyrobyDo || null,
      datum_povrchovej_upravy_od: etapa.datumPovrchovejUpravyOd || null,
      datum_povrchovej_upravy_do: etapa.datumPovrchovejUpravyDo || null,
      datum_montaze_od: etapa.datumMontazeOd || null,
      datum_montaze_do: etapa.datumMontazeDo || null,
      zinkovanie: etapa.zinkovanie,
      farba: etapa.farba,
      farba_ton: etapa.farbaTon,
      popis: etapa.popis,
      stav: etapa.stav,
      // Nové timeline polia
      datum_zaciatku: etapa.datumZaciatku || null,
      deadline: etapa.deadline || null,
      clovekohod: etapa.clovekohod ? parseFloat(etapa.clovekohod) : null,
      pocet_ludi: etapa.pocetLudi ? parseInt(etapa.pocetLudi) : null,
    }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ API: Chyba pri pridávaní etapy:', error);
    throw error;
  }
}

export async function aktualizujEtapu(etapaId, etapa) {
  try {
    const { error } = await supabase.from('etapy').update({
      nazov: etapa.nazov,
      kontaktna_osoba: etapa.kontaktnaOsoba,
      telefon: etapa.telefon,
      email: etapa.email,
      hmotnost_podla_vykazu: etapa.hmotnostPodlaVykazu || null,
      datum_ukoncenia: etapa.datumUkoncenia || null,
      datum_vyroby_od: etapa.datumVyrobyOd || null,
      datum_vyroby_do: etapa.datumVyrobyDo || null,
      datum_povrchovej_upravy_od: etapa.datumPovrchovejUpravyOd || null,
      datum_povrchovej_upravy_do: etapa.datumPovrchovejUpravyDo || null,
      datum_montaze_od: etapa.datumMontazeOd || null,
      datum_montaze_do: etapa.datumMontazeDo || null,
      zinkovanie: etapa.zinkovanie,
      farba: etapa.farba,
      farba_ton: etapa.farbaTon,
      popis: etapa.popis,
      // Nové timeline polia
      datum_zaciatku: etapa.datumZaciatku || null,
      deadline: etapa.deadline || null,
      clovekohod: etapa.clovekohod ? parseFloat(etapa.clovekohod) : null,
      pocet_ludi: etapa.pocetLudi ? parseInt(etapa.pocetLudi) : null,
    }).eq('id', etapaId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii etapy:', error);
    throw error;
  }
}

export async function zmenStavEtapy(etapaId, novyStav) {
  try {
    const { error } = await supabase
      .from('etapy')
      .update({ stav: novyStav })
      .eq('id', etapaId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ API: Chyba pri zmene stavu etapy:', error);
    throw error;
  }
}
