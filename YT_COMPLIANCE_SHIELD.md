# YT Compliance Shield
## Inauthentic Content Detection & Prevention System
### YouTube Policy 2026 — Last updated: April 2026

---

## WHAT YOUTUBE IS ACTUALLY ENFORCING

YouTube's January 2026 enforcement wave terminated channels with 4.7 billion views and $10M/year revenue. The pattern in every case: synthetic voiceover + templated script + stock visuals + high upload frequency = channel-level demonetization or termination. The policy evaluates **channels as systems**, not individual videos.

**The rule in one sentence:** AI is allowed as a tool. AI as the creator is not.

---

## THE 10 COMPLIANCE RULES (Non-Negotiable)

| # | Rule | Status if Broken |
|---|------|-----------------|
| R1 | Every script must contain original research, analysis, or storytelling not findable in a single source | Demonetization |
| R2 | Every video must have tonal variation in voiceover — not flat robotic delivery | Flagged as inauthentic |
| R3 | No two videos can share the same structural template identically | Channel-level flag |
| R4 | Visuals must not be exclusively static images — motion required | Inauthentic flag |
| R5 | AI disclosure label must be toggled on for any AI-generated visuals or voice | Policy violation |
| R6 | Upload no more than 1 video/day maximum — high frequency = spam signal | Inauthentic flag |
| R7 | Each video must add value not available elsewhere — commentary, context, unique angle | Demonetization |
| R8 | Script must NOT be a verbatim AI output — human rewrite/edit mandatory | Inauthentic flag |
| R9 | Do not reuse the same B-roll clips, music beds, or visual assets across videos | Reused content flag |
| R10 | Never simulate real news or events with AI visuals — fiction must be clearly labeled | Channel termination |

---

## DETECTION SYSTEM — 10 THREAT CATEGORIES

---

### ⚠️ THREAT-01: Templated Script Structure

**WARNING LEVEL:** 🔴 CRITICAL — Channel termination risk

**Detected Issue:**
Every script follows the same hook → exposition → reveal → CTA structure with identical phrasing patterns. YouTube's detection reads captions across your channel and flags when sentence structure, opening lines, or narrative pacing are statistically identical across videos.

Signs you're at risk:
- Scripts generated from the same Claude prompt template without variation
- Same intro formula: "In [YEAR], [PERSON] did [THING]..."
- Same CTA word-for-word in every outro
- Same act structure lengths (2 min intro, 3 min middle, 2 min outro) every video

**Solution/Fix:**
- Vary the hook type per video: open with dialogue, open with a statistic, open with a question, open with sound — rotate every video
- Rewrite 20–30% of every AI-generated script in your own voice before recording
- Vary CTA phrasing: subscribe ask, comment ask, like ask, notification ask — rotate
- Vary act lengths: some videos front-load the reveal, some withhold it until the end
- Add a "unique angle note" at the top of every script brief: what does THIS video say that no other video says?

**Tools/Instruction:**
- In Script Engine tab → add "Unique Angle" field before generating — this forces differentiation
- Claude instruction: *"Write this script in a completely different structural style from a history documentary format. Start with the money figure, not the event."*
- Run compliance check: paste script into Claude → *"Flag any sentence that could appear in any other history mystery video. Rewrite those sections."*

---

### ⚠️ THREAT-02: Robotic AI Voiceover (Flat TTS)

**WARNING LEVEL:** 🔴 CRITICAL — Direct inauthentic content flag

**Detected Issue:**
ElevenLabs and Kokoro TTS at default settings produce monotone, evenly-paced narration. YouTube's audio analysis detects tonal range, pause variation, emotional peaks, and breath patterns. Flat TTS with no variation is the #1 audio signal of inauthentic content. Channels using purely AI-generated imagery saw 25–35% lower average view duration than channels blending AI with authentic B-roll.

Signs you're at risk:
- Same ElevenLabs voice at same stability/similarity settings every video
- No dramatic pauses before reveals
- No tonal shift when transitioning between story beats
- Voiceover pace is identical throughout — no speed variation

**Solution/Fix:**
- Use ElevenLabs voice settings: drop stability to 0.35–0.45, boost style exaggeration to 0.6–0.8 for dramatic moments
- Add SSML-style direction to scripts: [PAUSE 1.5s], [WHISPER], [DRAMATIC], [SPEED UP]
- Rotate between 2–3 different ElevenLabs voices across your video series (not same voice every video)
- Write voiceover direction into every script: not just what to say, but HOW to say it at each beat
- For Grimm Archives: voice should drop to near-whisper at the mystery reveal, then build urgency at the CTA

**Tools/Instruction:**
- ElevenLabs settings for Grimm Archives: Stability 0.40, Similarity 0.75, Style 0.65, Speaker Boost ON
- Add SSML cues to script template: `[PAUSE 2s — before the key reveal]`, `[BREATHE]`, `[INTENSE — 3 sentences]`, `[CALM DOWN — transition]`
- Instruction: Never generate voiceover from a script without reading it first and adding at least 5 directional cues

---

### ⚠️ THREAT-03: Static Image Slideshow Format

**WARNING LEVEL:** 🔴 CRITICAL — Direct inauthentic flag

**Detected Issue:**
YouTube explicitly flags image slideshows or scrolling text with minimal narrative or educational value. Content where only the audio is modified but the visual content is repetitive or a low-effort match. Whisk-only production (static images + voiceover) with no motion = inauthentic content flag.

Signs you're at risk:
- Every visual is a static image with no motion
- No video clips between images
- Ken Burns (pan/zoom) is the only "motion" added
- Same image transition style throughout

**Solution/Fix:**
- Minimum ratio: 60% motion video clips / 40% static images — aim for 70/30
- Every static image must have at minimum: pan + zoom + subtle vignette overlay
- Add at least 3–5 Hunyuan video clips per video (even 3-second cinematic shots count)
- Use CapCut's motion effects on every static image — no image should sit completely still
- Vary transition styles: no two consecutive same-style transitions
- Add text overlays, graphics, and data visualizations — motion elements that aren't footage

**Tools/Instruction:**
- Production rule: Script cue markers must include at least 1 `[HUNYUAN CLIP]` per 2 minutes of content
- CapCut: apply Ken Burns to every image, vary zoom direction (some zoom in, some zoom out, some pan left/right)
- short-video-maker: already uses Pexels video B-roll automatically — satisfies this requirement for Shorts
- OpenMontage documentary-montage pipeline: handles motion mix automatically

---

### ⚠️ THREAT-04: Template Clone Detection (Channel Pattern)

**WARNING LEVEL:** 🔴 CRITICAL — Channel-level flag

**Detected Issue:**
YouTube evaluates channels holistically — upload frequency, format similarity, lack of commentary, and minimal editing all stack up as risk signals. The platform can now identify patterns behind mass-generated videos. If your last 10 videos have the same structure, pacing, and visual style, the channel is flagged — not individual videos.

Signs you're at risk:
- Every video is 10–12 min with the same act structure
- Same thumbnail template for every single video
- Same intro music every video
- Same voiceover pacing every video
- Upload schedule is robotically consistent (every Tuesday at 9am, no variation)

**Solution/Fix:**
- Every 4th or 5th video: break format completely. Do a 6-min shorter piece, or a 15-min deep dive
- Rotate thumbnail styles: dark-gold-object (your primary), then try red-text-face (archival photo), then light-documentary style
- Rotate intro music: 3–4 different score options, vary by video topic mood
- Vary upload times ± 2–3 days from your schedule
- Add at least one "special format" per month: a two-part story, a mystery series, a comparison piece

**Tools/Instruction:**
- Pre-upload checklist: "Is this video structurally different from my last 3 videos?" — if no → change something
- Claude instruction: *"Look at these 5 video titles and structures. What is the most different format I could use for the next video that still fits the Grimm Archives niche?"*
- Keep a format log: document structure type for every video uploaded

---

### ⚠️ THREAT-05: Script Not Genuinely Original

**WARNING LEVEL:** 🟠 HIGH — Demonetization risk

**Detected Issue:**
Content must reflect genuine human editorial judgment. A channel uploads 100 Top-10 videos using the same script template and AI voice = demonetized. If your script is essentially the Wikipedia article reordered with voiceover, it fails the originality test. The test is: does this video say something that didn't exist before you made it?

Signs you're at risk:
- Script sources: Wikipedia + one article → script
- No original analysis, opinion, or interpretation
- Story told in exact chronological order as found in sources
- No "this is what I think happened" or "this is why this matters today" sections
- Script is 90%+ verifiable facts with no editorial voice

**Solution/Fix:**
- Every Grimm Archives video needs at least ONE of: original theory, modern parallel, financial analysis, moral question, emotional interpretation
- Research minimum: 3+ distinct sources per video, then synthesize — not summarize
- Add a "Creator Take" section to every script brief: *"What is the angle or opinion that ONLY Grimm Archives would bring to this story?"*
- End every video with a genuine question that reflects your research: not "comment below" but "based on the evidence, here's what I believe happened — and here's why that changes how we think about [thing]"

**Tools/Instruction:**
- Script brief must include: Sources (3+), Unique Angle, Creator Take, Modern Relevance
- Claude instruction: *"After writing this script, add a 90-second 'Grimm Archives Take' section where you give a specific theory or interpretation that goes beyond the documented facts. Make it defensible but provocative."*
- Crawl4AI: scrape 3 different sources on each topic — forces synthesis over copy

---

### ⚠️ THREAT-06: AI Disclosure Non-Compliance

**WARNING LEVEL:** 🟠 HIGH — Policy violation, potential strike

**Detected Issue:**
Failure to disclose altered or realistic AI content can result in severe penalties including potential channel termination. Non-disclosure is a policy violation under the synthetic content disclosure requirement. This is separate from the inauthentic content policy — you can fail both independently.

What requires disclosure:
- AI-generated voiceover that sounds realistic/human
- AI-generated images depicting real people or events
- AI-generated video clips that could be mistaken for real footage
- AI-altered audio (voice cloning of real people)

What does NOT require disclosure:
- AI-used for scripting assistance
- AI thumbnail generation (stylized, not realistic)
- AI-used for research
- Motion graphics and animated text

**Solution/Fix:**
- Toggle "Altered or synthetic content" ON in YouTube Studio for every video using AI visuals or AI voice
- Note: The disclosure label does not negatively affect distribution or monetization — YouTube has confirmed disclosed AI content receives normal recommendations. There is zero downside to disclosing.
- When in doubt → always disclose
- Add to upload SOP: before clicking Publish → check AI disclosure toggle

**Tools/Instruction:**
- Pre-upload checklist item: "AI disclosure toggled ON in YouTube Studio" — make this a required step
- YouTube Studio path: Upload → Details → More Options → "Altered or synthetic content" toggle
- Rule: Every Grimm Archives video uses AI visuals and AI voice → disclosure is ALWAYS required → non-negotiable

---

### ⚠️ THREAT-07: Over-Uploading / Frequency Signal

**WARNING LEVEL:** 🟡 MEDIUM — Spam pattern flag

**Detected Issue:**
Prioritize quality over upload frequency. If you are publishing more than one video per day, evaluate whether each upload reflects genuine effort. High upload frequency combined with similar content structure = automated spam pattern. YouTube flags channels, not just videos, when the upload-to-quality ratio is off.

Signs you're at risk:
- Uploading more than 7 long-form videos per week
- Uploading Shorts at a pace of 5+ per day with identical format
- Upload schedule is perfectly robotic (same time, same day, no variation)

**Solution/Fix:**
- Long-form: max 2–3 per week (you're targeting 1/week — this is safe)
- Shorts: max 3–4 per week per channel — do not auto-blast all 6 Shorts from AI generator in one day
- Spread Shorts across 2–3 days after long-form drops
- Vary upload time ± a few hours from your schedule

**Tools/Instruction:**
- YouTube Studio: schedule Shorts across Mon/Wed/Fri after long-form drops Sunday or Monday
- n8n workflow: stagger auto-generated Shorts — 1 per day max from AI-Shorts-Generator output
- Rule: AI-Shorts-Generator produces 3 Shorts → schedule over 3 days, not same day

---

### ⚠️ THREAT-08: Reused Visual Assets

**WARNING LEVEL:** 🟡 MEDIUM — Reused content flag

**Detected Issue:**
Using the same B-roll clips, Pexels videos, Hunyuan outputs, or background music across multiple videos. YouTube's systems can identify duplicate asset usage across a channel's library.

Signs you're at risk:
- Same Pexels video clip appears in multiple videos
- Same Hunyuan-generated clip reused
- Same background music track in every video
- Same title card / intro animation in every video

**Solution/Fix:**
- Never reuse a Hunyuan or Whisk asset across two videos — generate fresh every time
- For Pexels B-roll: use different search terms per video — never pull from the same search results
- Background music: maintain a library of 8–10 tracks, rotate — never same track back-to-back
- Generate unique intro animation/title card for each video (or vary the color grade/timing)

**Tools/Instruction:**
- short-video-maker: already generates fresh Pexels B-roll per scene — stays compliant automatically
- Naming convention: save every asset as `[VideoTitle]_[asset-type]_[number]` — prevents accidental reuse
- Music rule: Grimm Archives uses dark/cinematic score — rotate between at least 5 different tracks

---

### ⚠️ THREAT-09: Simulating Real News or Events

**WARNING LEVEL:** 🔴 CRITICAL — Channel termination risk

**Detected Issue:**
Content generated to simulate real news or events is heavily cracked down on. A viral true-crime YouTube series garnered millions of views before being exposed as completely AI-generated. This includes: AI-generated news anchor presenters, fake breaking news formatting, AI video of real people saying things they didn't say.

Signs you're at risk (edge cases for Grimm Archives):
- Showing AI-generated realistic footage of real historical figures doing things
- Making AI video that looks like real archival documentary footage
- Narrating unverified theories as confirmed facts
- Using realistic AI face generation of living people

**Solution/Fix:**
- Never generate realistic AI video of real named people — use symbolic/atmospheric visuals only
- Historical figures: use archival portraits + cinematic interpretation, never AI-generated realistic video of them
- Always include accuracy disclosure for historical theories: "Based on available evidence, historians believe..."
- Clearly separate verified fact from interpretation in every script
- Grimm Archives topics are historical/financial — stick to documentary style, not news simulation

**Tools/Instruction:**
- Script rule: every unverified theory must include qualifier: "evidence suggests," "historians believe," "one theory holds"
- Whisk/Hunyuan guidance: generate atmospheric/symbolic visuals (gold bars, vaults, maps, landscapes) — not realistic human faces for named real people
- Pre-upload check: "Does any visual in this video falsely depict a real person doing something they didn't do?" → if yes → replace visual

---

### ⚠️ THREAT-10: Strike Response Protocol

**WARNING LEVEL:** 🔴 CRITICAL — Channel survival

**Detected Issue:**
A strike or demonetization warning has been issued.

**What YouTube says to do in first 72 hours:**
Step 1 — Stop uploading immediately. Give the system a chance to reassess. Adding more risky content during a review will only confirm the algorithm's suspicions. Step 2 — Gather evidence. Audit your content. Identify if the issue was narration, format, or upload speed. Do not delete the video — it makes appeals harder. Mark where you added human value. Provide project files or script drafts if possible.

**Full response protocol:**
1. STOP all uploads immediately — no new content for 7 days minimum
2. Do NOT delete flagged video(s) — this removes appeal evidence
3. Open YouTube Studio → Channel → Monetization → read exact violation cited
4. Audit last 10 videos against this compliance shield — identify the pattern
5. Document your creative process: save scripts, research notes, NotebookLM sources, asset generation logs
6. Submit appeal through YouTube Studio with evidence of human creative process
7. After appeal: change the specific flagged element before resuming uploads
8. Resume with 1 video/week for 30 days before returning to normal schedule

**Tools/Instruction:**
- Keep a "creative process log" for every video: research sources used, script draft versions, edit decisions made — this is your appeal evidence
- Never appeal without documentation — appeals without evidence are auto-rejected
- Claude instruction for appeal: *"Help me write a YouTube monetization appeal. My channel does [X]. Here is evidence of my creative process: [paste log]. The specific flag was [Y]. Here is how my content differs from inauthentic content: [Z]."*

---

## COMPLIANCE SCORE — PRE-UPLOAD GATE

Run this score check before every upload. A video must score 7/10 or higher to publish.

```
COMPLIANCE SCORECARD — Video: _______________

ORIGINALITY (3 points max)
[ ] Script has a unique angle not found in any single source (+1)
[ ] Video includes original interpretation, theory, or "Creator Take" (+1)
[ ] Research used 3+ distinct sources synthesized together (+1)
Score: ___/3

PRODUCTION AUTHENTICITY (4 points max)
[ ] Voiceover has tonal variation — not flat delivery (+1)
[ ] Visuals include motion video clips, not just static images (+1)
[ ] This video's structure is different from the last 3 videos (+1)
[ ] No recycled visual assets from previous videos (+1)
Score: ___/4

COMPLIANCE (3 points max)
[ ] AI disclosure toggled ON in YouTube Studio (+1)
[ ] Script has been human-reviewed and rewritten (not raw AI output) (+1)
[ ] No simulation of real news events or realistic AI depiction of named real people (+1)
Score: ___/3

TOTAL: ___/10
PASS (7+): ✅ Clear to upload
FAIL (6 or below): ❌ Fix flagged items before uploading
```

---

## GRIMM ARCHIVES SPECIFIC SAFEGUARDS

These are the channel-specific compliance commitments:

**Content originality:** Every episode must have a "Grimm Archives Take" — an original theory, financial analysis, or modern parallel that exists nowhere else. This is the human editorial fingerprint.

**Visual production standard:** Minimum 4 Hunyuan video clips per long-form video. Static images must have motion applied in CapCut. No two videos share the same visual palette.

**Voice authenticity:** Voiceover recorded with SSML-style direction cues in script. ElevenLabs stability below 0.45 for dramatic variation. Rotate voices if using multiple.

**Format variation:** Every 4th video breaks the standard documentary structure. Could be: two-part story, mystery countdown, financial breakdown deep-dive.

**Disclosure:** Every Grimm Archives video uses AI visuals and AI voice → disclosure toggle is ALWAYS ON. No exceptions.

**Research sourcing:** Every script brief includes minimum 3 sources. Crawl4AI pulls from Wikipedia + news + academic. Claude synthesizes, not summarizes.

---

## WHERE THIS FITS IN THE PIPELINE

This is **Stage 0** — runs BEFORE scripting, AND again as a final gate at **Stage 9** before upload.

```
Stage 0 → Compliance Brief Check         [Before scripting — confirm angle is original]
Stage 1 → Research (3+ sources)          [Crawl4AI + NotebookLM]
Stage 2 → Script + Creator Take          [With SSML cues + unique angle mandatory]
Stage 3 → Title Alignment Check          [Script matches metadata]
Stage 4 → AB Test 3 Variants             [Curiosity/Fear/Result]
Stage 5 → Visuals (60%+ motion)          [Whisk + Hunyuan minimum mix]
Stage 6 → Voiceover (with direction)     [ElevenLabs with tonal variation settings]
Stage 7 → Auto-Edit + Assembly           [auto-editor + CapCut]
Stage 8 → Thumbnail (3 variants)         [Canva]
Stage 8.5 → COMPLIANCE SCORECARD        [Must score 7/10+ to proceed]
Stage 9 → Upload                         [AI disclosure ON → publish]
```

---

## QUICK REFERENCE — WHAT YOUTUBE WANTS VS WHAT KILLS YOU

| ✅ SAFE | ❌ KILLS MONETIZATION |
|---------|----------------------|
| AI helps write first draft → human rewrites 30%+ | Raw AI output published as-is |
| 3 cinematic Hunyuan clips + 8 Whisk images | 12 static Whisk images with no motion |
| ElevenLabs with dramatic variation + SSML cues | Flat monotone TTS at default settings |
| 1 video/week, Shorts spread across days | 3 videos/day, Shorts batch-published |
| Original theory + verified facts | Wikipedia summary reformatted |
| Disclosure toggle ON every video | No disclosure on AI voice/visuals |
| Different structure every 4th video | Identical template every video |
| Fresh assets generated per video | Same B-roll/music reused |
| Historical atmospheric visuals | Realistic AI faces of named real people |
| "Evidence suggests..." for theories | Stating theories as confirmed fact |

