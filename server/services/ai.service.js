import Anthropic from "@anthropic-ai/sdk";
import { ApiError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

const getClient = () => {
  if (!env.anthropicApiKey) {
    throw new ApiError(503, "AI service is not configured");
  }
  return new Anthropic({ apiKey: env.anthropicApiKey });
};

const callClaude = async (systemPrompt, userPrompt, maxTokens = 1024) => {
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    return response.content[0].text;
  } catch (error) {
    logger.error(`Claude API error: ${error.message}`);

    if (error.status === 429) {
      throw new ApiError(
        429,
        "AI service rate limit reached. Please try again shortly.",
      );
    }

    if (error.status === 401) {
      throw new ApiError(503, "AI service authentication failed.");
    }

    throw new ApiError(503, "AI service is temporarily unavailable.");
  }
};

const explainCode = async ({ code, language, filename }) => {
  if (!code || code.trim().length === 0) {
    throw new ApiError(400, "Code content is required");
  }

  if (code.length > 50000) {
    throw new ApiError(400, "Code is too large. Maximum 50,000 characters.");
  }

  const systemPrompt = `You are an expert software engineer and technical educator. 
Your task is to explain code clearly and concisely to developers.
Always structure your response with:
1. A brief overview of what the code does
2. Key components and their roles
3. Important patterns or techniques used
4. Any potential issues or improvements
Be direct and technical. Assume the reader is a developer.`;

  const userPrompt = `Explain the following ${language || "code"}${filename ? ` from file "${filename}"` : ""}:

\`\`\`${language || ""}
${code}
\`\`\``;

  const explanation = await callClaude(systemPrompt, userPrompt, 1500);

  return { explanation, language, filename };
};

const reviewCode = async ({ code, language, filename, context }) => {
  if (!code || code.trim().length === 0) {
    throw new ApiError(400, "Code content is required");
  }

  if (code.length > 50000) {
    throw new ApiError(400, "Code is too large. Maximum 50,000 characters.");
  }

  const systemPrompt = `You are a senior software engineer conducting a thorough code review.
Analyze the code for:
- Bugs and logical errors
- Security vulnerabilities
- Performance issues
- Code quality and maintainability
- Best practices violations
- Missing error handling

Structure your response as JSON with this exact shape:
{
  "summary": "Brief overall assessment",
  "score": <number 1-10>,
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "type": "bug|security|performance|quality|style",
      "line": <line number or null>,
      "description": "Issue description",
      "suggestion": "How to fix it"
    }
  ],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;

  const userPrompt = `Review the following ${language || "code"}${filename ? ` from file "${filename}"` : ""}${context ? `\n\nContext: ${context}` : ""}:

\`\`\`${language || ""}
${code}
\`\`\``;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 2000);

  let review;
  try {
    review = JSON.parse(rawResponse);
  } catch {
    logger.warn(
      "Claude returned non-JSON for code review, wrapping as summary",
    );
    review = {
      summary: rawResponse,
      score: null,
      issues: [],
      strengths: [],
      recommendations: [],
    };
  }

  return { review, language, filename };
};

const summarizeIssue = async ({ issue, comments }) => {
  if (!issue) {
    throw new ApiError(400, "Issue data is required");
  }

  const systemPrompt = `You are a technical project manager assistant.
Summarize GitHub issues concisely for developers.
Structure your response as JSON:
{
  "summary": "2-3 sentence summary of the issue",
  "problemStatement": "Clear description of the problem",
  "proposedSolution": "What solution has been discussed or proposed (if any)",
  "currentStatus": "Current state of the issue",
  "keyPoints": ["key point 1", "key point 2"],
  "nextSteps": ["next step 1", "next step 2"]
}
Return ONLY valid JSON.`;

  const commentsText =
    comments && comments.length > 0
      ? comments
          .slice(0, 20)
          .map((c) => `@${c.author?.username || "user"}: ${c.body}`)
          .join("\n\n")
      : "No comments yet.";

  const userPrompt = `Summarize this issue:

Title: ${issue.title}
Status: ${issue.status}
Author: @${issue.author?.username || "unknown"}
Body: ${issue.body || "No description provided."}

Comments:
${commentsText}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 1000);

  let summary;
  try {
    summary = JSON.parse(rawResponse);
  } catch {
    summary = {
      summary: rawResponse,
      problemStatement: "",
      proposedSolution: "",
      currentStatus: issue.status,
      keyPoints: [],
      nextSteps: [],
    };
  }

  return { summary, issueNumber: issue.number, issueTitle: issue.title };
};

const summarizePullRequest = async ({ pullRequest, comments, diff }) => {
  if (!pullRequest) {
    throw new ApiError(400, "Pull request data is required");
  }

  const systemPrompt = `You are a technical code review assistant.
Summarize pull requests concisely for developers.
Structure your response as JSON:
{
  "summary": "2-3 sentence summary of what this PR does",
  "changes": "Description of the code changes",
  "impact": "Potential impact of merging this PR",
  "reviewFocus": ["area to focus review on 1", "area 2"],
  "riskLevel": "low|medium|high",
  "riskReasons": ["reason 1", "reason 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}
Return ONLY valid JSON.`;

  const diffSummary =
    diff && diff.length > 0
      ? diff
          .slice(0, 10)
          .map((d) => `${d.status}: ${d.path}`)
          .join("\n")
      : "No diff available.";

  const commentsText =
    comments && comments.length > 0
      ? comments
          .slice(0, 10)
          .map((c) => `@${c.author?.username || "user"}: ${c.body}`)
          .join("\n\n")
      : "No comments yet.";

  const userPrompt = `Summarize this pull request:

Title: ${pullRequest.title}
Status: ${pullRequest.status}
Author: @${pullRequest.author?.username || "unknown"}
Source: ${pullRequest.sourceBranch} → Target: ${pullRequest.targetBranch}
Body: ${pullRequest.body || "No description provided."}

Changed files:
${diffSummary}

Comments:
${commentsText}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 1200);

  let summary;
  try {
    summary = JSON.parse(rawResponse);
  } catch {
    summary = {
      summary: rawResponse,
      changes: "",
      impact: "",
      reviewFocus: [],
      riskLevel: "medium",
      riskReasons: [],
      suggestions: [],
    };
  }

  return {
    summary,
    prNumber: pullRequest.number,
    prTitle: pullRequest.title,
  };
};

const generateCommitMessage = async ({ diff, context }) => {
  if (!diff || diff.length === 0) {
    throw new ApiError(
      400,
      "Diff data is required to generate a commit message",
    );
  }

  const systemPrompt = `You are an expert developer who writes clear, conventional commit messages.
Follow the Conventional Commits specification:
- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code refactoring
- test: adding tests
- chore: maintenance tasks

Structure your response as JSON:
{
  "message": "type(scope): concise description",
  "description": "Optional longer description (or null)",
  "type": "feat|fix|docs|style|refactor|test|chore",
  "scope": "affected area (or null)",
  "breakingChange": false,
  "alternatives": ["alternative message 1", "alternative message 2"]
}
Return ONLY valid JSON.`;

  const diffText = diff
    .slice(0, 15)
    .map((d) => `${d.status}: ${d.path}`)
    .join("\n");

  const userPrompt = `Generate a commit message for these changes:

Changed files:
${diffText}

${context ? `Additional context: ${context}` : ""}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 600);

  let result;
  try {
    result = JSON.parse(rawResponse);
  } catch {
    result = {
      message: rawResponse.split("\n")[0].trim(),
      description: null,
      type: "chore",
      scope: null,
      breakingChange: false,
      alternatives: [],
    };
  }

  return result;
};

const analyzeRepositoryHealth = async ({ repository, stats }) => {
  if (!repository) {
    throw new ApiError(400, "Repository data is required");
  }

  const systemPrompt = `You are a software engineering consultant analyzing repository health.
Assess the repository based on provided metrics and give actionable recommendations.
Structure your response as JSON:
{
  "overallScore": <number 1-100>,
  "grade": "A|B|C|D|F",
  "summary": "2-3 sentence overall assessment",
  "metrics": {
    "activity": { "score": <1-100>, "assessment": "description" },
    "community": { "score": <1-100>, "assessment": "description" },
    "maintenance": { "score": <1-100>, "assessment": "description" },
    "documentation": { "score": <1-100>, "assessment": "description" }
  },
  "strengths": ["strength 1", "strength 2"],
  "improvements": [
    { "priority": "high|medium|low", "area": "area name", "suggestion": "what to do" }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Return ONLY valid JSON.`;

  const userPrompt = `Analyze the health of this repository:

Repository: ${repository.fullName}
Description: ${repository.description || "No description"}
Language: ${repository.language || "Not specified"}
Topics: ${repository.topics?.join(", ") || "None"}
Stars: ${repository.starsCount || 0}
Forks: ${repository.forkCount || 0}
Watchers: ${repository.watchersCount || 0}
Open Issues: ${repository.openIssuesCount || 0}
Open PRs: ${repository.openPullRequestsCount || 0}
Has Issues enabled: ${repository.hasIssues}
Has Wiki: ${repository.hasWiki}
Is Archived: ${repository.isArchived}
Created: ${repository.createdAt}
Last pushed: ${repository.lastPushedAt || "Never"}

Additional stats:
${stats ? JSON.stringify(stats, null, 2) : "No additional stats available"}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 1500);

  let analysis;
  try {
    analysis = JSON.parse(rawResponse);
  } catch {
    analysis = {
      overallScore: null,
      grade: null,
      summary: rawResponse,
      metrics: {},
      strengths: [],
      improvements: [],
      recommendations: [],
    };
  }

  return { analysis, repository: repository.fullName };
};

const suggestIssueLabels = async ({ issue }) => {
  if (!issue) {
    throw new ApiError(400, "Issue data is required");
  }

  const systemPrompt = `You are a project management assistant that categorizes GitHub issues.
Suggest appropriate labels based on the issue content.
Structure your response as JSON:
{
  "labels": [
    {
      "name": "label name",
      "color": "#hexcolor",
      "reason": "why this label applies"
    }
  ],
  "confidence": "high|medium|low"
}
Use common labels like: bug, enhancement, documentation, question, help wanted,
good first issue, invalid, duplicate, wontfix, performance, security, breaking change.
Return ONLY valid JSON.`;

  const userPrompt = `Suggest labels for this issue:

Title: ${issue.title}
Body: ${issue.body || "No description provided."}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 600);

  let result;
  try {
    result = JSON.parse(rawResponse);
  } catch {
    result = { labels: [], confidence: "low" };
  }

  return { suggestions: result, issueNumber: issue.number };
};

const generatePRDescription = async ({
  sourceBranch,
  targetBranch,
  commits,
  diff,
}) => {
  if (!commits || commits.length === 0) {
    throw new ApiError(
      400,
      "Commit data is required to generate PR description",
    );
  }

  const systemPrompt = `You are a senior developer who writes clear, informative pull request descriptions.
Generate a comprehensive PR description following best practices.
Structure your response as JSON:
{
  "title": "Suggested PR title",
  "description": "Full markdown PR description with sections",
  "type": "feature|bugfix|refactor|docs|test|chore",
  "checklist": ["checklist item 1", "checklist item 2"],
  "relatedIssues": []
}
The description should include: Summary, Changes Made, Testing Done, Screenshots (if UI), Notes.
Return ONLY valid JSON.`;

  const commitsText = commits
    .slice(0, 20)
    .map((c) => `- ${c.message}`)
    .join("\n");

  const diffText =
    diff && diff.length > 0
      ? diff
          .slice(0, 10)
          .map((d) => `${d.status}: ${d.path}`)
          .join("\n")
      : "No diff available";

  const userPrompt = `Generate a PR description for merging ${sourceBranch} into ${targetBranch}:

Commits:
${commitsText}

Changed files:
${diffText}`;

  const rawResponse = await callClaude(systemPrompt, userPrompt, 1200);

  let result;
  try {
    result = JSON.parse(rawResponse);
  } catch {
    result = {
      title: `Merge ${sourceBranch} into ${targetBranch}`,
      description: rawResponse,
      type: "feature",
      checklist: [],
      relatedIssues: [],
    };
  }

  return result;
};

export {
  explainCode,
  reviewCode,
  summarizeIssue,
  summarizePullRequest,
  generateCommitMessage,
  analyzeRepositoryHealth,
  suggestIssueLabels,
  generatePRDescription,
};
