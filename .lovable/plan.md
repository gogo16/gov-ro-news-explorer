

## Research Findings

After analyzing top civic engagement platforms (Citizen OS, TechForGov, Civio), news aggregators (Feedly, SmartNews patterns), and policy impact tools (PolicyCost.org, OBBBA calculator), here are the highest-impact improvements ranked by user value:

---

## Recommended Improvements

### 1. Personal Impact Alerts ("How does this affect ME?")
The biggest gap: users see articles but don't know if they're personally relevant. Add a simple onboarding flow where users select their profile (employee, pensioner, business owner, parent, student, etc.) and the AI tags each article with affected groups. Articles get a prominent "This affects you" badge.

- New database table: `user_profiles` with interests/demographics
- AI prompt update: ask Gemini to also return `affected_groups: string[]` during simplification
- Filter: "Show only articles that affect me"

### 2. Email/Push Digest (Weekly Summary)
The newsletter signup component exists but doesn't send anything. Implement a scheduled edge function that:
- Runs weekly (cron)
- Groups articles by user interests
- Sends a styled HTML email via Lovable Cloud
- Includes AI-generated weekly summary ("This week in Romanian law: 3 tax changes, 1 new health regulation")

### 3. "Explain Like I'm 5" Chat
Add a floating chat button where users can ask questions about any article. Uses Lovable AI to answer in plain language with context from the article. Example: "What does this tax change mean for my salary?" This is the #1 feature civic tech platforms highlight for engagement.

### 4. Deadline & Action Tracker
Many government articles have deadlines (tax filing, consultation periods, new rules taking effect). Extract dates from articles using AI and show:
- A calendar view of upcoming deadlines
- Countdown badges on articles ("Starts in 14 days")
- Optional reminder notifications

### 5. Multi-Language Support (Beyond RO/UK)
The architecture already supports country switching. Adding more EU countries (Poland, Bulgaria, Hungary) would dramatically expand the user base. The scraper pattern is reusable.

### 6. Community Annotations & Reactions
Let users react to articles (helpful/confusing/concerning) and submit plain-language explanations. Crowdsourced simplification complements AI. Light moderation via upvotes.

### 7. Share as Image Card
Generate a social-media-friendly image card from any article's simplified summary. One-click share to WhatsApp/Facebook/X. This drives organic growth — critical for a civic tool.

### 8. Accessibility Improvements
- Text-to-speech button on each article (Web Speech API, zero cost)
- Font size controls
- High contrast mode beyond dark/light
- Screen reader optimizations

---

## Priority Recommendation

```text
Impact vs Effort Matrix:

HIGH IMPACT, LOW EFFORT:
  → Text-to-speech (Web Speech API, ~1 hour)
  → Share as image card (html2canvas, ~2 hours)
  → "Explain Like I'm 5" chat (Lovable AI, ~3 hours)

HIGH IMPACT, MEDIUM EFFORT:
  → Personal impact alerts + user profiles (~4 hours)
  → Deadline tracker with calendar view (~4 hours)
  → Weekly email digest (~3 hours)

HIGH IMPACT, HIGH EFFORT:
  → Community annotations (~6 hours)
  → More countries (~8 hours per country)
```

### Suggested Implementation Order
1. **ELI5 Chat** — highest engagement, uses existing AI infra
2. **Share as Image** — drives growth, quick win
3. **Text-to-Speech** — accessibility, nearly free
4. **Personal Impact Alerts** — the real differentiator
5. **Deadline Tracker** — unique value no competitor offers
6. **Weekly Digest** — retention mechanism

---

## Technical Approach (Summary)

- **ELI5 Chat**: New edge function calling Lovable AI with article context. Floating `<ChatBubble>` component on article pages.
- **Share Card**: `html2canvas` to render a styled card from simplified content. Download or share via Web Share API.
- **Text-to-Speech**: `window.speechSynthesis` — no backend needed, works in all modern browsers.
- **Personal Impact**: New `user_profiles` table + updated AI prompt to return `affected_groups`. Profile selector in a sheet/dialog.
- **Deadline Tracker**: AI extracts dates during simplification. New `deadlines` table. Calendar component on homepage.
- **Weekly Digest**: Cron edge function + HTML email template via Lovable Cloud email.

