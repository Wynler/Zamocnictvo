import { supabase } from '../supabase';

/**
 * Pridá novú etapu k zákazke
 */
export async function pridajEtapu(zakazkaId, etapa) {
  console.log('🟡 API: Pridávam etapu k zákazke', zakazkaId);
  
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
      stav: etapa.stav
    }]);
    
    if (error) throw error;
    
    console.log('✅ API: Etapa pridaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri pridávaní etapy:', error);
    throw error;
  }
}

/**
 * Aktualizuje etapu
 */
export async function aktualizujEtapu(etapaId, etapa) {
  console.log('🟡 API: Aktualizujem etapu', etapaId);
  
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
      popis: etapa.popis
    }).eq('id', etapaId);
    
    if (error) throw error;
    
    console.log('✅ API: Etapa aktualizovaná');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii etapy:', error);
    throw error;
  }
}

/**
 * Zmení stav etapy
 */
export async function zmenStavEtapy(etapaId, novyStav) {
  console.log('🟡 API: Mením stav etapy', etapaId, '→', novyStav);
  
  try {
    const { error } = await supabase
      .from('etapy')
      .update({ stav: novyStav })
      .eq('id', etapaId);
    
    if (error) throw error;
    
    console.log('✅ API: Stav etapy zmenený');
    return true;
    
  } catch (error) {
    console.error('❌ API: Chyba pri zmene stavu etapy:', error);
    throw error;
  }
}
