import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { RealisticPanda } from '../components/RealisticPanda';
import { Icon } from '../components/Icon';
import { ProgressBar, toast } from '../components/ui';
import { updateSettings } from '../store/actions';
import { update, useAppState } from '../store/store';
import { PET_ITEMS, petStatus } from '../utils/pet';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { FOOD_PER_BAMBOO, WATER_PER_DROP, feedPet, needsMessage, waterPet } from '../utils/petCare';
import { PetNotifyToggle } from '../hooks/usePetAlerts';
import { dashboard } from '../utils/stats';
import { dayKey } from '../utils/date';

const EARN_RULES = [
  ['🎋 1 bambu', '5 doğru cevap'],
  ['🎋 1 bambu', 'bitirdiğin her test'],
  ['🎋 2 bambu', 'tamamladığın her konu'],
  ['💧 1 damla', '4 cevaplanan soru'],
  ['💧 1 damla', '15 dk çalışma'],
  ['💧 1 damla', '10 bilgi kartı tekrarı'],
];

const HOUSE_UPGRADES = [
  { level: 1, icon: '🏠', label: 'Salon + mutfak' },
  { level: 2, icon: '📚', label: 'Çalışma odası' },
  { level: 3, icon: '🛁', label: 'Banyo detayları' },
  { level: 4, icon: '🛏️', label: 'Yatak odası' },
  { level: 6, icon: '🌿', label: 'Bahçe alanı' },
  { level: 8, icon: '🌙', label: 'Gece aydınlatması' },
  { level: 10, icon: '🏆', label: 'Başarı duvarı' },
];

type HouseRoom = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'study' | 'garden';
type HouseActivity =
  | 'idle'
  | 'walking'
  | 'waiting'
  | 'eating'
  | 'drinking'
  | 'sleeping'
  | 'bathing'
  | 'playing'
  | 'studying'
  | 'relaxing'
  | 'greeting'
  | 'talking';

type ZeynepActivity = 'idle' | 'walking' | 'cooking' | 'serving';

const ROOM_ORDER: HouseRoom[] = ['living', 'kitchen', 'bedroom', 'bathroom', 'study', 'garden'];
const ROOM_INFO: Record<HouseRoom, { icon: string; label: string; desc: string }> = {
  living: { icon: '🛋️', label: 'Salon', desc: 'Dinlenme ve oyun alanı' },
  kitchen: { icon: '🍽️', label: 'Mutfak', desc: 'Yemek ve su burada' },
  bedroom: { icon: '🛏️', label: 'Yatak Odası', desc: 'Uyku ve gece rutini' },
  bathroom: { icon: '🛁', label: 'Banyo', desc: 'Temizlik ve bakım' },
  study: { icon: '📚', label: 'Çalışma Odası', desc: 'Ders ve odak zamanı' },
  garden: { icon: '🌿', label: 'Bahçe', desc: 'Oyun ve temiz hava' },
};

const PANDA_TALK: Record<HouseRoom, string[]> = {
  living: [
    'Selam! Geldiğine sevindim. Biraz salonda takılalım mı?',
    'Bugün nasılsın? Ben biraz dolaşıp sonra dinleneceğim.',
    'Beni sevince moralim yükseliyor, biliyor muydun?',
  ],
  kitchen: [
    'Mutfakta güzel bir şeyler var mı? Biraz acıkmış olabilirim.',
    'Zeynep gelirse beraber yemek yiyelim.',
    'Su içmeyi unutma, ben de unutmamaya çalışıyorum.',
  ],
  bedroom: [
    'Burası çok rahat. Yorulursam biraz uyuyabilirim.',
    'Gece olunca ışıkları kısalım, tamam mı?',
    'İyi bir uyku yarınki dersleri de kolaylaştırır.',
  ],
  bathroom: [
    'Banyo zamanı gelince köpükleri çok seviyorum.',
    'Temiz olunca kendimi daha iyi hissediyorum.',
    'Aynadaki panda baya iyi görünüyor, değil mi?',
  ],
  study: [
    'Hadi biraz çalışalım. Sen çöz, ben yanında durayım.',
    'Bir konuyu anlamayınca bırakma; küçük parçalara bölelim.',
    'Bugün birkaç soru bile çözsek ilerleme sayılır.',
  ],
  garden: [
    'Hava güzel! Biraz koşup oynayalım.',
    'Bahçede dolaşmak enerjimi yerine getiriyor.',
    'Topu görüyor musun? Biraz oynayalım!',
  ],
};

const ROOM_TARGET: Record<HouseRoom, { x: number; y: number }> = {
  living: { x: 50, y: 2 },
  kitchen: { x: 54, y: 2 },
  bedroom: { x: 43, y: 2 },
  bathroom: { x: 59, y: 2 },
  study: { x: 48, y: 2 },
  garden: { x: 52, y: 2 },
};

function NeedBubble({ icon, label, value }: { icon: string; label: string; value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={'pet-need-bubble' + (v < 30 ? ' low' : '')}
      style={{ '--need': v + '%' } as CSSProperties}
      aria-label={label + ' yüzde ' + v}
    >
      <span>{icon}</span>
      <b>{v}</b>
    </div>
  );
}

function Meter({ label, value, kind }: { label: string; value: number; kind: 'food' | 'water' }) {
  const v = Math.round(value);
  return (
    <div className={'need-meter ' + kind + (v < 35 ? ' low' : '')}>
      <div className="row between nowrap small">
        <b>{label}</b>
        <span>%{v}</span>
      </div>
      <div className="need-bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
        <span style={{ width: v + '%' }} />
      </div>
    </div>
  );
}

function RoomBackdrop({
  room,
  onFood,
  onSleep,
  onBath,
  onStudy,
  onGarden,
  onRelax,
}: {
  room: HouseRoom;
  onFood: () => void;
  onSleep: () => void;
  onBath: () => void;
  onStudy: () => void;
  onGarden: () => void;
  onRelax: () => void;
}) {
  if (room === 'living') {
    return (
      <>
        <div className="pet-room-wall living-wall">
          <div className="scene-window"><span>☁</span><span>☀</span></div>
          <div className="scene-frame">♡</div>
          <div className="scene-tv"><span>YKS molası</span></div>
        </div>
        <button className="scene-object scene-sofa" type="button" onClick={onRelax} aria-label="Koltukta dinlen">
          <span className="scene-cushion" />
          <span className="scene-cushion right" />
        </button>
        <div className="scene-rug" />
        <div className="scene-plant">🪴</div>
        <div className="scene-lamp"><span /></div>
      </>
    );
  }
  if (room === 'kitchen') {
    return (
      <>
        <div className="pet-room-wall kitchen-wall">
          <div className="scene-kitchen-cabinets">
            <span /><span /><span />
          </div>
          <div className="scene-kitchen-counter">
            <span className="scene-sink" />
            <span className="scene-stove">● ●</span>
          </div>
          <div className="scene-fridge"><span>♡</span></div>
        </div>
        <button className="scene-object scene-table" type="button" onClick={onFood} aria-label="Zeynep yemek hazırlasın">
          <span className="scene-food-bowl">🥣</span>
        </button>
        <div className="scene-kitchen-chair left" />
        <div className="scene-kitchen-chair right" />
      </>
    );
  }
  if (room === 'bedroom') {
    return (
      <>
        <div className="pet-room-wall bedroom-wall">
          <div className="scene-bedroom-window">☾</div>
          <div className="scene-wardrobe"><span /><span /></div>
          <div className="scene-bedroom-frame">♡</div>
        </div>
        <button className="scene-object scene-bed" type="button" onClick={onSleep} aria-label="Panda uyusun">
          <span className="scene-bed-pillow">♡</span>
          <span className="scene-blanket" />
        </button>
        <div className="scene-nightstand"><span>☾</span></div>
        <div className="scene-bedroom-rug" />
      </>
    );
  }
  if (room === 'bathroom') {
    return (
      <>
        <div className="pet-room-wall bathroom-wall">
          <div className="scene-bath-mirror"><span>✨</span></div>
          <div className="scene-bath-sink"><span /></div>
          <div className="scene-bath-shelf">🧴 🧼</div>
        </div>
        <button className="scene-object scene-bathtub" type="button" onClick={onBath} aria-label="Panda banyo yapsın">
          <span className="scene-bath-water" />
          <span className="scene-bubbles">◌ ◦ ○</span>
        </button>
        <div className="scene-bathmat" />
      </>
    );
  }
  if (room === 'study') {
    return (
      <>
        <div className="pet-room-wall study-wall">
          <div className="scene-bookshelf">📕 📘 📗<br />📚 ✏️ 🧠</div>
          <div className="scene-study-board">
            <b>Bugün</b>
            <span>25 soru</span>
            <span>1 konu</span>
          </div>
        </div>
        <button className="scene-object scene-study-desk" type="button" onClick={onStudy} aria-label="Panda ders çalışsın">
          <span className="scene-laptop">YKS</span>
          <span className="scene-study-books">📚</span>
        </button>
        <div className="scene-study-chair" />
        <div className="scene-study-rug" />
      </>
    );
  }
  return (
    <>
      <div className="pet-room-wall garden-wall">
        <div className="scene-sky-cloud one">☁</div>
        <div className="scene-sky-cloud two">☁</div>
        <div className="scene-garden-sun">☀</div>
        <div className="scene-fence"><span /><span /><span /><span /><span /></div>
      </div>
      <div className="scene-garden-tree">🌳</div>
      <div className="scene-garden-flowers">🌷 🌼 🌸</div>
      <button className="scene-object scene-garden-ball" type="button" onClick={onGarden} aria-label="Bahçede oyna">⚽</button>
      <div className="scene-garden-bench" />
      <div className="scene-garden-path" />
    </>
  );
}

const XP_RULES = [
  ['Cevapladığın her soru', '+2 XP'],
  ['Her doğru cevap', '+1 XP'],
  ['Her çalışma dakikası', '+1 XP'],
  ['Her bilgi kartı tekrarı', '+1 XP'],
  ['Bitirdiğin her test', '+5 XP'],
  ['Tamamladığın her konu', '+20 XP'],
  ['Kaydettiğin her deneme', '+30 XP'],
];

function activityText(activity: HouseActivity, room: HouseRoom, name: string): string {
  if (activity === 'walking') return name + ' ' + ROOM_INFO[room].label.toLowerCase() + ' tarafına gidiyor…';
  if (activity === 'waiting') return name + ' Zeynep’in yemeği hazırlamasını bekliyor.';
  if (activity === 'eating') return name + ' afiyetle yemeğini yiyor.';
  if (activity === 'drinking') return name + ' suyunu içiyor.';
  if (activity === 'sleeping') return name + ' uyuyor. Tatlı rüyalar 🌙';
  if (activity === 'bathing') return name + ' köpüklü banyo yapıyor 🫧';
  if (activity === 'playing') return name + ' bahçede oyun oynuyor.';
  if (activity === 'studying') return name + ' çalışma masasında seninle ders çalışıyor.';
  if (activity === 'relaxing') return name + ' koltukta dinleniyor.';
  if (activity === 'greeting') return name + ' sana selam veriyor 👋';
  if (activity === 'talking') return name + ' seninle konuşuyor.';
  return ROOM_INFO[room].desc;
}

export default function PetPage() {
  const state = useAppState();
  const pet = state.settings.pet;
  const p = useMemo(() => petStatus(state), [state]);
  const needs = usePetNeeds();

  const [holding, setHolding] = useState<'bambu' | 'su' | null>(null);
  const [room, setRoom] = useState<HouseRoom>('living');
  const [activity, setActivity] = useState<HouseActivity>('idle');
  const [zeynepActivity, setZeynepActivity] = useState<ZeynepActivity>('idle');
  const [roomMode, setRoomMode] = useState<'day' | 'night'>(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 7 ? 'night' : 'day';
  });
  const [hearts, setHearts] = useState(0);
  const [cleanliness, setCleanliness] = useState(82);
  const [energy, setEnergy] = useState(76);
  const [happiness, setHappiness] = useState(84);
  const [sceneMessage, setSceneMessage] = useState<string | null>(null);
  const [name, setName] = useState(pet.name);
  const [petPos, setPetPos] = useState({ x: 50, y: 2 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [voiceOn, setVoiceOn] = useState(true);
  const timers = useRef<number[]>([]);
  const greeted = useRef(false);

  const sad = needs.hungry || needs.thirsty;
  const need = needsMessage(pet.name, needs);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  const speak = (text: string) => {
    setSceneMessage(text);
    if (!voiceOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'tr-TR';
      utter.rate = 0.96;
      utter.pitch = 1.08;
      const voices = window.speechSynthesis.getVoices();
      const tr = voices.find((v) => v.lang.toLowerCase().startsWith('tr'));
      if (tr) utter.voice = tr;
      window.speechSynthesis.speak(utter);
    } catch {
      // Konuşma balonu yine çalışır; bazı mobil tarayıcılar ses sentezini engelleyebilir.
    }
  };

  const randomLine = (where: HouseRoom = room) => {
    const lines = PANDA_TALK[where];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const greet = (withVoice = true) => {
    clearTimers();
    setFacing('right');
    setActivity('greeting');
    const text = 'Selam! Ben ' + pet.name + '. Hoş geldin! 👋';
    setSceneMessage(text);
    if (withVoice) speak(text);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 2600);
  };

  const talk = () => {
    clearTimers();
    setActivity('talking');
    const text = randomLine();
    speak(text);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 3300);
  };

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const id = window.setTimeout(() => greet(false), 500);
    return () => window.clearTimeout(id);
    // İlk karşılama yalnızca sayfa açılışında bir kez çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activity !== 'idle') return;
    let cancelled = false;
    const wait = 2600 + Math.floor(Math.random() * 2800);
    const id = window.setTimeout(() => {
      if (cancelled) return;
      const roll = Math.random();

      if (roll < 0.52) {
        // Aynı odada gerçek bir yürüyüş: sahnenin bir ucundan diğerine kadar dolaşır.
        let nextX = 16 + Math.round(Math.random() * 68);
        if (Math.abs(nextX - petPos.x) < 22) nextX = petPos.x < 50 ? 76 : 24;
        const nextY = 1 + Math.round(Math.random() * 9);
        setFacing(nextX < petPos.x ? 'left' : 'right');
        setActivity('walking');
        setPetPos({ x: nextX, y: nextY });
        later(() => setActivity('idle'), 1500);
        return;
      }

      if (roll < 0.70) {
        // Odadan çıkar, başka odaya gir ve yürümeye devam et.
        const choices = ROOM_ORDER.filter((x) => x !== room);
        const nextRoom = choices[Math.floor(Math.random() * choices.length)];
        const exitRight = Math.random() > 0.5;
        setFacing(exitRight ? 'right' : 'left');
        setActivity('walking');
        setSceneMessage(pet.name + ' ' + ROOM_INFO[nextRoom].label.toLowerCase() + 'a gidiyor…');
        setPetPos({ x: exitRight ? 90 : 10, y: 3 });
        later(() => {
          setRoom(nextRoom);
          setPetPos({ x: exitRight ? 10 : 90, y: 3 });
          setFacing(exitRight ? 'right' : 'left');
          later(() => {
            const target = ROOM_TARGET[nextRoom];
            setFacing(target.x < (exitRight ? 10 : 90) ? 'left' : 'right');
            setPetPos(target);
            later(() => {
              setActivity('idle');
              setSceneMessage(null);
            }, 1200);
          }, 80);
        }, 1050);
        return;
      }

      if (roll < 0.84) {
        setActivity('greeting');
        setFacing('right');
        setSceneMessage('Selam! Buradayım 👋');
        later(() => {
          setActivity('idle');
          setSceneMessage(null);
        }, 2200);
        return;
      }

      if (roll < 0.96) {
        setActivity('talking');
        setSceneMessage(randomLine());
        later(() => {
          setActivity('idle');
          setSceneMessage(null);
        }, 3000);
        return;
      }

      // Odaya uygun küçük bir kendi-kendine davranış.
      const contextual: Partial<Record<HouseRoom, HouseActivity>> = {
        living: 'relaxing',
        study: 'studying',
        garden: 'playing',
      };
      const nextActivity = contextual[room] ?? 'idle';
      setActivity(nextActivity);
      later(() => setActivity('idle'), 3200);
    }, wait);
    timers.current.push(id);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // Her idle dönüşünde yeni bir doğal davranış planlanır.
  }, [activity, room, pet.name, petPos.x]);

  useEffect(() => () => {
    clearTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const moveTo = (nextRoom: HouseRoom, nextActivity: HouseActivity = 'idle', message?: string) => {
    clearTimers();
    setHolding(null);
    setRoom(nextRoom);
    setPetPos(ROOM_TARGET[nextRoom]);
    setActivity('walking');
    setSceneMessage(message ?? ROOM_INFO[nextRoom].label + 'a gidiyor…');
    later(() => {
      setActivity(nextActivity);
      if (nextActivity === 'idle') setSceneMessage(null);
    }, 850);
  };

  const changeRoom = (direction: -1 | 1) => {
    const i = ROOM_ORDER.indexOf(room);
    const next = ROOM_ORDER[(i + direction + ROOM_ORDER.length) % ROOM_ORDER.length];
    moveTo(next);
  };

  const kitchenGive = (kind: 'bambu' | 'su') => {
    const full = kind === 'bambu' ? needs.food >= 100 : needs.water >= 100;
    const have = kind === 'bambu' ? needs.bamboo : needs.drops;
    if (full) return toast(kind === 'bambu' ? pet.name + ' şu an tok ♡' : pet.name + ' şu an susamadı ♡');
    if (have < 1) {
      return toast(kind === 'bambu' ? 'Bambun kalmadı. 5 doğru cevap = 1 bambu 🎋' : 'Suyun kalmadı. 4 soru çöz = 1 damla su 💧');
    }

    clearTimers();
    setRoom('kitchen');
    setPetPos({ x: 52, y: 2 });
    setFacing('right');
    setActivity('walking');
    setZeynepActivity('walking');
    setSceneMessage('Zeynep mutfağa geliyor. ' + pet.name + ' masaya geçiyor…');

    later(() => {
      setActivity('waiting');
      setZeynepActivity('cooking');
      setSceneMessage(kind === 'bambu' ? 'Zeynep yemeği hazırlıyor 🍳' : 'Zeynep suyu hazırlıyor 💧');
    }, 900);

    later(() => {
      update((s) => (kind === 'bambu' ? feedPet(s) : waterPet(s)));
      setHolding(kind);
      setActivity(kind === 'bambu' ? 'eating' : 'drinking');
      setZeynepActivity('serving');
      setSceneMessage(kind === 'bambu' ? 'Yemek hazır. Afiyet olsun ♡' : 'Suyu hazır. Ohh, ferahladı ♡');
      setHappiness((v) => Math.min(100, v + 5));
    }, 2200);

    later(() => {
      setHolding(null);
      setActivity('idle');
      setZeynepActivity('idle');
      setSceneMessage(null);
      toast(kind === 'bambu' ? 'Yemeğini bitirdi 🎋' : 'Suyunu içti 💧');
    }, 4700);
  };

  const bath = () => {
    clearTimers();
    setRoom('bathroom');
    setPetPos({ x: 59, y: 2 });
    setFacing('right');
    setActivity('walking');
    setSceneMessage(pet.name + ' banyoya gidiyor…');
    later(() => {
      setActivity('bathing');
      setSceneMessage('Köpükler hazır. Banyo zamanı 🫧');
    }, 850);
    later(() => {
      setCleanliness(100);
      setHappiness((v) => Math.min(100, v + 4));
      setActivity('idle');
      setSceneMessage(pet.name + ' tertemiz oldu ✨');
      toast(pet.name + ' banyosunu yaptı.');
    }, 4300);
    later(() => setSceneMessage(null), 6000);
  };

  const sleep = () => {
    if (activity === 'sleeping') {
      clearTimers();
      setActivity('idle');
      setRoomMode('day');
      setEnergy(100);
      setSceneMessage('Günaydın! ' + pet.name + ' uyandı ☀️');
      later(() => setSceneMessage(null), 1800);
      return;
    }
    clearTimers();
    setRoom('bedroom');
    setPetPos({ x: 42, y: 2 });
    setFacing('left');
    setActivity('walking');
    setSceneMessage(pet.name + ' yatağına gidiyor…');
    later(() => {
      setActivity('sleeping');
      setRoomMode('night');
      setSceneMessage('Işıkları kapattık. ' + pet.name + ' uyuyor 🌙');
    }, 900);
    later(() => setEnergy(100), 4200);
  };

  const garden = () => {
    moveTo('garden', 'playing', 'Bahçeye çıkıyoruz 🌿');
    later(() => {
      setHappiness(100);
      setEnergy((v) => Math.max(35, v - 4));
      setActivity('idle');
      setSceneMessage(null);
    }, 5200);
  };

  const studyTogether = () => {
    moveTo('study', 'studying', 'Çalışma odasına geçiyoruz 📚');
    later(() => setHappiness((v) => Math.min(100, v + 2)), 2500);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 5400);
  };

  const relax = () => {
    moveTo('living', 'relaxing', 'Salonda kısa bir mola 🛋️');
    later(() => setEnergy((v) => Math.min(100, v + 5)), 2400);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 4700);
  };

  const roam = () => {
    clearTimers();
    let nextX = petPos.x < 50 ? 78 : 22;
    setFacing(nextX < petPos.x ? 'left' : 'right');
    setActivity('walking');
    setSceneMessage(pet.name + ' odada dolaşıyor…');
    setPetPos({ x: nextX, y: 8 });
    later(() => {
      nextX = nextX < 50 ? 66 : 34;
      setFacing(nextX < petPos.x ? 'left' : 'right');
      setPetPos({ x: nextX, y: 2 });
    }, 1400);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 2800);
  };

  const petPanda = () => {
    setHearts((v) => v + 1);
    setHappiness((v) => Math.min(100, v + 3));
    setActivity('greeting');
    const text = Math.random() > 0.5 ? 'Selam! Beni mi çağırdın? 👋' : 'Buradayım! Seninle takılmayı seviyorum.';
    speak(text);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 2800);
  };

  const nextItem = PET_ITEMS.find((i) => i.level > p.level);
  const nextUpgrade = HOUSE_UPGRADES.find((i) => i.level > p.level);
  const pct = ((p.xp - p.levelStartXp) / Math.max(1, p.nextLevelXp - p.levelStartXp)) * 100;
  const unlocked = HOUSE_UPGRADES.filter((i) => i.level <= p.level).length;
  const housePct = (unlocked / HOUSE_UPGRADES.length) * 100;
  const roomMessage = sceneMessage || need || activityText(activity, room, pet.name);

  const today = dayKey();
  const d = dashboard(state, today);
  const doneTasks = state.tasks.filter((t) => t.date === today && t.done).length;
  const questQuestions = Math.max(10, Math.min(30, Math.round(state.profile.dailyQuestionGoal * 0.35)));
  const questMinutes = Math.max(20, Math.min(60, Math.round(state.profile.dailyStudyMinutes * 0.25)));
  const quests = [
    { icon: '⚡', label: questQuestions + ' soru çöz', current: Math.min(questQuestions, d.todayQuestions), target: questQuestions, done: d.todayQuestions >= questQuestions },
    { icon: '⏱️', label: questMinutes + ' dk odaklan', current: Math.min(questMinutes, d.todayMinutes), target: questMinutes, done: d.todayMinutes >= questMinutes },
    { icon: '✓', label: '1 plan görevi bitir', current: Math.min(1, doneTasks), target: 1, done: doneTasks >= 1 },
  ];
  const questDone = quests.filter((q) => q.done).length;

  const toggle = (id: string) =>
    update((s) => {
      const items = s.settings.pet.items.includes(id) ? s.settings.pet.items.filter((x) => x !== id) : [...s.settings.pet.items, id];
      return updateSettings(s, { pet: { ...s.settings.pet, items } });
    });

  return (
    <div className="pet-game-page">
      <section className={'pet-game ' + roomMode + ' room-' + room} aria-label={pet.name + ' sanal evcil hayvan evi'}>
        <header className="pet-game-top">
          <a className="pet-game-iconbtn" href="#/" aria-label="Ana sayfaya dön">
            <Icon name="home" />
          </a>
          <div className="pet-game-room-title">
            <span>{ROOM_INFO[room].icon}</span>
            <div>
              <b>{ROOM_INFO[room].label}</b>
              <small>{pet.name} · Seviye {p.level}</small>
            </div>
          </div>
          <button
            className="pet-game-iconbtn"
            type="button"
            onClick={() => setVoiceOn((v) => {
              const next = !v;
              if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              return next;
            })}
            aria-label={voiceOn ? 'Panda sesini kapat' : 'Panda sesini aç'}
          >
            {voiceOn ? '🔊' : '🔇'}
          </button>
        </header>

        <div className="pet-game-needs" aria-label="Panda ihtiyaçları">
          <NeedBubble icon="🎋" label="Tokluk" value={needs.food} />
          <NeedBubble icon="💧" label="Su" value={needs.water} />
          <NeedBubble icon="🫧" label="Temizlik" value={cleanliness} />
          <NeedBubble icon="⚡" label="Enerji" value={energy} />
          <NeedBubble icon="♡" label="Mutluluk" value={happiness} />
        </div>

        <div className={'pet-stage scene-' + room + ' activity-' + activity}>
          <RoomBackdrop
            room={room}
            onFood={() => kitchenGive('bambu')}
            onSleep={sleep}
            onBath={bath}
            onStudy={studyTogether}
            onGarden={garden}
            onRelax={relax}
          />

          <button className="pet-scene-arrow prev" type="button" onClick={() => changeRoom(-1)} aria-label="Önceki oda">‹</button>
          <button className="pet-scene-arrow next" type="button" onClick={() => changeRoom(1)} aria-label="Sonraki oda">›</button>

          <button
            type="button"
            className={'pet-stage-panda act-' + activity + ' facing-' + facing}
            style={{ '--pet-x': petPos.x + '%', '--pet-y': petPos.y + '%' } as CSSProperties}
            onClick={petPanda}
            aria-label={pet.name + ' pandayı sev'}
          >
            <RealisticPanda
              size={250}
              sleepy={activity === 'sleeping'}
              sad={!holding && sad}
              eating={activity === 'eating'}
              drinking={activity === 'drinking'}
              bathing={activity === 'bathing'}
              playing={activity === 'playing'}
              waving={activity === 'greeting'}
              talking={activity === 'talking' || activity === 'greeting'}
            />
            <span className="pet-floor-shadow" />
            {hearts > 0 && <span key={hearts} className="pet-game-heart" aria-hidden="true">♡</span>}
            {activity === 'sleeping' && <span className="pet-game-sleep">Z z z</span>}
          </button>

          {zeynepActivity !== 'idle' && room === 'kitchen' && (
            <div className={'pet-game-zeynep z-' + zeynepActivity}>
              <div className="pet-zeynep-avatar">👩🏻</div>
              <b>Zeynep</b>
              <span>{zeynepActivity === 'cooking' ? '🍳' : zeynepActivity === 'serving' ? '🍽️' : '→'}</span>
            </div>
          )}

          <div className={'pet-game-talk' + (activity === 'talking' || activity === 'greeting' ? ' speaking' : '')} aria-live="polite">
            <span>{roomMessage}</span>
          </div>
        </div>

        <nav className="pet-room-strip" aria-label="Ev odaları">
          {ROOM_ORDER.map((id) => (
            <button key={id} type="button" className={room === id ? 'active' : ''} onClick={() => moveTo(id)}>
              <span>{ROOM_INFO[id].icon}</span>
              <b>{ROOM_INFO[id].label.replace(' Odası', '')}</b>
            </button>
          ))}
        </nav>

        <div className="pet-game-actions" aria-label="Panda eylemleri">
          <button type="button" onClick={() => kitchenGive('bambu')} className="feed">
            <span>🍽️</span><b>Yemek</b>
          </button>
          <button type="button" onClick={bath}>
            <span>🛁</span><b>Banyo</b>
          </button>
          <button type="button" onClick={sleep}>
            <span>🛏️</span><b>{activity === 'sleeping' ? 'Uyandır' : 'Uyku'}</b>
          </button>
          <button type="button" onClick={garden}>
            <span>⚽</span><b>Oyun</b>
          </button>
          <button type="button" onClick={talk}>
            <span>💬</span><b>Konuş</b>
          </button>
        </div>
      </section>

      <section className="pet-game-quick section">
        <button type="button" onClick={roam}>
          <span>🐾</span><b>Evde gez</b><small>Kendi kendine dolaşsın</small>
        </button>
        <button type="button" onClick={greet}>
          <span>👋</span><b>Selam ver</b><small>Sana dönüp tepki versin</small>
        </button>
        <button type="button" onClick={() => kitchenGive('su')}>
          <span>💧</span><b>Su ver</b><small>{needs.drops} damla</small>
        </button>
        <button type="button" onClick={studyTogether}>
          <span>📚</span><b>Birlikte çalış</b><small>Çalışma odasına geç</small>
        </button>
        <button type="button" onClick={relax}>
          <span>🛋️</span><b>Mola ver</b><small>Salonda dinlensin</small>
        </button>
      </section>

      <details className="card section pet-game-drawer">
        <summary>
          <span>
            <b>Bakım ve gelişim</b>
            <small>İhtiyaçlar, XP, görevler ve ev ilerlemesi</small>
          </span>
          <Icon name="right" />
        </summary>
        <div className="pet-game-drawer-body">
          <div className="pet-dashboard">
            <div className="pet-care-card">
              <Meter label="Tokluk 🎋" value={needs.food} kind="food" />
              <Meter label="Su 💧" value={needs.water} kind="water" />
              <div className="life-meter-grid">
                <div><span>Temizlik</span><b>%{cleanliness}</b></div>
                <div><span>Enerji</span><b>%{energy}</b></div>
                <div><span>Mutluluk</span><b>%{happiness}</b></div>
              </div>
            </div>
            <div className="pet-growth-card">
              <div className="row between nowrap">
                <b>Seviye {p.level}</b>
                <span className="badge brand">{p.todayXp} XP bugün</span>
              </div>
              <ProgressBar value={pct} label="Seviye ilerlemesi" />
              <p className="small muted">{p.xp} XP · sonraki seviyeye {Math.max(0, p.nextLevelXp - p.xp)} XP</p>
              <div className="pet-next-unlock">
                <span className="pet-next-icon">{nextUpgrade?.icon ?? '✨'}</span>
                <div className="grow">
                  <b>{nextUpgrade ? 'Sıradaki ev geliştirmesi' : 'Ev tamamen gelişti'}</b>
                  <span>{nextUpgrade ? 'Seviye ' + nextUpgrade.level + ': ' + nextUpgrade.label : 'Tüm ev geliştirmeleri açık.'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panda-quest-card">
            <div className="card-head">
              <div>
                <div className="eyebrow">Günlük görevler</div>
                <h3>{questDone}/{quests.length} tamamlandı</h3>
              </div>
            </div>
            <div className="panda-quests">
              {quests.map((q) => (
                <div className={'panda-quest ' + (q.done ? 'done' : '')} key={q.label}>
                  <span className="panda-quest-icon">{q.done ? '✓' : q.icon}</span>
                  <span className="grow">
                    <b>{q.label}</b>
                    <ProgressBar value={(q.current / Math.max(1, q.target)) * 100} label={q.label} />
                  </span>
                  <span className="tiny muted">{q.current}/{q.target}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="row between">
              <b>Ev gelişimi</b>
              <span className="badge">%{Math.round(housePct)}</span>
            </div>
            <div className="room-unlocks mt-12">
              {HOUSE_UPGRADES.map((item) => {
                const open = item.level <= p.level;
                return (
                  <div key={item.label} className={'room-unlock ' + (open ? 'open' : 'locked')}>
                    <span>{open ? item.icon : '🔒'}</span>
                    <b>{item.label}</b>
                    <small>{open ? 'Aktif' : 'Seviye ' + item.level}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </details>

      <details className="card section pet-game-drawer">
        <summary>
          <span>
            <b>Gardırop ve panda adı</b>
            <small>Aksesuarları değiştir, pandana isim ver</small>
          </span>
          <Icon name="right" />
        </summary>
        <div className="pet-game-drawer-body">
          <div className="pet-items">
            {PET_ITEMS.map((i) => {
              const open = i.level <= p.level;
              const on = pet.items.includes(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  className={'pet-item' + (on ? ' on' : '') + (open ? '' : ' locked')}
                  aria-pressed={on}
                  disabled={!open}
                  onClick={() => toggle(i.id)}
                >
                  <span className="pet-item-icon">{open ? i.icon : '🔒'}</span>
                  <b>{i.label}</b>
                  <span className="tiny muted">{open ? (on ? 'Takılı' : 'Tak') : 'Seviye ' + i.level}</span>
                </button>
              );
            })}
          </div>
          {nextItem && <div className="tiny muted">Sıradaki aksesuar: Seviye {nextItem.level} · {nextItem.icon} {nextItem.label}</div>}

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim().slice(0, 20);
              if (!n) return;
              update((s) => updateSettings(s, { pet: { ...s.settings.pet, name: n } }));
              toast('Pandanın yeni adı: ' + n + ' ♡');
            }}
          >
            <input className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} aria-label="Panda adı" />
            <button type="submit" className="btn primary">Adı kaydet</button>
          </form>
        </div>
      </details>

      <details className="card section pet-game-drawer">
        <summary>
          <span>
            <b>Bakım ve XP kuralları</b>
            <small>Bambu, su ve seviye sistemi</small>
          </span>
          <Icon name="right" />
        </summary>
        <div className="pet-rule-grid pet-game-drawer-body">
          <section>
            <h3>Yemek ve su</h3>
            <ul className="list">
              {EARN_RULES.map(([k, v]) => (
                <li key={k + v} className="list-item">
                  <b className="small">{k}</b>
                  <span className="grow small">{v}</span>
                </li>
              ))}
            </ul>
            <p className="tiny muted mt-8">
              Bir bambu tokluğu %{FOOD_PER_BAMBOO}, bir damla su %{WATER_PER_DROP} artırır.
            </p>
            <PetNotifyToggle />
          </section>
          <section>
            <h3>XP kazanma</h3>
            <ul className="list">
              {XP_RULES.map(([k, v]) => (
                <li key={k} className="list-item">
                  <span className="grow small">{k}</span>
                  <b className="small">{v}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </details>
    </div>
  );
}
