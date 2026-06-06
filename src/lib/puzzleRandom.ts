type Rng = () => number;

export type SignalConfig = {
  target: {
    frequency: number;
    amplitude: number;
    phase: number;
  };
  initial: {
    frequency: number;
    amplitude: number;
    phase: number;
  };
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const makeRng = (seed: string): Rng => {
  let state = hashString(seed);
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const intBetween = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const decimalBetween = (rng: Rng, min: number, max: number, step = 0.1) => {
  const ticks = Math.round((max - min) / step);
  return Number((min + intBetween(rng, 0, ticks) * step).toFixed(1));
};

const choice = <T,>(rng: Rng, items: T[]) => items[intBetween(rng, 0, items.length - 1)];

const shuffle = <T,>(rng: Rng, items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = intBetween(rng, 0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const position = (rng: Rng, maxTop = 76) => ({
  top: `${intBetween(rng, 10, maxTop)}%`,
  left: `${intBetween(rng, 10, 85)}%`,
});

// A function to get non-overlapping positions for Puzzle 1
const getGridPositions = (rng: Rng, count: number) => {
  const positions = [];
  const cols = 4;
  const rows = 4;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ r, c });
    }
  }
  const shuffledCells = shuffle(rng, cells).slice(0, count);
  
  for (const cell of shuffledCells) {
    // cell width ~25%, height ~25%
    const topBase = cell.r * 25;
    const leftBase = cell.c * 25;
    positions.push({
      top: `${topBase + intBetween(rng, 2, 10)}%`,
      left: `${leftBase + intBetween(rng, 2, 10)}%`,
    });
  }
  return positions;
};

// Possíveis senhas para o primeiro Puzzle, todas relacionadas à data especial de Luca e Mimi
export const getPuzzle1Config = (seed: string) => {
  const rng = makeRng(`${seed}:p1`);
  const dateFormats = [
    '13 DE MAIO DE 2026',
    '13/05/2026',
    '13 DE MAIO',
    '13052026'
  ];
  const key = choice(rng, dateFormats);
  
  // eslint-disable-next-line no-useless-assignment
  let chunks: string[] = [];
  if (key.includes(' ')) {
    chunks = key.split(' ');
  } else if (key.includes('/')) {
    chunks = key.split('/');
  } else {
    chunks = key.match(/.{1,3}/g) ?? [key];
  }

  const dummyChunks = shuffle(rng, ['14', '06', 'JUNHO', '2025', 'AMOR']).slice(0, 3);
  const allChunks = [...chunks, ...dummyChunks];

  const positions = getGridPositions(rng, allChunks.length);

  const fragments = shuffle(
    rng,
    allChunks.map((chunk, index) => ({
      id: index + 1,
      text: chunk,
      pos: positions[index],
    })),
  );

  return { key, fragments, totalRealChunks: chunks.length };
};


// Configurações para o Puzzle 2, tendo um número da sorte e a data em que se conheceram 
export const getPuzzle2Config = (seed: string) => {
  const rng = makeRng(`${seed}:p2`);

  const luckyNumber = 7;
  const connectionDate = 1305;
  
  const syncFactor = intBetween(rng, 2, 15);
  const heartOffset = intBetween(rng, 10, 99);

  return {
    luckyNumber,
    syncFactor,
    connectionDate,
    heartOffset,
    lucaExpected: luckyNumber * syncFactor,
    mimiExpected: connectionDate + luckyNumber + heartOffset, 
  };
};

// Configurações para o Puzzle 3, onde as senhas possíveis são relacionadas a Luca e Mimi, como gosto, apelido ou data.
export const getPuzzle3Config = (seed: string) => {
  const rng = makeRng(`${seed}:p3`);
  const passwords = ['13 DE MAIO', 'IDOSO', 'BOLO', 'CAFÉ'];
  const password = choice(rng, passwords);
  const words = [
    'SENHA',
    ...password.split(' '),
    choice(rng, ['COMEÇO', 'DATA ESPECIAL', 'INICIO']),
    choice(rng, ['APELIDO', 'LUCA É', 'VELHICE']),
    choice(rng, ['DOCE FAVORITO', 'MIMI AMA', 'GOSTOSO']),
    choice(rng, ['DELICIOSO', 'LUCA AMA', 'PERFEITO']),
  ];

  return {
    password,
    fragments: shuffle(
      rng,
      words.map((word, index) => ({
        id: index + 1,
        text: word,
        rotation: intBetween(rng, -18, 18),
        pos: position(rng, 30),
        isPasswordPart: index <= password.split(' ').length,
      })),
    ),
  };
};

const keyOf = (x: number, y: number) => `${x},${y}`;

// Configurações para o Puzzle 4, onde o labirinto é gerado a partir de um caminho garantido entre início e fim, e o restante é preenchido aleatoriamente.
export const getPuzzle4Config = (seed: string, attempt: number) => {
  const rng = makeRng(`${seed}:p4:${attempt}`);
  const size = 8;
  const start = { x: 0, y: 0 };
  const end = { x: size - 1, y: size - 1 };
  const path = new Set<string>([keyOf(start.x, start.y)]);
  let cursor = { ...start };
  let guard = 0;

  while ((cursor.x !== end.x || cursor.y !== end.y) && guard < 200) {
    guard += 1;
    const options = [
      { x: cursor.x + 1, y: cursor.y, weight: 4 },
      { x: cursor.x, y: cursor.y + 1, weight: 4 },
      { x: cursor.x - 1, y: cursor.y, weight: 1 },
      { x: cursor.x, y: cursor.y - 1, weight: 1 },
    ].filter((option) => option.x >= 0 && option.x < size && option.y >= 0 && option.y < size);

    const weighted = options.flatMap((option) => Array.from({ length: option.weight }, () => option));
    cursor = choice(rng, weighted);
    path.add(keyOf(cursor.x, cursor.y));
  }

  const maze = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      if (path.has(keyOf(x, y))) return 0;
      return rng() < 0.48 ? 1 : 0;
    }),
  );

  maze[start.y][start.x] = 0;
  maze[end.y][end.x] = 0;

  return { maze, size, start, end };
};

// Configurações para o Puzzle 5, onde a frequência, amplitude e fase são geradas aleatoriamente dentro de um intervalo, garantindo que o desafio seja sempre possível a partir de uma configuração inicial próxima.
export const getPuzzle5Config = (seed: string): SignalConfig => {
  const rng = makeRng(`${seed}:p5`);
  const target = {
    // Frequências entre 2.4 e 8.8, com passos de 0.2 para garantir que a configuração inicial possa ser ajustada para o alvo
    frequency: decimalBetween(rng, 2.4, 8.8, 0.2),
    amplitude: decimalBetween(rng, 2.2, 7.4, 0.2),
    phase: decimalBetween(rng, 1.5, 18.5, 0.5),
  };
  const initial = {
    frequency: Number(Math.max(1, target.frequency + choice(rng, [-2.2, -1.8, 1.6, 2.4])).toFixed(1)),
    amplitude: Number(Math.max(1, target.amplitude + choice(rng, [-1.4, 1.6, 2.2])).toFixed(1)),
    phase: Number(Math.min(20, Math.max(0, target.phase + choice(rng, [-4.5, -2.5, 3.5, 4.5]))).toFixed(1)),
  };

  return { target, initial };
};

// Configurações para o Puzzle 6, onde as cores dos fios e botões, os símbolos e os requisitos são gerados aleatoriamente a partir de um conjunto de opções relacionadas a Luca e Mimi, garantindo que o desafio seja sempre possível.
export const getPuzzle6Config = (seed: string, attempt: number) => {
  const rng = makeRng(`${seed}:p6:${attempt}`);
  const wireColors = shuffle(rng, ['red', 'blue', 'green', 'pink']);
  const buttonColors = shuffle(rng, ['yellow', 'red', 'blue']);
  const symbols = shuffle(rng, ['HEART', 'SOUL', '13', '7']).slice(0, 3);
  const requiredWire = choice(rng, wireColors);
  const requiredButton = choice(rng, buttonColors);

  return { wireColors, buttonColors, symbols, requiredWire, requiredButton };
};

// Configurações para o Puzzle 7, onde as posições dos alvos são geradas aleatoriamente dentro de uma área específica, garantindo que estejam sempre acessíveis e que o desafio seja possível.
export const getPuzzle7Config = (seed: string) => {
  const rng = makeRng(`${seed}:p7`);
  return {
    lucaTarget: { x: intBetween(rng, 54, 246), y: intBetween(rng, 34, 126) },
    mimiTarget: { x: intBetween(rng, 54, 246), y: intBetween(rng, 34, 126) },
  };
};
