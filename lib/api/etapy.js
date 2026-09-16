import { supabase } from '../supabase';
import { vypocitajVyrobnyPlan } from '../planovanie/vyrobnyPlan';

function zostavPayload(etapa) {
  const plan = vypocitajVyrobnyPlan(etapa);

  return {
    nazov: etapa.nazov,
    kontaktna_osoba: etapa.kontaktnaOsoba,
    telefon: etapa.telefon,
    email: etapa.email,
    hmotnost_podla_vykazu: etapa.hmotnostPodlaVykazu || null,
    popis: etapa.popis,
    stav: etapa.stav,

    // Vstupy výrobného plánu
    datum_materialu: etapa.datumMaterialu || null,
    datum_zaciatku: etapa.zelanyStartVyroby || null,
    deadline: etapa.deadline || null,
    clovekohod: etapa.clovekohod ? parseFloat(etapa.clovekohod) : null,
    pocet_ludi: etapa.pocetLudi ? parseInt(etapa.pocetLudi) : null,
    zinkovanie: etapa.zinkovanie,
    zinkovanie_dni: plan.zinkovanieDni,
    farba: etapa.farba,
    farba_dni: plan.farbaDni,
    farba_ton: etapa.farbaTon,
    pieskovanie: !!etapa.pieskovanie,
    pieskovanie_dni: plan.pieskovanieDni,
    montaz_dni: plan.montazDni,

    // Vypočítané dátumy (uložené, aby s nimi vedeli pracovať aj Harmonogram/Timeline)
    datum_vyroby_od: plan.startVyroby,
    datum_vyroby_do: plan.koniecVyroby,
    datum_povrchovej_upravy_od: plan.zaciatokPovrchu,
    datum_povrchovej_upravy_do: plan.koniecPovrchu,
    datum_montaze_od: plan.zaciatokMontaze,
    datum_montaze_do: plan.koniecMontaze,
    datum_ukoncenia: plan.koniecMontaze,
  };
}

export async function pridajEtapu(zakazkaId, etapa) {
  try {
    const { error } = await supabase.from('etapy').insert([{
      zakazka_id: zakazkaId,
      ...zostavPayload(etapa)
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
    const { error } = await supabase.from('etapy').update(
      zostavPayload(etapa)
    ).eq('id', etapaId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ API: Chyba pri aktualizácii etapy:', error);
    throw error;
  }
}
