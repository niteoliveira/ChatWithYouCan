export type CipherType = 'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL';

export type Matrix2x2 = [
  [number, number],
  [number, number]
];

export interface LanInfo {
  localIp: string;
  port: number;
  clientCount: number;
  totalPackets: number;
}

export interface ChatPacket {
  id: string;
  senderId: string;
  senderName: string;
  cipherType: CipherType;
  ciphertext: string;
  metadata?: {
    length?: number;
    hint?: string;
    otpBits?: number;
    hillPadding?: boolean;
    // Eve detection aids:
    otpKeyHash?: string;
    originalDec?: string;
    checksum?: number;
  };
  timestamp: number;
}

export interface OtpResult {
  messageDec: string;
  keyDec: string;
  messageBin: string;
  keyBin: string;
  bitLength: number;
  xorBin: string;
  cipherDec: string;
  steps: string[];
}

export interface CaesarResult {
  plaintext: string;
  shift: number;
  ciphertext: string;
  steps: Array<{
    char: string;
    isLetter: boolean;
    origPos?: number;
    newPos?: number;
    cipherChar: string;
  }>;
}

export interface VigenereResult {
  plaintext: string;
  key: string;
  alignedKey: string;
  ciphertext: string;
  steps: Array<{
    char: string;
    keyChar: string;
    origPos: number;
    keyPos: number;
    cipherPos: number;
    cipherChar: string;
  }>;
}

export interface HillResult {
  plaintext: string;
  paddedText: string;
  matrix: Matrix2x2;
  det: number;
  detMod26: number;
  gcd: number;
  isInvertible: boolean;
  invDetMod26: number;
  invMatrix: Matrix2x2;
  blocks: Array<{
    pair: string;
    v1: number;
    v2: number;
    c1: number;
    c2: number;
    cipherPair: string;
    calculation: string;
  }>;
  ciphertext: string;
}

export interface TwoTimePadResult {
  c1Dec: string;
  c2Dec: string;
  c1Bin: string;
  c2Bin: string;
  xorBin: string;
  xorDec: string;
  xorAscii: string;
  explanation: string[];
  cribCandidates: Array<{
    crib: string;
    revealed: string;
    score: number;
  }>;
}
