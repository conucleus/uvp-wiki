import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const wikiRoot = path.resolve(scriptDir, "..");
const outputRoot = path.join(wikiRoot, "site");
const assetSource = path.join(wikiRoot, "assets", "site.css");
const publicRoot = path.join(wikiRoot, "public");
const defaultSiteUrl =
  process.env.GITHUB_REPOSITORY?.includes("/")
    ? `https://${process.env.GITHUB_REPOSITORY.split("/")[0]}.github.io/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "https://conucleus.github.io/uvp-wiki/";
const siteUrl = normalizeSiteUrl(process.env.WIKI_SITE_URL || defaultSiteUrl);

const markdownFiles = [];
const languageConfigs = {
  zh: {
    code: "zh",
    htmlLang: "zh-CN",
    sourcePrefix: "",
    outputPrefix: "",
    summaryRel: "SUMMARY.md",
    homeLabel: "首页",
    brandSubtitle: "EVM 原生 UVP 文档",
    footer: "由 Markdown 生成。修改源文件后运行 <code>node wiki/scripts/build-static-site.mjs</code> 重新构建。",
  },
  en: {
    code: "en",
    htmlLang: "en",
    sourcePrefix: "en/",
    outputPrefix: "en/",
    summaryRel: "en/SUMMARY.md",
    homeLabel: "Home",
    brandSubtitle: "EVM-native UVP docs",
    footer: "Generated from Markdown. After editing source files, run <code>node wiki/scripts/build-static-site.mjs</code> to rebuild.",
  },
};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["site", "scripts", "assets", "public"].includes(entry.name)) continue;
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      markdownFiles.push(fullPath);
    }
  }
}

function outputRelForMarkdown(rel) {
  if (rel === "README.md") return "index.html";
  if (rel.endsWith("/README.md")) return rel.slice(0, -"README.md".length) + "index.html";
  return rel.replace(/\.md$/, ".html");
}

function normalizeSiteUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function publicUrlForOutputRel(outputRel) {
  const normalizedRel = outputRel.replaceAll(path.sep, "/");
  if (normalizedRel === "index.html") return siteUrl;
  if (normalizedRel.endsWith("/index.html")) return `${siteUrl}${normalizedRel.slice(0, -"index.html".length)}`;
  return `${siteUrl}${normalizedRel}`;
}

function slugify(value) {
  const normalized = value
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_#[\]()]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "section";
}

function currentRootRel(outputRel) {
  const depth = path.dirname(outputRel) === "." ? 0 : path.dirname(outputRel).split(path.sep).length;
  return depth === 0 ? "" : "../".repeat(depth);
}

function rewriteMarkdownLink(target) {
  if (/^(https?:|mailto:|#|file:)/.test(target)) return target;
  const [base, hash = ""] = target.split("#");
  if (!base.endsWith(".md")) return target;
  let rewritten;
  if (base === "README.md" || base.endsWith("/README.md")) {
    rewritten = base.replace(/(^|\/)README\.md$/, "$1index.html");
  } else {
    rewritten = base.replace(/\.md$/, ".html");
  }
  return hash ? `${rewritten}#${hash}` : rewritten;
}

function inlineMarkdown(value) {
  const codeSpans = [];
  let text = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    const token = `\u0000CODE${codeSpans.length}\u0000`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, target) => {
    const href = escapeHtml(rewriteMarkdownLink(target.trim()));
    return `<a href="${href}">${inlineMarkdown(label)}</a>`;
  });

  text = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (let i = 0; i < codeSpans.length; i += 1) {
    text = text.replace(`\u0000CODE${i}\u0000`, codeSpans[i]);
  }
  return text;
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function parseTable(lines, start) {
  const rows = [];
  let index = start;
  while (index < lines.length && lines[index].includes("|") && lines[index].trim() !== "") {
    rows.push(lines[index]);
    index += 1;
  }
  if (rows.length < 2 || !isTableSeparator(rows[1])) return null;

  const splitRow = (row) => {
    let trimmed = row.trim();
    if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
    if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
    return trimmed.split("|").map((cell) => cell.trim());
  };

  const header = splitRow(rows[0]);
  const body = rows.slice(2).map(splitRow);
  const html = [
    "<table>",
    "<thead><tr>",
    ...header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`),
    "</tr></thead>",
    "<tbody>",
    ...body.flatMap((row) => [
      "<tr>",
      ...row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`),
      "</tr>",
    ]),
    "</tbody>",
    "</table>",
  ].join("");
  return { html, next: index };
}

function isBlockStarter(lines, index) {
  const line = lines[index];
  return (
    line.trim() === "" ||
    line.startsWith("```") ||
    /^(#{1,6})\s+/.test(line) ||
    line.startsWith(">") ||
    (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
  );
}

function parseList(lines, start, ordered) {
  const pattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*-\s+(.+)$/;
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let index = start;
  while (index < lines.length) {
    const match = lines[index].match(pattern);
    if (!match) break;
    const itemLines = [match[1].trim()];
    index += 1;
    while (
      index < lines.length &&
      !lines[index].match(pattern) &&
      !isBlockStarter(lines, index) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^\s*-\s+/.test(lines[index])
    ) {
      itemLines.push(lines[index].trim());
      index += 1;
    }
    items.push(`<li>${inlineMarkdown(itemLines.join(" "))}</li>`);
  }
  return { html: `<${tag}>${items.join("")}</${tag}>`, next: index };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const usedIds = new Map();
  let index = 0;

  const uniqueId = (raw) => {
    const base = slugify(raw);
    const count = usedIds.get(base) || 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([^`]*)\s*$/);
    if (fence) {
      const language = fence[1].trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const className = language === "mermaid" ? "mermaid-block" : "code-block";
      const langClass = language ? ` class="language-${escapeHtml(language)}"` : "";
      html.push(`<pre class="${className}"><code${langClass}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();
      const id = uniqueId(title);
      html.push(`<h${level} id="${id}">${inlineMarkdown(title)}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${markdownToHtml(quote.join("\n"))}</blockquote>`);
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      html.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      const list = parseList(lines, index, false);
      html.push(list.html);
      index = list.next;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const list = parseList(lines, index, true);
      html.push(list.html);
      index = list.next;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !lines[index].startsWith("```") &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*-\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !(lines[index].includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) &&
      !lines[index].startsWith(">")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function pageTitle(markdown, fallback) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

function languageForSourceRel(sourceRel) {
  return sourceRel.startsWith(languageConfigs.en.sourcePrefix) ? languageConfigs.en : languageConfigs.zh;
}

function stripLanguagePrefix(sourceRel, language) {
  return language.sourcePrefix && sourceRel.startsWith(language.sourcePrefix)
    ? sourceRel.slice(language.sourcePrefix.length)
    : sourceRel;
}

function parseSummary(summaryMarkdown, language) {
  const sections = [];
  let section = { title: "Docs", items: [] };
  let stack = [];

  const ensureSection = () => {
    if (!sections.includes(section)) sections.push(section);
  };

  for (const line of summaryMarkdown.split("\n")) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      section = { title: sectionMatch[1].trim(), items: [] };
      sections.push(section);
      stack = [];
      continue;
    }
    const itemMatch = line.match(/^(\s*)-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (itemMatch) {
      ensureSection();
      const indent = itemMatch[1].replace(/\t/g, "  ").length;
      const level = Math.floor(indent / 2);
      const href = `${language.outputPrefix}${outputRelForMarkdown(itemMatch[3].trim())}`;
      const node = { label: itemMatch[2].trim(), href, children: [] };

      if (level === 0 || stack.length === 0) {
        section.items.push(node);
        stack = [node];
        continue;
      }

      const parent = stack[level - 1] || stack[stack.length - 1];
      parent.children.push(node);
      stack[level] = node;
      stack.length = level + 1;
    }
  }
  return sections.filter((entry) => entry.items.length > 0);
}

function navNodeContainsCurrent(node, currentOutputRel) {
  return node.href === currentOutputRel || node.children.some((child) => navNodeContainsCurrent(child, currentOutputRel));
}

function renderNavNode(node, currentOutputRel, rootRel, depth = 0) {
  const active = node.href === currentOutputRel ? " active" : "";
  const depthClass = ` nav-depth-${Math.min(depth, 3)}`;
  const href = `${rootRel}${node.href}`;

  if (node.children.length === 0) {
    return `<a class="nav-link${depthClass}${active}" href="${href}">${escapeHtml(node.label)}</a>`;
  }

  const open = navNodeContainsCurrent(node, currentOutputRel) ? " open" : "";
  const children = node.children.map((child) => renderNavNode(child, currentOutputRel, rootRel, depth + 1)).join("\n");
  return [
    `<details class="nav-group${depthClass}"${open}>`,
    `<summary class="nav-group-summary"><a class="nav-link nav-parent${active}" href="${href}">${escapeHtml(node.label)}</a></summary>`,
    `<div class="nav-children">${children}</div>`,
    "</details>",
  ].join("\n");
}

function renderNav(navSections, currentOutputRel, rootRel) {
  const parts = [];
  for (const section of navSections) {
    parts.push(`<div class="nav-section"><p class="nav-section-title">${escapeHtml(section.title)}</p>`);
    for (const item of section.items) {
      parts.push(renderNavNode(item, currentOutputRel, rootRel));
    }
    parts.push("</div>");
  }
  return parts.join("\n");
}

function alternateOutputRel(sourceRel, sourceSet) {
  const language = languageForSourceRel(sourceRel);
  if (language.code === "en") {
    const zhRel = stripLanguagePrefix(sourceRel, language);
    return sourceSet.has(zhRel) ? outputRelForMarkdown(zhRel) : "index.html";
  }

  const enRel = `${languageConfigs.en.sourcePrefix}${sourceRel}`;
  return sourceSet.has(enRel) ? outputRelForMarkdown(enRel) : "en/index.html";
}

function renderLanguageSwitch(language, rootRel, outputRel, altOutputRel) {
  const currentHref = `${rootRel}${outputRel}`;
  const altHref = `${rootRel}${altOutputRel}`;

  if (language.code === "en") {
    return [
      '<nav class="language-switch" aria-label="Language">',
      `<a href="${altHref}">中文</a>`,
      `<a class="active" href="${currentHref}" aria-current="page">EN</a>`,
      "</nav>",
    ].join("");
  }

  return [
    '<nav class="language-switch" aria-label="语言">',
    `<a class="active" href="${currentHref}" aria-current="page">中文</a>`,
    `<a href="${altHref}">EN</a>`,
    "</nav>",
  ].join("");
}

function renderPage({ title, body, nav, rootRel, sourceRel, outputRel, altOutputRel, language }) {
  const documentTitle = title === "UVP Wiki" ? "UVP Wiki" : `${title} · UVP Wiki`;
  const sourceMeta =
    sourceRel === "README.md"
      ? `<a href="${rootRel}../README.md">${escapeHtml(sourceRel)}</a>`
      : escapeHtml(sourceRel);
  const languageSwitch = renderLanguageSwitch(language, rootRel, outputRel, altOutputRel);

  return `<!doctype html>
<html lang="${language.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(documentTitle)}</title>
  <link rel="stylesheet" href="${rootRel}assets/site.css">
</head>
<body>
  <div class="mobile-header">
    <span class="mobile-title">UVP Wiki</span>
    <a href="${rootRel}${language.outputPrefix}index.html">${language.homeLabel}</a>
  </div>
  <div class="site-shell">
    <aside class="site-sidebar">
      <a class="brand" href="${rootRel}${language.outputPrefix}index.html">
        <span class="brand-title">UVP Wiki</span>
        <span class="brand-subtitle">${language.brandSubtitle}</span>
      </a>
      ${nav}
    </aside>
    <main class="site-main">
      <article class="doc-card">
        <div class="doc-toolbar">
          <div class="doc-meta">${sourceMeta}</div>
          ${languageSwitch}
        </div>
        <div class="doc-content">
${body}
        </div>
        <div class="page-footer">${language.footer}</div>
      </article>
    </main>
  </div>
</body>
</html>
`;
}

function writeRobotsTxt() {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}sitemap.xml`,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(outputRoot, "robots.txt"), robots);
}

function writeSitemapXml(pages) {
  const urls = [...pages]
    .sort((a, b) => a.outputRel.localeCompare(b.outputRel))
    .map((page) => [
      "  <url>",
      `    <loc>${escapeXml(publicUrlForOutputRel(page.outputRel))}</loc>`,
      `    <lastmod>${page.lastmod}</lastmod>`,
      "  </url>",
    ].join("\n"));

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(outputRoot, "sitemap.xml"), sitemap);
}

function copyPublicFiles() {
  if (!fs.existsSync(publicRoot)) return;
  fs.cpSync(publicRoot, outputRoot, { recursive: true, force: true });
}

function build() {
  walk(wikiRoot);
  const sourceSet = new Set(markdownFiles.map((file) => path.relative(wikiRoot, file)));
  const sitemapPages = [];

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(outputRoot, "assets"), { recursive: true });
  fs.copyFileSync(assetSource, path.join(outputRoot, "assets", "site.css"));
  copyPublicFiles();

  const navByLanguage = new Map();
  for (const language of Object.values(languageConfigs)) {
    const summaryPath = path.join(wikiRoot, language.summaryRel);
    if (fs.existsSync(summaryPath)) {
      const summary = fs.readFileSync(summaryPath, "utf8");
      navByLanguage.set(language.code, parseSummary(summary, language));
    }
  }

  for (const file of markdownFiles) {
    const rel = path.relative(wikiRoot, file);
    const language = languageForSourceRel(rel);
    const markdown = fs.readFileSync(file, "utf8");
    const outputRel = outputRelForMarkdown(rel);
    const rootRel = currentRootRel(outputRel);
    const body = markdownToHtml(markdown);
    const title = pageTitle(markdown, rel);
    const navItems = navByLanguage.get(language.code) || navByLanguage.get(languageConfigs.zh.code) || [];
    const nav = renderNav(navItems, outputRel, rootRel);
    const altOutputRel = alternateOutputRel(rel, sourceSet);
    const outPath = path.join(outputRoot, outputRel);
    ensureDir(outPath);
    fs.writeFileSync(outPath, renderPage({ title, body, nav, rootRel, sourceRel: rel, outputRel, altOutputRel, language }));
    sitemapPages.push({
      outputRel,
      lastmod: fs.statSync(file).mtime.toISOString().slice(0, 10),
    });
  }

  writeRobotsTxt();
  writeSitemapXml(sitemapPages);

  const redirect = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=site/index.html">
  <title>UVP Wiki</title>
</head>
<body>
  <p><a href="site/index.html">打开 UVP Wiki 文档站</a></p>
</body>
</html>
`;
  fs.writeFileSync(path.join(wikiRoot, "index.html"), redirect);
}

build();
console.log(`Built ${markdownFiles.length} pages into ${path.relative(process.cwd(), outputRoot)}`);
