// Gera public/musica.wav: 8 s a 120 BPM, progressão Am–F–C–G
// com pad, arpejo e batida suave. Tudo sintetizado, sem samples externos.
import {writeFileSync} from 'node:fs';

const SR = 44100;
const DURACAO = 8;
const BPM = 120;
const beat = 60 / BPM;
const n = SR * DURACAO;
const L = new Float32Array(n);
const R = new Float32Array(n);

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);
// Um acorde por compasso (4 tempos = 2 s)
const acordes = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C
  [55, 59, 62], // G
];

const add = (i, v, pan = 0) => {
  if (i < 0 || i >= n) return;
  // pan: -1 = esquerda, 0 = centro, 1 = direita
  L[i] += v * Math.min(1, 1 - pan);
  R[i] += v * Math.min(1, 1 + pan);
};

// Pad: ondas senoidais levemente desafinadas com ataque e liberação lentos
acordes.forEach((acorde, c) => {
  const ini = c * 4 * beat;
  const dur = 4 * beat;
  for (const nota of acorde) {
    for (const det of [-0.15, 0.15]) {
      const f = freq(nota) * 2 ** (det / 12);
      for (let s = 0; s < dur * SR; s++) {
        const t = s / SR;
        const env = Math.min(1, t / 0.4) * Math.min(1, (dur - t) / 0.4);
        add(Math.floor((ini + t) * SR), 0.035 * env * Math.sin(2 * Math.PI * f * t), det);
      }
    }
  }
  // Baixo
  const fb = freq(acorde[0] - 12);
  for (let s = 0; s < dur * SR; s++) {
    const t = s / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 0.6);
    add(Math.floor((ini + t) * SR), 0.12 * env * Math.sin(2 * Math.PI * fb * t));
  }
  // Arpejo em colcheias, uma oitava acima
  const padrao = [0, 1, 2, 1, 0, 2, 1, 2];
  padrao.forEach((idx, k) => {
    const f = freq(acorde[idx] + 12);
    const t0 = ini + k * (beat / 2);
    const pan = k % 2 ? 0.4 : -0.4;
    for (let s = 0; s < 0.45 * SR; s++) {
      const t = s / SR;
      const env = Math.min(1, t / 0.005) * Math.exp(-t * 7);
      const v = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t);
      add(Math.floor((t0 + t) * SR), 0.07 * env * v, pan);
    }
  });
});

// Batida: bumbo em todo tempo, chimbal nos contratempos
for (let b = 0; b < DURACAO / beat; b++) {
  const t0 = b * beat;
  let fase = 0;
  for (let s = 0; s < 0.3 * SR; s++) {
    const t = s / SR;
    fase += (2 * Math.PI * (45 + 110 * Math.exp(-t * 30))) / SR;
    add(Math.floor((t0 + t) * SR), 0.35 * Math.exp(-t * 12) * Math.sin(fase));
  }
  let semente = b * 9301 + 49297;
  for (let s = 0; s < 0.06 * SR; s++) {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff;
    const ruido = semente / 0x3fffffff - 1;
    add(Math.floor((t0 + beat / 2 + s / SR) * SR), 0.05 * Math.exp((-s / SR) * 60) * ruido, 0.2);
  }
}

// Fade de saída, normalização e escrita do WAV (16 bits, estéreo)
let pico = 0;
for (let i = 0; i < n; i++) {
  const fade = Math.min(1, (n - i) / (SR * 1.0));
  L[i] *= fade;
  R[i] *= fade;
  pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
}
const ganho = 0.89 / pico;
const buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round(L[i] * ganho * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * ganho * 32767), 46 + i * 4);
}
writeFileSync(new URL('../public/musica.wav', import.meta.url), buf);
console.log('public/musica.wav gerado');
