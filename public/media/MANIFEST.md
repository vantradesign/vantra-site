# Product media — real captures only

No AI generation, no mockups, no retouching beyond cropping. If a capture cannot
be recorded yet, it stays a marked placeholder frame. A stylised stand-in on a
product page would misrepresent the product.

## Captures still needed

### `accessibility-auto-fixer/`

| File | What to record | Ratio |
| --- | --- | --- |
| `overlay-markers.mp4` + `.avif` poster | A scan running on a real page: markers appearing in place on the failing elements. No cursor choreography, no zooming. | 16:9 |
| `side-panel.avif` | The side panel with several findings expanded, showing rule, measured ratio and required threshold. | 16:10 |
| `diff-view.mp4` + `.avif` poster | A suggested colour fix shown as a diff, then applied to the preview. Must show that nothing changes until accepted. | 16:9 |

## Capture and encode rules

1. **Record at 2× device pixel ratio**, browser chrome cropped out, on the
   `#f5f2f3` paper background where possible.
2. **No GIFs.** Encode to MP4 (H.264, yuv420p) *and* export a poster frame. GIFs
   are an order of magnitude larger and cannot be paused by the user.
   ```bash
   ffmpeg -i raw.mov -an -vf "fps=30,scale=1920:-2" \
     -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart overlay-markers.mp4
   ffmpeg -i overlay-markers.mp4 -vframes 1 -q:v 2 poster.png
   ```
3. **Strip audio** (`-an`). These autoplay muted; an audio track is dead weight.
4. **Keep clips under 8 seconds** and loop cleanly.
5. **Poster frame is mandatory.** Under `prefers-reduced-motion` the component
   renders the poster with native controls instead of autoplaying, so a missing
   poster means a blank rectangle for those visitors.
6. **Register every file here**, then set `ratio` and remove `placeholder: true`
   in `data/products.ts`. The declared `ratio` must match the real asset — it is
   what reserves layout space and keeps CLS at zero.
