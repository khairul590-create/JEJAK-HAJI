"""Uji pemandu suara MP3 Jejak Haji.

Dua cabang mesti diuji:
  1. Klip ada     -> <audio> dimain, Web Speech TIDAK dipanggil.
  2. Klip tiada   -> jatuh balik ke Web Speech, murid tetap dengar arahan.

Jalankan:  python3 tools/test-voice.py
"""

from __future__ import annotations

import subprocess
import sys
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = 8899
URL = f"http://127.0.0.1:{PORT}/index.html"

STUB = """
window.__speech = 0;
const orig = window.speechSynthesis && window.speechSynthesis.speak;
if (window.speechSynthesis)
  window.speechSynthesis.speak = function () { window.__speech++; return orig.apply(this, arguments); };
"""


def serve() -> subprocess.Popen:
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    for _ in range(60):
        try:
            subprocess.run(["curl", "-sf", "-o", "/dev/null", URL], check=True, timeout=2)
            return proc
        except Exception:
            time.sleep(0.2)
    proc.terminate()
    sys.exit("server tak naik")


def start(p, requested: list):
    p.goto(URL, wait_until="load")
    p.fill("#inName", "Ahmad")
    p.click("#stGo")
    p.wait_for_selector("#hud:not(.pre)", timeout=15000)
    p.wait_for_timeout(2500)


def main() -> int:
    server = serve()
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            fails = []

            # 1. Klip ada -> main MP3, tiada Web Speech
            ctx = br.new_context(viewport={"width": 390, "height": 780})
            p = ctx.new_page()
            p.add_init_script(STUB)
            reqs: list[str] = []
            p.on("request", lambda r: reqs.append(r.url) if "/audio/" in r.url else None)
            start(p, reqs)
            got = p.evaluate(
                """() => { const a = document.querySelector('audio'); return {
                     src: a ? a.getAttribute('src') : null,
                     paused: a ? a.paused : null,
                     t: a ? a.currentTime : null,
                     speech: window.__speech }; }"""
            )
            print("KLI ADA:", got, "| permintaan audio:", sorted(set(x.split("/")[-1] for x in reqs))[:4])
            if got["paused"] or not got["t"]:
                fails.append("klip MP3 tidak dimain")
            if got["speech"]:
                fails.append(f"Web Speech dipanggil {got['speech']}x walau klip ada")
            if not got["src"] or not got["src"].endswith(".mp3"):
                fails.append("src audio bukan fail MP3")
            ctx.close()

            # 2. Klip tiada -> jatuh balik ke Web Speech
            (ROOT / "audio" / "miqat_board.mp3").rename(ROOT / "audio" / "miqat_board.mp3.hold")
            try:
                ctx = br.new_context(viewport={"width": 390, "height": 780})
                p = ctx.new_page()
                p.add_init_script(STUB)
                start(p, [])
                time.sleep(6)  # salam (2s) habis, kemudian klip langkah hilang -> fallback
                fb = p.evaluate("() => window.__speech")
                print("KLIP TIADA: web speech dipanggil", fb, "kali")
                if not fb:
                    fails.append("tiada fallback ke Web Speech bila klip hilang")
                ctx.close()
            finally:
                (ROOT / "audio" / "miqat_board.mp3.hold").rename(ROOT / "audio" / "miqat_board.mp3")

            br.close()
            if fails:
                print("GAGAL:", *fails, sep="\n  - ")
                return 1
            print("LULUS: kedua-dua cabang suara berfungsi")
            return 0
    finally:
        server.terminate()


if __name__ == "__main__":
    sys.exit(main())
