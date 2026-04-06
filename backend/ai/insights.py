#!/usr/bin/env python3
import sys
import json
from typing import Dict, List, Any

def generate_insights(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generate intelligent insights and suggestions from GitHub analytics data.
    
    Args:
        data: Dictionary containing commits, pullRequests, issuesResolved, productivityScore
        
    Returns:
        Dictionary with insights and suggestions arrays
    """
    insights = []
    suggestions = []
    
    # Extract stats with safe defaults
    commits = data.get('commits', 0)
    pull_requests = data.get('pullRequests', 0)
    issues_resolved = data.get('issuesResolved', 0)
    productivity_score = data.get('productivityScore', 0)
    
    # Generate insights based on commit activity
    if commits == 0:
        insights.append("No recent activity detected")
    elif commits < 5:
        insights.append("Low commit activity - consider increasing development frequency")
    elif commits > 20:
        insights.append("High development activity - excellent momentum!")
    else:
        insights.append("Moderate commit activity - steady progress")
    
    # Generate insights based on pull requests
    if pull_requests == 0:
        insights.append("No pull requests opened recently")
    elif pull_requests < commits / 2:
        insights.append("Pull request ratio is low - consider opening more PRs")
    else:
        insights.append("Good pull request engagement")
    
    # Generate insights based on issue resolution
    if issues_resolved == 0:
        insights.append("No issues resolved - consider contributing to issue fixing")
    elif issues_resolved > 10:
        insights.append("Excellent issue resolution rate")
    else:
        insights.append("Active issue resolution")
    
    # Generate insights based on productivity score
    if productivity_score > 80:
        insights.append("Excellent productivity score")
    elif productivity_score < 40:
        insights.append("Productivity needs improvement")
    else:
        insights.append("Good productivity level")
    
    # Generate suggestions
    if commits < 5:
        suggestions.append("Set daily commit goals to increase development activity")
        suggestions.append("Focus on smaller, frequent commits")
    
    if pull_requests < commits / 2:
        suggestions.append("Open more pull requests to improve code collaboration")
        suggestions.append("Review and merge pending pull requests")
    
    if issues_resolved == 0:
        suggestions.append("Start by fixing small issues to build momentum")
        suggestions.append("Participate in issue triage and resolution")
    
    if productivity_score < 40:
        suggestions.append("Take regular breaks to maintain coding efficiency")
        suggestions.append("Focus on high-impact tasks first")
    
    # Bonus productivity explanation
    if productivity_score > 0:
        if productivity_score > 80:
            suggestions.append("Maintain current excellent work-life balance")
        elif productivity_score < 40:
            suggestions.append("Consider time management techniques to boost productivity")
        else:
            suggestions.append("Continue consistent development patterns")
    
    # Ensure we always have some content
    if not insights:
        insights.append("Development data analysis complete")
    
    if not suggestions:
        suggestions.append("Keep up the good work!")
    
    return {
        "insights": insights,
        "suggestions": suggestions
    }

def main():
    """Main function to read JSON from stdin and output insights."""
    try:
        # Read input from stdin
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            # Handle empty input
            result = {
                "insights": ["No data available for analysis"],
                "suggestions": ["Ensure GitHub integration is properly configured"]
            }
            print(json.dumps(result))
            return
        
        # Parse JSON input
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError as e:
            # Handle invalid JSON
            result = {
                "insights": ["Invalid data format received"],
                "suggestions": ["Check data transmission from backend"]
            }
            print(json.dumps(result))
            return
        
        # Generate insights
        result = generate_insights(data)
        
        # Output valid JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Handle any other errors
        result = {
            "insights": ["Analysis service temporarily unavailable"],
            "suggestions": ["Please try again later"]
        }
        print(json.dumps(result))
        sys.stderr.write(f"Error: {str(e)}\n")

if __name__ == "__main__":
    main()
