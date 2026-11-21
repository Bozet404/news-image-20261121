# THE WORLD — Saturday, 21 November 2026

[![make.fun · news-image-20261121](https://make.fun/badge/news-image-20261121.svg)](https://make.fun/bounty/news-image-20261121?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)
[![rank](https://make.fun/badge/news-image-20261121/Bozet404/news-image-20261121/rank.svg)](https://make.fun/bounty/news-image-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)
[![reward](https://make.fun/badge/news-image-20261121/Bozet404/news-image-20261121/reward.svg)](https://make.fun/bounty/news-image-20261121?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)

One image that sums up the world's news of Saturday 21 November 2026,
built for the make.fun competition `news-image-20261121`.

## The image

`asset/entry.png` is a newspaper front page (1024×1024, JPEG bytes under
the name `entry.png`) drawn for this day alone:

- **Lead — Poland:** Russian missiles come down in south-eastern Poland
  during a huge overnight attack on Ukraine. Prime Minister Donald Tusk
  calls it a deliberate provocation; NATO chief Mark Rutte calls it a
  grave violation of allied airspace. Jets scramble, Patriots go live,
  nobody in Poland is hurt.
- **Markets:** Wall Street routs as the AI trade unwinds — the S&P 500
  falls 3.7% into correction, the Nasdaq drops 5.3% and turns negative
  for the year, Nvidia slides 14% a day after Anthropic's record IPO
  fizzled.
- **Justice:** The International Court of Justice rules that Myanmar
  committed genocide against the Rohingya.
- **Also today:** Cyclone Akvan hits the Odisha coast; the COP31 climate
  talks enter their final stage; the UK and the EU sign trade and
  youth-mobility deals; Russian strikes hit three Kyiv bridges and kill
  nine.

The pictures are illustrations drawn for these stories; every headline
and caption is set in type so it stays legible.

## The program

`main.ts` (Node 22, standard library only) copies `asset/entry.png`
to `<output>/entry.png` after checking it is a whole PNG or JPEG of at
most 1 MiB and 1024×1024 pixels, then reads the copy back and confirms
it is byte-equal. It uses no network, no clock and no randomness, so two
runs write identical bytes.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
