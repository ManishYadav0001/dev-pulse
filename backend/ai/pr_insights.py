#!/usr/bin/env python3
import sys
import json
from typing import Dict, List, Any

def generate_pr_insights(pr_data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generate AI-style insights for PR efficiency based on PR metrics.
    
    Args:
        pr_data: Dictionary containing PR metrics and bottlenecks
        
    Returns:
        Dictionary with insights and suggestions
    """
    avg_merge_time = pr_data.get('avgMergeTime', 0)
    avg_review_time = pr_data.get('avgReviewTime', 0)
    total_prs = pr_data.get('totalPRs', 0)
    open_prs = pr_data.get('openPRs', 0)
    merged_prs = pr_data.get('mergedPRs', 0)
    bottlenecks = pr_data.get('bottlenecks', [])
    
    insights = []
    suggestions = []
    
    # Generate insights based on metrics
    if avg_merge_time > 72:  # > 3 days
        insights.append(f"PRs are taking {avg_merge_time:.1f} hours to merge - indicates severe review bottleneck")
        suggestions.append("Implement PR triage system to prioritize critical changes")
        suggestions.append("Consider automated testing to speed up review process")
    elif avg_merge_time > 48:  # > 2 days
        insights.append(f"PRs are taking {avg_merge_time:.1f} hours to merge - indicates review bottleneck")
        suggestions.append("Increase reviewer availability and set SLA for PR reviews")
    elif avg_merge_time > 24:  # > 1 day
        insights.append(f"PR merge time of {avg_merge_time:.1f} hours could be improved")
        suggestions.append("Set clear review guidelines and expectations")
    else:
        insights.append(f"PR merge time of {avg_merge_time:.1f} hours is within acceptable range")
    
    # Review time analysis
    if avg_review_time > avg_merge_time * 1.5:
        insights.append(f"Review phase ({avg_review_time:.1f}h) is significantly longer than merge phase ({avg_merge_time:.1f}h)")
        suggestions.append("Streamline review process and reduce unnecessary delays")
        suggestions.append("Provide better review tools and automation")
    
    # PR volume analysis
    if open_prs > 10:
        insights.append(f"High backlog of {open_prs} pending PRs - team may be overwhelmed")
        suggestions.append("Implement regular review cycles and dedicated review time")
        suggestions.append("Consider adding more reviewers to the team")
    elif open_prs > 5:
        insights.append(f"{open_prs} pending PRs - moderate review backlog detected")
        suggestions.append("Schedule regular review meetings to clear backlog")
    
    # PR success rate
    if total_prs > 0:
        merge_rate = (merged_prs / total_prs) * 100
        if merge_rate < 70:
            insights.append(f"Low PR merge rate of {merge_rate:.1f}% - many PRs are abandoned")
            suggestions.append("Improve PR templates and requirements")
            suggestions.append("Provide better feedback on rejected PRs")
        elif merge_rate > 90:
            insights.append(f"High PR merge rate of {merge_rate:.1f}% - excellent collaboration")
        else:
            insights.append(f"PR merge rate of {merge_rate:.1f}% is within normal range")
    
    # Add bottleneck-specific insights
    for bottleneck in bottlenecks:
        insights.append(bottleneck.get('message', ''))
        suggestions.append(bottleneck.get('suggestion', ''))
    
    # Remove duplicates
    insights = list(dict.fromkeys(insights))
    suggestions = list(dict.fromkeys(suggestions))
    
    return {
        "prInsights": insights[:5],  # Limit to top 5 insights
        "prSuggestions": suggestions[:5]  # Limit to top 5 suggestions
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python pr_insights.py '<pr_data_json>'"}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        result = generate_pr_insights(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
