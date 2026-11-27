import type {
  BandingQuestion,
  CompareOperator,
  CountObjectType,
  DifficultyLevel,
  GameMode,
  HitungQuestion,
  MathQuestion,
  OperasiQuestion,
  UrutQuestion,
} from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildChoices(answer: number, minVal: number, maxVal: number, count = 4): number[] {
  const set = new Set<number>([answer]);
  const offsets = [-3, -2, -1, 1, 2, 3, -4, 4, -5, 5];
  const shuffledOffsets = shuffle(offsets);

  for (const offset of shuffledOffsets) {
    if (set.size >= count) break;
    const candidate = answer + offset;
    if (candidate >= minVal && candidate <= maxVal) {
      set.add(candidate);
    }
  }

  while (set.size < count) {
    const candidate = randInt(minVal, maxVal);
    set.add(candidate);
  }

  return shuffle(Array.from(set));
}

const OBJECT_TYPES: {type: CountObjectType; label: string}[] = [
  {type: 'apel', label: 'apel'},
  {type: 'bintang', label: 'bintang'},
  {type: 'bebek', label: 'bebek'},
  {type: 'balok', label: 'balok'},
  {type: 'pensil', label: 'pensil'},
];

function createHitungQuestion(level: DifficultyLevel, idx: number): HitungQuestion {
  const maxObjects = level === 'dasar' ? 10 : level === 'mahir' ? 20 : 25;
  const minObjects = level === 'dasar' ? 2 : 5;
  const count = randInt(minObjects, maxObjects);
  const obj = OBJECT_TYPES[randInt(0, OBJECT_TYPES.length - 1)];

  return {
    id: `q_hitung_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind: 'hitung',
    prompt: `Ada berapa banyak ${obj.label} di bawah ini?`,
    objectType: obj.type,
    count,
    choices: buildChoices(count, 1, maxObjects + 3),
    answer: count,
    explanation: `Jika dihitung satu per satu, jumlah seluruh ${obj.label} ada ${count}.`,
  };
}

function createBandingQuestion(level: DifficultyLevel, idx: number): BandingQuestion {
  const maxNum = level === 'dasar' ? 10 : level === 'mahir' ? 20 : 50;
  const minNum = 1;

  // Include ~20% equal cases for balanced learning
  const makeEqual = Math.random() < 0.22;
  const left = randInt(minNum, maxNum);
  const right = makeEqual ? left : randInt(minNum, maxNum);

  let answer: CompareOperator = '=';
  let explanation = `${left} sama banyak dengan ${right}, jadi tandanya =.`;

  if (left > right) {
    answer = '>';
    explanation = `${left} lebih banyak daripada ${right}, jadi ${left} > ${right}.`;
  } else if (left < right) {
    answer = '<';
    explanation = `${left} lebih sedikit daripada ${right}, jadi ${left} < ${right}.`;
  }

  return {
    id: `q_banding_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind: 'banding',
    prompt: 'Pilih tanda perbandingan yang tepat!',
    left,
    right,
    answer,
    explanation,
  };
}

function createUrutQuestion(level: DifficultyLevel, idx: number): UrutQuestion {
  const maxNum = level === 'dasar' ? 10 : level === 'mahir' ? 20 : 50;
  const length = 5;

  let step = 1;
  if (level === 'mahir' && Math.random() < 0.35) {
    step = -1;
  } else if (level === 'tantangan') {
    const roll = Math.random();
    if (roll < 0.35) step = 2;
    else if (roll < 0.6) step = -1;
    else step = 1;
  }

  let start = 1;
  if (step > 0) {
    const maxStart = Math.max(1, maxNum - (length - 1) * step);
    start = randInt(1, maxStart);
  } else {
    const minStart = (length - 1) * Math.abs(step) + 1;
    start = randInt(minStart, maxNum);
  }

  const fullSeq = Array.from({length}, (_, i) => start + i * step);
  const missingIndex = randInt(1, length - 2);
  const answer = fullSeq[missingIndex];
  const sequence = fullSeq.map((val, i) => (i === missingIndex ? null : val));

  const stepWord =
    step === 1
      ? 'bertambah 1 setiap langkah'
      : step === -1
        ? 'berkurang 1 setiap langkah'
        : `meloncat ${step} setiap langkah`;

  return {
    id: `q_urut_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind: 'urut',
    prompt: 'Bilangan berapa yang tepat untuk mengisi kotak kosong?',
    sequence,
    missingIndex,
    step,
    choices: buildChoices(answer, 1, maxNum + 2),
    answer,
    explanation: `Urutan bilangan ${stepWord}, jadi angka yang hilang adalah ${answer}.`,
  };
}

function createOperasiQuestion(level: DifficultyLevel, idx: number): OperasiQuestion {
  const maxTotal = level === 'dasar' ? 10 : level === 'mahir' ? 20 : 40;
  const isAddition = Math.random() < 0.55;

  if (isAddition) {
    const a = randInt(1, maxTotal - 1);
    const b = randInt(1, maxTotal - a);
    const answer = a + b;
    return {
      id: `q_operasi_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      kind: 'operasi',
      prompt: 'Berapakah hasil penjumlahan ini?',
      a,
      b,
      operator: '+',
      choices: buildChoices(answer, 1, maxTotal + 2),
      answer,
      explanation: `Mulai dari ${a}, lalu tambah ${b} langkah lagi menjadi ${answer}.`,
    };
  }

  const a = randInt(2, maxTotal);
  const b = randInt(1, a - 1);
  const answer = a - b;
  return {
    id: `q_operasi_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind: 'operasi',
    prompt: 'Berapakah hasil pengurangan ini?',
    a,
    b,
    operator: '-',
    choices: buildChoices(answer, 0, maxTotal),
    answer,
    explanation: `Dari ${a} diambil ${b}, sisanya tinggal ${answer}.`,
  };
}

function getSignature(q: MathQuestion): string {
  switch (q.kind) {
    case 'hitung':
      return `h_${q.count}_${q.objectType}`;
    case 'banding':
      return `b_${q.left}_${q.right}`;
    case 'urut':
      return `u_${q.sequence.join(',')}`;
    case 'operasi':
      return `o_${q.a}${q.operator}${q.b}`;
  }
}

export function generateRoundQuestions(
  mode: GameMode,
  level: DifficultyLevel,
  total = 10
): MathQuestion[] {
  const questions: MathQuestion[] = [];
  const seen = new Set<string>();
  const mixedKinds: Array<'hitung' | 'banding' | 'urut' | 'operasi'> = [
    'hitung',
    'banding',
    'urut',
    'operasi',
    'hitung',
    'banding',
    'urut',
    'operasi',
    'operasi',
    'urut',
  ];

  let attempts = 0;
  while (questions.length < total && attempts < 120) {
    attempts++;
    const idx = questions.length;
    const kind = mode === 'campuran' ? mixedKinds[idx % mixedKinds.length] : mode;

    let q: MathQuestion;
    if (kind === 'hitung') {
      q = createHitungQuestion(level, idx);
    } else if (kind === 'banding') {
      q = createBandingQuestion(level, idx);
    } else if (kind === 'urut') {
      q = createUrutQuestion(level, idx);
    } else {
      q = createOperasiQuestion(level, idx);
    }

    const sig = getSignature(q);
    if (!seen.has(sig)) {
      seen.add(sig);
      questions.push(q);
    }
  }

  return questions;
}
