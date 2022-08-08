"""Detect import structure about a single module, and turn into mermaid.js flowchart

Files in directories in `fall_to_dir` are treated as their parents.
"""

from sys import argv
from pathlib import Path
from typing import NamedTuple

from import_graph import Link, LinkType, detect_links, format_name, show_md


class LinksAboutMod(NamedTuple):
    name: Path
    internal: set[Link]
    dependencies: set[Link]
    dependents: set[Link]


def fall_path(path: Path, fall_to_dir: list[Path]):
    while path.parent in fall_to_dir:
        path = path.parent
    return path


def filter_about(links: list[Link], mod: Path, *, fall_to_dir: list[Path] = []) -> LinksAboutMod:
    result = LinksAboutMod(name=mod, internal=set(),
                           dependencies=set(), dependents=set())

    for src, dst, link_type in links:
        src = fall_path(src, fall_to_dir)
        dst = fall_path(dst, fall_to_dir) if isinstance(dst, Path) else dst
        if src == dst:
            continue

        src_in_mod = src.parent == mod
        dst_in_mod = dst.parent == mod if isinstance(dst, Path) else False

        l = src, dst, link_type
        match (src_in_mod, dst_in_mod):
            case (True, True):
                result.internal.add(l)
            case (True, False):
                result.dependencies.add(l)
            case (False, True):
                result.dependents.add(l)

    return result


def generate_markdown(info: LinksAboutMod, *, tab='  ') -> list[str]:
    md: list[str] = ['flowchart LR']

    # Internal links
    md.append(f"{tab}subgraph {format_name(info.name)}")
    for src, dst, link_type in info.internal:
        match link_type:
            case LinkType.relative:
                md.append(
                    f'{tab * 2}{format_name(src)} --> {format_name(dst)}')
    md.append(f"{tab}end")

    # Other links
    for links in (info.dependencies, info.dependents):
        for src, dst, link_type in links:
            match link_type:
                case LinkType.relative:
                    if src.name.endswith('.test'):
                        continue
                    md.append(
                        f'{tab}{format_name(src)} -.-> {format_name(dst)}')
                # case LinkType.absolute:
                #     md.append(
                #         f"{tab}{format_name(src)} -.-> {format_name(dst)}")

    return md


def main():
    src_root = Path(__file__).parent.parent / 'src'
    links = detect_links(src_root)
    info = filter_about(
        links,
        mod=(src_root / argv[1]).relative_to(src_root),
        fall_to_dir=[
            Path('core/sources'),
            Path('core/notices'),
        ])
    md = generate_markdown(info)
    show_md(md)


if __name__ == '__main__':
    main()
