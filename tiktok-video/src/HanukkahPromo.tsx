import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────
const DEEP_BLUE = "#07152b";
const LIGHT_BLUE = "#122d53";
const GOLD = "#dfb15b";
const GOLD_LIGHT = "#f7d688";
const GREEN = "#22c55e";

// ─────────────────────────────────────────────
// Text dictionary
// ─────────────────────────────────────────────
const TEXT = {
  he: {
    dir: "rtl" as const,
    title: "חידון חנוכה",
    subtitle: "של יהדות הודו",
    didYouKnow: "🕎 מכירים את המנהגים?",
    facts: [
      { emoji: "🫙", text: "יודעים באיזה שמן מקומי הדליקו יהודי הודו את החנוכייה במקום שמן זית?" },
      { emoji: "😮", text: "יודעים למה קהילה יהודית בהודו לא חגגה חנוכה במקור - ולא כי לא רצתה?" },
      { emoji: "✨", text: "יודעים מה תלו יהודי כלכותה על הקיר ליד החנוכייה?" },
    ],
    questionPrefix: "שאלת חימום",
    question: "איזה חג הינדי נחגג גם הוא כ\"חג האורות\" ומתקיים לעיתים קרובות באותה עונה כמו חנוכה?",
    options: ["הולי 🎨", "דיוואלי - חג האורות ✓", "נאוורטרי 💃", "פונגל 🌾"],
    correctIndex: 1,
    menorahLabel: "חנוכייה",
    familyHeadline: "מתאים לכל המשפחה!",
    familyDesc: "8 שאלות מרתקות על המסורות הייחודיות\nשל יהדות הודו בחג החנוכה",
    pills: ["🎯 מאתגר", "📚 מלמד", "🎉 כיפי"],
    scoreLabel: "הציון שלי:",
    scoreMsg: "מומחים למסורת יהדות הודו!",
    shareHeadline: "שתפו עם החברים!",
    ctaBtn: "שחקו עכשיו!",
    ctaHoliday: "חג חנוכה שמח! 🕎",
  },
  en: {
    dir: "ltr" as const,
    title: "Hanukkah Quiz",
    subtitle: "Indian Jewish Heritage",
    didYouKnow: "🕎 Know Your Hanukkah?",
    facts: [
      { emoji: "🫙", text: "Know which local oil Indian Jews used to light the Menorah instead of olive oil?" },
      { emoji: "😮", text: "Know why a Jewish community in India didn't originally celebrate Hanukkah — and it wasn't because they didn't want to?" },
      { emoji: "✨", text: "Know what the Jews of Kolkata hung on the wall next to their Menorah?" },
    ],
    questionPrefix: "Warm-up Question",
    question: "Which Hindu festival is also celebrated as a \"Festival of Lights\" and often falls in the same season as Hanukkah?",
    options: ["Holi 🎨", "Diwali - Festival of Lights ✓", "Navaratri 💃", "Pongal 🌾"],
    correctIndex: 1,
    menorahLabel: "Menorah",
    familyHeadline: "Perfect for the whole family!",
    familyDesc: "8 fascinating questions about the unique\ntraditions of Indian Jewry on Hanukkah",
    pills: ["🎯 Challenging", "📚 Educational", "🎉 Fun"],
    scoreLabel: "My Score:",
    scoreMsg: "Expert on Indian Jewish tradition!",
    shareHeadline: "Share with friends!",
    ctaBtn: "Play Now!",
    ctaHoliday: "Happy Hanukkah! 🕎",
  },
};

type Lang = keyof typeof TEXT;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function useFadeIn(startFrame: number, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useSlideUp(startFrame: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  return {
    y: interpolate(progress, [0, 1], [60, 0]),
    opacity: interpolate(progress, [0, 1], [0, 1]),
  };
}

function useScale(startFrame: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config: { damping: 12 } });
}

// ─────────────────────────────────────────────
// Background
// ─────────────────────────────────────────────
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 30%, ${LIGHT_BLUE} 0%, ${DEEP_BLUE} 65%)`,
    }}
  >
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: i % 3 === 0 ? 6 : 4,
          height: i % 3 === 0 ? 6 : 4,
          borderRadius: "50%",
          background: GOLD,
          opacity: 0.08 + (i % 5) * 0.02,
          top: `${(i * 37) % 95}%`,
          left: `${(i * 61) % 95}%`,
        }}
      />
    ))}
  </AbsoluteFill>
);

// ─────────────────────────────────────────────
// Menorah
// ─────────────────────────────────────────────
const Menorah: React.FC<{ litCount: number; size?: number }> = ({ litCount, size = 1 }) => {
  const frame = useCurrentFrame();
  const candleGap = 24 * size;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: candleGap, position: "relative", paddingBottom: 20 * size }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const isShamash = i === 4;
        const isLit = isShamash || [0, 1, 2, 3, 5, 6, 7, 8].slice(0, litCount).includes(i);
        const height = isShamash ? 100 * size : 64 * size;
        const flicker = isLit ? Math.sin(frame * 0.3 + i * 1.5) * 2 : 0;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontSize: isShamash ? 28 * size : 22 * size,
                opacity: isLit ? 1 : 0,
                transform: `translateY(${flicker}px) scale(${1 + Math.sin(frame * 0.4 + i) * 0.05})`,
                filter: isLit ? `drop-shadow(0 0 ${12 * size}px ${GOLD_LIGHT})` : "none",
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              🔥
            </div>
            <div
              style={{
                width: 18 * size,
                height,
                background: `linear-gradient(to bottom, ${GOLD_LIGHT}, #9a752e)`,
                borderRadius: "3px 3px 0 0",
                boxShadow: isLit ? `0 0 ${16 * size}px ${GOLD}66` : "none",
              }}
            />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 20 * size, left: 0, right: 0, height: 10 * size, background: `linear-gradient(to right, #9a752e, ${GOLD_LIGHT}, #9a752e)`, borderRadius: 999 }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 50 * size, height: 20 * size, background: `linear-gradient(to bottom, ${GOLD}, #9a752e)`, borderRadius: "0 0 8px 8px" }} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Sparkles
// ─────────────────────────────────────────────
const Sparkles: React.FC<{ count?: number }> = ({ count = 15 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 100 + (i % 3) * 60;
        const speed = 0.8 + (i % 4) * 0.3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(angle + frame * speed * 0.01) * radius,
              top: 300 + Math.sin(angle + frame * speed * 0.015) * (radius * 0.6),
              fontSize: 20 + (i % 3) * 8,
              opacity: 0.3 + Math.sin(frame * 0.1 + i * 0.7) * 0.3,
              transform: `scale(${0.5 + Math.sin(frame * 0.08 + i) * 0.3})`,
            }}
          >
            ✨
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 1 – Opening
// ─────────────────────────────────────────────
const SceneOpening: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = TEXT[lang];
  const menorahScale = spring({ frame, fps, config: { damping: 14 } });
  const title1 = useSlideUp(30);
  const title2 = useSlideUp(55);
  const sub = useFadeIn(80, 25);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Background />
      <Sparkles count={12} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <div style={{ transform: `scale(${menorahScale})` }}>
          <Menorah litCount={8} size={1.6} />
        </div>
        <div style={{ transform: `translateY(${title1.y}px)`, opacity: title1.opacity, textAlign: "center" }}>
          <div style={{ fontSize: 88, fontWeight: 900, color: GOLD_LIGHT, textShadow: `0 0 40px ${GOLD}99`, lineHeight: 1, direction: t.dir }}>
            {t.title}
          </div>
        </div>
        <div style={{ transform: `translateY(${title2.y}px)`, opacity: title2.opacity, textAlign: "center" }}>
          <div style={{ fontSize: 42, color: "white", opacity: 0.9, direction: t.dir, lineHeight: 1.4 }}>
            {t.subtitle}
          </div>
        </div>
        <div style={{ opacity: sub, background: `${GOLD}22`, border: `2px solid ${GOLD}66`, borderRadius: 999, padding: "10px 36px" }}>
          <span style={{ color: GOLD_LIGHT, fontSize: 32, fontWeight: 700 }}>IJHC</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 2 – Did You Know
// ─────────────────────────────────────────────
const SceneDidYouKnow: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = TEXT[lang];
  const badge = useSlideUp(0);

  const slides = [useSlideUp(20), useSlideUp(50), useSlideUp(80)];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <Background />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${badge.y}px)`, opacity: badge.opacity }}>
        <div style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: DEEP_BLUE, borderRadius: 999, padding: "14px 48px", fontSize: 36, fontWeight: 900 }}>
          {t.didYouKnow}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, marginTop: 80 }}>
        {t.facts.map(({ emoji, text }, i) => {
          const slide = slides[i];
          return (
            <div
              key={i}
              style={{
                transform: `translateY(${slide.y}px)`,
                opacity: slide.opacity,
                background: "rgba(255,255,255,0.07)",
                border: `2px solid ${GOLD}44`,
                borderRadius: 24,
                padding: "28px 36px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                direction: t.dir,
              }}
            >
              <span style={{ fontSize: 52, flexShrink: 0 }}>{emoji}</span>
              <span style={{ fontSize: 34, color: "white", lineHeight: 1.4, flex: 1 }}>{text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 3 – Quiz Preview
// ─────────────────────────────────────────────
const SceneQuizPreview: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const t = TEXT[lang];

  const headerSlide = useSlideUp(0);
  const questionSlide = useSlideUp(20);
  const optSlides = [useSlideUp(45), useSlideUp(65), useSlideUp(85), useSlideUp(105)];

  const revealProgress = interpolate(frame - 130, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ padding: "0 48px" }}>
      <Background />
      <div
        style={{
          position: "absolute", top: 90, left: 48, right: 48,
          transform: `translateY(${headerSlide.y}px)`, opacity: headerSlide.opacity,
          display: "flex", justifyContent: "space-between", alignItems: "center", direction: t.dir,
        }}
      >
        <span style={{ color: GOLD_LIGHT, fontSize: 34, fontWeight: 700 }}>{t.questionPrefix}</span>
        <div style={{ transform: "scale(0.7)", transformOrigin: lang === "he" ? "right center" : "left center" }}>
          <Menorah litCount={1} size={0.7} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 230, left: 48, right: 48, transform: `translateY(${questionSlide.y}px)`, opacity: questionSlide.opacity, direction: t.dir }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: "white", lineHeight: 1.4 }}>{t.question}</div>
      </div>

      <div style={{ position: "absolute", top: 530, left: 48, right: 48, display: "flex", flexDirection: "column", gap: 22 }}>
        {t.options.map((opt, i) => {
          const slide = optSlides[i];
          const isCorrect = i === t.correctIndex;
          const revealedCorrect = isCorrect && revealProgress > 0;
          return (
            <div
              key={i}
              style={{
                transform: `translateY(${slide.y}px)`,
                opacity: slide.opacity,
                background: revealedCorrect ? `rgba(34,197,94,${0.2 * revealProgress})` : "rgba(255,255,255,0.06)",
                border: `2px solid ${revealedCorrect ? `rgba(34,197,94,${revealProgress})` : `${GOLD}44`}`,
                borderRadius: 18, padding: "22px 32px", direction: t.dir,
                display: "flex", alignItems: "center", gap: 20,
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${revealedCorrect ? GREEN : `${GOLD}88`}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {revealedCorrect && <div style={{ width: 16, height: 16, borderRadius: "50%", background: GREEN, opacity: revealProgress }} />}
              </div>
              <span style={{ fontSize: 32, color: revealedCorrect ? GREEN : "white", flex: 1 }}>{opt}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 4 – Family
// ─────────────────────────────────────────────
const SceneFamily: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXT[lang];
  const emojiScale = spring({ frame: frame - 10, fps, config: { damping: 10 } });
  const t1 = useSlideUp(15);
  const t2 = useSlideUp(40);
  const t3 = useSlideUp(65);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <Background />
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20, transform: `scale(${emojiScale})` }}>
        {["👨‍👩‍👧‍👦", "🕎", "👴🏽", "👵🏽", "🧒🏽"].map((e, i) => (
          <span key={i} style={{ fontSize: 90 }}>{e}</span>
        ))}
      </div>
      <div style={{ marginTop: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <div style={{ transform: `translateY(${t1.y}px)`, opacity: t1.opacity, textAlign: "center", direction: t.dir }}>
          <div style={{ fontSize: 68, fontWeight: 900, color: GOLD_LIGHT, lineHeight: 1.2, textShadow: `0 0 30px ${GOLD}88` }}>
            {t.familyHeadline}
          </div>
        </div>
        <div style={{ transform: `translateY(${t2.y}px)`, opacity: t2.opacity, textAlign: "center", direction: t.dir }}>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
            {t.familyDesc.split("\n").map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
        <div style={{ transform: `translateY(${t3.y}px)`, opacity: t3.opacity, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {t.pills.map((pill, i) => (
            <div key={i} style={{ background: `${GOLD}22`, border: `2px solid ${GOLD}66`, borderRadius: 999, padding: "12px 32px", color: GOLD_LIGHT, fontSize: 32, fontWeight: 700 }}>
              {pill}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 5 – Share
// ─────────────────────────────────────────────
const SceneShare: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXT[lang];
  const scoreScale = useScale(10);
  const t1 = useSlideUp(0);
  const t2 = useSlideUp(25);
  const shareButtons = useSlideUp(55);

  const SHARE_BTNS = [
    { bg: "#25D366", label: "WhatsApp", emoji: "💬" },
    { bg: "#1877F2", label: "Facebook", emoji: "👥" },
    { bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: "Instagram", emoji: "📸" },
    { bg: "#0A66C2", label: "LinkedIn", emoji: "💼" },
  ];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <Background />
      <Sparkles count={10} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <div style={{ transform: `translateY(${t1.y}px)`, opacity: t1.opacity, background: "rgba(255,255,255,0.06)", border: `3px solid ${GOLD}66`, borderRadius: 36, padding: "48px 72px", textAlign: "center", direction: t.dir }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🕎✨</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 36, marginBottom: 8 }}>{t.scoreLabel}</div>
          <div style={{ fontSize: 120, fontWeight: 900, color: GOLD_LIGHT, transform: `scale(${scoreScale})`, lineHeight: 1, textShadow: `0 0 40px ${GOLD}` }}>7</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 36 }}>/ 8</div>
          <div style={{ marginTop: 16, color: "white", fontSize: 30, background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "12px 24px" }}>{t.scoreMsg}</div>
        </div>

        <div style={{ transform: `translateY(${t2.y}px)`, opacity: t2.opacity, textAlign: "center", direction: t.dir }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: GOLD_LIGHT }}>{t.shareHeadline}</div>
        </div>

        <div style={{ transform: `translateY(${shareButtons.y}px)`, opacity: shareButtons.opacity, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%" }}>
          {SHARE_BTNS.map(({ bg, label, emoji }) => (
            <div key={label} style={{ background: bg, color: "white", borderRadius: 20, padding: "22px 20px", fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {emoji} {label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// SCENE 6 – CTA
// ─────────────────────────────────────────────
const SceneCTA: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const t = TEXT[lang];
  const menorahScale = useScale(0);
  const t1 = useSlideUp(15);
  const t2 = useSlideUp(35);
  const url = useSlideUp(55);
  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <Background />
      <Sparkles count={20} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${menorahScale})` }}>
          <Menorah litCount={8} size={1.3} />
        </div>
        <div style={{ transform: `translateY(${t1.y}px)`, opacity: t1.opacity, textAlign: "center", direction: t.dir }}>
          <div style={{ fontSize: 76, fontWeight: 900, color: GOLD_LIGHT, lineHeight: 1.2, textShadow: `0 0 50px ${GOLD}` }}>
            {t.ctaBtn}
          </div>
        </div>
        {/* URL – prominent, appears before holiday message */}
        <div style={{ transform: `translateY(${url.y}px)`, opacity: url.opacity, textAlign: "center" }}>
          <div style={{
            color: GOLD_LIGHT,
            fontSize: 46,
            fontFamily: "monospace",
            fontWeight: 800,
            background: "rgba(223,177,91,0.12)",
            borderRadius: 20,
            padding: "22px 52px",
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 32px ${GOLD}55, inset 0 0 20px ${GOLD}11`,
            letterSpacing: 1,
          }}>
            hanuka.indianjews.org
          </div>
        </div>

        {/* Holiday message below URL */}
        <div style={{ transform: `translateY(${t2.y}px) scale(${pulse})`, opacity: t2.opacity, background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: DEEP_BLUE, borderRadius: 999, padding: "24px 72px", fontSize: 44, fontWeight: 900, boxShadow: `0 8px 40px ${GOLD}66`, textAlign: "center" }}>
          {t.ctaHoliday}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Main Composition (parameterized by lang)
// ─────────────────────────────────────────────
export const HanukkahPromo: React.FC<{ lang: Lang }> = ({ lang }) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={130}><SceneOpening lang={lang} /></Sequence>
      <Sequence from={110} durationInFrames={170}><SceneDidYouKnow lang={lang} /></Sequence>
      <Sequence from={270} durationInFrames={220}><SceneQuizPreview lang={lang} /></Sequence>
      <Sequence from={475} durationInFrames={165}><SceneFamily lang={lang} /></Sequence>
      <Sequence from={625} durationInFrames={165}><SceneShare lang={lang} /></Sequence>
      <Sequence from={775} durationInFrames={125}><SceneCTA lang={lang} /></Sequence>
    </AbsoluteFill>
  );
};
