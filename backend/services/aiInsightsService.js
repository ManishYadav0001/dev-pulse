const axios = require("axios");
const crypto = require("crypto");

const CACHE_TTL_MS = 10 * 60 * 1000;
const insightsCache = new Map();

const getCached = (key) => {
  const cached = insightsCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    insightsCache.delete(key);
    return null;
  }
  return cached.value;
};

const setCached = (key, value) => {
  insightsCache.set(key, { createdAt: Date.now(), value });
};

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 4);
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
};

const extractJsonBlock = (text) => {
  const match = String(text || "").match(/\{[\s\S]*\}/);
  return match ? match[0] : "";
};

const generateAIInsights = async ({ userId, stats, charts, recentActivity, force = false }) => {
  const apiKey = String(
    process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || ""
  ).trim();

  if (!apiKey) {
    return {
      error: true,
      message:
        "AI insights are unavailable: add OPENROUTER_API_KEY in backend/.env (free-tier model supported).",
      insights: [],
      suggestions: [],
    };
  }

  const payload = { stats, charts, recentActivity };
  const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const cacheKey = `ai:${userId}:${hash}`;

  if (!force) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const preferredModel = process.env.OPENROUTER_MODEL || "";
  const modelCandidates = [
    preferredModel,
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-coder:free",
    "google/gemma-3-12b-it:free",
  ].filter(Boolean);
  const prompt = [
    "Analyze this developer GitHub analytics data.",
    "Return ONLY strict JSON with this shape:",
    '{"insights":["..."],"suggestions":["..."]}',
    "Rules:",
    "- professional and concise tone",
    "- max 4 insights, max 4 suggestions",
    "- actionable, metric-based statements",
    "- no markdown, no extra text",
    "",
    `Data: ${JSON.stringify(payload)}`,
  ].join("\n");

  let content = "";
  let lastError = null;
  for (const model of modelCandidates) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          temperature: 0.3,
          messages: [
            { role: "system", content: "You are a concise engineering analytics assistant." },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
      content = response.data?.choices?.[0]?.message?.content || "";
      if (content) break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!content) {
    return {
      error: true,
      message:
        lastError?.response?.data?.error?.message ||
        lastError?.message ||
        "AI provider request failed.",
      insights: [],
      suggestions: [],
    };
  }
  const parsed = safeJsonParse(content) || safeJsonParse(extractJsonBlock(content)) || {};
  const result = {
    insights: cleanArray(parsed.insights),
    suggestions: cleanArray(parsed.suggestions),
  };

  const normalized =
    result.insights.length || result.suggestions.length
      ? result
      : {
          insights: ["No insights available for the selected time window."],
          suggestions: ["Keep shipping consistently and review trend changes next run."],
        };

  setCached(cacheKey, normalized);
  return normalized;
};

module.exports = { generateAIInsights };

