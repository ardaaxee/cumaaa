"""Zero-dependency QR Code encoder (byte mode, EC levels L/M, versions 1-15).

Written from the ISO/IEC 18004 spec so the /api/qr endpoint has no native
dependencies -- important because this app is developed and often run under
Termux, where building Pillow is painful.

Public API:
    encode(text, ec="M")   -> list[list[bool]] module matrix
    svg(text, ...)         -> SVG document string
"""

from typing import List, Tuple

# --- Galois field GF(256), primitive polynomial 0x11D ------------------------

_EXP = [0] * 512
_LOG = [0] * 256


def _init_tables() -> None:
    x = 1
    for i in range(255):
        _EXP[i] = x
        _LOG[x] = i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        _EXP[i] = _EXP[i - 255]


_init_tables()


def _gf_mul(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return _EXP[_LOG[a] + _LOG[b]]


def _rs_generator(degree: int) -> List[int]:
    """Generator polynomial for `degree` error-correction codewords."""
    poly = [1]
    for i in range(degree):
        nxt = [0] * (len(poly) + 1)
        for j, coef in enumerate(poly):
            nxt[j] ^= _gf_mul(coef, 1)
            nxt[j + 1] ^= _gf_mul(coef, _EXP[i])
        poly = nxt
    return poly


def _rs_encode(data: List[int], ec_len: int) -> List[int]:
    gen = _rs_generator(ec_len)
    rem = [0] * ec_len
    for byte in data:
        factor = byte ^ rem[0]
        rem = rem[1:] + [0]
        for i, g in enumerate(gen[1:]):
            rem[i] ^= _gf_mul(g, factor)
    return rem


# --- Version tables ----------------------------------------------------------

# version -> total codewords
_TOTAL_CODEWORDS = {
    1: 26, 2: 44, 3: 70, 4: 100, 5: 134, 6: 172, 7: 196, 8: 242,
    9: 292, 10: 346, 11: 404, 12: 466, 13: 532, 14: 581, 15: 655,
}

# (version, level) -> (ec codewords per block, [(block count, data codewords), ...])
_EC_BLOCKS = {
    ("L", 1): (7, [(1, 19)]),
    ("L", 2): (10, [(1, 34)]),
    ("L", 3): (15, [(1, 55)]),
    ("L", 4): (20, [(1, 80)]),
    ("L", 5): (26, [(1, 108)]),
    ("L", 6): (18, [(2, 68)]),
    ("L", 7): (20, [(2, 78)]),
    ("L", 8): (24, [(2, 97)]),
    ("L", 9): (30, [(2, 116)]),
    ("L", 10): (18, [(2, 68), (2, 69)]),
    ("L", 11): (20, [(4, 81)]),
    ("L", 12): (24, [(2, 92), (2, 93)]),
    ("L", 13): (26, [(4, 107)]),
    ("L", 14): (30, [(3, 115), (1, 116)]),
    ("L", 15): (22, [(5, 87), (1, 88)]),
    ("M", 1): (10, [(1, 16)]),
    ("M", 2): (16, [(1, 28)]),
    ("M", 3): (26, [(1, 44)]),
    ("M", 4): (18, [(2, 32)]),
    ("M", 5): (24, [(2, 43)]),
    ("M", 6): (16, [(4, 27)]),
    ("M", 7): (18, [(4, 31)]),
    ("M", 8): (22, [(2, 38), (2, 39)]),
    ("M", 9): (22, [(3, 36), (2, 37)]),
    ("M", 10): (26, [(4, 43), (1, 44)]),
    ("M", 11): (30, [(1, 50), (4, 51)]),
    ("M", 12): (22, [(6, 36), (2, 37)]),
    ("M", 13): (22, [(8, 37), (1, 38)]),
    ("M", 14): (24, [(4, 40), (5, 41)]),
    ("M", 15): (24, [(5, 41), (5, 42)]),
}

# version -> alignment pattern centre coordinates
_ALIGN = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
    7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
    11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66],
    15: [6, 26, 48, 70],
}

_EC_LEVEL_BITS = {"L": 0b01, "M": 0b00, "Q": 0b11, "H": 0b10}

MAX_VERSION = 15


def _data_capacity(version: int, ec: str) -> int:
    """Data codewords available at this version/level."""
    _, blocks = _EC_BLOCKS[(ec, version)]
    return sum(count * size for count, size in blocks)


def _choose_version(byte_len: int, ec: str) -> int:
    for version in range(1, MAX_VERSION + 1):
        # 4 mode bits + character-count bits + payload
        count_bits = 8 if version <= 9 else 16
        needed = 4 + count_bits + byte_len * 8
        if needed <= _data_capacity(version, ec) * 8:
            return version
    raise ValueError(
        "payload too long for QR versions 1-%d at level %s (%d bytes)"
        % (MAX_VERSION, ec, byte_len)
    )


# --- Bit stream --------------------------------------------------------------


def _build_codewords(payload: bytes, version: int, ec: str) -> List[int]:
    capacity_bits = _data_capacity(version, ec) * 8
    bits: List[int] = []

    def put(value: int, length: int) -> None:
        for i in range(length - 1, -1, -1):
            bits.append((value >> i) & 1)

    put(0b0100, 4)  # byte mode
    put(len(payload), 8 if version <= 9 else 16)
    for byte in payload:
        put(byte, 8)

    # terminator, up to four zero bits
    put(0, min(4, capacity_bits - len(bits)))
    # pad to a byte boundary
    while len(bits) % 8:
        bits.append(0)

    codewords = [
        int("".join(str(b) for b in bits[i:i + 8]), 2)
        for i in range(0, len(bits), 8)
    ]
    # alternating pad codewords
    pads = (0xEC, 0x11)
    i = 0
    while len(codewords) < capacity_bits // 8:
        codewords.append(pads[i % 2])
        i += 1
    return codewords


def _interleave(codewords: List[int], version: int, ec: str) -> List[int]:
    ec_len, blocks = _EC_BLOCKS[(ec, version)]

    data_blocks: List[List[int]] = []
    ec_blocks: List[List[int]] = []
    pos = 0
    for count, size in blocks:
        for _ in range(count):
            chunk = codewords[pos:pos + size]
            pos += size
            data_blocks.append(chunk)
            ec_blocks.append(_rs_encode(chunk, ec_len))

    result: List[int] = []
    max_data = max(len(b) for b in data_blocks)
    for i in range(max_data):
        for block in data_blocks:
            if i < len(block):
                result.append(block[i])
    for i in range(ec_len):
        for block in ec_blocks:
            result.append(block[i])
    return result


# --- Matrix construction -----------------------------------------------------


def _bch_format(value: int) -> int:
    """10-bit BCH check for the 5-bit format information."""
    code = value << 10
    for i in range(4, -1, -1):
        if code & (1 << (i + 10)):
            code ^= 0x537 << i
    return ((value << 10) | code) ^ 0x5412


def _bch_version(version: int) -> int:
    """12-bit BCH check for the 6-bit version information."""
    code = version << 12
    for i in range(5, -1, -1):
        if code & (1 << (i + 12)):
            code ^= 0x1F25 << i
    return (version << 12) | code


def _new_matrix(size: int):
    modules = [[False] * size for _ in range(size)]
    reserved = [[False] * size for _ in range(size)]
    return modules, reserved


def _place_finder(modules, reserved, size: int, row: int, col: int) -> None:
    for r in range(-1, 8):
        for c in range(-1, 8):
            rr, cc = row + r, col + c
            if not (0 <= rr < size and 0 <= cc < size):
                continue
            # 7x7 concentric squares; the -1/7 ring is the separator
            in_ring = (0 <= r < 7 and c in (0, 6)) or (0 <= c < 7 and r in (0, 6))
            in_core = 2 <= r <= 4 and 2 <= c <= 4
            modules[rr][cc] = in_ring or in_core
            reserved[rr][cc] = True


def _place_alignment(modules, reserved, version: int) -> None:
    centres = _ALIGN[version]
    for i, r in enumerate(centres):
        for j, c in enumerate(centres):
            # skip the three corners occupied by finder patterns
            if (i == 0 and j == 0) or (i == 0 and j == len(centres) - 1) \
               or (i == len(centres) - 1 and j == 0):
                continue
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    modules[r + dr][c + dc] = max(abs(dr), abs(dc)) != 1
                    reserved[r + dr][c + dc] = True


def _place_timing(modules, reserved, size: int) -> None:
    for i in range(8, size - 8):
        val = i % 2 == 0
        if not reserved[6][i]:
            modules[6][i] = val
            reserved[6][i] = True
        if not reserved[i][6]:
            modules[i][6] = val
            reserved[i][6] = True


def _reserve_format(reserved, size: int) -> None:
    for i in range(9):
        if i != 6:
            reserved[8][i] = True
            reserved[i][8] = True
    for i in range(size - 8, size):
        reserved[8][i] = True
        reserved[i][8] = True
    modules_dark_row = size - 8
    reserved[modules_dark_row][8] = True


def _place_version_info(modules, reserved, size: int, version: int) -> None:
    if version < 7:
        return
    bits = _bch_version(version)
    for i in range(18):
        bit = (bits >> i) & 1
        r, c = i // 3, size - 11 + i % 3
        modules[r][c] = bool(bit)
        reserved[r][c] = True
        modules[c][r] = bool(bit)
        reserved[c][r] = True


def _place_format_info(modules, size: int, ec: str, mask: int) -> None:
    bits = _bch_format((_EC_LEVEL_BITS[ec] << 3) | mask)
    for i in range(15):
        bit = bool((bits >> i) & 1)
        # vertical copy, down column 8 (row 6 is timing and is skipped)
        if i < 6:
            modules[i][8] = bit
        elif i < 8:
            modules[i + 1][8] = bit
        else:
            modules[size - 15 + i][8] = bit
        # horizontal copy, along row 8
        if i < 8:
            modules[8][size - 1 - i] = bit
        elif i == 8:
            modules[8][7] = bit
        else:
            modules[8][14 - i] = bit
    modules[size - 8][8] = True  # the always-dark module


def _place_data(modules, reserved, size: int, stream: List[int]) -> None:
    bit_index = 0
    total_bits = len(stream) * 8
    col = size - 1
    upward = True
    while col > 0:
        if col == 6:  # the vertical timing pattern column is skipped entirely
            col -= 1
        rows = range(size - 1, -1, -1) if upward else range(size)
        for row in rows:
            for c in (col, col - 1):
                if reserved[row][c]:
                    continue
                bit = False
                if bit_index < total_bits:
                    byte = stream[bit_index >> 3]
                    bit = bool((byte >> (7 - (bit_index & 7))) & 1)
                    bit_index += 1
                modules[row][c] = bit
        col -= 2
        upward = not upward


def _mask_condition(mask: int, row: int, col: int) -> bool:
    if mask == 0:
        return (row + col) % 2 == 0
    if mask == 1:
        return row % 2 == 0
    if mask == 2:
        return col % 3 == 0
    if mask == 3:
        return (row + col) % 3 == 0
    if mask == 4:
        return (row // 2 + col // 3) % 2 == 0
    if mask == 5:
        return (row * col) % 2 + (row * col) % 3 == 0
    if mask == 6:
        return ((row * col) % 2 + (row * col) % 3) % 2 == 0
    return ((row + col) % 2 + (row * col) % 3) % 2 == 0


def _apply_mask(modules, reserved, size: int, mask: int):
    out = [row[:] for row in modules]
    for r in range(size):
        for c in range(size):
            if not reserved[r][c] and _mask_condition(mask, r, c):
                out[r][c] = not out[r][c]
    return out


def _penalty(modules, size: int) -> int:
    score = 0

    # Rule 1: runs of five or more same-coloured modules in a line
    for line in list(modules) + [list(col) for col in zip(*modules)]:
        run_colour = line[0]
        run_len = 1
        for value in line[1:]:
            if value == run_colour:
                run_len += 1
            else:
                if run_len >= 5:
                    score += 3 + (run_len - 5)
                run_colour = value
                run_len = 1
        if run_len >= 5:
            score += 3 + (run_len - 5)

    # Rule 2: 2x2 blocks of one colour
    for r in range(size - 1):
        for c in range(size - 1):
            block = (modules[r][c], modules[r][c + 1],
                     modules[r + 1][c], modules[r + 1][c + 1])
            if all(block) or not any(block):
                score += 3

    # Rule 3: finder-like 1:1:3:1:1 patterns with four light modules beside them
    pattern_a = [True, False, True, True, True, False, True,
                 False, False, False, False]
    pattern_b = list(reversed(pattern_a))
    for line in list(modules) + [list(col) for col in zip(*modules)]:
        for i in range(size - 10):
            window = line[i:i + 11]
            if window == pattern_a or window == pattern_b:
                score += 40

    # Rule 4: deviation from a 50% dark ratio
    dark = sum(1 for row in modules for value in row if value)
    ratio = dark * 100 // (size * size)
    score += 10 * (min(abs(ratio - 50) // 5, 10))
    return score


def encode(text: str, ec: str = "M") -> List[List[bool]]:
    """Encode `text` and return the final module matrix (True == dark)."""
    ec = ec.upper()
    if ec not in ("L", "M"):
        raise ValueError("error-correction level must be 'L' or 'M'")
    if not text:
        raise ValueError("nothing to encode")

    payload = text.encode("utf-8")
    version = _choose_version(len(payload), ec)
    size = version * 4 + 17

    codewords = _build_codewords(payload, version, ec)
    stream = _interleave(codewords, version, ec)

    modules, reserved = _new_matrix(size)
    _place_finder(modules, reserved, size, 0, 0)
    _place_finder(modules, reserved, size, 0, size - 7)
    _place_finder(modules, reserved, size, size - 7, 0)
    _place_alignment(modules, reserved, version)
    _place_timing(modules, reserved, size)
    _reserve_format(reserved, size)
    _place_version_info(modules, reserved, size, version)
    _place_data(modules, reserved, size, stream)

    best = None
    for mask in range(8):
        candidate = _apply_mask(modules, reserved, size, mask)
        _place_format_info(candidate, size, ec, mask)
        score = _penalty(candidate, size)
        if best is None or score < best[0]:
            best = (score, candidate)
    return best[1]


def svg(text: str, ec: str = "M", quiet: int = 4,
        dark: str = "#000000", light: str = "#ffffff",
        scale: int = 8) -> str:
    """Render `text` as a standalone SVG document."""
    matrix = encode(text, ec)
    size = len(matrix)
    total = size + quiet * 2
    px = total * scale

    # one path for every dark module keeps the file small and scales cleanly
    parts: List[str] = []
    for r, row in enumerate(matrix):
        c = 0
        while c < size:
            if row[c]:
                run = 1
                while c + run < size and row[c + run]:
                    run += 1
                parts.append("M%d %dh%dv1h-%dz" % (c + quiet, r + quiet, run, run))
                c += run
            else:
                c += 1

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
        'viewBox="0 0 %d %d" shape-rendering="crispEdges" role="img" '
        'aria-label="QR code">'
        '<rect width="%d" height="%d" fill="%s"/>'
        '<path fill="%s" d="%s"/>'
        "</svg>"
    ) % (px, px, total, total, total, total, light, dark, "".join(parts))


def dimensions(text: str, ec: str = "M") -> Tuple[int, int]:
    """Return (version, module count per side) without rendering."""
    version = _choose_version(len(text.encode("utf-8")), ec.upper())
    return version, version * 4 + 17
