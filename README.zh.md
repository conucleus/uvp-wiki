<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# uvp-wiki

`uvp-eth` 的公开静态 wiki。

可编辑源文件位于 `wiki/`。GitHub Actions 使用以下命令构建：

```bash
node wiki/scripts/build-static-site.mjs
```

生成站点会写入 `wiki/site/`，并通过 GitHub Pages 部署。
