from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "raw" / "portrait-source.png"
OUTPUT = ROOT / "public" / "portrait.png"
SIZE = 1024


def is_white_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, alpha = pixel
    if alpha < 12:
        return True

    spread = max(r, g, b) - min(r, g, b)
    return r > 232 and g > 232 and b > 232 and spread < 30


def main() -> None:
    image = Image.open(SOURCE).convert("RGBA")
    image.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    left = (SIZE - image.width) // 2
    top = (SIZE - image.height) // 2
    canvas.alpha_composite(image, (left, top))

    pixels = canvas.load()
    width, height = canvas.size
    seen = bytearray(width * height)
    background = Image.new("L", canvas.size, 0)
    background_pixels = background.load()
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if seen[index]:
            return
        seen[index] = 1
        if is_white_background(pixels[x, y]):
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        background_pixels[x, y] = 255

        for next_x, next_y in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= next_x < width and 0 <= next_y < height:
                enqueue(next_x, next_y)

    feathered_background = background.filter(ImageFilter.GaussianBlur(radius=1.6))
    red, green, blue, alpha = canvas.split()
    cutout_alpha = Image.eval(feathered_background, lambda value: 255 - value)
    final_alpha = ImageChops.multiply(alpha, cutout_alpha)
    output = Image.merge("RGBA", (red, green, blue, final_alpha))
    output.save(OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
