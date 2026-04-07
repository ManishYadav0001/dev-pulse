const { spawn } = require("child_process");
const path = require("path");

// Cache for AI insights (5-10 minutes TTL)
const insightsCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate AI insights using Python analytics script
 * @param {Object} stats - GitHub statistics
 * @returns {Promise<Object>} - AI insights and suggestions
 */
const generateAIInsights = async (stats) => {
  try {
    // Generate cache key based on stats
    const cacheKey = JSON.stringify(stats);
    const cached = insightsCache.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log("[AI] Using cached insights");
      return cached.data;
    }

    console.log("[AI] Generating new insights with Python");
    
    // Prepare data for Python script
    const inputData = {
      commits: stats.commits || 0,
      pullRequests: stats.pullRequests || 0,
      issuesResolved: stats.issuesResolved || 0,
      productivityScore: stats.productivityScore || 0
    };

    // Spawn Python process
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../ai/insights.py')
    ]);

    let output = '';
    let errorOutput = '';

    // Set up stdout and stderr handlers
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send data to Python via stdin
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    // Wait for process completion
    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('[AI] Python script failed:', errorOutput);
          resolve({
            insights: ["Unable to generate insights"],
            suggestions: []
          });
          return;
        }

        try {
          // Parse Python output
          const result = JSON.parse(output);
          
          // Cache the result
          insightsCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          // Clean up old cache entries
          cleanCache();
          
          resolve(result);
        } catch (parseError) {
          console.error('[AI] Failed to parse Python output:', parseError);
          resolve({
            insights: ["Unable to generate insights"],
            suggestions: []
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('[AI] Python process error:', error);
        resolve({
          insights: ["AI insights service unavailable"],
          suggestions: []
        });
      });
    });

  } catch (error) {
    console.error('[AI] Unexpected error:', error);
    return {
      insights: ["Unable to generate insights"],
      suggestions: []
    };
  }
};

/**
 * Clean up expired cache entries
 */
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of insightsCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL_MS) {
      insightsCache.delete(key);
    }
  }
};

/**
 * Clear all cached insights
 */
const clearInsightsCache = () => {
  insightsCache.clear();
};

/**
 * Generate PR insights using Python analytics script
 * @param {Object} prMetrics - PR metrics data
 * @returns {Promise<Object>} - PR insights and suggestions
 */
const generatePRInsights = async (prMetrics) => {
  try {
    // Generate cache key based on metrics
    const cacheKey = JSON.stringify(prMetrics);
    const cached = insightsCache.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log("[AI] Using cached PR insights");
      return cached.data;
    }

    console.log("[AI] Generating new PR insights with Python");
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../ai/pr_insights.py')
    ]);

    let output = '';
    let errorOutput = '';

    // Set up stdout and stderr handlers
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send data to Python via stdin
    pythonProcess.stdin.write(JSON.stringify(prMetrics));
    pythonProcess.stdin.end();

    // Wait for process completion
    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('[AI] PR Python script failed:', errorOutput);
          resolve({
            prInsights: [],
            prSuggestions: []
          });
          return;
        }

        try {
          // Parse Python output
          const result = JSON.parse(output);
          
          // Cache the result
          insightsCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          // Clean up old cache entries
          cleanCache();
          
          resolve(result);
        } catch (parseError) {
          console.error('[AI] Failed to parse PR Python output:', parseError);
          resolve({
            prInsights: [],
            prSuggestions: []
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('[AI] PR Python process error:', error);
        resolve({
          prInsights: [],
          prSuggestions: []
        });
      });
    });

  } catch (error) {
    console.error('[AI] PR insights unexpected error:', error);
    return {
      prInsights: [],
      prSuggestions: []
    };
  }
};

module.exports = {
  generateAIInsights,
  generatePRInsights,
  clearInsightsCache
};
