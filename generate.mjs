// Builds the profile SVGs. No dependencies: change the text below, then run `node generate.mjs`.
// It needs the network once, to fetch a font subset containing only the characters used here.
import { writeFileSync } from "node:fs";

const ACCENT = "#00fab3";
const BG = "#0c0c0c";
const FG = "#e0e0e0";
const MUTED = "#999999";
const CORE = "#d8fff2";

const NAME = "Nikita Dmitrienko";
const TITLE = "Senior Frontend Engineer";
const PROMPT = "nikita@github:~$ ";
const TAGLINE = "building things, breaking things, occasionally shipping things";

const WIDE_ROWS = [
  ["Now", "Pluto TV, streaming on web and connected TV"],
  ["Before", "Finch Genetics, regulated healthcare, 6 years"],
  ["Started", "QA, 2016"],
  ["Remote", "Since 2017"],
  ["Stack", "React, TypeScript"],
  ["Games", "Timmy's Ascension, Cobra's Quest"],
  ["Site", "nikita-dmitrienko.dev"],
];

const NARROW_ROWS = [
  ["Now", "Pluto TV, web and connected TV"],
  ["Before", "Finch Genetics, healthcare, 6 years"],
  ["Started", "QA, 2016"],
  ["Remote", "Since 2017"],
  ["Stack", "React, TypeScript"],
  ["Games", "Timmy's Ascension, Cobra's Quest"],
  ["Site", "nikita-dmitrienko.dev"],
];

// --- The TV: x runs right, y runs down, z runs away from the viewer ---

const ROTATION_FRAMES = 16;
const TRACE_FRAMES = 24;
const LOOP_SECONDS = 8;

const closed = (points) => [...points, points[0]];

const roundedRect = (cx, cy, w, h, r, z) => {
  const points = [];
  const corners = [
    [cx + w - r, cy - h + r, -90],
    [cx + w - r, cy + h - r, 0],
    [cx - w + r, cy + h - r, 90],
    [cx - w + r, cy - h + r, 180],
  ];
  for (const [x, y, start] of corners) {
    for (let i = 0; i <= 3; i += 1) {
      const angle = ((start + i * 30) * Math.PI) / 180;
      points.push([x + r * Math.cos(angle), y + r * Math.sin(angle), z]);
    }
  }
  return closed(points);
};

const circle = (cx, cy, r, z) =>
  closed(Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 2 * Math.PI;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle), z];
  }));

const W = 2.25;
const H = 1.7;
const SCREEN = { x: -0.42, w: 1.62, h: 1.34 };

const screenEdge = roundedRect(SCREEN.x, 0, SCREEN.w - 0.14, SCREEN.h - 0.14, 0.26, -0.01);
const faceEdge = roundedRect(0, 0, W, H, 0.16, 0);

const frontLines = [
  faceEdge,
  roundedRect(SCREEN.x, 0, SCREEN.w, SCREEN.h, 0.3, 0),
  screenEdge,
  circle(1.66, -0.82, 0.24, 0),
  [[1.66, -0.82, 0], [1.66, -1.02, 0]],
  circle(1.66, -0.16, 0.24, 0),
  [[1.66, -0.16, 0], [1.83, -0.28, 0]],
  ...[0.42, 0.62, 0.82, 1.02].map((y) => [[1.36, y, 0], [1.96, y, 0]]),
  [[0, -H, 0.75], [-1.25, -3.05, 0.75]],
  [[0, -H, 0.75], [1.2, -2.95, 0.75]],
  circle(-1.25, -3.05, 0.05, 0.75),
  circle(1.2, -2.95, 0.05, 0.75),
  [[-1.55, H, 0.15], [-1.8, H + 0.3, 0.15], [-0.95, H + 0.3, 0.15], [-1.2, H, 0.15]],
  [[1.55, H, 0.15], [1.8, H + 0.3, 0.15], [0.95, H + 0.3, 0.15], [1.2, H, 0.15]],
];

const rear = closed([[-1.2, -0.92, 2.15], [1.2, -0.92, 2.15], [1.2, 0.92, 2.15], [-1.2, 0.92, 2.15]]);
const backLines = [
  roundedRect(0, 0, W, H, 0.16, 0.5),
  rear,
  ...[[-W, -H], [W, -H], [W, H], [-W, H]].map(([x, y], i) => [
    [x * 0.97, y * 0.97, 0],
    [x, y, 0.5],
    rear[i],
  ]),
];

const camera = (t) => ({
  yaw: ((34 * Math.PI) / 180) * Math.sin(2 * Math.PI * t),
  pitch: (-8 * Math.PI) / 180 + ((2.5 * Math.PI) / 180) * Math.sin(4 * Math.PI * t),
});

const project = ([x0, y0, z0], { yaw, pitch }, view) => {
  const z1 = z0 - 0.8;
  const x = x0 * Math.cos(yaw) + z1 * Math.sin(yaw);
  const z2 = -x0 * Math.sin(yaw) + z1 * Math.cos(yaw);
  const y = y0 * Math.cos(pitch) - z2 * Math.sin(pitch);
  const z = y0 * Math.sin(pitch) + z2 * Math.cos(pitch);
  const depth = 9 / (9 + z);
  return [view.cx + x * depth * view.scale, view.cy + y * depth * view.scale];
};

const round = (n) => String(Math.round(n * 10) / 10);

const toPath = (lines, cam, view) =>
  lines
    .map((line) => `M${line.map((p) => project(p, cam, view).map(round).join(" ")).join(" ")}`)
    .join("");

const traceAt = (t) =>
  Array.from({ length: 17 }, (_, i) => {
    const u = i / 16;
    const y = 0.62 * Math.sin(u * 7 + 2 * Math.PI * t * 3) * Math.sin(u * Math.PI);
    return [SCREEN.x - 1.18 + u * 2.36, y, -0.01];
  });

const animatedPath = (id, pathAt, animate, frames = ROTATION_FRAMES) => {
  const times = Array.from({ length: frames + 1 }, (_, i) => (i % frames) / frames);
  const motion = animate
    ? `<animate attributeName="d" dur="${LOOP_SECONDS}s" repeatCount="indefinite" values="${times.map(pathAt).join(";")}"/>`
    : "";
  return `<path id="${id}" d="${pathAt(animate ? 0 : 0.09)}">${motion}</path>`;
};

const tv = (view, animate) => {
  const paths = [
    animatedPath("front", (t) => toPath(frontLines, camera(t), view), animate),
    animatedPath("back", (t) => toPath(backLines, camera(t), view), animate),
    animatedPath("face", (t) => toPath([faceEdge], camera(t), view), animate),
    animatedPath("screen", (t) => toPath([screenEdge], camera(t), view), animate),
    animatedPath("trace", (t) => toPath([traceAt(t)], camera(t), view), animate, TRACE_FRAMES),
  ];
  return `<defs>${paths.join("")}</defs>
<g class="tv">
<use href="#back" class="line back"/>
<use href="#face" class="face"/>
<use href="#screen" class="phosphor"/>
<g class="line wide"><use href="#front"/><use href="#trace"/></g>
<g class="line soft"><use href="#front"/><use href="#trace"/></g>
<g class="line core"><use href="#front"/><use href="#trace"/></g>
</g>`;
};

// --- The card ---

const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const typed = (text, startIndex) =>
  [...text].map((ch, i) => `<tspan class="ty" style="--i:${startIndex + i}">${esc(ch)}</tspan>`).join("");

const card = ({ x, top, rows, nameSize, labelWidth, step, taglineLines, width }) => {
  let y = top;
  const out = [`<text x="${x}" y="${y}" class="prompt">${PROMPT}${typed("whoami", 0)}</text>`];
  y += nameSize + 12;
  out.push(
    `<g class="r" style="--i:2">`,
    `<g class="glitch"><text x="${x - 2}" y="${y}" class="name split-a" style="font-size:${nameSize}px">${NAME}</text>`,
    `<text x="${x + 2}" y="${y}" class="name split-b" style="font-size:${nameSize}px">${NAME}</text></g>`,
    `<text x="${x}" y="${y}" class="name halo-wide" style="font-size:${nameSize}px">${NAME}</text>`,
    `<text x="${x}" y="${y}" class="name halo" style="font-size:${nameSize}px">${NAME}</text>`,
    `<text x="${x}" y="${y}" class="name" style="font-size:${nameSize}px">${NAME}</text>`,
    `</g>`,
  );
  y += 26;
  out.push(`<text x="${x}" y="${y}" class="title r" style="--i:3">${TITLE}</text>`);
  y += 13;
  out.push(`<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" class="rule r" style="--i:4"/>`);
  y += 12;
  rows.forEach(([label, value], i) => {
    y += step;
    const dots = ".".repeat(labelWidth - label.length);
    // The whole image links to the site, so the domain is styled as the link it is
    const shown = label === "Site" ? `<tspan class="link">${esc(value)}</tspan>` : esc(value);
    out.push(
      `<text x="${x}" y="${y}" class="row r" style="--i:${i + 5}"><tspan class="key">${label}</tspan><tspan class="dots"> ${dots} </tspan>${shown}</text>`,
    );
  });
  y += 12;
  for (const line of taglineLines) {
    y += 19;
    out.push(`<text x="${x}" y="${y}" class="comment r" style="--i:13">${esc(line)}</text>`);
  }
  y += 26;
  const cursorX = x + PROMPT.length * 8.7;
  out.push(
    `<text x="${x}" y="${y}" class="prompt r" style="--i:14">${PROMPT}</text>`,
    `<rect x="${cursorX}" y="${y - 12}" width="8.7" height="15" class="cursor r" style="--i:14"/>`,
  );
  return { body: out.join("\n"), bottom: y };
};

// --- The file ---

const style = (fonts, animate) => {
  const faces = fonts
    .map(({ weight, data }) => `@font-face{font-family:JBM;font-weight:${weight};src:url(data:font/woff2;base64,${data}) format("woff2")}`)
    .join("");
  const motion = animate
    ? `.r{animation:in .2s ease-out backwards;animation-delay:calc(var(--i)*55ms + 340ms)}
@keyframes in{from{opacity:0;transform:translateX(-5px)}}
.ty{animation:ty 1ms steps(1) backwards;animation-delay:calc(var(--i)*48ms + 90ms)}
@keyframes ty{from{fill-opacity:0}}
.tv{animation:power .55s steps(1) backwards .05s}
@keyframes power{0%{opacity:0}18%{opacity:.8}30%{opacity:.1}48%{opacity:1}62%{opacity:.35}78%{opacity:1}}
.phosphor{animation:breathe 3.1s ease-in-out infinite}
@keyframes breathe{50%{fill-opacity:.09}}
.cursor{animation:in .2s ease-out backwards,blink 1.1s steps(1) infinite 1.2s;animation-delay:calc(14*55ms + 340ms),1.2s}
@keyframes blink{50%{opacity:0}}
.glitch{animation:glitch 8s steps(1) infinite 2.4s}
@keyframes glitch{0%,94%{opacity:0;transform:none}94.5%{opacity:.9;transform:translateX(3px)}95.5%{opacity:.7;transform:translateX(-2px)}96.5%{opacity:0}}
.band{animation:band 7s linear infinite}
@keyframes band{from{transform:translateY(-120px)}to{transform:translateY(760px)}}`
    : `.glitch,.band{display:none}`;
  return `<style><![CDATA[${faces}
text{font-family:JBM,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;font-size:14.5px;fill:${FG}}
.line{fill:none;stroke-linecap:round;stroke-linejoin:round}
.wide{stroke:${ACCENT};stroke-opacity:.09;stroke-width:11}
.soft{stroke:${ACCENT};stroke-opacity:.3;stroke-width:4}
.core{stroke:${CORE};stroke-width:1.4}
.back{stroke:${ACCENT};stroke-opacity:.34;stroke-width:1}
.face{fill:${BG};stroke:none}
.phosphor{fill:${ACCENT};fill-opacity:.045;stroke:none}
.prompt{fill:${MUTED}}
.name{font-weight:700;fill:#f2fffb}
.halo{fill:none;stroke:${ACCENT};stroke-opacity:.55;stroke-width:2}
.halo-wide{fill:none;stroke:${ACCENT};stroke-opacity:.16;stroke-width:7}
.split-a{fill:#ff2d78;mix-blend-mode:screen}.split-b{fill:#2df0ff;mix-blend-mode:screen}
.title{fill:${ACCENT}}
.rule{stroke:#2a2a2a}
.key{fill:${ACCENT}}.dots{fill:#3d3d3d}
.link{fill:${ACCENT};text-decoration:underline}
.comment{fill:#8a8a8a;font-size:12.5px}
.cursor{fill:${ACCENT}}
${motion}]]></style>`;
};

const svg = ({ width, tvView, cardOptions, fonts, animate }) => {
  const { body, bottom } = card(cardOptions);
  const height = bottom + 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${NAME}, ${TITLE}">
<!-- Generated by generate.mjs. Text is JetBrains Mono, subset and embedded under the SIL Open Font License 1.1: see OFL.txt -->
${style(fonts, animate)}
<defs><pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" fill-opacity=".018"/></pattern>
<linearGradient id="sweep" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${ACCENT}" stop-opacity="0"/><stop offset=".5" stop-color="${ACCENT}" stop-opacity=".035"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></linearGradient></defs>
<rect width="${width}" height="${height}" rx="12" fill="${BG}"/>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="11.5" fill="none" stroke="#222"/>
${tv(tvView, animate)}
${body}
<rect width="${width}" height="${height}" rx="12" fill="url(#scan)"/>
<rect class="band" width="${width}" height="110" fill="url(#sweep)"/>
</svg>
`;
};

// --- Build ---

async function fetchFonts(text) {
  const chars = [...new Set(text)].sort().join("");
  const url = `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&text=${encodeURIComponent(chars)}`;
  const headers = { "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/140.0 Safari/537.36" };
  const css = await (await fetch(url, { headers })).text();
  const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?url\((https:[^)]+)\)/g)];
  if (faces.length !== 2) throw new Error(`Expected 2 font files, got ${faces.length}`);
  return Promise.all(
    faces.map(async ([, weight, fontUrl]) => ({
      weight,
      data: Buffer.from(await (await fetch(fontUrl)).arrayBuffer()).toString("base64"),
    })),
  );
}

const allText = [NAME, TITLE, PROMPT, "whoami", TAGLINE, ".", ...[...WIDE_ROWS, ...NARROW_ROWS].flat()].join("");
const fonts = await fetchFonts(allText);

const wide = {
  width: 880,
  tvView: { cx: 178, cy: 205, scale: 56 },
  cardOptions: { x: 352, top: 42, rows: WIDE_ROWS, nameSize: 29, labelWidth: 9, step: 23, taglineLines: [TAGLINE], width: 496 },
  fonts,
};

const narrow = {
  width: 440,
  tvView: { cx: 220, cy: 196, scale: 52 },
  cardOptions: {
    x: 24,
    top: 336,
    rows: NARROW_ROWS,
    nameSize: 27,
    labelWidth: 8,
    step: 23,
    taglineLines: ["building things, breaking things,", "occasionally shipping things"],
    width: 392,
  },
  fonts,
};

const outputs = {
  "profile.svg": svg({ ...wide, animate: true }),
  "profile-narrow.svg": svg({ ...narrow, animate: true }),
  "profile-still.svg": svg({ ...wide, animate: false }),
  "profile-narrow-still.svg": svg({ ...narrow, animate: false }),
};

for (const [file, content] of Object.entries(outputs)) {
  writeFileSync(new URL(file, import.meta.url), content);
  console.log(file, `${(content.length / 1024).toFixed(1)} KB`);
}
