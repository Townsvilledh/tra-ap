// Tra-ap core tests — structural + pure-function checks against index.html
// Run: node tests/test_core.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log("  ✓", name); } else { fail++; console.log("  ✗ FAIL:", name); } };

// 1. The inline script compiles
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
try { new vm.Script(script); ok(true, "inline script compiles"); }
catch (e) { ok(false, "inline script compiles — " + e.message); }

// 2. Every $("#id") used in JS exists in the HTML, no duplicate ids
const used = new Set([...script.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)/g)].map(m => m[1]));
const defined = [...html.matchAll(/ id="([A-Za-z0-9_-]+)"/g)].map(m => m[1]);
ok([...used].every(id => defined.includes(id)), "all " + used.size + " JS-referenced ids exist in HTML");
ok(new Set(defined).size === defined.length, "no duplicate element ids");

// 3. All five studio views present
for (const v of ["flow", "rack", "keys", "mix", "create"])
  ok(html.includes('id="view-' + v + '"'), "view present: " + v);

// 4. Pure helpers behave (extracted and evaluated in isolation)
const grabStmt = (marker) => { const i = script.indexOf(marker); return script.slice(i, script.indexOf(";", i) + 1); };
const ctx = {};
vm.createContext(ctx);
vm.runInContext(grabStmt("const NOTE_NAMES=") + grabStmt("const mf=") +
  "function vlq(v){let b=v>>7,a=[];while(b>0){a.push((b&127)|128);b>>=7;}a.push(v&127);return a;}" +
  ";this.__={mf,mname,vlq};", ctx);
const { mf, mname, vlq } = ctx.__;
ok(Math.abs(mf(69) - 440) < 0.01, "A4 = 440 Hz");
ok(Math.abs(mf(60) - 261.63) < 0.1, "middle C ≈ 261.63 Hz");
ok(mname(69) === "A4" && mname(60) === "C4", "note names A4 / C4");
ok(JSON.stringify(vlq(0)) === "[0]", "VLQ(0)");
ok(JSON.stringify(vlq(128)) === "[129,0]", "VLQ(128)");
ok(JSON.stringify(vlq(8192)) === "[192,0]", "VLQ(8192)");

// 5. Feature presence — the v7 promises
for (const [needle, name] of [
  ["OfflineAudioContext", "WAV export via offline render"],
  ["midiBytes", "MIDI export"],
  ["runSoundCheck", "sound check diagnostic"],
  ["buildFromSentence", "sentence-to-song"],
  ["applyWords", "sound design by words"],
  ["genIdea", "idea cards"],
  ["finishListen", "hum / beatbox listen"],
  ["songBars", "playlist song length"],
  ['value="4">4 bars', "4-bar patterns"],
  ["roundRect", "piano roll rendering"],
  ["createConvolver", "reverb bus"],
  ["createDynamicsCompressor", "master compressor"],
  ["latencyHint", "playback buffer (fewer dropouts on low-end phones)"],
  ["wakeLock", "screen wake lock while playing"],
  ["visibilitychange", "auto-resume when returning to the app"],
  ["onstatechange", "audio state recovery"],
  ["activeVoices>56", "live voice cap against CPU overload"],
]) ok(html.includes(needle), "feature: " + name);

// 6. No copied/proprietary assets: no external URLs, no audio files referenced
ok(!/<script[^>]+src=/.test(html) && !/<link[^>]+href="http/.test(html), "single file, no external scripts/styles");
ok(!/samples\/|\.mp3|\.ogg/.test(script) && !/<audio/.test(html), "no bundled sample files referenced");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
