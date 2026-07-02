'use client'
import { useState, useEffect } from 'react';
import { nacitajMaterialCasti } from '../../lib/api/material';

function vypocitajHmotnostCelkovu(p) {
  const pocet = p.pocet || 0;
  const hmotnost1ks = p.hmotnost_1ks || 0;
  return pocet * hmotnost1ks;
}

function TabulkaMaterialu({ polozky, typ }) {
  const jeTyp = typ === 'tyc';
  const celkovaHmotnost = polozky.reduce((s, p) => s + vypocitajHmotnostCelkovu(p), 0);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '8px',
        background: jeTyp ? '#E6F1FB' : '#EAF3DE'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: jeTyp ? '#0C447C' : '#27500A' }}>
          {jeTyp ? 'Tyčový materiál' : 'Platne'}
        </span>
        <span style={{
          fontSize: '12px', padding: '2px 8px', borderRadius: '99px',
          background: jeTyp ? '#B5D4F4' : '#C0DD97',
          color: jeTyp ? '#0C447C' : '#27500A'
        }}>
          {polozky.length} {polozky.length === 1 ? 'položka' : 'položiek'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-secondary)' }}>
              {['Položka', 'Profil', 'Materiál', 'Dĺžka (mm)', 'Počet ks', 'Hmot. 1ks (kg)', 'Hmot. celk. (kg)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 3 ? 'right' : 'left',
                  padding: '7px 10px',
                  fontSize: '11px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {polozky.map((p, i) => {
              const hmotnostCelkova = vypocitajHmotnostCelkovu(p);
              return (
                <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {p.polozka || '—'}
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {p.profil || '—'}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)' }}>
                    {p.material || '—'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.dlzka_mm ?? '—'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(p.pocet * 100) / 100}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.hmotnost_1ks != null ? (Math.round(p.hmotnost_1ks * 10) / 10) : '—'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(hmotnostCelkova * 10) / 10}
                  </td>
                </tr>
              );
            })}
            <tr style={{ borderTop: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
              <td colSpan={6} style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Celková hmotnosť
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 500, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkovaHmotnost * 10) / 10} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Súhrn podľa materiálu + profilu + dĺžky, naprieč tyč aj platňami
function SuhrnMaterialu({ vsetkyPolozky }) {
  const skupiny = {};

  for (const p of vsetkyPolozky) {
    const material = p.material || '—';
    const profil = p.profil || '—';
    const dlzka = p.dlzka_mm ?? '—';
    const kluc = `${material}__${profil}__${dlzka}`;

    if (!skupiny[kluc]) {
      skupiny[kluc] = { material, profil, dlzka, pocet: 0, hmotnost: 0 };
    }
    skupiny[kluc].pocet += (p.pocet || 0);
    skupiny[kluc].hmotnost += vypocitajHmotnostCelkovu(p);
  }

  const riadky = Object.values(skupiny).sort((a, b) => {
    const m = a.material.localeCompare(b.material, 'sk');
    if (m !== 0) return m;
    const pr = a.profil.localeCompare(b.profil, 'sk', { numeric: true });
    if (pr !== 0) return pr;
    return (Number(a.dlzka) || 0) - (Number(b.dlzka) || 0);
  });

  const celkovaHmotnost = riadky.reduce((s, r) => s + r.hmotnost, 0);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '8px',
        background: '#F3E8FF'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B21A8' }}>
          Súhrn podľa materiálu, profilu a dĺžky
        </span>
        <span style={{
          fontSize: '12px', padding: '2px 8px', borderRadius: '99px',
          background: '#E9D5FF',
          color: '#6B21A8'
        }}>
          {riadky.length} {riadky.length === 1 ? 'skupina' : 'skupín'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-secondary)' }}>
              {['Materiál', 'Profil', 'Dĺžka (mm)', 'Počet ks', 'Hmot. celk. (kg)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 2 ? 'right' : 'left',
                  padding: '7px 10px',
                  fontSize: '11px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riadky.map((r, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)' }}>{r.material}</td>
                <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.profil}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.dlzka}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.pocet * 100) / 100}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.hmotnost * 10) / 10}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Celková hmotnosť (tyč + platne)
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkovaHmotnost * 10) / 10} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// NOVÉ: súhrn len podľa profilu (ignoruje materiál aj dĺžku)
function SuhrnPodlaProfilu({ vsetkyPolozky }) {
  const skupiny = {};

  for (const p of vsetkyPolozky) {
    const profil = p.profil || '—';

    if (!skupiny[profil]) {
      skupiny[profil] = { profil, pocet: 0, hmotnost: 0 };
    }
    skupiny[profil].pocet += (p.pocet || 0);
    skupiny[profil].hmotnost += vypocitajHmotnostCelkovu(p);
  }

  const riadky = Object.values(skupiny).sort((a, b) =>
    a.profil.localeCompare(b.profil, 'sk', { numeric: true })
  );

  const celkovaHmotnost = riadky.reduce((s, r) => s + r.hmotnost, 0);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '8px',
        background: '#EEEDFE'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#3C3489' }}>
          Súhrn podľa profilu
        </span>
        <span style={{
          fontSize: '12px', padding: '2px 8px', borderRadius: '99px',
          background: '#CECBF6',
          color: '#3C3489'
        }}>
          {riadky.length} {riadky.length === 1 ? 'profil' : 'profilov'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border-secondary)' }}>
              {['Profil', 'Počet ks', 'Hmot. celk. (kg)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 1 ? 'right' : 'left',
                  padding: '7px 10px',
                  fontSize: '11px', fontWeight: 500,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riadky.map((r, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.profil}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.pocet * 100) / 100}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.hmotnost * 10) / 10}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
              <td colSpan={2} style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Celková hmotnosť (tyč + platne)
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(celkovaHmotnost * 10) / 10} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ZoznamMaterialu({ cast }) {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chyba, setChyba] = useState(null);

  useEffect(() => {
    if (!cast?.id) return;
    nacitaj();
  }, [cast?.id]);

  async function nacitaj() {
    setLoading(true);
    setChyba(null);
    try {
      const data = await nacitajMaterialCasti(cast.id);
      setMaterial(data);
    } catch (err) {
      setChyba(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
      Načítavam materiál...
    </div>
  );

  if (chyba) return (
    <div style={{ padding: '1rem', background: 'var(--color-background-danger)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-danger)', fontSize: '13px' }}>
      Chyba: {chyba}
    </div>
  );

  if (!material || (material.tyc.length === 0 && material.platne.length === 0)) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
      Žiadne položky kusovníka pre túto časť.
    </div>
  );

  const vsetkyPolozky = [...material.tyc, ...material.platne];

  return (
    <div>
      {material.tyc.length > 0 && (
        <TabulkaMaterialu polozky={material.tyc} typ="tyc" />
      )}
      {material.platne.length > 0 && (
        <TabulkaMaterialu polozky={material.platne} typ="platne" />
      )}

      <div style={{ borderTop: '1px solid var(--color-border-secondary)', paddingTop: '1rem' }}>
        <SuhrnMaterialu vsetkyPolozky={vsetkyPolozky} />
        <SuhrnPodlaProfilu vsetkyPolozky={vsetkyPolozky} />
      </div>
    </div>
  );
}
