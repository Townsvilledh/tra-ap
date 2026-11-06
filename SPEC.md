# Tra-ap — SPEC (v7 "Unique")

## What Tra-ap is
An offline-first, open-source music studio for a phone in landscape
(Samsung A12 class hardware). One single HTML file. No server, no account,
no samples to download: every sound is synthesised live with the Web Audio
API from original code, so there is nothing proprietary to copy and nothing
to license.

## What Tra-ap is NOT
- Not a clone of FL Studio / FL Mobile or Logic. It does not copy their UI,
  code, sounds, icons or project formats.
- The public FL-workflow clones (LYNX SHARE, Gridline), LMMS, Ardour,
  Zrythm and Helio were studied only as *workflow references* — the general
  ideas every DAW shares (a step rack, a piano roll, a playlist, a mixer).
  No code was taken from them. LYNX SHARE / Gridline are AGPL-3.0 and
  desktop C++; Tra-ap is MIT and a browser app, so their code could not be
  reused here even if we wanted to.
- No VST/AU plugins (impossible in a mobile browser), no .flp/.logicx
  read/write. MIDI + WAV are the honest bridge formats.

## The Tra-ap difference (the unique part)
1. **Say it, hear it** — sound design by words. Type "punchy kick",
   "dark log drum", "soft marimba" and the selected channel is re-tuned.
   Sentence-to-song: "sad piano in Am at 100, soft drums" builds a pattern.
2. **Idea Cards** — Tra-ap proposes grooves/melodies as cards.
   You are the producer: **Use** it, **Blend** it with what you have, or
   **Dismiss** it. Nothing is forced on your track.
3. **Scenes, not pattern numbers** — playlist clips are named scenes
   (Intro, Groove, Log Party…) you double-tap to edit.
4. **Listen** — hum a melody or beatbox into the mic; Tra-ap transcribes
   it into a pattern (beta: pitch/noise detection, quantised to your key).
5. **Sound Check** — a one-tap diagnostic that plays every channel alone
   and tells you *why* one is silent (muted, volume 0, solo masking,
   audio asleep). Built to kill the "only the kick plays" bug class:
   every voice in Tra-ap is created fresh per hit and routed through its
   own channel chain — no shared pre-rendered buffers to go stale.

## Core studio (fixed gaps from v6)
- Patterns are **1, 2 or 4 bars** (was: 1 bar only).
- Playlist: **64 bars**, 8 scene lanes, zoom, time counter + 3:00 marker.
- Piano roll: tap to write, **drag to move, drag the tail to resize**,
  erase mode, velocity by double-tap cycle.
- Mixer: per-channel volume, pan, **3-band EQ, delay + reverb sends**,
  mute/solo; master compressor.
- Automation: not yet (see roadmap). Audio clips on the timeline: not yet;
  imported samples play as instruments instead.
- Project files: `.traap.json` save/load + autosave in the browser.
- Export: **WAV** (offline render of the whole song) and **MIDI**.
- Import: MIDI files, audio samples (wav/mp3/ogg) onto a channel,
  project JSON. ZIP pack import: not in this build.

## Sound engine
All synthesis, no samples:
drums — kick, snare, hat, clap, shaker, amapiano log drum;
melodic — piano, marimba, kalimba, glockenspiel, pluck guitar,
bass, pad, strings, flute, choir. Word-design adjusts brightness,
punch (pitch-drop), decay and filter per channel.

## Performance rules (A12)
- Lookahead scheduler (25 ms tick, 120 ms horizon), fresh oscillators per
  voice, no per-frame DOM writes except the playhead.
- Step grid groups by bar; playlist renders 512 light cells max.

## Roadmap
1. .flp *reader* (tempo, names, pattern notes only — no plugins) as an
   import bridge, once its format behaviour is verified from clean sources.
2. Audio clips on playlist lanes (record/import, trim, fade).
3. Automation lanes (volume/pan/filter at first).
4. Longer Listen sessions + real-voice tuning.
5. Native Android wrapper (same single file inside a WebView shell).

## License
MIT for Tra-ap code. All sounds are generated — no third-party samples
ship in this build. If you import your own packs, their licenses are yours.
