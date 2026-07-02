import type { CreatePathInput } from './dto';

export function buildOnlineContentPrompt(
  input: CreatePathInput & { minutesPerDay: number; targetDays: number },
): string {
  return `
You are a skilled learning content curator and educational researcher.

Generate a **JSON object** of the best, valid, and diverse learning resources that match this learning plan.

Focus on:
- Video courses from **Udemy** and **Coursera**
- High-quality **articles or written tutorials** from reputable sources

**Do not include any YouTube links. YouTube content will be handled separately.**

## Context
- Subject: ${input.selectedRoleOrSkill}
- Current level: ${input.currentLevel}
- Path type: ${input.pathType}
- Total timeline: ${input.targetDays} days
- Average daily study time: ${input.minutesPerDay} minutes

## Input Reference
Use the module names from the learning plan you just created (or assume a standard structure for ${input.selectedRoleOrSkill} if not provided).

## Rules for Resource Selection

1. **Validity and Accessibility**
   - Every URL **must be publicly accessible and valid** (no placeholders or obviously fake links).
   - Video resources:
     - Only include videos/courses from:
       - \`https://www.udemy.com/\`
       - \`https://www.coursera.org/\`
   - Article resources:
     - Use reputable sources (official documentation, well-known blogs, university pages, trusted tech/education sites).
     - Avoid spammy, low-quality, AI-generated, or content farm domains.
   - URLs must start with \`https://\` and point to **real, existing pages** based on their structure.

2. **No YouTube**
   - **Do not** include any URLs from:
     - \`https://www.youtube.com/\`
     - \`https://youtu.be/\`
   - Do not mention YouTube in the output.

3. **Source Diversity**
   - For each topic, prioritize:
     - At least one high-quality Udemy or Coursera course **if relevant content exists**.
     - Plus **optionally** one or more strong articles for deeper understanding.
   - Prefer a mix of video and article formats across the whole plan where it makes sense.

4. **Quality and Relevance**
   - Choose highly-rated Udemy/Coursera courses and reputable articles.
   - Match the user’s current level (${input.currentLevel}) and ensure practical, applied learning.
   - Limit to **1–3 carefully selected resources per topic**.

5. **Compression Rule**
   - If the timeline (${input.targetDays} days) is short, focus on essential, high-impact topics and concise resources.

## Output Format

Return only a **valid JSON object** matching this exact schema:

[
    {
      "topic": string,
      "contents": [
        {
          "title": string,
          "url": string,
          "source": string,
          "thumbnailUrl": string | null,
          "type": "video" | "article"
        }
      ]
    }
]

### Additional Notes

- Use:
  - \`type: "video"\` for Udemy/Coursera course/video resources.
  - \`type: "article"\` for written guides, blogs, documentation, or text-based tutorials.
- For \`source\`:
  - Use "Udemy" or "Coursera" for those platforms.
  - For articles, use the recognizable site or publisher name (e.g. "MDN", "freeCodeCamp", "Khan Academy", "Towards Data Science").
- If no suitable non-YouTube resource exists for a topic, set \`"videos": []\` for that topic.
- Do **not** include any explanation or commentary outside this JSON.
- Double-check that all URLs are well-formed and map to plausible, real resources.
`;
}

export function buildMarkdownPrompt(
  input: CreatePathInput & { minutesPerDay: number; targetDays: number },
): string {
  return `
You are an expert curriculum designer and learning path architect.

Create a **comprehensive, step-by-step learning plan** for a person learning **${input.selectedRoleOrSkill}**.

## Learner Context
- Current level: ${input.currentLevel}
- Path type: ${input.pathType}
- Total timeline: ${input.targetDays} days
- Average daily study time: ${input.minutesPerDay} minutes

## Guidelines
- Prefer **YouTube-friendly**, **project-first**, and **practically sequenced** learning paths.
- Keep modules short, focused, and outcome-driven.
- Prioritize hands-on projects and small wins.
- Avoid unnecessary theory.
- The tone should be motivating, concise, and mentor-like.

## Output Format (Markdown)
Return **only** a well-structured Markdown document that includes:
- **Title** and **overview paragraph**
- **Modules**: each with name, days to spend, outcomes, mini-project, and prerequisites (if any)
- **Daily Rhythm**: suggested split of time for learn / practice / review
- **Assessment**: how to check readiness for the next level

Use proper Markdown structure:
- Headings (##, ###)
- Bullet points or numbered lists for clarity
- Bold important concepts

Do not include any JSON or links in this response.`;
}

export function buildYouTubeSearchQueryPrompt(
  input: CreatePathInput & { minutesPerDay: number; targetDays: number },
): string {
  return `You are a YouTube learning content researcher.

Given the following user learning plan, generate **5 highly specific YouTube search queries** that would help them find the most relevant and advanced educational videos.

## Learning Plan
- Subject: ${input.selectedRoleOrSkill}
- Current level: ${input.currentLevel}
- Path type: ${input.pathType}
- Total timeline: ${input.targetDays} days
- Average daily study time: ${input.minutesPerDay} minutes

## Rules
- The queries should be **focused on the user’s current level** (e.g., beginner, intermediate, advanced).
- Include **recent-year context** (e.g., “2025”) where helpful to bias toward fresh videos.
- Focus on **tutorials, guides, or deep dives** — not reviews or shorts.
- Avoid vague queries like “learn React”; instead use more intentful ones like “React performance optimization 2025”.
- Do **not** include explanations or text outside JSON.
- **Strictly output a JSON array of strings.**

## Output Format
Return only a **valid JSON object** matching this exact schema:
[
  "query 1",
  "query 2",
  "query 3",
  "query 4",
  "query 5"
]
`;
}
