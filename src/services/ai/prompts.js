export function moduleDescriptionPrompt({ course, module, audience }) {
    return `
You are an academic content assistant for a Learning Management System.

Generate a concise, professional module description.

Rules:
- No marketing language
- No emojis
- Max 100 words
- Clear learning focus
- Do NOT invent tools or technologies

Course: ${course}
Module Title: ${module}
Audience Level: ${audience}

Return only the description text.
`;
}


export function reWriteAssignemtQuestionPrompt({ question }) {
    return `
    You're a assisting a teacher in improving an assignment question.

    Task: 
    Rewrite the question ONLY to improve clarity, grammar, and structure.

    Strict rules:
    - Do NOT change the meaning
    - Do NOT add new requiremnets
    - Do NOT remove any requirements
    - Do NOT add examples
    - Do NOT change marks or constraints
    - Preserve the original intent exactly

    Original assignment question"
    ${question}

    Return ONLY the rewritten question text
    `
}

export function enhanceLessonDescriptionPrompt({ description }) {
    return `
    Improve the clarity and structure of the following lesson description.

    Rules:

    - Do NOT change meaning
    - Do NOT add new concepts
    - Do NOT increase length
    - Fix grammar and flow only

    Original Description:
    ${description}

    Return ONLY improved text.
`
}