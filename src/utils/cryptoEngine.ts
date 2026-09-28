import type { Matrix2x2, OtpResult, CaesarResult, VigenereResult, HillResult, TwoTimePadResult } from '../types/crypto.ts';

// --- MATH UTILITIES (Pure TypeScript, Zero external libraries) ---

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function modInverse(a: number, m: number = 26): number {
  a = mod(a, m);
  for (let x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) {
      return x;
    }
  }
  return -1; // No modular inverse
}

// Convert arbitrary BigInt to binary string with fixed length padding
export function toPaddedBinary(val: bigint, bitLength: number): string {
  let bin = val.toString(2);
  if (bin.length < bitLength) {
    bin = '0'.repeat(bitLength - bin.length) + bin;
  }
  return bin;
}

// 32-bit FNV-1a checksum for message integrity verification upon decryption
export function computeChecksum(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// --- 1. ONE-TIME PAD (EXERCÍCIO 1 - BASE 10 NUMÉRICA) ---

export function encryptOtpDecimal(messageDecStr: string, keyDecStr: string): OtpResult {
  const cleanM = messageDecStr.trim();
  const cleanK = keyDecStr.trim();

  if (!/^\d+$/.test(cleanM)) {
    throw new Error('A mensagem deve ser um número inteiro decimal positivo.');
  }
  if (!/^\d+$/.test(cleanK)) {
    throw new Error('A chave deve ser um número inteiro decimal positivo.');
  }

  const mVal = BigInt(cleanM);
  const kVal = BigInt(cleanK);

  const mBinRaw = mVal.toString(2);
  const kBinRaw = kVal.toString(2);
  const maxBits = Math.max(mBinRaw.length, kBinRaw.length);

  const messageBin = toPaddedBinary(mVal, maxBits);
  const keyBin = toPaddedBinary(kVal, maxBits);

  let xorBin = '';
  for (let i = 0; i < maxBits; i++) {
    const bitM = messageBin[i];
    const bitK = keyBin[i];
    xorBin += bitM === bitK ? '0' : '1';
  }

  const cipherDec = BigInt('0b' + xorBin).toString(10);

  const steps = [
    `1. Mensagem decimal informada: ${cleanM}`,
    `2. Chave decimal informada: ${cleanK}`,
    `3. Conversão da mensagem para binário: ${mBinRaw} (${mBinRaw.length} bits)`,
    `4. Conversão da chave para binário: ${kBinRaw} (${kBinRaw.length} bits)`,
    `5. Alinhamento com padding de ${maxBits} bits:`,
    `   M: ${messageBin}`,
    `   K: ${keyBin}`,
    `6. Operação XOR bit a bit (M ⊕ K):`,
    `   C: ${xorBin}`,
    `7. Conversão do binário resultante para decimal (Base 10): ${cipherDec}`
  ];

  return {
    messageDec: cleanM,
    keyDec: cleanK,
    messageBin,
    keyBin,
    bitLength: maxBits,
    xorBin,
    cipherDec,
    steps
  };
}

export function decryptOtpDecimal(cipherDecStr: string, keyDecStr: string): OtpResult {
  // Decryption in OTP is symmetric: C ⊕ K = M
  const res = encryptOtpDecimal(cipherDecStr, keyDecStr);
  return {
    ...res,
    messageDec: res.cipherDec,
    cipherDec: cipherDecStr,
    steps: [
      `1. Cifrado decimal informado (C): ${cipherDecStr}`,
      `2. Chave decimal informada (K): ${keyDecStr}`,
      `3. Alinhamento binário de ${res.bitLength} bits:`,
      `   C: ${res.messageBin}`,
      `   K: ${res.keyBin}`,
      `4. Aplicação do XOR reverso (C ⊕ K):`,
      `   M: ${res.xorBin}`,
      `5. Mensagem original recuperada em decimal: ${res.cipherDec}`
    ]
  };
}

// Helpers to bridge text to decimal and back for Chat mode
export function textToDecimal(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return BigInt('0x' + (hex || '0')).toString(10);
}

export function decimalToText(decStr: string): string {
  try {
    let hex = BigInt(decStr).toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return `[Decimal puro: ${decStr}]`;
  }
}

// --- 2. CIFRA DE CÉSAR GENERALIZADA (EXERCÍCIO 2) ---

export function encryptCaesar(plaintext: string, shift: number): CaesarResult {
  const k = mod(shift, 26);
  let ciphertext = '';
  const steps: CaesarResult['steps'] = [];

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      // Uppercase A-Z
      const origPos = code - 65;
      const newPos = mod(origPos + k, 26);
      const cipherChar = String.fromCharCode(65 + newPos);
      ciphertext += cipherChar;
      steps.push({ char, isLetter: true, origPos, newPos, cipherChar });
    } else if (code >= 97 && code <= 122) {
      // Lowercase a-z
      const origPos = code - 97;
      const newPos = mod(origPos + k, 26);
      const cipherChar = String.fromCharCode(97 + newPos);
      ciphertext += cipherChar;
      steps.push({ char, isLetter: true, origPos, newPos, cipherChar });
    } else {
      // Preserve spaces, punctuation and numbers
      ciphertext += char;
      steps.push({ char, isLetter: false, cipherChar: char });
    }
  }

  return { plaintext, shift, ciphertext, steps };
}

export function decryptCaesar(ciphertext: string, shift: number): CaesarResult {
  return encryptCaesar(ciphertext, -shift);
}

// --- 3. CIFRA DE VIGENÈRE (EXERCÍCIO 3 - VALIDAÇÃO >= 4 PALAVRAS) ---

export function validateVigenereWords(text: string): { isValid: boolean; wordCount: number } {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return {
    isValid: words.length >= 4,
    wordCount: words.length
  };
}

export function encryptVigenere(plaintext: string, rawKey: string, enforceWordCount: boolean = true): VigenereResult {
  if (enforceWordCount) {
    const validation = validateVigenereWords(plaintext);
    if (!validation.isValid) {
      throw new Error(`A frase deve conter no mínimo 4 palavras conforme o requisito do exercício. Quantidade atual: ${validation.wordCount}`);
    }
  }

  const cleanKey = rawKey.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) {
    throw new Error('A chave de Vigenère deve conter pelo menos uma letra válida (A-Z).');
  }

  let ciphertext = '';
  let alignedKey = '';
  let keyIndex = 0;
  const steps: VigenereResult['steps'] = [];

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    let isUpper = code >= 65 && code <= 90;
    let isLower = code >= 97 && code <= 122;

    if (isUpper || isLower) {
      const base = isUpper ? 65 : 97;
      const origPos = code - base;
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const keyPos = keyChar.charCodeAt(0) - 65;
      const cipherPos = mod(origPos + keyPos, 26);
      const cipherChar = String.fromCharCode(base + cipherPos);

      ciphertext += cipherChar;
      alignedKey += keyChar;
      steps.push({ char, keyChar, origPos, keyPos, cipherPos, cipherChar });
      keyIndex++;
    } else {
      ciphertext += char;
      alignedKey += ' ';
    }
  }

  return { plaintext, key: cleanKey, alignedKey, ciphertext, steps };
}

export function decryptVigenere(ciphertext: string, rawKey: string): VigenereResult {
  const cleanKey = rawKey.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) {
    throw new Error('A chave de Vigenère deve conter pelo menos uma letra válida (A-Z).');
  }

  let plaintext = '';
  let alignedKey = '';
  let keyIndex = 0;
  const steps: VigenereResult['steps'] = [];

  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i];
    const code = char.charCodeAt(0);

    let isUpper = code >= 65 && code <= 90;
    let isLower = code >= 97 && code <= 122;

    if (isUpper || isLower) {
      const base = isUpper ? 65 : 97;
      const cipherPos = code - base;
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const keyPos = keyChar.charCodeAt(0) - 65;
      const origPos = mod(cipherPos - keyPos, 26);
      const plainChar = String.fromCharCode(base + origPos);

      plaintext += plainChar;
      alignedKey += keyChar;
      steps.push({ char, keyChar, origPos, keyPos, cipherPos, cipherChar: char });
      keyIndex++;
    } else {
      plaintext += char;
      alignedKey += ' ';
    }
  }

  return { plaintext, key: cleanKey, alignedKey, ciphertext, steps };
}

// --- 4. CIFRA DE HILL 2x2 (EXERCÍCIO 4 - MATRIZ MODULAR) ---

export function parseHillKeyString(keyStr: string): Matrix2x2 {
  const clean = keyStr.toUpperCase().replace(/[^A-Z0-9,\s-]/g, '').trim();

  // If provided as 4 letters (e.g. 'HILL', 'GYBN')
  if (/^[A-Z]{4}$/.test(clean)) {
    const a = clean.charCodeAt(0) - 65;
    const b = clean.charCodeAt(1) - 65;
    const c = clean.charCodeAt(2) - 65;
    const d = clean.charCodeAt(3) - 65;
    return [[a, b], [c, d]];
  }

  // If provided as comma or space separated numbers
  const nums = clean.split(/[,\s]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  if (nums.length === 4) {
    return [[mod(nums[0], 26), mod(nums[1], 26)], [mod(nums[2], 26), mod(nums[3], 26)]];
  }

  throw new Error('A chave de Hill deve ter 4 letras (ex: "HILL") ou 4 números (ex: "3, 3, 2, 5").');
}

export function analyzeHillMatrix(matrix: Matrix2x2) {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  const rawDet = a * d - b * c;
  const detMod26 = mod(rawDet, 26);
  const commonGcd = gcd(detMod26, 26);
  const isInvertible = commonGcd === 1;
  const invDetMod26 = isInvertible ? modInverse(detMod26, 26) : -1;

  let invMatrix: Matrix2x2 = [[0, 0], [0, 0]];
  if (isInvertible) {
    // Adjugate matrix: [[d, -b], [-c, a]]
    const adj00 = mod(d, 26);
    const adj01 = mod(-b, 26);
    const adj10 = mod(-c, 26);
    const adj11 = mod(a, 26);

    invMatrix = [
      [mod(invDetMod26 * adj00, 26), mod(invDetMod26 * adj01, 26)],
      [mod(invDetMod26 * adj10, 26), mod(invDetMod26 * adj11, 26)]
    ];
  }

  return {
    det: rawDet,
    detMod26,
    gcd: commonGcd,
    isInvertible,
    invDetMod26,
    invMatrix
  };
}

export function encryptHill(plaintext: string, matrix: Matrix2x2): HillResult {
  const analysis = analyzeHillMatrix(matrix);
  if (!analysis.isInvertible) {
    throw new Error(
      `A matriz de Hill não é invertível em Z26! det = ${analysis.detMod26}, gcd(det, 26) = ${analysis.gcd} (deve ser 1). Escolha outra chave.`
    );
  }

  // Sanitize text: letters only, uppercase
  const clean = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) {
    throw new Error('O texto para Hill deve conter letras (A-Z).');
  }

  // Pad with 'X' if length is odd
  const paddedText = clean.length % 2 === 0 ? clean : clean + 'X';
  let ciphertext = '';
  const blocks: HillResult['blocks'] = [];

  for (let i = 0; i < paddedText.length; i += 2) {
    const pair = paddedText.substring(i, i + 2);
    const v1 = pair.charCodeAt(0) - 65;
    const v2 = pair.charCodeAt(1) - 65;

    const c1 = mod(matrix[0][0] * v1 + matrix[0][1] * v2, 26);
    const c2 = mod(matrix[1][0] * v1 + matrix[1][1] * v2, 26);

    const cipherPair = String.fromCharCode(65 + c1) + String.fromCharCode(65 + c2);
    ciphertext += cipherPair;

    blocks.push({
      pair,
      v1,
      v2,
      c1,
      c2,
      cipherPair,
      calculation: `[${matrix[0][0]}*${v1} + ${matrix[0][1]}*${v2}] = ${c1} (${cipherPair[0]}), [${matrix[1][0]}*${v1} + ${matrix[1][1]}*${v2}] = ${c2} (${cipherPair[1]})`
    });
  }

  return {
    plaintext,
    paddedText,
    matrix,
    det: analysis.det,
    detMod26: analysis.detMod26,
    gcd: analysis.gcd,
    isInvertible: analysis.isInvertible,
    invDetMod26: analysis.invDetMod26,
    invMatrix: analysis.invMatrix,
    blocks,
    ciphertext
  };
}

export function decryptHill(ciphertext: string, matrix: Matrix2x2): HillResult {
  const analysis = analyzeHillMatrix(matrix);
  if (!analysis.isInvertible) {
    throw new Error(`A matriz de Hill não é invertível em Z26 (gcd=${analysis.gcd}).`);
  }

  // To decrypt, we encrypt using the inverse matrix!
  const decResult = encryptHill(ciphertext, analysis.invMatrix);
  return {
    ...decResult,
    matrix, // keep original matrix for reference
    invMatrix: analysis.invMatrix
  };
}

// --- 5. TWO-TIME PAD CRYPTANALYSIS (OPÇÃO B DO TRABALHO) ---

export function analyzeTwoTimePad(c1DecStr: string, c2DecStr: string): TwoTimePadResult {
  const c1 = BigInt(c1DecStr.trim());
  const c2 = BigInt(c2DecStr.trim());

  const c1BinRaw = c1.toString(2);
  const c2BinRaw = c2.toString(2);
  const maxBits = Math.max(c1BinRaw.length, c2BinRaw.length);

  const c1Bin = toPaddedBinary(c1, maxBits);
  const c2Bin = toPaddedBinary(c2, maxBits);

  let xorBin = '';
  for (let i = 0; i < maxBits; i++) {
    xorBin += c1Bin[i] === c2Bin[i] ? '0' : '1';
  }

  const xorVal = BigInt('0b' + xorBin);
  const xorDec = xorVal.toString(10);
  const xorAscii = decimalToText(xorDec);

  const explanation = [
    `1. Pacote 1 interceptado: C1 = M1 ⊕ K`,
    `2. Pacote 2 interceptado: C2 = M2 ⊕ K`,
    `3. Operação de cancelamento: C1 ⊕ C2 = (M1 ⊕ K) ⊕ (M2 ⊕ K)`,
    `4. Pela propriedade associativa e idempotência do XOR: K ⊕ K = 0`,
    `5. Logo: C1 ⊕ C2 = M1 ⊕ M2 (A chave K desapareceu por completo!)`,
    `6. Resultado C1 ⊕ C2 em decimal: ${xorDec}`,
    `7. Resultado C1 ⊕ C2 em binário (${maxBits} bits): ${xorBin}`
  ];

  // Common Portuguese crib words for crib-dragging demonstration
  const cribs = ['OLA', 'BOM', 'DIA', 'TESTE', 'CHAVE', 'SENHA', 'DADOS', 'REDE', 'ALUNO', 'PROF'];
  const cribCandidates: TwoTimePadResult['cribCandidates'] = [];

  for (const crib of cribs) {
    try {
      const cribDec = textToDecimal(crib);
      const cribVal = BigInt(cribDec);
      const testVal = xorVal ^ cribVal;
      const testText = decimalToText(testVal.toString(10));

      let score = 0;
      for (const char of testText) {
        if (/[A-Za-z0-9\s]/.test(char)) score++;
      }

      cribCandidates.push({
        crib,
        revealed: testText,
        score
      });
    } catch {
      // ignore
    }
  }

  cribCandidates.sort((a, b) => b.score - a.score);

  return {
    c1Dec: c1DecStr,
    c2Dec: c2DecStr,
    c1Bin,
    c2Bin,
    xorBin,
    xorDec,
    xorAscii,
    explanation,
    cribCandidates: cribCandidates.slice(0, 5)
  };
}
