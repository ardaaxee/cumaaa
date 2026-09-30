import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
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
import { playPandaVoice, stopPandaVoice, unlockPandaVoice } from '../utils/pandaVoice';
import { usePandaBallGame } from '../hooks/usePandaBallGame';
import { BALL_GOAL, ballPosition } from '../utils/pandaBallGame';
import { ROOM_ORDER, PANDA_LIFE_KEY, clampLife, loadPandaLife, type HouseRoom, type PandaLifeSnapshot } from '../utils/pandaLife';
import '../styles/panda-home.css';

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
  { level: 7, icon: '🌇', label: 'Balkon yaşamı' },
  { level: 8, icon: '🌙', label: 'Gece aydınlatması' },
  { level: 10, icon: '🏆', label: 'Başarı duvarı' },
];

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
  | 'talking'
  | 'laughing'
  | 'angry'
  | 'shy'
  | 'yawning'
  | 'sneezing'
  | 'surprised';

type PandaEmotion = 'neutral' | 'laugh' | 'angry' | 'shy' | 'yawn' | 'sneeze' | 'surprised';


const ROOM_INFO: Record<HouseRoom, { icon: string; label: string; desc: string }> = {
  living: { icon: '🛋️', label: 'Salon', desc: 'Dinlenme ve oyun alanı' },
  kitchen: { icon: '🍽️', label: 'Mutfak', desc: 'Yemek ve su burada' },
  bedroom: { icon: '🛏️', label: 'Yatak Odası', desc: 'Uyku ve gece rutini' },
  bathroom: { icon: '🛁', label: 'Banyo', desc: 'Temizlik ve bakım' },
  study: { icon: '📚', label: 'Çalışma Odası', desc: 'Ders ve odak zamanı' },
  garden: { icon: '🌿', label: 'Bahçe', desc: 'Oyun ve temiz hava' },
  balcony: { icon: '🌇', label: 'Balkon', desc: 'Manzara, bitkiler ve sakin mola' },
};

const PANDA_TALK: Record<HouseRoom, string[]> = {
  living: [
    'Selam! Geldiğine sevindim. Biraz salonda takılalım mı?',
    'Bugün nasılsın? Ben biraz dolaşıp sonra dinleneceğim.',
    'Beni sevince moralim yükseliyor, biliyor muydun?',
  ],
  kitchen: [
    'Mutfakta güzel bir şeyler var mı? Biraz acıkmış olabilirim.',
    'Bambu verirsen beraber küçük bir yemek molası yapalım.',
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
  balcony: [
    'Balkonda biraz hava alalım mı? Manzara güzel.',
    'Bitkilere bakmak beni sakinleştiriyor.',
    'Burada kısa bir mola çok iyi geliyor.',
  ],
};

const PANDA_REACTIONS: { activity: HouseActivity; emotion: PandaEmotion; line: string; voice: 'laugh' | 'angry' | 'shy' | 'yawn' | 'sneeze' | 'surprised' }[] = [
  { activity: 'laughing', emotion: 'laugh', line: 'Hıhıhı! Çok komikti! 😄', voice: 'laugh' },
  { activity: 'shy', emotion: 'shy', line: 'Şey… beni böyle izleyince biraz utanıyorum 🙈', voice: 'shy' },
  { activity: 'yawning', emotion: 'yawn', line: 'Uaaah… biraz uykum geldi.', voice: 'yawn' },
  { activity: 'sneezing', emotion: 'sneeze', line: 'Hapşuu! Burnuma bir şey kaçtı 😳', voice: 'sneeze' },
  { activity: 'surprised', emotion: 'surprised', line: 'Ooo! Bunu beklemiyordum! 😮', voice: 'surprised' },
  { activity: 'angry', emotion: 'angry', line: 'Hımm! Biraz huysuzlandım ama geçecek 😤', voice: 'angry' },
];

const ROOM_TARGET: Record<HouseRoom, { x: number; y: number }> = {
  living: { x: 50, y: 2 },
  kitchen: { x: 54, y: 2 },
  bedroom: { x: 43, y: 2 },
  bathroom: { x: 59, y: 2 },
  study: { x: 48, y: 2 },
  garden: { x: 52, y: 2 },
  balcony: { x: 56, y: 3 },
};

function NeedBubble({ icon, label, value, onClick }: { icon: string; label: string; value: number; onClick: () => void }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <button type="button" onClick={onClick} className={'pet-need-bubble' + (v < 30 ? ' low' : '')}
      style={{ '--need': v + '%' } as CSSProperties} aria-label={label + ' yüzde ' + v + ', bakım yap'}>
      <span aria-hidden="true">{icon}</span><b>%{v}</b><small>{label}</small>
    </button>
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
  if (room === 'balcony') {
    return (
      <>
        <div className="pet-room-wall garden-wall">
          <div className="scene-sky-cloud one">☁</div>
          <div className="scene-sky-cloud two">☁</div>
          <div className="scene-garden-sun">☀</div>
          <div className="scene-fence"><span /><span /><span /><span /><span /></div>
        </div>
        <div className="scene-garden-tree">🌆</div>
        <div className="scene-garden-flowers">🪴 🌿 🌷</div>
        <button className="scene-object scene-garden-ball" type="button" onClick={onRelax} aria-label="Balkonda dinlen">☕</button>
        <div className="scene-garden-bench" />
        <div className="scene-garden-path" />
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
  if (activity === 'waiting') return name + ' mutfakta yemeğini bekliyor.';
  if (activity === 'eating') return name + ' afiyetle yemeğini yiyor.';
  if (activity === 'drinking') return name + ' suyunu içiyor.';
  if (activity === 'sleeping') return name + ' uyuyor. Tatlı rüyalar 🌙';
  if (activity === 'bathing') return name + ' köpüklü banyo yapıyor 🫧';
  if (activity === 'playing') return name + ' bahçede oyun oynuyor.';
  if (activity === 'studying') return name + ' çalışma masasında seninle ders çalışıyor.';
  if (activity === 'relaxing') return name + ' koltukta dinleniyor.';
  if (activity === 'greeting') return name + ' sana selam veriyor 👋';
  if (activity === 'talking') return name + ' seninle konuşuyor.';
  if (activity === 'laughing') return name + ' kahkaha atıyor 😄';
  if (activity === 'angry') return name + ' biraz huysuzlandı 😤';
  if (activity === 'shy') return name + ' utandı 🙈';
  if (activity === 'yawning') return name + ' esniyor 🥱';
  if (activity === 'sneezing') return name + ' hapşırdı 🤧';
  if (activity === 'surprised') return name + ' şaşırdı 😮';
  return ROOM_INFO[room].desc;
}

export default function PetPage() {
  const state = useAppState();
  const pet = state.settings.pet;
  const p = useMemo(() => petStatus(state), [state]);
  const needs = usePetNeeds();
  const initialLife = useMemo(() => loadPandaLife(), []);

  const [holding, setHolding] = useState<'bambu' | 'su' | null>(null);
  const [room, setRoom] = useState<HouseRoom>(initialLife.room);
  const [activity, setActivity] = useState<HouseActivity>('idle');
  const [roomMode, setRoomMode] = useState<'day' | 'night'>(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 7 ? 'night' : 'day';
  });
  const [hearts, setHearts] = useState(0);
  const [cleanliness, setCleanliness] = useState(initialLife.cleanliness);
  const [energy, setEnergy] = useState(initialLife.energy);
  const [happiness, setHappiness] = useState(initialLife.happiness);
  const [sceneMessage, setSceneMessage] = useState<string | null>(null);
  const [name, setName] = useState(pet.name);
  const [petPos, setPetPos] = useState(ROOM_TARGET[initialLife.room]);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [voiceOn, setVoiceOn] = useState(initialLife.voiceOn);
  const [emotion, setEmotion] = useState<PandaEmotion>('neutral');
  const ballGame = usePandaBallGame();
  const playScore = ballGame.score;
  const ballGameActive = ballGame.phase === 'playing';
  const playHighScore = ballGame.highScore;
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const pandaDragRef = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null>(null);
  const lastUserActionRef = useRef(Date.now());
  const timers = useRef<number[]>([]);
  const greeted = useRef(false);
  const dailyRoutineRef = useRef('');

  const sad = needs.hungry || needs.thirsty;
  const need = needsMessage(pet.name, needs);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((timer) => timer !== id);
      fn();
    }, ms);
    timers.current.push(id);
  };

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  const beginAction = () => {
    greeted.current = true;
    lastUserActionRef.current = Date.now();
    clearTimers();
    ballGame.stop();
    setHolding(null);
    setEmotion('neutral');
    stopPandaVoice();
  };

  useEffect(() => {
    if (ballGame.phase === 'completed') resultRef.current?.focus({ preventScroll: true });
    if (ballGame.phase === 'playing') ballRef.current?.focus({ preventScroll: true });
  }, [ballGame.phase]);

  const speak = (text: string, intent: 'greet' | 'talk' | 'happy' | 'hungry' | 'sleepy' | 'eat' | 'drink' | 'bath' | 'play' | 'laugh' | 'angry' | 'shy' | 'yawn' | 'sneeze' | 'surprised' = 'talk') => {
    setSceneMessage(text);
    void playPandaVoice(text, intent, voiceOn);
  };

  const randomLine = (where: HouseRoom = room) => {
    const lines = PANDA_TALK[where];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const greet = (withVoice = true) => {
    beginAction();
    setFacing('right');
    setEmotion('neutral');
    setActivity('greeting');
    const awayHours = Math.max(0, (Date.now() - initialLife.lastSeen) / 3_600_000);
    const text = awayHours >= 8
      ? 'Seni özledim! Yeniden geldin ya, çok sevindim 👋♡'
      : 'Selam! Ben ' + pet.name + '. Hoş geldin! 👋';
    setSceneMessage(text);
    if (withVoice) speak(text, 'greet');
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 2600);
  };



  const triggerReaction = (forced?: (typeof PANDA_REACTIONS)[number]) => {
    beginAction();
    const reaction = forced ?? PANDA_REACTIONS[Math.floor(Math.random() * PANDA_REACTIONS.length)];
    setEmotion(reaction.emotion);
    setActivity(reaction.activity);
    speak(reaction.line, reaction.voice);
    if (reaction.activity === 'angry') setHappiness((v) => Math.max(0, v - 2));
    if (reaction.activity === 'laughing') setHappiness((v) => Math.min(100, v + 3));
    later(() => {
      setEmotion('neutral');
      setActivity('idle');
      setSceneMessage(null);
    }, reaction.activity === 'yawning' ? 3600 : 2600);
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (greeted.current || Date.now() - lastUserActionRef.current < 600) return;
      greeted.current = true;
      greet(true);
    }, 650);
    return () => window.clearTimeout(id);
    // İlk karşılama yalnızca sayfa açılışında bir kez çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saveLife = () => {
      try {
        window.localStorage.setItem(PANDA_LIFE_KEY, JSON.stringify({ cleanliness, energy, happiness, room, voiceOn, lastSeen: Date.now() } satisfies PandaLifeSnapshot));
      } catch { /* depolama kapalıysa oyun yine çalışır */ }
    };
    saveLife();
    window.addEventListener('pagehide', saveLife);
    return () => window.removeEventListener('pagehide', saveLife);
  }, [cleanliness, energy, happiness, room, voiceOn]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCleanliness((v) => clampLife(v - (activity === 'bathing' ? 0 : 0.12)));
      setEnergy((v) => clampLife(v + (activity === 'sleeping' ? 0.9 : -0.16)));
      setHappiness((v) => clampLife(v - (activity === 'playing' || activity === 'laughing' ? -0.12 : 0.07)));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [activity]);

  useEffect(() => {
    if (activity !== 'idle' || ballGame.phase !== 'idle' || dragging) return;
    let cancelled = false;
    const wait = 8500 + Math.floor(Math.random() * 6500);
    const id = window.setTimeout(() => {
      if (cancelled) return;
      if (Date.now() - lastUserActionRef.current < 6500) return;
      const hour = new Date().getHours();
      if ((needs.hungry || needs.thirsty) && room !== 'kitchen') {
        setFacing('right');
        setActivity('walking');
        setSceneMessage(pet.name + ' acıktığı için mutfağa gidiyor…');
        setRoom('kitchen');
        setPetPos({ x: 52, y: 2 });
        later(() => {
          setActivity('waiting');
          setSceneMessage(pet.name + ' mutfakta seni bekliyor 🍽️');
          later(() => setActivity('idle'), 3000);
        }, 1200);
        return;
      }
      if (cleanliness < 28 && room !== 'bathroom') {
        setActivity('walking');
        setRoom('bathroom');
        setPetPos({ x: 59, y: 2 });
        setSceneMessage(pet.name + ' kendi kendine banyoya gidiyor…');
        later(() => {
          setActivity('bathing');
          void playPandaVoice('Banyo zamanı', 'bath', voiceOn);
          later(() => {
            setCleanliness(100);
            setActivity('idle');
            setSceneMessage(pet.name + ' tertemiz oldu ✨');
          }, 3200);
        }, 1000);
        return;
      }
      if ((energy < 24 || ((hour >= 22 || hour < 7) && energy < 55)) && room !== 'bedroom') {
        setActivity('walking');
        setRoom('bedroom');
        setPetPos({ x: 42, y: 2 });
        setSceneMessage(pet.name + ' uykusu geldiği için yatağına gidiyor…');
        later(() => {
          setActivity('sleeping');
          setRoomMode('night');
          void playPandaVoice('İyi geceler', 'sleepy', voiceOn);
          later(() => {
            setEnergy(100);
            setActivity('idle');
          }, 5200);
        }, 1100);
        return;
      }
      if (happiness < 35 && room !== 'garden' && room !== 'balcony') {
        setActivity('walking');
        setRoom('garden');
        setPetPos({ x: 52, y: 2 });
        setSceneMessage(pet.name + ' biraz neşelenmek için bahçeye çıkıyor…');
        later(() => {
          setActivity('playing');
          void playPandaVoice('Oyun zamanı', 'play', voiceOn);
          later(() => {
            setHappiness(100);
            setActivity('idle');
          }, 3600);
        }, 1100);
        return;
      }

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
        speak('Selam! Buradayım 👋', 'greet');
        later(() => {
          setActivity('idle');
          setSceneMessage(null);
        }, 2200);
        return;
      }

      if (roll < 0.90) {
        setActivity('talking');
        const text = randomLine();
        speak(text, 'talk');
        later(() => {
          setActivity('idle');
          setSceneMessage(null);
        }, 3000);
        return;
      }

      if (roll < 0.98) {
        const pool = sad
          ? PANDA_REACTIONS.filter((r) => r.emotion === 'angry' || r.emotion === 'yawn' || r.emotion === 'sneeze')
          : PANDA_REACTIONS.filter((r) => r.emotion !== 'angry');
        triggerReaction(pool[Math.floor(Math.random() * pool.length)]);
        return;
      }

      // Odaya uygun küçük bir kendi-kendine davranış.
      const contextual: Partial<Record<HouseRoom, HouseActivity>> = {
        living: 'relaxing',
        study: 'studying',
        garden: 'playing',
        balcony: 'relaxing',
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
  }, [activity, room, pet.name, petPos.x, needs.hungry, needs.thirsty, cleanliness, energy, happiness, voiceOn, ballGame.phase, dragging]);

  useEffect(() => {
    if (activity !== 'idle' || ballGame.phase !== 'idle' || dragging || needs.hungry || needs.thirsty) return;
    const now = new Date();
    const hour = now.getHours();
    const preferredHour = state.profile.preferredStudyTime
      ? Number(state.profile.preferredStudyTime.slice(0, 2))
      : null;

    let key = '';
    let target: HouseRoom | null = null;
    let pandaNext: HouseActivity = 'idle';
    let message = '';

    if (hour >= 23 || hour < 7) {
      key = 'night';
      target = 'bedroom';
      pandaNext = 'sleeping';
      message = 'Evde gece rutini başladı. ' + pet.name + ' yatağına geçiyor 🌙';
    } else if (preferredHour != null && hour === preferredHour) {
      key = 'preferred-study-' + preferredHour;
      target = 'study';
      pandaNext = 'studying';
      message = 'Çalışma saati geldi. ' + pet.name + ' çalışma odasına geçiyor 📚♡';
    } else if (hour >= 7 && hour < 9) {
      key = 'breakfast';
      target = 'kitchen';
      pandaNext = 'relaxing';
      message = 'Günaydın! Evde kahvaltı rutini başladı ☀️🍳';
    } else if (hour >= 9 && hour < 12) {
      key = 'morning-study';
      target = 'study';
      pandaNext = 'studying';
      message = 'Sabah çalışma zamanı. ' + pet.name + ' çalışma odasına geçti 📚';
    } else if (hour >= 18 && hour < 20) {
      key = 'dinner';
      target = 'kitchen';
      pandaNext = 'relaxing';
      message = 'Akşam oldu; evde yemek hazırlığı başladı 🍽️';
    } else if (hour >= 20 && hour < 23) {
      key = 'evening';
      target = 'balcony';
      pandaNext = 'relaxing';
      message = 'Günün sonunda ' + pet.name + ' balkonda biraz dinleniyor 🌇♡';
    }

    if (!key || !target) return;
    const stamp = dayKey() + ':' + key;
    if (dailyRoutineRef.current === stamp) return;
    dailyRoutineRef.current = stamp;

    beginAction();
    setSceneMessage(message);
    setActivity('walking');
    setRoom(target);
    setPetPos({ x: 42, y: 2 });

    later(() => {
      setActivity(pandaNext);
      if (pandaNext === 'sleeping') setRoomMode('night');
      else if (hour >= 7 && hour < 19) setRoomMode('day');
    }, 950);

    later(() => {
      if (pandaNext !== 'sleeping') setActivity('idle');
      if (pandaNext !== 'sleeping') setSceneMessage(null);
    }, pandaNext === 'sleeping' ? 12_000 : 5_500);
  }, [
    activity,
    ballGame.phase,
    dragging,
    needs.hungry,
    needs.thirsty,
    state.profile.preferredStudyTime,
    pet.name,
  ]);



  useEffect(() => () => {
    clearTimers();
    stopPandaVoice();
  }, []);

  const moveTo = (nextRoom: HouseRoom, nextActivity: HouseActivity = 'idle', message?: string) => {
    lastUserActionRef.current = Date.now();
    beginAction();
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
    lastUserActionRef.current = Date.now();
    const full = kind === 'bambu' ? needs.food >= 100 : needs.water >= 100;
    const have = kind === 'bambu' ? needs.bamboo : needs.drops;
    if (full) return toast(kind === 'bambu' ? pet.name + ' şu an tok ♡' : pet.name + ' şu an susamadı ♡');
    if (have < 1) {
      return toast(kind === 'bambu' ? 'Bambun kalmadı. 5 doğru cevap = 1 bambu 🎋' : 'Suyun kalmadı. 4 soru çöz = 1 damla su 💧');
    }

    beginAction();
    setRoom('kitchen');
    setPetPos({ x: 52, y: 2 });
    setFacing('right');
    setActivity('walking');
    setSceneMessage(pet.name + ' mutfağa koşuyor…');

    later(() => {
      setActivity('waiting');
      setSceneMessage(kind === 'bambu' ? pet.name + ' bambusunu bekliyor 🎋' : pet.name + ' su kabını bekliyor 💧');
    }, 900);

    later(() => {
      update((s) => (kind === 'bambu' ? feedPet(s) : waterPet(s)));
      setHolding(kind);
      setActivity(kind === 'bambu' ? 'eating' : 'drinking');
      const line = kind === 'bambu' ? 'Bambu hazır. Afiyet olsun 🎋' : 'Su hazır. Ohh, ferahladı 💧';
      speak(line, kind === 'bambu' ? 'eat' : 'drink');
      setHappiness((v) => Math.min(100, v + 5));
    }, 2200);

    later(() => {
      setHolding(null);
      setActivity('idle');
      setSceneMessage(null);
      toast(kind === 'bambu' ? 'Yemeğini bitirdi 🎋' : 'Suyunu içti 💧');
    }, 4700);
  };

  const bath = () => {
    beginAction();
    setRoom('bathroom');
    setPetPos({ x: 59, y: 2 });
    setFacing('right');
    setActivity('walking');
    setSceneMessage(pet.name + ' banyoya gidiyor…');
    later(() => {
      setActivity('bathing');
      speak('Köpükler hazır. Banyo zamanı 🫧', 'bath');
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
      beginAction();
      setActivity('idle');
      setRoomMode('day');
      setEnergy(100);
      setSceneMessage('Günaydın! ' + pet.name + ' uyandı ☀️');
      later(() => setSceneMessage(null), 1800);
      return;
    }
    beginAction();
    setRoom('bedroom');
    setPetPos({ x: 42, y: 2 });
    setFacing('left');
    setActivity('walking');
    setSceneMessage(pet.name + ' yatağına gidiyor…');
    later(() => {
      setActivity('sleeping');
      setRoomMode('night');
      speak('Işıkları kapattık. ' + pet.name + ' uyuyor 🌙', 'sleepy');
    }, 900);
    later(() => setEnergy(100), 4200);
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
    const outside = room === 'balcony';
    moveTo(outside ? 'balcony' : 'living', 'relaxing', outside ? 'Balkonda kısa bir mola 🌇' : 'Salonda kısa bir mola 🛋️');
    later(() => setEnergy((v) => Math.min(100, v + 5)), 2400);
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 4700);
  };

  const roam = () => {
    beginAction();
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


  const clampPos = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const userWalkTo = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage || activity === 'sleeping' || activity === 'bathing') return;
    const rect = stage.getBoundingClientRect();
    const nextX = clampPos(((clientX - rect.left) / Math.max(1, rect.width)) * 100, 14, 86);
    const rawBottom = ((rect.bottom - clientY) / Math.max(1, rect.height)) * 100 - 13;
    const nextY = clampPos(rawBottom, 1, 14);
    lastUserActionRef.current = Date.now();
    beginAction();
    setFacing(nextX < petPos.x ? 'left' : 'right');
    setActivity('walking');
    setPetPos({ x: nextX, y: nextY });
    setSceneMessage(null);
    later(() => setActivity('idle'), 900);
  };

  const stageTouch = useRef<{ x: number; y: number } | null>(null);

  const stagePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = stageTouch.current;
    stageTouch.current = null;
    const target = e.target as HTMLElement;
    if (target.closest('button,a') || !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10 || ballGame.phase !== 'idle') return;
    userWalkTo(e.clientX, e.clientY);
  };

  const pandaPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (activity === 'sleeping' || ballGame.phase !== 'idle') return;
    lastUserActionRef.current = Date.now();
    beginAction();
    pandaDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: petPos.x,
      y: petPos.y,
      moved: false,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const pandaPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = pandaDragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 7) drag.moved = true;
    if (!drag.moved) return;
    const nextX = clampPos(drag.x + (dx / Math.max(1, rect.width)) * 100, 14, 86);
    const nextY = clampPos(drag.y - (dy / Math.max(1, rect.height)) * 100, 1, 14);
    setFacing(dx < 0 ? 'left' : 'right');
    setActivity('walking');
    setPetPos({ x: nextX, y: nextY });
  };

  const pandaPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = pandaDragRef.current;
    pandaDragRef.current = null;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
    if (drag?.moved) {
      setActivity('idle');
      setSceneMessage('Buraya geldim 🐾');
      setHappiness((v) => clampLife(v + 1));
      later(() => setSceneMessage(null), 1300);
      return;
    }
    if (drag || activity === 'sleeping') touchPanda(e);
  };

  const finishBallGame = () => {
    if (ballGame.phase === 'completed') {
      setRoom('living');
      setPetPos(ROOM_TARGET.living);
    }
    beginAction();
    setActivity('idle');
    setSceneMessage(playScore > 0 ? `Top oyunu bitti · ${playScore}/${BALL_GOAL} ⚽` : null);
    later(() => setSceneMessage(null), 1600);
  };

  const playGame = () => {
    beginAction();
    setRoom('garden');
    setPetPos({ x: 38, y: 2 });
    setFacing('right');
    ballGame.start();
    setActivity('playing');
    setSceneMessage('10 kez topa dokun. Ben peşinden koşayım! ⚽');
  };

  const kickBall = () => {
    const next = ballGame.hit();
    if (!next) return;
    lastUserActionRef.current = Date.now();
    const target = ballPosition(next.score - 1);
    setFacing(target.x < petPos.x ? 'left' : 'right');
    setPetPos(target);
    if (next.phase === 'completed') {
      setHappiness((v) => clampLife(v + 12));
      setHearts((v) => v + 1);
      setEmotion('laugh');
      setActivity('laughing');
      speak('On numara! Top oyununu bitirdik! ⚽🏆', 'happy');
      try { navigator.vibrate?.([45, 55, 45]); } catch { /* Optional haptics. */ }
    } else {
      setSceneMessage(`${next.score}/${BALL_GOAL} · devam! ⚽`);
      try { navigator.vibrate?.(28); } catch { /* Optional haptics. */ }
    }
  };

  const petPanda = () => {
    beginAction();
    setHearts((v) => v + 1);
    setHappiness((v) => Math.min(100, v + 3));
    setActivity('greeting');
    const text = Math.random() > 0.5 ? 'Selam! Beni mi çağırdın? 👋' : 'Buradayım! Seninle takılmayı seviyorum.';
    speak(text, 'happy');
    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 2800);
  };

  const touchPanda = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    beginAction();
    void unlockPandaVoice();

    if (activity === 'sleeping') {
      setActivity('idle');
      setRoomMode('day');
      setEnergy(100);
      setEmotion('surprised');
      speak('Günaydın! Beni uyandırdın 😮', 'surprised');
      later(() => { setEmotion('neutral'); setSceneMessage(null); }, 2200);
      return;
    }

    if (y < 0.38) {
      setEmotion('shy');
      setActivity('shy');
      setHappiness((v) => clampLife(v + 5));
      speak('Başımı okşayınca çok hoşuma gidiyor 🙈♡', 'shy');
    } else if (y < 0.72) {
      setEmotion('laugh');
      setActivity('laughing');
      setHappiness((v) => clampLife(v + 7));
      speak('Hıhıhı! Gıdıklanıyorum 😄', 'laugh');
    } else {
      setEmotion('surprised');
      setActivity('surprised');
      setHappiness((v) => clampLife(v + 3));
      speak('Patime dokundun! 😮🐾', 'surprised');
    }

    setHearts((v) => v + 1);
    later(() => {
      setEmotion('neutral');
      setActivity('idle');
      setSceneMessage(null);
    }, 2400);
  };

  const nextItem = PET_ITEMS.find((i) => i.level > p.level);
  const nextUpgrade = HOUSE_UPGRADES.find((i) => i.level > p.level);
  const pct = ((p.xp - p.levelStartXp) / Math.max(1, p.nextLevelXp - p.levelStartXp)) * 100;
  const unlocked = HOUSE_UPGRADES.filter((i) => i.level <= p.level).length;
  const housePct = (unlocked / HOUSE_UPGRADES.length) * 100;
  const roomMessage = sceneMessage || need || activityText(activity, room, pet.name);

  const today = dayKey();
  const d = useMemo(() => dashboard(state, today), [state, today]);
  const doneTasks = state.tasks.filter((t) => t.date === today && t.done).length;
  const questQuestions = Math.max(10, Math.min(30, Math.round(state.profile.dailyQuestionGoal * 0.35)));
  const questMinutes = Math.max(20, Math.min(60, Math.round(state.profile.dailyStudyMinutes * 0.25)));
  const quests = [
    { icon: '⚡', label: questQuestions + ' soru çöz', current: Math.min(questQuestions, d.todayQuestions), target: questQuestions, done: d.todayQuestions >= questQuestions },
    { icon: '⏱️', label: questMinutes + ' dk odaklan', current: Math.min(questMinutes, d.todayMinutes), target: questMinutes, done: d.todayMinutes >= questMinutes },
    { icon: '✓', label: '1 plan görevi bitir', current: Math.min(1, doneTasks), target: 1, done: doneTasks >= 1 },
  ];
  const questDone = quests.filter((q) => q.done).length;

  const dailyStudyProgress = Math.min(
    100,
    Math.round(
      (((state.profile.dailyQuestionGoal > 0 ? Math.min(1, d.todayQuestions / state.profile.dailyQuestionGoal) : 1) +
        (state.profile.dailyStudyMinutes > 0 ? Math.min(1, d.todayMinutes / state.profile.dailyStudyMinutes) : 1)) /
        2) *
        100,
    ),
  );

  useEffect(() => {
    if (activity !== 'idle' || ballGame.phase !== 'idle' || dragging) return;
    const threshold = dailyStudyProgress >= 75 ? 75 : dailyStudyProgress >= 50 ? 50 : dailyStudyProgress >= 25 ? 25 : 0;
    if (!threshold) return;

    const key = `iyiki-panda-progress-${today}-${threshold}`;
    try {
      if (window.localStorage.getItem(key) === '1') return;
      window.localStorage.setItem(key, '1');
    } catch {
      /* kalıcı işaret tutulamazsa olay yine gösterilebilir */
    }

    beginAction();
    setHearts((v) => v + 1);
    setHappiness((v) => clampLife(v + 5));

    if (threshold === 25) {
      setRoom('kitchen');
      setPetPos({ x: 46, y: 2 });
      setActivity('greeting');
      setSceneMessage('Günün ilk çeyreği tamam! ' + pet.name + ' mutfakta küçük bir mola veriyor ☕♡');
      void playPandaVoice('Güzel başladık!', 'happy', voiceOn);
    } else if (threshold === 50) {
      setRoom('study');
      setPetPos({ x: 48, y: 2 });
      setActivity('studying');
      setSceneMessage('Günün yarısı tamamlandı! ' + pet.name + ' çalışma masasında sana eşlik ediyor 📚🐼');
      void playPandaVoice('Yarıladık, devam!', 'happy', voiceOn);
    } else {
      setRoom('balcony');
      setPetPos({ x: 45, y: 2 });
      setActivity('relaxing');
      setSceneMessage('Hedefin %75’i bitti. ' + pet.name + ' balkonda kısa bir nefes molasında 🌇♡');
      void playPandaVoice('Az kaldı!', 'happy', voiceOn);
    }

    later(() => {
      setActivity('idle');
      setSceneMessage(null);
    }, 4600);
    // Bu olay yalnız yeni bir günlük eşik ilk kez aşıldığında çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, dailyStudyProgress, today, pet.name, voiceOn, ballGame.phase, dragging]);

  useEffect(() => {
    if (activity !== 'idle' || ballGame.phase !== 'idle' || dragging) return;
    const key = 'iyiki-panda-surprise-' + today;
    try {
      if (window.localStorage.getItem(key) === '1') return;
    } catch {
      /* sürpriz kalıcı olmasa da çalışabilir */
    }

    let line: string | null = null;
    if (d.todayQuestions >= state.profile.dailyQuestionGoal && state.profile.dailyQuestionGoal > 0) {
      line = `${state.profile.name || 'Sen'}, bugün soru hedefini tamamladın! ${pet.name} küçük bir kutlama yapıyor 🎉♡`;
    } else if (d.todayMinutes >= state.profile.dailyStudyMinutes && state.profile.dailyStudyMinutes > 0) {
      line = `${state.profile.name || 'Sen'}, bugünkü çalışma süresi hedefin tamam! Biraz dinlenmeyi hak ettin ☕♡`;
    } else if (d.streak >= 7) {
      line = `${d.streak} günlük serin var! ${pet.name} bile seninle gurur duyuyor 🐼🏆`;
    } else if (doneTasks >= 3) {
      line = `Bugün ${doneTasks} plan görevi bitirdin. Evde küçük bir başarı kutlaması var ✨`;
    }
    if (!line) return;

    try { window.localStorage.setItem(key, '1'); } catch { /* noop */ }
    beginAction();
    setActivity('surprised');
    setEmotion('surprised');
    setSceneMessage(line);
    setHappiness((v) => clampLife(v + 10));
    setHearts((v) => v + 1);
    void playPandaVoice('Yaşasın! Bugün çok güzel ilerledik!', 'happy', voiceOn);

    later(() => {
      setActivity('playing');
      setEmotion('laugh');
    }, 800);
    later(() => {
      setActivity('idle');
      setEmotion('neutral');
      setSceneMessage(null);
    }, 4300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activity,
    ballGame.phase,
    dragging,
    today,
    d.todayQuestions,
    d.todayMinutes,
    d.streak,
    doneTasks,
    state.profile.dailyQuestionGoal,
    state.profile.dailyStudyMinutes,
    state.profile.name,
    pet.name,
    voiceOn,
  ]);

  const toggle = (id: string) =>
    update((s) => {
      if (!PET_ITEMS.some((item) => item.id === id && item.level <= petStatus(s).level)) return s;
      const items = s.settings.pet.items.includes(id) ? s.settings.pet.items.filter((x) => x !== id) : [...s.settings.pet.items, id];
      return updateSettings(s, { pet: { ...s.settings.pet, items } });
    });

  return (
    <div className="pet-game-page panda-home-v7">
      <section
        className={'pet-game ' + roomMode + ' room-' + room}
        aria-label={pet.name + ' sanal evcil hayvan evi'}
        onPointerDown={() => { if (voiceOn) void unlockPandaVoice(); }}
      >
        <header className="pet-game-top">
          <a className="pet-game-iconbtn" href="#/" aria-label="Ana sayfaya dön">
            <Icon name="home" />
          </a>
          <div className="pet-game-room-title">
            <span>{ROOM_INFO[room].icon}</span>
            <div>
              <b>{pet.name} ile evde</b>
              <small>Seviye {p.level} · {p.xp} XP</small>
            </div>
          </div>
          <button
            className="pet-game-iconbtn"
            type="button"
            onClick={() => {
              if (voiceOn) stopPandaVoice();
              else void unlockPandaVoice();
              setVoiceOn((v) => !v);
            }}
            aria-label={voiceOn ? 'Panda sesini kapat' : 'Panda sesini aç'}
            aria-pressed={voiceOn}
          >
            {voiceOn ? '🐼♪' : '🐼×'}
          </button>
        </header>

        <div className="pet-game-needs" aria-label="Panda ihtiyaçları">
          <NeedBubble icon="🎋" label="Tokluk" value={needs.food} onClick={() => kitchenGive('bambu')} />
          <NeedBubble icon="💧" label="Su" value={needs.water} onClick={() => kitchenGive('su')} />
          <NeedBubble icon="🫧" label="Temizlik" value={cleanliness} onClick={bath} />
          <NeedBubble icon="⚡" label="Enerji" value={energy} onClick={sleep} />
          <NeedBubble icon="♡" label="Neşe" value={happiness} onClick={petPanda} />
        </div>
        <div className="panda-inventory" aria-label="Bakım çantası">
          <span>🎋 <b>{needs.bamboo}</b> bambu</span>
          <span>💧 <b>{needs.drops}</b> damla</span>
          <a href="#/testler">Soru çöz, kazan</a>
        </div>
        <div
          ref={stageRef}
          className={'pet-stage scene-' + room + ' activity-' + activity + (ballGame.phase !== 'idle' ? ' has-ball-game' : '')}
          onPointerDown={(e) => { stageTouch.current = { x: e.clientX, y: e.clientY }; }}
          onPointerCancel={() => { stageTouch.current = null; }}
          onPointerUp={stagePointerUp}
        >
          <div className="pet-stage-room-badge">
            <span>{ROOM_INFO[room].icon}</span>
            <div><b>{ROOM_INFO[room].label}</b><small>{ROOM_INFO[room].desc}</small></div>
          </div>
          <div className="pet-stage-study-progress" aria-label={'Günlük çalışma ilerlemesi yüzde ' + dailyStudyProgress}>
            <span style={{ width: dailyStudyProgress + '%' }} />
            <b>%{dailyStudyProgress}</b>
          </div>
          <RoomBackdrop
            room={room}
            onFood={() => kitchenGive('bambu')}
            onSleep={sleep}
            onBath={bath}
            onStudy={studyTogether}
            onGarden={playGame}
            onRelax={relax}
          />

          <button className="pet-scene-arrow prev" type="button" onClick={() => changeRoom(-1)} aria-label="Önceki oda">‹</button>
          <button className="pet-scene-arrow next" type="button" onClick={() => changeRoom(1)} aria-label="Sonraki oda">›</button>

          <button
            type="button"
            className={'pet-stage-panda act-' + activity + ' facing-' + facing + (dragging ? ' is-dragging' : '')}
            style={{
              '--pet-x': petPos.x + '%',
              '--pet-y': petPos.y + '%',
              '--pet-depth': String(Math.max(0.9, 1 - petPos.y * 0.008)),
            } as CSSProperties}
            onPointerDown={pandaPointerDown}
            onPointerMove={pandaPointerMove}
            onPointerUp={pandaPointerUp}
            onPointerCancel={() => { pandaDragRef.current = null; setDragging(false); setActivity('idle'); }}
            onClick={(e) => { if (e.detail === 0) petPanda(); }}
            disabled={ballGame.phase !== 'idle'}
            aria-label={pet.name + ' pandayı sev'}
          >
            <RealisticPanda
              size={292}
              items={pet.items.filter((id) => PET_ITEMS.some((item) => item.id === id && item.level <= p.level))}
              sleepy={activity === 'sleeping'}
              sad={!holding && sad}
              eating={activity === 'eating'}
              drinking={activity === 'drinking'}
              bathing={activity === 'bathing'}
              playing={activity === 'playing'}
              waving={activity === 'greeting'}
              talking={activity === 'talking' || activity === 'greeting'}
              emotion={emotion}
            />
            <span className="pet-floor-shadow" />
            {hearts > 0 && <span key={hearts} className="pet-game-heart" aria-hidden="true">♡</span>}
            {activity === 'sleeping' && <span className="pet-game-sleep">Z z z</span>}
            {roomMessage && (
              <span className="pet-panda-mini-talk" aria-live="polite"
                style={{ left: petPos.x < 30 ? '65%' : petPos.x > 70 ? '35%' : '50%' }}>
                <i>🐼</i><b>{roomMessage}</b>
              </span>
            )}
          </button>

          {room === 'garden' && ballGameActive && (
            <>
              <div className="pet-ball-game-hud">
                <div>
                  <b>⚽ Top Oyunu</b>
                  <small>Rekor {playHighScore}</small>
                </div>
                <div className="pet-ball-game-progress" aria-label={'Top oyunu ' + playScore + ' / 10'}>
                  <span style={{ width: Math.min(100, playScore * 10) + '%' }} />
                </div>
                <strong aria-live="polite">{playScore}/10</strong>
                <button type="button" onClick={(e) => { e.stopPropagation(); finishBallGame(); }}>Bitir</button>
              </div>
              <button
                ref={ballRef}
                type="button"
                className="pet-tom-ball"
                style={{
                  left: ballPosition(playScore).x + '%',
                  bottom: (13 + ballPosition(playScore).y) + '%',
                }}
                onClick={(e) => { e.stopPropagation(); kickBall(); }}
                aria-label={'Top · skor ' + playScore}
              >
                ⚽<small>{playScore}</small>
              </button>
            </>
          )}

          {ballGame.phase === 'completed' && (
            <div ref={resultRef} tabIndex={-1} className="panda-game-result" role="region" aria-label="Top oyunu sonucu">
              <span aria-hidden="true">🏆</span>
              <h2>10’da 10!</h2>
              <p>{pet.name} seninle çok eğlendi.</p>
              <strong>Neşe +12 · En iyi skor {playHighScore}/10</strong>
              <div><button type="button" onClick={playGame}>Tekrar oyna</button>
                <button type="button" onClick={finishBallGame}>Eve dön</button></div>
            </div>
          )}
          <div className="pet-control-hint">
            <span>☝️ Zemine dokun: yürü</span>
            <span>↔️ Panda’yı sürükle</span>
          </div>
        </div>

        <nav className="pet-room-strip" aria-label="Ev odaları">
          {ROOM_ORDER.map((id) => (
            <button key={id} type="button" className={room === id ? 'active' : ''} aria-pressed={room === id} onClick={() => moveTo(id)}>
              <span>{ROOM_INFO[id].icon}</span>
              <b>{ROOM_INFO[id].label.replace(' Odası', '')}</b>
            </button>
          ))}
        </nav>

        <div className="pet-game-actions" aria-label="Panda eylemleri">
          <button type="button" onClick={petPanda} className="love">
            <span>♡</span><b>Sev</b>
          </button>
          <button type="button" onClick={() => kitchenGive('bambu')} className="feed">
            <span>🎋</span><b>Besle</b>
          </button>
          <button type="button" onClick={() => kitchenGive('su')} className="water">
            <span>💧</span><b>Su</b>
          </button>
          <button type="button" onClick={playGame} className="play">
            <span>⚽</span><b>Oyna</b>
          </button>
          <button type="button" onClick={sleep}>
            <span>🌙</span><b>{activity === 'sleeping' ? 'Uyandır' : 'Uyku'}</b>
          </button>
        </div>
      </section>

      <section className="panda-study-card" aria-label="Bugünkü çalışma">
        <div><span className="panda-study-label">BİRLİKTE İLERLEYELİM</span>
          <h2>Bir mola, sonra küçük bir adım.</h2>
          <p>Bugün {d.todayQuestions} soru · {Math.round(d.todayMinutes)} dk çalışma</p>
          <ProgressBar value={dailyStudyProgress} label="Günlük hedef" />
        </div>
        <div className="panda-study-links"><a href="#/odak">Odaklanmaya geç</a><a href="#/testler">Soru çöz</a></div>
      </section>
      <section className="pet-game-quick section">
        <button type="button" onClick={roam}>
          <span>🐾</span><b>Evde gez</b><small>Kendi kendine dolaşsın</small>
        </button>
        <button type="button" onClick={() => greet()}>
          <span>👋</span><b>Selam ver</b><small>Sana dönüp tepki versin</small>
        </button>
        <button type="button" onClick={bath}>
          <span>🫧</span><b>Banyo</b><small>Temizliği yenile</small>
        </button>
        <button type="button" onClick={studyTogether}>
          <span>📚</span><b>Çalışma odası</b><small>Masaya birlikte geç</small>
        </button>
        <button type="button" onClick={playGame}>
          <span>⚽</span><b>Top oyunu</b><small>Topa dokun, Panda peşinden koşsun</small>
        </button>
        <button type="button" onClick={() => triggerReaction()}>
          <span>🎭</span><b>Sürpriz tepki</b><small>Kahkaha · utanma · hapşırma…</small>
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
                <div><span>Temizlik</span><b>%{Math.round(cleanliness)}</b></div>
                <div><span>Enerji</span><b>%{Math.round(energy)}</b></div>
                <div><span>Mutluluk</span><b>%{Math.round(happiness)}</b></div>
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
