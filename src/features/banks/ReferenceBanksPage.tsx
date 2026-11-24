import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Play, Search, ShieldAlert } from 'lucide-react';
import { SpeakButton } from '../../components/ui/SpeakButton';
import { useApp } from '../../context/AppContext';
import { expressionsBank } from '../../data/banks/expressions';
import { irregularVerbsBank } from '../../data/banks/irregularVerbs';
import { wordlistBank } from '../../data/banks/wordlist';
import { speechService } from '../../services/speechService';

type BankTab = 'verbs' | 'expressions' | 'wordlist';

function isBankTab(value: string | null): value is BankTab {
  return value === 'verbs' || value === 'expressions' || value === 'wordlist';
}

export function ReferenceBanksPage() {
  const { activeExamId } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const [tab, setTab] = useState<BankTab>(() => (isBankTab(paramTab) ? paramTab : 'verbs'));
  const [query, setQuery] = useState('');
  const [voiceInfo, setVoiceInfo] = useState(() => speechService.getEnglishVoiceInfo());

  useEffect(() => {
    setVoiceInfo(speechService.getEnglishVoiceInfo());
    return speechService.subscribeVoices(() => {
      setVoiceInfo(speechService.getEnglishVoiceInfo());
    });
  }, []);

  const handleSelectTab = (next: BankTab) => {
    setTab(next);
    setSearchParams({ tab: next }, { replace: true });
  };

  const normalizedQuery = query.trim().toLowerCase();

  const filteredVerbs = useMemo(() => {
    if (!normalizedQuery) return irregularVerbsBank;
    return irregularVerbsBank.filter(
      (v) =>
        v.infinitive.toLowerCase().includes(normalizedQuery) ||
        v.pastSimple.toLowerCase().includes(normalizedQuery) ||
        v.pastParticiple.toLowerCase().includes(normalizedQuery) ||
        v.spanish.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const filteredExpressions = useMemo(() => {
    if (!normalizedQuery) return expressionsBank;
    return expressionsBank.filter(
      (e) =>
        e.english.toLowerCase().includes(normalizedQuery) ||
        e.spanish.toLowerCase().includes(normalizedQuery) ||
        e.category.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const filteredWords = useMemo(() => {
    if (!normalizedQuery) return wordlistBank;
    return wordlistBank.filter(
      (w) =>
        w.english.toLowerCase().includes(normalizedQuery) ||
        w.spanish.toLowerCase().includes(normalizedQuery) ||
        w.category.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  if (activeExamId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-amber-700" />
          <h1 className="text-xl font-extrabold text-amber-950">Bancos bloqueados durante el examen</h1>
          <p className="mt-2 text-sm text-amber-900">
            Tienes un examen en curso. Termina o entrega el examen antes de consultar verbos o expresiones.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/exam/${activeExamId}`)}
            className="touch-target mt-5 w-full rounded-2xl bg-amber-700 py-3 font-bold text-white"
          >
            Volver al examen
          </button>
        </div>
      </div>
    );
  }

  const isEmpty =
    (tab === 'verbs' && filteredVerbs.length === 0) ||
    (tab === 'expressions' && filteredExpressions.length === 0) ||
    (tab === 'wordlist' && filteredWords.length === 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="touch-target inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">Bancos de Recursos Bilingües</h1>
          </div>

          {tab !== 'wordlist' && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  tab === 'verbs'
                    ? '/practice/bank-irregular-verbs?mode=bank_practice'
                    : '/practice/bank-expressions?mode=bank_practice',
                )
              }
              className="touch-target inline-flex items-center gap-1.5 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              <Play className="h-4 w-4" /> Practicar {tab === 'verbs' ? 'verbos' : 'expresiones'}
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6">
        {voiceInfo.supported && voiceInfo.voicesLoaded && !voiceInfo.available && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              Tu navegador no detecta ninguna voz en inglés instalada (puede pronunciar las palabras con acento español).
              Prueba en Chrome o Edge, o instala la voz &ldquo;Inglés (Reino Unido)&rdquo; en los ajustes de idioma de tu
              dispositivo.
            </span>
          </div>
        )}

        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { id: 'verbs', label: 'Verbos Irregulares' },
            { id: 'expressions', label: 'Expresiones Útiles' },
            { id: 'wordlist', label: 'Vocabulario' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTab(t.id as BankTab)}
              className={`touch-target rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                tab === t.id
                  ? 'border-blue-600 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en inglés o español..."
            className="touch-target w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base focus:border-blue-600 focus:outline-none"
          />
        </div>

        {isEmpty ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-bold text-slate-800">No hemos encontrado coincidencias para "{query}".</p>
            <p className="mt-1 text-sm text-slate-600">Revisa la ortografía o prueba con otra palabra.</p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="touch-target mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <>
            {tab === 'verbs' && (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Infinitive</th>
                      <th className="px-4 py-3">Past Simple</th>
                      <th className="px-4 py-3">Past Participle</th>
                      <th className="px-4 py-3">Español</th>
                      <th className="px-4 py-3 text-right">Audio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVerbs.map((v) => (
                      <tr key={v.id} className="hover:bg-blue-50/40">
                        <td className="px-4 py-3 font-extrabold text-slate-900">{v.infinitive}</td>
                        <td className="px-4 py-3 font-bold text-blue-800">{v.pastSimple}</td>
                        <td className="px-4 py-3 text-slate-700">{v.pastParticiple}</td>
                        <td className="px-4 py-3 text-slate-700">{v.spanish}</td>
                        <td className="px-4 py-2 text-right">
                          <SpeakButton text={`${v.infinitive}, ${v.pastSimple}, ${v.pastParticiple}`} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'expressions' && (
              <div className="space-y-2.5">
                {filteredExpressions.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                        {e.category}
                      </span>
                      <p className="mt-1 text-base font-extrabold text-slate-900">{e.english}</p>
                      <p className="text-sm text-slate-600">{e.spanish}</p>
                    </div>
                    <SpeakButton text={e.english} compact />
                  </div>
                ))}
              </div>
            )}

            {tab === 'wordlist' && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {filteredWords.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{w.english}</p>
                      <p className="text-sm text-slate-600">
                        {w.spanish} · <span className="text-xs text-slate-400">{w.category}</span>
                      </p>
                    </div>
                    <SpeakButton text={w.english} compact />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
