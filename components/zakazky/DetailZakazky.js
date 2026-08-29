import { ArrowLeft, Plus, Edit, Wrench } from 'lucide-react';

export default function DetailZakazky({ 
  zakazka,
  stavyZakaziek,
  stavyEtap,
  showInfoZakazky,
  setShowInfoZakazky,
  editujemZakazku,
  editovanaZakazka,
  setEditovanaZakazka,
  onSpat,
  onNovaEtapa,
  onDetailEtapy,
  onZacatEditovatZakazku,
  onUlozitZakazku,
  onZrusitEditaciu,
  onZmenitStavZakazky
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onSpat}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {zakazka.nazov}
            {zakazka.cisloZakazky && (
              <span className="ml-3 text-lg font-normal text-gray-400">#{zakazka.cisloZakazky}</span>
            )}
          </h1>
          <span className={`ml-auto px-4 py-2 rounded-full text-sm font-medium ${
            stavyZakaziek[zakazka.stav]?.farba || 'bg-gray-100 text-gray-700'
          }`}>
            {stavyZakaziek[zakazka.stav]?.label || 'Príprava'}
          </span>
        </div>

        {/* INFO PANEL */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Informácie o zákazke</h2>
            <div className="flex gap-2">
              {!editujemZakazku && (
                <>
                  <button
                    onClick={() => setShowInfoZakazky(!showInfoZakazky)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showInfoZakazky ? 'Skryť' : 'Zobraziť'}
                  </button>
                  <button
                    onClick={onZacatEditovatZakazku}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit size={16} />
                    Upraviť
                  </button>
                </>
              )}
            </div>
          </div>

          {(showInfoZakazky || editujemZakazku) && (
            <>
              {editujemZakazku ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Názov zákazky
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.nazov}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, nazov: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Číslo zákazky (pre účtovníctvo)
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.cisloZakazky || ''}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, cisloZakazky: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="napr. ZAK-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zákazník
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.zakaznik}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, zakaznik: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kontaktná osoba
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.kontaktnaOsoba}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, kontaktnaOsoba: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefón
                      </label>
                      <input
                        type="tel"
                        value={editovanaZakazka.telefon}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, telefon: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editovanaZakazka.email}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Názov firmy
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.nazovFirmy}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, nazovFirmy: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
                      <input
                        type="text"
                        value={editovanaZakazka.ico}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, ico: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
                      <input
                        type="text"
                        value={editovanaZakazka.dic}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, dic: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresa
                      </label>
                      <input
                        type="text"
                        value={editovanaZakazka.adresa}
                        onChange={(e) => setEditovanaZakazka({...editovanaZakazka, adresa: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onUlozitZakazku}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Uložiť zmeny
                    </button>
                    <button
                      onClick={onZrusitEditaciu}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Zrušiť
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {zakazka.cisloZakazky && (
                    <div>
                      <span className="text-gray-600">Číslo zákazky:</span>
                      <span className="ml-2 font-medium">{zakazka.cisloZakazky}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Zákazník:</span>
                    <span className="ml-2 font-medium">{zakazka.zakaznik}</span>
                  </div>
                  {zakazka.kontaktnaOsoba && (
                    <div>
                      <span className="text-gray-600">Kontakt:</span>
                      <span className="ml-2 font-medium">{zakazka.kontaktnaOsoba}</span>
                    </div>
                  )}
                  {zakazka.telefon && (
                    <div>
                      <span className="text-gray-600">Telefón:</span>
                      <span className="ml-2 font-medium">{zakazka.telefon}</span>
                    </div>
                  )}
                  {zakazka.email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{zakazka.email}</span>
                    </div>
                  )}
                  {zakazka.nazovFirmy && (
                    <div>
                      <span className="text-gray-600">Firma:</span>
                      <span className="ml-2 font-medium">{zakazka.nazovFirmy}</span>
                    </div>
                  )}
                  {zakazka.ico && (
                    <div>
                      <span className="text-gray-600">IČO:</span>
                      <span className="ml-2 font-medium">{zakazka.ico}</span>
                    </div>
                  )}
                  {zakazka.dic && (
                    <div>
                      <span className="text-gray-600">DIČ:</span>
                      <span className="ml-2 font-medium">{zakazka.dic}</span>
                    </div>
                  )}
                  {zakazka.adresa && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Adresa:</span>
                      <span className="ml-2 font-medium">{zakazka.adresa}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ZMENA STAVU */}
          {!editujemZakazku && (
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zmeniť stav zákazky:
              </label>
              <select
                value={zakazka.stav}
                onChange={(e) => onZmenitStavZakazky(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(stavyZakaziek).map(([hodnota, {label}]) => (
                  <option key={hodnota} value={hodnota}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ETAPY */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Etapy ({zakazka.etapy?.length || 0})
            </h2>
            <button
              onClick={onNovaEtapa}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nová etapa
            </button>
          </div>

          {zakazka.etapy && zakazka.etapy.length > 0 ? (
            <div className="space-y-3">
              {zakazka.etapy.map(etapa => (
                <div
                  key={etapa.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition"
                  onClick={() => onDetailEtapy(etapa)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{etapa.nazov}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📦 {etapa.dielce?.length || 0} dielcov</span>
                        {etapa.hmotnostPodlaVykazu && (
                          <span>⚖️ {etapa.hmotnostPodlaVykazu} kg</span>
                        )}
                        {etapa.datumUkoncenia && (
                          <span>📅 {new Date(etapa.datumUkoncenia).toLocaleDateString('sk-SK')}</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stavyEtap[etapa.stav]?.farba || 'bg-gray-100 text-gray-700'
                    }`}>
                      {stavyEtap[etapa.stav]?.label || 'Plánované'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Zatiaľ žiadne etapy</p>
              <p className="text-sm">Začni pridaním prvej etapy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
