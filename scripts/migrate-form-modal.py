#!/usr/bin/env python3
"""将 n-modal preset=card 迁移为 FormModal（保留 preset=dialog）。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

SKIP_PARTS = ("index_copy", ".backup", "_cp.vue", "FormModal/index.vue")


def should_skip(path: Path) -> bool:
    s = str(path)
    return any(p in s for p in SKIP_PARTS)


def infer_size(open_tag: str) -> str:
    for size in ("xxl", "xl", "lg", "md", "sm"):
        if f"TemplateModal--{size}" in open_tag:
            return size
    blob = open_tag
    m = re.search(r"w-\[(\d+)px\]", blob)
    if m:
        w = int(m.group(1))
        if w >= 1300:
            return "xxl"
        if w >= 1100:
            return "xl"
        if w >= 960:
            return "lg"
        if w >= 720:
            return "md"
        return "sm"
    if "w-[64rem]" in blob or "width: 1000px" in blob or "1000px" in blob:
        return "lg"
    if "w-[48rem]" in blob or "width: 800px" in blob or "w-[800px]" in blob:
        return "md"
    if "w-[32rem]" in blob or "w-[600px]" in blob or "w-[520px]" in blob or "width: 500px" in blob:
        return "sm"
    if "h-screen" in blob:
        return "xl"
    return "md"


def infer_height_mode(open_tag: str, body: str, size: str) -> str:
    if "showDetail" in open_tag or "详情" in open_tag:
        return "fixed"
    if size in ("xl", "xxl"):
        return "fixed"
    if size == "sm":
        return "auto"
    if body.count("n-form-item") <= 5 and size == "md":
        return "auto"
    return "fixed"


def extract_show_var(open_tag: str) -> str | None:
    m = re.search(r'v-model:show="([^"]+)"', open_tag)
    return m.group(1) if m else None


def build_form_modal_open(open_tag: str, body: str) -> str:
    if "preset=\"card\"" not in open_tag and "preset='card'" not in open_tag:
        return open_tag

    size = infer_size(open_tag)
    height_mode = infer_height_mode(open_tag, body, size)

    attrs: list[str] = []
    show = extract_show_var(open_tag)
    if show:
        attrs.append(f'v-model:show="{show}"')

    title_m = re.search(r':title="([^"]+)"', open_tag)
    if title_m:
        attrs.append(f':title="{title_m.group(1)}"')
    else:
        title_m2 = re.search(r'title="([^"]+)"', open_tag)
        if title_m2:
            attrs.append(f'title="{title_m2.group(1)}"')

    attrs.append(f'size="{size}"')
    if height_mode == "auto":
        attrs.append('height-mode="auto"')

    if ":mask-closable=\"false\"" in open_tag or ":mask-closable='false'" in open_tag:
        attrs.append(":mask-closable=\"false\"")

    for pat in (
        r':loading="[^"]+"',
        r'@after-leave="[^"]+"',
        r'@positive-click="[^"]+"',
    ):
        m = re.search(pat, open_tag)
        if m:
            attrs.append(m.group(0))

    return "<FormModal " + " ".join(attrs) + ">"


def find_modal_blocks(content: str) -> list[tuple[int, int, str, str]]:
    blocks = []
    i = 0
    n = len(content)
    while i < n:
        start = content.find("<n-modal", i)
        if start == -1:
            break
        tag_end = content.find(">", start)
        if tag_end == -1:
            break
        open_tag = content[start : tag_end + 1]
        if "preset=\"card\"" not in open_tag and "preset='card'" not in open_tag:
            i = tag_end + 1
            continue

        depth = 1
        pos = tag_end + 1
        body_start = pos
        while pos < n and depth > 0:
            next_open = content.find("<n-modal", pos)
            next_close = content.find("</n-modal>", pos)
            if next_close == -1:
                break
            if next_open != -1 and next_open < next_close:
                depth += 1
                pos = next_open + 8
            else:
                depth -= 1
                if depth == 0:
                    body = content[body_start:next_close]
                    blocks.append((start, next_close + len("</n-modal>"), open_tag, body))
                    pos = next_close + len("</n-modal>")
                    break
                pos = next_close + len("</n-modal>")
        i = pos
    return blocks


def simplify_footer(body: str) -> str:
    body = re.sub(
        r'<div class="TemplateModal-footer">\s*',
        "<template #footer>\n        ",
        body,
    )
    body = re.sub(
        r'<div class="TemplateForm-actions">\s*<n-flex[^>]*>\s*',
        "<template #footer>\n        ",
        body,
    )
    body = re.sub(
        r'</n-flex>\s*</div>\s*(?=\s*</FormModal>)',
        "\n    </template>",
        body,
        count=1,
    )
    body = re.sub(
        r'</div>\s*(?=\s*</FormModal>)',
        "\n    </template>",
        body,
        count=1,
    )
    body = re.sub(
        r"<template #footer>\s*<n-flex justify=\"end\">\s*",
        "<template #footer>\n      ",
        body,
    )
    body = re.sub(
        r"\s*</n-flex>\s*</template>",
        "\n    </template>",
        body,
    )
    return body


def unwrap_scroll(body: str) -> str:
    body = re.sub(r'<div class="TemplateModal-form-scroll[^"]*">\s*', "", body)
    body = re.sub(r'<div class="TemplateForm-main[^"]*">\s*', "", body)
    return body


def migrate_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    if "preset=\"card\"" not in content and "preset='card'" not in content:
        return False

    blocks = find_modal_blocks(content)
    if not blocks:
        return False

    new_content = content
    for start, end, open_tag, body in reversed(blocks):
        new_open = build_form_modal_open(open_tag, body)
        new_body = unwrap_scroll(body)
        new_body = simplify_footer(new_body)
        new_block = new_open + new_body + "</FormModal>"
        new_content = new_content[:start] + new_block + new_content[end:]

    if "<FormModal" in new_content and 'from "@/components/FormModal/index.vue"' not in new_content:
        if "<script" in new_content:
            new_content = re.sub(
                r"(<script[^>]*>\n)",
                r'\1import FormModal from "@/components/FormModal/index.vue"\n',
                new_content,
                count=1,
            )

    if new_content != content:
        path.write_text(new_content, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.vue")):
        if should_skip(path):
            continue
        if migrate_file(path):
            changed.append(path.relative_to(ROOT.parent))
    print(f"Migrated {len(changed)} files:")
    for p in changed:
        print(f"  {p}")


if __name__ == "__main__":
    main()
