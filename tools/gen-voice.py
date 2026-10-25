#!/usr/bin/env python3
"""Jana fail pemandu suara (audio/*.mp3) untuk Jejak Haji.

Sebelum ini permainan guna Web Speech API — bunyi berbeza setiap peranti dan
kedengaran seperti robot. Di sini setiap ayat dijana sekali menjadi fail MP3
dengan suara tetap: ms-MY-OsmanNeural (Bahasa Melayu) dan ar-SA-HamedNeural
(Arab untuk doa). Permainan hanya memainkan fail, jadi bunyi seragam.

Guna:
    npx tsc -p tsconfig.json      # isi teks datang dari build/js
    python3 tools/gen-voice.py    # tulis audio/*.mp3 (langkau yang sedia ada)
    python3 tools/gen-voice.py --force   # jana semula semua

Perlukan: pip install edge-tts
Nota: aiohttp 3.14.3 menolak sambungan dengan 403; aiohttp >= 3.14.5 berjalan.
"""

from __future__ import annotations

import asyncio
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
MS = "ms-MY-OsmanNeural"
AR = "ar-SA-HamedNeural"
WORKERS = 5

DUMP = r"""
const vm = require("vm"), fs = require("fs");
const ctx = { console, Math, Date };
vm.createContext(ctx);
let code = "";
for (const f of ["00-config", "04-steps"]) code += fs.readFileSync(`build/js/${f}.js`, "utf8") + "\n";
code += "\n;globalThis.__D = { DOA, ALL_STEPS };";
vm.runInContext(code, ctx, { filename: "cfg" });
const { DOA, ALL_STEPS } = ctx.__D;
const out = {};
for (const s of ALL_STEPS) out[s.step.id] = [process.env.V_MS, s.step.text];
for (const k of Object.keys(DOA)) {
  out[k + "-ar"] = [process.env.V_AR, DOA[k].ar];
  out[k + "-ms"] = [process.env.V_MS, "Maksudnya: " + DOA[k].makna];
}
out["salam"] = [process.env.V_MS, "Assalamualaikum"];
out["selamat-kembali"] = [process.env.V_MS, "Selamat kembali"];
out["tenaga"] = [process.env.V_MS, "Tenaga rendah. Minum air dan berehat."];
out["suara-on"] = [process.env.V_MS, "Pemandu suara dihidupkan."];
process.stdout.write(JSON.stringify(out));
"""


def texts() -> dict[str, tuple[str, str]]:
    env = dict(__import__("os").environ, V_MS=MS, V_AR=AR)
    r = subprocess.run(["node", "-e", DUMP], cwd=ROOT, capture_output=True, text=True, env=env)
    if r.returncode:
        sys.exit(f"Gagal baca teks dari build/js — jalankan dulu `npx tsc -p tsconfig.json`\n{r.stderr}")
    raw = json.loads(r.stdout)
    if not raw:
        sys.exit("build/js tidak mengandungi data langkah/doa — jalankan semula `npx tsc -p tsconfig.json`")
    return {k: (v[0], v[1]) for k, v in raw.items()}


def main() -> int:
    force = "--force" in sys.argv
    AUDIO.mkdir(exist_ok=True)
    todo = {k: v for k, v in texts().items() if force or not (AUDIO / f"{k}.mp3").exists()}
    print(f"{len(todo)} klip perlu dijana")

    async def one(sem, key, voice, text):
        import edge_tts

        async with sem:
            await edge_tts.Communicate(text, voice).save(str(AUDIO / f"{key}.mp3"))

    async def run():
        sem = asyncio.Semaphore(WORKERS)
        await asyncio.gather(*(one(sem, k, v[0], v[1]) for k, v in todo.items()))

    asyncio.run(run())

    kosong = [k for k in todo if (AUDIO / f"{k}.mp3").stat().st_size < 500]
    if kosong:
        sys.exit(f"Klip kosong/terlalu kecil: {', '.join(kosong)}")
    total = sum(f.stat().st_size for f in AUDIO.glob("*.mp3"))
    print(f"OK {len(list(AUDIO.glob('*.mp3')))} klip, {(total / 1024 / 1024):.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
