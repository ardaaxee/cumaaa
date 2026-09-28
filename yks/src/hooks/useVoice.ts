import { useCallback, useEffect, useRef, useState } from 'react';

/** Konuşma metninden görsel biçimlendirmeyi temizler (sesli okuma için). */
export function speakableText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[•✦♡☕#*_>`]/g, ' ')
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function pickTurkishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  const tr = voices.filter((v) => v.lang?.toLowerCase().startsWith('tr'));
  if (!tr.length) return null;
  // Erkek sesi varsa onu tercih et (cihaza göre isimler değişir).
  const male = tr.find((v) => /male|erkek|tolga|cem|ahmet|emre|yunus/i.test(v.name) && !/female|kad[ıi]n/i.test(v.name));
  return male ?? tr[0];
}

/**
 * Tarayıcının yerleşik konuşma sentezi (Web Speech API). Ağ ya da API anahtarı gerekmez.
 * Desteklenmeyen tarayıcıda `supported` false olur ve karakter yalnızca yazılı yanıt verir.
 */
export function useSpeaker() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!supported) return;
    // Bazı tarayıcılarda ses listesi geç yüklenir.
    window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    if (timer.current) clearTimeout(timer.current);
    setSpeaking(false);
  }, [supported]);

  /** Metni okur; ses kapalıysa ya da desteklenmiyorsa yalnızca konuşma animasyonunu metin uzunluğu kadar oynatır. */
  const speak = useCallback(
    (text: string, withVoice: boolean, maxChars = 900) => {
      const clean = speakableText(text).slice(0, maxChars);
      if (!clean) return;
      stop();
      const mimic = () => {
        setSpeaking(true);
        timer.current = window.setTimeout(() => setSpeaking(false), Math.min(9000, 1200 + clean.length * 45));
      };
      if (!withVoice || !supported) return mimic();
      // Uzun metinler bazı tarayıcılarda yarıda kesildiği için cümle cümle sıraya alınır.
      const chunks = clean.match(/[^.!?]+[.!?]*/g)?.reduce<string[]>((acc, part) => {
        const last = acc[acc.length - 1];
        if (last && last.length + part.length < 220) acc[acc.length - 1] = last + part;
        else acc.push(part);
        return acc;
      }, []) ?? [clean];
      const v = pickTurkishVoice();
      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk.trim());
        u.lang = 'tr-TR';
        if (v) u.voice = v;
        u.rate = 1.02;
        u.pitch = 0.95;
        if (i === 0) u.onstart = () => setSpeaking(true);
        if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      });
      // onstart tetiklenmezse (ör. ses izni yok) animasyon yine de başlasın.
      timer.current = window.setTimeout(() => {
        if (!window.speechSynthesis.speaking) mimic();
      }, 700);
    },
    [stop, supported],
  );

  return { supported, speaking, speak, stop };
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

/** Sesle soru sorma (Chrome/Android ve Safari'de). Desteklenmezse `supported` false. */
export function useListener(onText: (text: string) => void) {
  const Ctor: RecognitionCtor | undefined =
    typeof window !== 'undefined'
      ? ((window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition)
      : undefined;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecognitionLike | null>(null);
  const cbRef = useRef(onText);
  cbRef.current = onText;

  const start = useCallback(() => {
    if (!Ctor) return;
    setError(null);
    const rec = new Ctor();
    rec.lang = 'tr-TR';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from({ length: e.results.length }, (_, i) => e.results[i][0]?.transcript ?? '').join(' ').trim();
      if (t) cbRef.current(t);
    };
    rec.onerror = (e) => setError(e.error === 'not-allowed' ? 'Mikrofon izni verilmedi.' : 'Ses anlaşılamadı, tekrar dener misin?');
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [Ctor]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => recRef.current?.stop(), []);

  return { supported: !!Ctor, listening, error, start, stop };
}
