"""Detect files' import structure, and turn into mermaid.js flowchart

(based on a fragile regular expression, not syntax tree)
"""

import re
from enum import Enum, auto
from pathlib import Path
from typing import Final

from pyperclip import copy


class LinkType(Enum):
    relative = auto()
    absolute = auto()


src_root: Final = Path(__file__).parent.parent / 'src'
statement_pattern: Final = re.compile(
    r"^(im|ex)port .+ from ['\"](?P<from>.+)['\"]$")

# 1. Detect structure

links: list[tuple[str, str, LinkType]] = []
for path in src_root.glob('**/*.ts'):
    with path.open('r', encoding='utf-8') as file:
        for line in file:
            match = statement_pattern.match(line.strip())
            if match is None:
                continue

            mod_name: str = match.group('from')
            link_type = LinkType.relative if mod_name.startswith(
                '.') else LinkType.absolute

            if mod_name.endswith('.js'):
                mod_path = path.parent / mod_name
                mod_name = mod_path.resolve().relative_to(src_root).as_posix()
                mod_name = mod_name[:-3]  # remove '.js'

            links.append((
                path.relative_to(src_root).as_posix()[:-3],  # remove '.ts'
                mod_name,
                link_type,
            ))

# 2. Generate markdown

md: list[str] = ['flowchart LR']
for src, dst, link_type in links:
    match link_type:
        case LinkType.relative:
            if src.startswith(('plugin/rss', 'plugin/ding')):
                continue
            if src.endswith('.test'):
                continue
            md.append(f'  {src} --> {dst}')
        case LinkType.absolute:
            pass

result = '\n'.join(md)
copy(result)
print(result, end='\n\n')
print('Also copied to your clipboard.')

print('Now you can paste it into https://mermaid.live .')
