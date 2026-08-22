# Movie Night media

Drop small, **you-own-the-rights** or public-domain `.mp4` files here to watch
together in the Living Room. The catalog in `src/systems/movieCatalog.ts` points
at:

- `demo-1.mp4` — "Evening In"
- `demo-2.mp4` — "City Lights"
- `demo-3.mp4` — "Slow Sunday"

If a file is missing, the in-world TV shows a **cinematic placeholder** instead
of erroring, so the app runs fine with no media at all. Keep files small
(mobile-first): short, low-bitrate clips are ideal. **No copyrighted content is
committed to this repo.**

To add another title, drop the file here and add an entry (`id`, `title`,
`src: '/media/your-file.mp4'`) to `MOVIE_CATALOG`.
