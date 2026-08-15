"""Generate og.png and the PWA icons with no imaging dependencies.

Run from the project root:  python3 tools/make_assets.py

Pillow will not build cleanly under Termux on many devices, so the PNG encoder
and the bitmap font live here instead. Output is committed to static/.
"""

import struct
import sys
import zlib
from pathlib import Path

STATIC = Path(__file__).resolve().parent.parent / "static"

BG = (5, 5, 6)
GRID = (14, 15, 19)
TEXT = (237, 238, 240)
MUTED = (111, 116, 126)
ACCENT = (0, 224, 138)

# 5x7 bitmap font. Only the glyphs this project renders are defined.
FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "·": ["00000", "00000", "00000", "01100", "01100", "00000", "00000"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    # lowercase forms needed by the handle
    "a": ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
    "d": ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
    "l": ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
    "o": ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
    "r": ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
    "v": ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
}


class Canvas:
    def __init__(self, width, height, background):
        self.w = width
        self.h = height
        self.px = bytearray()
        for _ in range(width * height):
            self.px += bytes(background)

    def set(self, x, y, colour):
        if 0 <= x < self.w and 0 <= y < self.h:
            offset = (y * self.w + x) * 3
            self.px[offset:offset + 3] = bytes(colour)

    def rect(self, x, y, width, height, colour):
        for yy in range(y, y + height):
            for xx in range(x, x + width):
                self.set(xx, yy, colour)

    def text(self, x, y, value, scale, colour, spacing=1):
        cursor = x
        for char in value:
            glyph = FONT.get(char)
            if glyph is None:
                glyph = FONT[" "]
            for row, bits in enumerate(glyph):
                for col, bit in enumerate(bits):
                    if bit == "1":
                        self.rect(cursor + col * scale, y + row * scale, scale, scale, colour)
            cursor += (5 + spacing) * scale
        return cursor

    @staticmethod
    def text_width(value, scale, spacing=1):
        if not value:
            return 0
        return len(value) * (5 + spacing) * scale - spacing * scale

    def write(self, path):
        raw = bytearray()
        stride = self.w * 3
        for y in range(self.h):
            raw.append(0)  # filter type 0 (None)
            raw += self.px[y * stride:(y + 1) * stride]

        def chunk(tag, data):
            out = struct.pack(">I", len(data)) + tag + data
            return out + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

        png = b"\x89PNG\r\n\x1a\n"
        png += chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 2, 0, 0, 0))
        png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        png += chunk(b"IEND", b"")
        path.write_bytes(png)
        return len(png)


def build_og():
    canvas = Canvas(1200, 630, BG)

    for x in range(0, 1200, 44):
        canvas.rect(x, 0, 1, 630, GRID)
    for y in range(0, 630, 44):
        canvas.rect(0, y, 1200, 1, GRID)

    canvas.rect(0, 0, 1200, 6, ACCENT)
    canvas.rect(80, 132, 8, 44, ACCENT)

    canvas.text(112, 140, "TERMUX", 5, MUTED)
    canvas.text(80, 220, "ARDA", 30, TEXT)
    canvas.text(84, 452, "@lov4ardaa", 9, ACCENT)
    canvas.text(84, 536, "LAB · TOOLS · NOTES · PLAYGROUND", 4, MUTED)

    size = canvas.write(STATIC / "og.png")
    print(f"  static/og.png          1200x630  {size:,} bytes")


def build_icon(pixels, name):
    canvas = Canvas(pixels, pixels, BG)

    step = max(4, pixels // 12)
    for x in range(0, pixels, step):
        canvas.rect(x, 0, 1, pixels, GRID)
    for y in range(0, pixels, step):
        canvas.rect(0, y, pixels, 1, GRID)

    scale = max(1, int(pixels * 0.52) // 7)
    width = Canvas.text_width("A", scale)
    canvas.text((pixels - width) // 2, (pixels - 7 * scale) // 2, "A", scale, ACCENT)

    border = max(2, pixels // 64)
    canvas.rect(0, pixels - border, pixels, border, ACCENT)

    size = canvas.write(STATIC / name)
    print(f"  static/{name:<15} {pixels}x{pixels}   {size:,} bytes")


def build_favicon():
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
        '<rect width="32" height="32" rx="7" fill="#050506"/>'
        '<path d="M16 7l6.4 18h-3.9l-1.2-3.6h-6.6L9.5 25H5.6L12 7h4zm-.1 4.9l-2.2 6.6h4.4l-2.2-6.6z" fill="#00e08a"/>'
        '<rect y="29" width="32" height="3" fill="#00e08a"/>'
        "</svg>"
    )
    path = STATIC / "favicon.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"  static/favicon.svg              {len(svg):,} bytes")


def main():
    STATIC.mkdir(exist_ok=True)
    print("generating assets…")
    build_og()
    build_icon(192, "icon-192.png")
    build_icon(512, "icon-512.png")
    build_icon(180, "apple-touch-icon.png")
    build_favicon()
    print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
