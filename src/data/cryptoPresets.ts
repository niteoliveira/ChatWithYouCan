// Cryptographic demo presets and common dictionaries

export const CRYPTO_PRESETS = {
  vigenereKeys: ['SEGREDO', 'VERAO', 'CRIPTOGRAFIA', 'MATRIZ', 'ALGORITMO', 'SENHA'],
  hillKeys: [
    { word: 'HILL', desc: 'det = 15 mod 26, inv = 7' },
    { word: 'GYBN', desc: 'det = 7 mod 26, inv = 15' },
    { word: 'DDCF', desc: 'det = 17 mod 26, inv = 23' }
  ],
  samplePhrases: [
    'Ataque ao amanhecer na base secreta',
    'Seguranca em redes locais com criptografia pura',
    'Transmissao de dados ponto a ponto'
  ],
  cribWords: ['OLA', 'BOM', 'DIA', 'TESTE', 'CHAVE', 'SENHA', 'DADOS', 'REDE', 'ALUNO', 'PROF']
};
