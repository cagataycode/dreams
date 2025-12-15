# Dreams

A comprehensive dream journaling and analysis application powered by AI. Record your dreams, explore interpretations from multiple psychoanalytic perspectives, and discover patterns across your dream series.

## 🌙 Features

### Dream Management

- **Record Dreams** - Capture dreams with rich metadata:
  - Title and content
  - Dream date
  - Feelings (multi-select: happy, anxious, peaceful, etc.)
  - Mood (1-10 scale)
  - Lucidity indicator
  - Recurring dream marker
- **View & Edit** - Browse your dream history and update entries
- **Delete** - Remove dreams with confirmation

### AI-Powered Interpretations

- **Multiple Psychoanalysts** - Get interpretations from 7 different perspectives:

  - **Carl Jung** - Archetypal analysis, individuation, collective unconscious
  - **Sigmund Freud** - Wish fulfillment, repressed desires, latent content
  - **Alfred Adler** - Individual psychology, life goals, social interest
  - **Melanie Klein** - Object relations, paranoid-schizoid & depressive positions
  - **Jacques Lacan** - Symbolic order, desire, linguistic structure
  - **James Hillman** - Archetypal psychology, soul-making, image primacy
  - **Calvin Hall** - Cognitive conception theory, quantifiable elements

- **Structured Outputs** - All interpretations return structured JSON with:
  - Summary
  - Symbols with meanings and significance
  - Themes with importance levels
  - Emotional landscape (primary and underlying)
  - Core interpretation (main message, unconscious material, psychological function)
  - Key insight
  - Reflection prompt
  - Personal context integration (when provided)

### Analysis Modes

- **Single Dream** - Interpret one dream with a chosen analyst
- **Batch Analysis** - Select multiple dreams, assign different analysts to each:
  - Individual interpretations for each dream
  - Collective pattern analysis across all selected dreams
- **Pattern Analysis** - View all previous collective analyses:
  - Recurring patterns (symbols, themes, emotions, settings, characters)
  - Psychological progression over time
  - Unified synthesis and meta-narratives
  - Key insights and recommendations

### Personal Profile

- **Encrypted "You" Section** - Store sensitive personal information:
  - Early life experiences
  - Significant relationships
  - Recurring themes
  - Personal symbols
  - Sensitive experiences
- **Client-Side Encryption** - Data encrypted in browser using AES-256-GCM before storage
- **Optional Integration** - Choose to include personal context in interpretations for more personalized insights

### User Experience

- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Welcome Page** - Onboarding and usage guidance
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI** - Clean, intuitive interface with collapsible sections

## 🏗️ Project Structure

```
dreams/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js app router pages
│   │   ├── components/ # React components
│   │   └── lib/      # Services, contexts, utilities
│   └── public/       # Static assets
├── backend/           # NestJS backend API
│   └── src/
│       ├── auth/     # Authentication module
│       ├── dreams/    # Dream CRUD operations
│       ├── interpretations/ # AI interpretation logic
│       └── profiles/  # Encrypted user profiles
└── README.md         # This file
```
