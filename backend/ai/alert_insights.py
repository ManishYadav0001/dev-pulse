#!/usr/bin/env python3
import sys
import json
from typing import Dict, List, Any

def generate_alert_insights(alerts_data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generate AI-style insights for repository alerts.
    
    Args:
        alerts_data: Dictionary containing alerts from repositories
        
    Returns:
        Dictionary with alerts summary and recommendations
    """
    alerts = alerts_data.get('alerts', [])
    
    if not alerts:
        return {
            "alertsSummary": [],
            "alertRecommendations": []
        }
    
    # Count alert types across all repos
    inactive_count = 0
    pr_delay_count = 0
    build_failure_count = 0
    critical_count = 0
    warning_count = 0
    
    repos_with_inactive = []
    repos_with_build_failures = []
    total_pr_delays = 0
    
    for repo_alert in alerts:
        repo_name = repo_alert.get('repoName', '')
        repo_alerts = repo_alert.get('alerts', [])
        
        for alert in repo_alerts:
            alert_type = alert.get('type', '')
            severity = alert.get('severity', 'warning')
            
            if severity == 'critical':
                critical_count += 1
            else:
                warning_count += 1
            
            if alert_type == 'inactive':
                inactive_count += 1
                if repo_name not in repos_with_inactive:
                    repos_with_inactive.append(repo_name)
            elif alert_type == 'pr_delay':
                pr_delay_count += 1
                total_pr_delays += 1
            elif alert_type == 'build_failure':
                build_failure_count += 1
                if repo_name not in repos_with_build_failures:
                    repos_with_build_failures.append(repo_name)
    
    # Generate summary insights
    summary = []
    recommendations = []
    
    # Inactivity insights
    if inactive_count >= 3:
        summary.append(f"Multiple repositories ({inactive_count}) show inactivity — possible drop in productivity")
        recommendations.append("Encourage regular commits and maintain consistent development pace")
    elif inactive_count > 0:
        summary.append(f"{inactive_count} repository(s) inactive for over 3 weeks")
        recommendations.append("Review inactive projects and consider archiving or reviving them")
    
    # Build failure insights
    if build_failure_count > 0:
        summary.append(f"Frequent CI failures detected ({build_failure_count} repos) — pipeline instability")
        recommendations.append("Fix failing builds immediately to avoid deployment delays")
        recommendations.append("Review CI/CD configuration and test suite stability")
    
    # PR delay insights
    if pr_delay_count >= 5:
        summary.append(f"High number of delayed PRs ({pr_delay_count}) — review process bottleneck")
        recommendations.append("Implement PR review SLAs to prevent delays")
        recommendations.append("Assign dedicated reviewers or increase review capacity")
    elif pr_delay_count > 0:
        summary.append(f"{pr_delay_count} PR(s) pending for more than 3 days")
        recommendations.append("Prioritize long-pending PRs to maintain development velocity")
    
    # Critical alerts
    if critical_count > 0:
        summary.append(f"{critical_count} critical alert(s) require immediate attention")
        recommendations.append("Address critical alerts first: build failures and security issues")
    
    # General recommendations if no specific issues
    if not summary:
        summary.append("Repository health looks good — maintain current practices")
        recommendations.append("Continue regular commits and timely PR reviews")
    
    # Add preventive recommendations
    recommendations.append("Set up automated alerts for early issue detection")
    recommendations.append("Review repository health dashboard weekly")
    
    return {
        "alertsSummary": summary[:3],  # Limit to top 3
        "alertRecommendations": list(dict.fromkeys(recommendations))[:5]  # Limit to top 5, remove duplicates
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python alert_insights.py '<alerts_data_json>'"}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        result = generate_alert_insights(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
