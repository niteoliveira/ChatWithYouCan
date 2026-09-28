import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptOtpDecimal,
  decryptOtpDecimal,
  encryptCaesar,
  decryptCaesar,
  encryptVigenere,
  decryptVigenere,
  validateVigenereWords,
  parseHillKeyString,
  analyzeHillMatrix,
  encryptHill,
  decryptHill,
  analyzeTwoTimePad,
  textToDecimal,
  decimalToText,
  gcd,
  modInverse,
  computeChecksum
} from '../src/utils/cryptoEngine.ts';

test('1. One-Time Pad Decimal (Base 10)', () => {
  // Simple integer test
  const m = '12345';
  const k = '67890';
  const enc = encryptOtpDecimal(m, k);

  assert.equal(enc.messageDec, '12345');
  assert.equal(enc.keyDec, '67890');
  assert.ok(enc.cipherDec.length > 0);

  // Decryption should restore original decimal
  const dec = decryptOtpDecimal(enc.cipherDec, k);
  assert.equal(dec.messageDec, '12345');

  // BigInt support (very large numbers)
  const bigM = '98765432101234567890987654321';
  const bigK = '12345678909876543210123456789';
  const bigEnc = encryptOtpDecimal(bigM, bigK);
  const bigDec = decryptOtpDecimal(bigEnc.cipherDec, bigK);
  assert.equal(bigDec.messageDec, bigM);

  // Rejection of invalid inputs
  assert.throws(() => encryptOtpDecimal('-5', '10'), /número inteiro decimal positivo/);
  assert.throws(() => encryptOtpDecimal('abc', '10'), /número inteiro decimal positivo/);
});

test('2. Cifra de César Generalizada', () => {
  const text = 'Ola Mundo! Crypto 101.';
  const shift = 3;
  const enc = encryptCaesar(text, shift);
  assert.equal(enc.ciphertext, 'Rod Pxqgr! Fubswr 101.');

  const dec = decryptCaesar(enc.ciphertext, shift);
  assert.equal(dec.ciphertext, text);

  // Negative and oversized shifts
  const encNegative = encryptCaesar(text, -3);
  const decNegative = decryptCaesar(encNegative.ciphertext, -3);
  assert.equal(decNegative.ciphertext, text);

  const encOversized = encryptCaesar(text, 29); // 29 mod 26 = 3
  assert.equal(encOversized.ciphertext, enc.ciphertext);
});

test('3. Cifra de Vigenère com validação >= 4 palavras', () => {
  // Fails with < 4 words
  assert.throws(() => encryptVigenere('tres palavras so', 'CHAVE'), /mínimo 4 palavras/);
  assert.equal(validateVigenereWords('um dois tres').isValid, false);
  assert.equal(validateVigenereWords('um dois tres quatro').isValid, true);

  const phrase = 'Antigravity criptografia sem bibliotecas externas';
  const key = 'SEGREDO';
  const enc = encryptVigenere(phrase, key);
  assert.notEqual(enc.ciphertext, phrase);

  const dec = decryptVigenere(enc.ciphertext, key);
  assert.equal(dec.plaintext, phrase);
});

test('4. Cifra de Hill 2x2 e Aritmética Modular', () => {
  // Check gcd and modInverse
  assert.equal(gcd(15, 26), 1);
  assert.equal(modInverse(15, 26), 7); // 15 * 7 = 105 = 4*26 + 1
  assert.equal(modInverse(2, 26), -1); // Even number has no inverse mod 26

  // Key "HILL" -> [[7, 8], [11, 11]]
  // det = 77 - 88 = -11 = 15 mod 26
  const hillMatrix = parseHillKeyString('HILL');
  const analysis = analyzeHillMatrix(hillMatrix);
  assert.equal(analysis.detMod26, 15);
  assert.equal(analysis.isInvertible, true);
  assert.equal(analysis.invDetMod26, 7);

  // Encrypt & Decrypt
  const text = 'HELP';
  const enc = encryptHill(text, hillMatrix);
  const dec = decryptHill(enc.ciphertext, hillMatrix);
  assert.equal(dec.ciphertext, text);

  // Odd length padding with 'X'
  const oddText = 'ACT';
  const encOdd = encryptHill(oddText, hillMatrix);
  assert.equal(encOdd.paddedText, 'ACTX');
  const decOdd = decryptHill(encOdd.ciphertext, hillMatrix);
  assert.equal(decOdd.ciphertext, 'ACTX');

  // Non-invertible key rejection
  const nonInvMatrix = parseHillKeyString('2, 0, 0, 2');
  assert.throws(() => encryptHill('TESTE', nonInvMatrix), /não é invertível em Z26/);
});

test('5. Criptoanálise Two-Time Pad (Opção B)', () => {
  // Message 1 and Message 2 encrypted with the EXACT SAME KEY K
  const key = '9876543210';
  const m1 = '1111122222';
  const m2 = '3333344444';

  const c1 = encryptOtpDecimal(m1, key).cipherDec;
  const c2 = encryptOtpDecimal(m2, key).cipherDec;

  const ttp = analyzeTwoTimePad(c1, c2);

  // C1 ⊕ C2 must equal M1 ⊕ M2
  const m1XorM2 = encryptOtpDecimal(m1, m2).cipherDec;
  assert.equal(ttp.xorDec, m1XorM2);
});

test('6. Text to Decimal Conversions', () => {
  const sample = 'Segredo LAN 2026';
  const dec = textToDecimal(sample);
  const back = decimalToText(dec);
  assert.equal(back, sample);
});

test('7. Integridade e Autenticação de Chave (Checksum)', () => {
  const original = 'Mensagem Secreta 2026';
  const chk = computeChecksum(original);
  assert.ok(typeof chk === 'number' && chk > 0);

  // Exact match produces exact checksum
  assert.equal(computeChecksum(original), chk);

  // Wrong key / altered string produces different checksum
  assert.notEqual(computeChecksum('Mensagem Secreta 2027'), chk);
  assert.notEqual(computeChecksum('Ruído matematico aleatório'), chk);
});

