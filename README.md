# uvp-wiki

Public static wiki for `uvp-eth`.

The editable source lives under `wiki/`. GitHub Actions builds it with:

```bash
node wiki/scripts/build-static-site.mjs
```

The generated site is written to `wiki/site/` and deployed through GitHub Pages.
