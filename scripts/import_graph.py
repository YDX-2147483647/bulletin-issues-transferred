"""Detect files' import structure, and turn into mermaid.js flowchart

(based on a fragile regular expression, not syntax tree)
"""

import re
from enum import Enum, auto
from pathlib import Path
from typing import Final, TypeAlias

from pyperclip import copy


class LinkType(Enum):
    relative = auto()
    absolute = auto()


Link: TypeAlias = tuple[Path, str | Path, LinkType]
"""(dependent, dependency, type)"""

statement_pattern: Final = re.compile(
    r"^(im|ex)port .+ from ['\"](?P<from>.+)['\"]$")


def detect_links(root: Path) -> list[Link]:
    """
    Returns Example:
        [
            (Path('core/index'), Path('core/hooks_type'), LinkType.relative),
            (Path('core/index'), 'node-fetch', LinkType.absolute),
        ]
    """

    links: list[Link] = []
    for path in root.glob('**/*.ts'):
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
                    mod_name = mod_path.resolve().relative_to(root).with_suffix('')

                links.append((
                    path.relative_to(root).with_suffix(''),
                    mod_name,
                    link_type,
                ))

    return links


def format_name(mod_name: Path | str) -> str:
    if isinstance(mod_name, Path):
        return mod_name.as_posix()
    else:
        return mod_name


def generate_markdown(links: list[Link]) -> list[str]:
    """
    :returns: rows
    """

    md: list[str] = ['flowchart LR']
    for src, dst, link_type in links:
        match link_type:
            case LinkType.relative:
                if src.name.endswith('.test'):
                    continue
                md.append(f'  {format_name(src)} --> {format_name(dst)}')
            case LinkType.absolute:
                pass

    return md


def show_md(md: list[str]) -> None:
    result = '\n'.join(md)

    copy(result)
    print(result, end='\n\n')
    print('Also copied to your clipboard.')

    print('Now you can paste it into https://mermaid.live .')


def main():
    src_root = Path(__file__).parent.parent / 'src'
    links = detect_links(src_root)
    md = generate_markdown(links)
    show_md(md)


if __name__ == '__main__':
    main()
