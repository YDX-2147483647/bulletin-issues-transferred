"""Detect modules' import structure, and turn into mermaid.js flowchart

All directories are regarded as modules, except those in `fall_to_parent`.
"""

from pathlib import Path

from import_graph import Link, LinkType, detect_links, format_name, show_md


def fall_path(path: Path, fall_to_parent: list[Path]) -> Path:
    while path in fall_to_parent:
        path = path.parent
    return path


def extract_mod_links(links: list[Link], fall_to_parent: list[Path] = []) -> set[Link]:
    """
    Returns Example:
        {

            (Path('plugin/cli'), Path('core'), LinkType.relative),
            (Path('core'), 'node-fetch', LinkType.absolute),
            (Path('core/notices'), Path('core'), LinkType.relative),
        }    
    """

    mod_links: set[Link] = set()

    for src, dst, link_type in links:
        src = fall_path(src.parent, fall_to_parent)

        if isinstance(dst, Path):
            dst = fall_path(dst.parent, fall_to_parent)

        if src != dst:
            mod_links.add((src, dst, link_type))

    return mod_links


def generate_markdown(mod_links: set[Link]) -> list[str]:
    """
    :returns: rows
    """

    md: list[str] = ['flowchart LR']
    for src, dst, link_type in mod_links:
        match link_type:
            case LinkType.relative:
                if src.name.endswith('.test'):
                    continue
                md.append(f'  {format_name(src)} --> {format_name(dst)}')
            case LinkType.absolute:
                pass
                # md.append(f'  {format_name(src)} -.-> {format_name(dst)}')

    return md


def main():
    src_root = Path(__file__).parent.parent / 'src'
    links = detect_links(src_root)
    mod_links = extract_mod_links(links, fall_to_parent=[
        Path('core/sources'),
        Path('core/notices'),
    ])
    md = generate_markdown(mod_links)
    show_md(md)


if __name__ == '__main__':
    main()
