export const statsData = [
  { id: 1, title: "Total Commits", value: "2,847", change: "+12.5%", trend: "up", metric: "commits" },
  { id: 2, title: "Pull Requests", value: 184, change: "+8.2%", trend: "up", metric: "prs" },
  { id: 3, title: "Issues Resolved", value: 423, change: "+23.1%", trend: "up", metric: "issues" },
  { id: 4, title: "Productivity Score", value: "94.2%", change: "-2.4%", trend: "down", metric: "productivity" },
];

export const chartData = [
  { day: "Mon", commits: 46, prsOpened: 12, prsReviewed: 10, prsMerged: 2 },
  { day: "Tue", commits: 52, prsOpened: 18, prsReviewed: 15, prsMerged: 3 },
  { day: "Wed", commits: 39, prsOpened: 15, prsReviewed: 12, prsMerged: 2 },
  { day: "Thu", commits: 66, prsOpened: 22, prsReviewed: 20, prsMerged: 1 },
  { day: "Fri", commits: 48, prsOpened: 16, prsReviewed: 13, prsMerged: 2 },
  { day: "Sat", commits: 25, prsOpened: 7, prsReviewed: 6, prsMerged: 1 },
  { day: "Sun", commits: 19, prsOpened: 5, prsReviewed: 4, prsMerged: 0 },
];

export const activityData = [
  { id: 1, action: "Fixed bug in dashboard", time: "2h ago", type: "commit" },
  { id: 2, action: "Opened new PR", time: "5h ago", type: "pr" },
  { id: 3, action: "Merged PR #42", time: "1d ago", type: "merge" },
];

export const insightsData = [
  {
    id: 1,
    title: "AI Insight",
    message: "Your commits spike on Thu–Fri. Consider scheduling code reviews earlier in the week.",
  },
  {
    id: 2,
    title: "Suggestion",
    message: "PR throughput is strong. Try batching smaller PRs to reduce review time.",
  },
  {
    id: 3,
    title: "Heads up",
    message: "Active hours dipped slightly. If it continues, check for blockers or context switching.",
  },
];
