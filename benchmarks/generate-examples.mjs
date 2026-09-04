// Generate examples/*.md verbatim from a real benchmark run (output.json):
// each file shows the same task answered with no skill vs with ponytail, same model.
//   node benchmarks/generate-examples.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import loc from './loc.js';

// output.json is a promptfoo artifact and is gitignored (.gitignore: benchmarks/output*),
// so it is never present in a fresh clone. Say how to produce it instead of throwing a
// readFileSync stack at whoever runs the command in the header comment.
const outputUrl = new URL('./output.json', import.meta.url);
if (!existsSync(outputUrl)) {
  console.error('benchmarks/output.json not found — it is a promptfoo artifact, not committed.');
  console.error('Produce it first:');
  console.error('  npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml -o benchmarks/output.json');
  process.exit(1);
}

const j = JSON.parse(readFileSync(outputUrl, 'utf8'));
const isHaiku = (id) => id.includes('haiku');

const meta = [
  [/validates email/, 'email-validation', 'Email Validation'],
  [/debounce/,        'debounce',         'Debounce'],
  [/sales\.csv/,      'csv-sum',          'CSV Sum'],
  [/countdown timer/, 'react-countdown',  'Countdown Timer'],
  [/rate limiting/,   'rate-limit',       'Rate Limiting'],
];

// promptIdx is a position in promptfooconfig.yaml's `prompts:` list. Hardcoding 0 and 2
// silently coupled these docs to that ordering — reorder the arms and every example
// would be labelled backwards, with no error. Derive the indices from the labels.
const cfg = readFileSync(new URL('./promptfooconfig.yaml', import.meta.url), 'utf8');
const armLabels = [...cfg.matchAll(/^\s*label:\s*(.+)$/gm)].map((m) => m[1].trim());
const armIdx = (name) => {
  const i = armLabels.findIndex((l) => l.toLowerCase().startsWith(name));
  if (i < 0) {
    console.error(`arm "${name}" not found in promptfooconfig.yaml prompts: [${armLabels.join(', ')}]`);
    process.exit(1);
  }
  return i;
};
const BASELINE_ARM = armIdx('baseline');
const PONYTAIL_ARM = armIdx('ponytail');

const pick = (re, armIdx) =>
  j.results.results.find((r) => isHaiku(r.provider.id) && r.promptIdx === armIdx && re.test(r.vars.task));

const rows = [];
for (const [re, slug, title] of meta) {
  const b = pick(re, BASELINE_ARM), p = pick(re, PONYTAIL_ARM);
  if (!b || !p) { console.log('MISS', slug, !!b, !!p); continue; }
  const bL = loc(b.response.output).score, pL = loc(p.response.output).score;
  const md = `# ${title}

**Task:** "${b.vars.task}"

Verbatim model output from a benchmark run — Claude Haiku 4.5, no-skill arm vs ponytail arm, temperature 1, source \`benchmarks/output.json\`. Reproduce: \`npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml\`.

## Without Ponytail — ${bL} lines of code

${b.response.output.trim()}

## With Ponytail — ${pL} lines of code

${p.response.output.trim()}

**${bL} → ${pL} lines of code** — same model, same prompt.
`;
  writeFileSync(new URL(`../examples/${slug}.md`, import.meta.url), md);
  rows.push([title, slug, bL, pL]);
  console.log('wrote examples/' + slug + '.md', bL, '->', pL);
}

const tbl = rows.map(([t, s, b, p]) => `| [${t}](${s}.md) | ${b} | ${p} |`).join('\n');
const readme = `# Examples

Real model output, verbatim from benchmark runs — the same task answered by the same model
with no skill (\`## Without Ponytail — N lines of code\`) and with ponytail
(\`## With Ponytail — N lines of code\`), so you can
compare side by side. Model: Claude Haiku 4.5, temperature 1, source \`benchmarks/output.json\`.

These are not hand-written. Reproduce them yourself:
\`npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml\`. Method, all three models, and
median-of-10 numbers: [../benchmarks/](../benchmarks/).

| Example | Without (LOC) | With (LOC) |
|---|--:|--:|
${tbl}
`;
writeFileSync(new URL('../examples/README.md', import.meta.url), readme);
console.log('wrote examples/README.md');
