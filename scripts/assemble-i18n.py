#!/usr/bin/env python3
"""Stitch translation chunks into src/i18n/{zh,id,es}.ts.

usage: assemble-i18n.py CHUNK_DIR
Each language has CHUNK_DIR/<lang>.1, .2, .3 ... : key/value lines to paste inside the object literal.
"""
import glob, os, sys

chunks = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'i18n')

for lang in ('zh', 'id', 'es'):
    parts = sorted(glob.glob(os.path.join(chunks, f'{lang}.[0-9]*')))
    body = ''.join(open(p, encoding='utf-8').read().rstrip('\n') + '\n' for p in parts)
    out = (
        f"import {{ cats_{lang} }} from './cats';\n"
        "import type { Key } from './en';\n\n"
        f"export const {lang}: Partial<Record<Key, string | readonly string[]>> = {{\n"
        f"  ...cats_{lang},\n"
        f"{body}"
        "};\n"
    )
    with open(os.path.join(root, f'{lang}.ts'), 'w', encoding='utf-8') as f:
        f.write(out)
    print(lang, len(parts), 'chunks', out.count('\n'), 'lines')
