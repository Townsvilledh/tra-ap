// Tra-ap runtime harness — runs the real app script against a minimal fake
// DOM and exercises the core features end to end. No browser needed.
// Run: node tests/runtime_harness.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

class El {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase(); this.id = id; this.children = []; this.dataset = {};
    this.style = {}; this._cls = new Set(); this.value = ""; this.textContent = "";
    this._innerHTML = ""; this.width = 300; this.height = 150; this.options = [];
    this.classList = { add: (...c) => c.forEach(x => this._cls.add(x)), remove: (...c) => c.forEach(x => this._cls.delete(x)),
      toggle: (c, f) => { if (f === undefined) f = !this._cls.has(c); f ? this._cls.add(c) : this._cls.delete(c); return f; },
      contains: c => this._cls.has(c) };
  }
  set innerHTML(v) { this._innerHTML = v; if (v === "") this.children = []; }
  get innerHTML() { return this._innerHTML; }
  appendChild(c) { this.children.push(c); if (c.tagName === "OPTION") this.options.push(c); return c; }
  append(...cs) { cs.forEach(c => this.appendChild(c)); }
  addEventListener() {} setAttribute() {} setPointerCapture() {}
  querySelector() { return this._q || (this._q = new El("span")); }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; }
  getContext() { return this._ctx || (this._ctx = new Proxy({}, { get: (t, k) => t[k] !== undefined ? t[k] : (() => {}), set: (t, k, v) => (t[k] = v, true) })); }
  click() {}
}
const byId = new Map();
const defaults = { bpm: "112", swing: "8", masterVol: "85", delayTime: "280", verbSize: "55",
  prZoom: "24", plZoom: "26", prLen: "2", keySel: "A minor", patBars: "2", bpmNum: "112" };
function elFor(sel) {
  if (!byId.has(sel)) { const e = new El(sel.includes("canvas") ? "canvas" : "div", sel.slice(1)); if (defaults[e.id] !== undefined) e.value = defaults[e.id]; byId.set(sel, e); }
  return byId.get(sel);
}
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Math, JSON, URL: { createObjectURL: () => "blob:x", revokeObjectURL: () => {} },
  Blob: class {}, location: { hash: "" }, navigator: {},
  localStorage: { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } },
  document: {
    querySelector: (s) => elFor(s), querySelectorAll: () => [],
    createElement: (t) => new El(t), documentElement: new El("html"), fullscreenElement: null,
  },
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);

let pass = 0, fail = 0; const ok = (c, n) => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗ FAIL:", n)); };

const tests = `
;(function(){
 const R=[];
 R.push(["demo loads 4 scenes", proj.patterns.length===4]);
 R.push(["scene names", proj.patterns.map(p=>p.name).join(",")==="Groove,Marimba Talk,Break,Log Party"]);
 R.push(["10 channels", proj.channels.length===10]);
 R.push(["song is >=13 bars", songBars()>=13]);
 const mb=midiBytes();
 R.push(["MIDI starts with MThd", mb[0]===0x4D&&mb[1]===0x54&&mb[2]===0x68&&mb[3]===0x64]);
 R.push(["MIDI has real content", mb.length>200]);
 const before=proj.patterns.length; const p=buildFromSentence("sad piano in Am at 98 with soft drums and a deep log");
 R.push(["sentence builds a scene", proj.patterns.length===before+1 && p.notes.length>=8]);
 R.push(["sentence sets BPM 98", proj.bpm===98]);
 const idea=genIdea("Amapiano");
 R.push(["amapiano idea has log notes", idea.pattern.notes.some(n=>n.ch==="log")]);
 const kick=chById("kick"); applyWords("punchy dark kick", kick);
 R.push(["words: punchy sets punch .95", kick.punch===.95]);
 R.push(["words: dark sets bright .22", kick.bright===.22]);
 const mp=chById("marimba"); applyWords("soft marimba", mp);
 R.push(["words: preset switch works", mp.preset==="marimba" && mp.punch===.25]);
 const pat=curPat(); const nb=pat.notes.length;
 pat.notes.push({id:"t1",ch:"piano",pitch:72,start:0,len:2,vel:.8});
 R.push(["note add works", curPat().notes.length===nb+1]);
 R.push(["autosave object is clean JSON", (()=>{try{JSON.stringify(cleanProject());return true}catch(e){return false}})()]);
 return R;
})()`;
try {
  vm.runInContext(script, sandbox);
  ok(true, "app script boots against DOM (renderAll runs)");
  const results = vm.runInContext(tests, sandbox);
  results.forEach(([n, c]) => ok(!!c, n));
} catch (e) { ok(false, "runtime boot — " + e.message); }
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
