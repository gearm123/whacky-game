from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ASSET_ROOT = Path("public/assets")
TARGET_SIZE = 1254
INNER_SCALE = 0.84
EDGE_SAMPLE_STEP = 3
SEED_DELTA = 36
NEIGHBOR_DELTA = 22
MIN_ALPHA = 8


def color_distance(left: tuple[int, int, int], right: tuple[int, int, int]) -> int:
    return abs(left[0] - right[0]) + abs(left[1] - right[1]) + abs(left[2] - right[2])


def gather_edge_seeds(width: int, height: int) -> list[tuple[int, int]]:
    seeds: list[tuple[int, int]] = []

    for x in range(0, width, EDGE_SAMPLE_STEP):
        seeds.append((x, 0))
        seeds.append((x, height - 1))

    for y in range(0, height, EDGE_SAMPLE_STEP):
        seeds.append((0, y))
        seeds.append((width - 1, y))

    seeds.extend(
        [
            (0, 0),
            (width - 1, 0),
            (0, height - 1),
            (width - 1, height - 1),
        ]
    )

    return list(dict.fromkeys(seeds))


def build_background_mask(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    visited: set[tuple[int, int]] = set()

    for seed_x, seed_y in gather_edge_seeds(width, height):
        if (seed_x, seed_y) in visited:
            continue

        seed_pixel = pixels[seed_x, seed_y]
        if seed_pixel[3] <= MIN_ALPHA:
            visited.add((seed_x, seed_y))
            mask_pixels[seed_x, seed_y] = 255
            continue

        seed_rgb = seed_pixel[:3]
        queue: deque[tuple[int, int]] = deque([(seed_x, seed_y)])
        visited.add((seed_x, seed_y))

        while queue:
            current_x, current_y = queue.popleft()
            current_pixel = pixels[current_x, current_y]

            if current_pixel[3] <= MIN_ALPHA:
                mask_pixels[current_x, current_y] = 255
            elif color_distance(current_pixel[:3], seed_rgb) <= SEED_DELTA:
                mask_pixels[current_x, current_y] = 255
            else:
                continue

            for next_x, next_y in (
                (current_x - 1, current_y),
                (current_x + 1, current_y),
                (current_x, current_y - 1),
                (current_x, current_y + 1),
            ):
                if not (0 <= next_x < width and 0 <= next_y < height):
                    continue

                if (next_x, next_y) in visited:
                    continue

                next_pixel = pixels[next_x, next_y]
                if next_pixel[3] <= MIN_ALPHA:
                    visited.add((next_x, next_y))
                    queue.append((next_x, next_y))
                    continue

                if (
                    color_distance(next_pixel[:3], seed_rgb) <= SEED_DELTA
                    and color_distance(next_pixel[:3], current_pixel[:3]) <= NEIGHBOR_DELTA
                ):
                    visited.add((next_x, next_y))
                    queue.append((next_x, next_y))

    return mask


def trim_and_pad_asset(path: Path) -> None:
    source = Image.open(path).convert("RGBA")
    alpha_bbox = source.getchannel("A").getbbox()
    background_mask = build_background_mask(source)

    output = source.copy()
    output_pixels = output.load()
    mask_pixels = background_mask.load()

    for y in range(output.height):
        for x in range(output.width):
            if mask_pixels[x, y] == 255:
                output_pixels[x, y] = (0, 0, 0, 0)

    bbox = output.getchannel("A").getbbox() or alpha_bbox
    if not bbox:
        return

    trimmed = output.crop(bbox)
    inner_target = int(TARGET_SIZE * INNER_SCALE)
    scale = min(inner_target / trimmed.width, inner_target / trimmed.height)
    resized = trimmed.resize(
        (
            max(1, round(trimmed.width * scale)),
            max(1, round(trimmed.height * scale)),
        ),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    paste_x = (TARGET_SIZE - resized.width) // 2
    paste_y = (TARGET_SIZE - resized.height) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    canvas.save(path)


def main() -> None:
    png_files = sorted(ASSET_ROOT.glob("*/*.png"))
    for path in png_files:
        trim_and_pad_asset(path)
        print(f"processed {path.as_posix()}")


if __name__ == "__main__":
    main()
