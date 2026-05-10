<p align="right">
  <strong>English</strong> | <a href="./README.zh.md">简体中文</a>
</p>

# uvp-wiki

Public static wiki for `uvp-eth`.

The editable source lives under `wiki/`. GitHub Actions builds it with:

```bash
node wiki/scripts/build-static-site.mjs
```

The generated site is written to `wiki/site/` and deployed through GitHub Pages.
