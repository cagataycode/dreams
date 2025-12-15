"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";

export default function WelcomePage() {
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const logoSrc =
    themeName === "dark" ? "/crescent-light.png" : "/crescent-dark.png";

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Dreamer";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <Image
          src={logoSrc}
          alt="Dreams"
          width={80}
          height={80}
          className="object-contain mx-auto mb-4"
        />
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: theme.text }}
        >
          Welcome, {userName}
        </h1>
        <p
          className="text-lg"
          style={{ color: theme.text, opacity: 0.7 }}
        >
          Your journey into the unconscious begins here
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dreams/new"
          className="p-6 rounded-xl transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
            ✍️ Record a Dream
          </h3>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            Capture your dream while it&apos;s still fresh in your memory
          </p>
        </Link>

        <Link
          href="/interpretations"
          className="p-6 rounded-xl transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
            🧠 Get Interpretations
          </h3>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            Analyze your dreams with different psychoanalytic perspectives
          </p>
        </Link>
      </div>

      {/* How to Record Dreams */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: theme.text }}
        >
          📝 How to Record Your Dreams
        </h2>
        <div className="space-y-4" style={{ color: theme.text, opacity: 0.85 }}>
          <p>
            Recording dreams effectively is the first step to understanding your unconscious mind. 
            Here are some tips:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Write immediately:</strong> Record your dreams as soon as you wake up, 
              before they fade from memory
            </li>
            <li>
              <strong>Include sensory details:</strong> Colors, sounds, textures, and smells 
              can reveal important symbolic meanings
            </li>
            <li>
              <strong>Note the emotions:</strong> How did you feel during the dream? Anxious, 
              joyful, confused? Emotions are key to interpretation
            </li>
            <li>
              <strong>Describe characters:</strong> Who appeared in your dream? Even if they 
              seemed like strangers, they might represent aspects of yourself
            </li>
            <li>
              <strong>Record settings:</strong> Where did the dream take place? Familiar or 
              strange locations carry different symbolic weight
            </li>
            <li>
              <strong>Include recurring elements:</strong> Patterns that repeat across dreams 
              often point to unresolved issues
            </li>
          </ul>
        </div>
      </div>

      {/* Understanding Interpretations */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: theme.text }}
        >
          🔮 Understanding Dream Interpretations
        </h2>
        <div className="space-y-4" style={{ color: theme.text, opacity: 0.85 }}>
          <p>
            Our app offers interpretations from different psychoanalytic schools of thought. 
            Each perspective brings unique insights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <h4 className="font-semibold mb-2">Carl Jung</h4>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Focuses on archetypes, the collective unconscious, and symbols that 
                connect to universal human experiences
              </p>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <h4 className="font-semibold mb-2">Sigmund Freud</h4>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Explores wish fulfillment, repressed desires, and the hidden meanings 
                behind dream imagery
              </p>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <h4 className="font-semibold mb-2">Alfred Adler</h4>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Examines dreams through the lens of personal goals, social feelings, 
                and striving for significance
              </p>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.background }}
            >
              <h4 className="font-semibold mb-2">Fritz Perls</h4>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Uses Gestalt therapy approach, viewing every element of the dream as 
                an aspect of the dreamer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Best Results */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: theme.text }}
        >
          💡 Tips for Best Results
        </h2>
        <div className="space-y-3" style={{ color: theme.text, opacity: 0.85 }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🌅</span>
            <div>
              <strong>Keep a dream journal by your bed</strong>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Physical or digital - whatever helps you capture dreams quickly
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <strong>Be consistent</strong>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Regular dream recording improves dream recall over time
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎭</span>
            <div>
              <strong>Try multiple analysts</strong>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Different perspectives can reveal different aspects of the same dream
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📊</span>
            <div>
              <strong>Track patterns</strong>
              <p className="text-sm" style={{ opacity: 0.8 }}>
                Use the analysis section to identify recurring themes in your dreams
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <Link
          href="/dreams/new"
          className="inline-block px-8 py-3 rounded-lg text-lg font-semibold transition-all hover:scale-105"
          style={{
            backgroundColor: theme.text,
            color: theme.background,
          }}
        >
          Start Recording Your Dreams
        </Link>
      </div>
    </div>
  );
}

