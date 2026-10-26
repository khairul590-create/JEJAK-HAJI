"""Check the pinned CC0 texture bundle without network or dependencies."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import struct


def main():
    root = Path(__file__).resolve().parents[1] / 'textures/polyhaven'
    manifest = json.loads((root / 'manifest.json').read_text())
    assert manifest['license'] == 'CC0-1.0'
    assert manifest['provider_license_url'] == 'https://polyhaven.com/license'
    assert 'CC0 1.0 Universal' in (root / 'CC0-1.0.txt').read_text()
    assert {a['id'] for a in manifest['assets']} == {'marble_01', 'sand_01', 'rock_face'}
    paths = set()
    total = 0
    for asset in manifest['assets']:
        assert asset['authors']
        assert asset['source_page'] == 'https://polyhaven.com/a/' + asset['id']
        assert {m['role'] for m in asset['maps']} == {'color', 'normal', 'roughness'}
        assert len(asset['maps']) == 3
        for entry in asset['maps']:
            relative = PurePosixPath(entry['path'])
            assert not relative.is_absolute() and '..' not in relative.parts
            assert len(relative.parts) == 2 and relative.parts[0] == asset['id']
            assert entry['path'] not in paths
            paths.add(entry['path'])
            blob = (root / relative).read_bytes()
            assert len(blob) == entry['bytes']
            assert hashlib.sha256(blob).hexdigest() == entry['sha256'], relative
            assert entry['source_url'].startswith('https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/')
            assert len(entry['source_md5']) == 32 and len(entry['source_sha256']) == 64
            assert max(entry['width'], entry['height']) <= 1024
            if entry['role'] == 'color':
                assert blob.startswith(b'\xff\xd8') and blob.endswith(b'\xff\xd9')
                assert entry['color_space'] == 'sRGB'
            else:
                assert blob[:8] == b'\x89PNG\r\n\x1a\n'
                assert struct.unpack('>II', blob[16:24]) == (512, 512)
                assert entry['color_space'] == 'linear-data'
            total += len(blob)
    actual = {str(p.relative_to(root)) for p in root.glob('*/*') if p.is_file()}
    assert actual == paths, (actual, paths)
    assert len(paths) == 9 and total < 2 * 1024 * 1024
    print(f'PASS: 3 CC0 materials, 9 maps, {total} bytes; hashes, paths and license valid')


if __name__ == '__main__':
    main()
