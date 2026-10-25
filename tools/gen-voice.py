#!/usr/bin/env python3
"""Jana fail pemandu suara (audio/*.mp3) untuk Jejak Haji.

Sebelum ini permainan guna Web Speech API — bunyi berbeza setiap peranti dan
kedengaran seperti robot. Di sini setiap ayat dijana sekali menjadi fail MP3
dengan suara tetap (Gemini TTS). Permainan hanya memainkan fail, jadi bunyi
seragam pada semua peranti dan tiada API key pada pelayar.

Guna:
    tsc -p tsconfig.json                 # teks datang dari build/js
    python3 tools/gen-voice.py           # tulis klip yang belum ada
    python3 tools/gen-voice.py --force   # jana semula semua

Guna kod TTS Gemini sedia ada dalam Hermes (`tools.tts_tool_providers`), jadi
persona suara dan resolusi key ikut tetapan Hermes — skrip ini tidak menulis
sendiri pelanggan Gemini.

Nota: doa Arab sengaja TANPA persona Bahasa Melayu, supaya bacaan Arab
kekal bacaan Arab.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
HERMES = pathlib.Path("/root/.hermes/hermes-agent")
MS, AR = "ms", "ar"
# Quota Tier 1 Gemini TTS: 10 generate/min. Gen ~5s + jeda 4s = ~7/min,
# bawah had. Naikkan bila quota naik.
DELAY = 4.0
RETRY_MAX = 4

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
    env = dict(os.environ, V_MS=MS, V_AR=AR)
    r = subprocess.run(["node", "-e", DUMP], cwd=ROOT, capture_output=True, text=True, env=env)
    if r.returncode:
        sys.exit(f"Gagal baca teks dari build/js — jalankan dulu `tsc -p tsconfig.json`\n{r.stderr}")
    raw = json.loads(r.stdout)
    if not raw:
        sys.exit("build/js tidak mengandungi data langkah/doa — jalankan semula `tsc -p tsconfig.json`")
    return {k: (v[0], v[1]) for k, v in raw.items()}


def load_hermes_config() -> dict:
    """Konfigurasi TTS Gemini ikut config.yaml Hermes (bukan tetapan keras)."""
    cfg_path = pathlib.Path("/root/.hermes/config.yaml")
    try:
        import yaml

        raw = yaml.safe_load(cfg_path.read_text()) or {}
    except Exception:
        raw = {}
    return dict(raw.get("tts", {}).get("gemini", {})) or {
        "model": "gemini-2.5-flash-preview-tts",
        "voice": "Aoede",
        "audio_tags": False,
    }


def ensure_key() -> None:
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return
    for line in pathlib.Path("/root/.hermes/.env").read_text().splitlines():
        if line.startswith(("GEMINI_API_KEY=", "GOOGLE_API_KEY=")):
            os.environ[line.split("=", 1)[0]] = line.split("=", 1)[1].strip()
            return
    sys.exit("GEMINI_API_KEY tiada — set dalam /root/.hermes/.env")


def main() -> int:
    force = "--force" in sys.argv
    sys.path.insert(0, str(HERMES))
    ensure_key()
    from tools.tts_tool_providers import _generate_gemini_tts  # noqa: E402

    gemini = load_hermes_config()
    ar_cfg = {k: v for k, v in gemini.items() if k != "persona_prompt_file"}

    AUDIO.mkdir(exist_ok=True)
    todo = {k: v for k, v in texts().items() if force or not (AUDIO / f"{k}.mp3").exists()}
    print(f"{len(todo)} klip perlu dijana")

    def one(item: tuple[str, tuple[str, str]]) -> str | None:
        key, (lang, text) = item
        cfg = ar_cfg if lang == AR else gemini
        for attempt in range(RETRY_MAX + 1):
            try:
                _generate_gemini_tts(text, str(AUDIO / f"{key}.mp3"), cfg)
                return None
            except Exception as exc:  # jangan senyap — senarai gagal dibentang
                msg = str(exc)
                if attempt == RETRY_MAX:
                    return f"{key}: {type(exc).__name__} {msg[:200]}"
                # 429 = tingkap seminit Tier 1; wajib tunggu penuh. Ralat
                # lain (400 model keluar teks, respon cacat) cuba semula segera.
                m = re.search(r"retry in ([\d.]+)s", msg)
                if m:
                    wait = float(m.group(1)) + 1
                else:
                    wait = 65.0 if "429" in msg else 3.0
                print(f"  {key}: {type(exc).__name__}, cuba semula dalam {wait:.0f}s")
                time.sleep(wait)
        return f"{key}: gagal selepas {RETRY_MAX} cubaan"

    gagal: list[str] = []
    for i, item in enumerate(todo.items()):
        g = one(item)
        if g:
            gagal.append(g)
        if i < len(todo) - 1:
            time.sleep(DELAY)

    if gagal:
        print("GAGAL:")
        for g in gagal:
            print("  -", g)
        return 1

    files = list(AUDIO.glob("*.mp3"))
    kosong = [f.stem for f in files if f.stat().st_size < 2000]
    if kosong:
        return sys.exit(f"Klip terlalu kecil (mungkin senyap): {', '.join(kosong)}")
    total = sum(f.stat().st_size for f in files)
    print(f"OK {len(files)} klip, {total / 1024 / 1024:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
