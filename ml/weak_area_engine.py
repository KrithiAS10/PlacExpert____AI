"""
weak_area_engine.py — Step 6: Weak Area Detection
==================================================
Rule-based detection of weak academic/technical areas using
interview scores and topic performance data.

Rule: Average(Topic_Score) < 5 => Weak Area

Usage (CLI):
  python weak_area_engine.py '{"scores":{"DSA":[3,4,6],"DBMS":[2,3]}}'

Returns JSON:
  {
    "weak_areas": [
      {"area": "DBMS", "average_score": 2.5, "severity": "HIGH", "reason": "Average score below 5"},
      ...
    ],
    "strong_areas": [...],
    "overall_performance": "Below Average"
  }
"""

import sys
import json


# ---------------------------------------------------------------------------
# SEVERITY THRESHOLDS
# ---------------------------------------------------------------------------
THRESHOLDS = {
    "CRITICAL": 3.0,   # Average < 3.0 → critical weakness
    "HIGH": 5.0,       # Average < 5.0 → high-priority weak area
    "MEDIUM": 6.5,     # Average < 6.5 → needs improvement
    "LOW": 8.0,        # Average < 8.0 → minor gap
}

# Performance buckets
PERFORMANCE_LEVELS = {
    "Excellent": (8.0, 10.0),
    "Good": (6.5, 8.0),
    "Average": (5.0, 6.5),
    "Below Average": (3.0, 5.0),
    "Poor": (0.0, 3.0),
}


def detect_weak_areas(topic_scores: dict, task_results: dict = None) -> dict:
    """
    Detect weak areas based on topic scores and optional task results.

    Args:
        topic_scores: Dictionary mapping topic name to list of scores.
            Example: {"DSA": [3, 4, 6], "DBMS": [2, 3], "OS": [7, 8]}
        task_results: Optional dictionary mapping topic to task outcomes.
            Example: {"DSA": {"total": 5, "passed": 2, "failed": 3}}

    Returns:
        Dictionary with weak areas, strong areas, and overall assessment.
    """
    weak_areas = []
    strong_areas = []
    all_averages = []

    for topic, scores in topic_scores.items():
        if not scores:
            continue

        avg = sum(scores) / len(scores)
        all_averages.append(avg)

        # Determine severity
        severity = _get_severity(avg)

        # Check task failure rate if available
        failure_info = ""
        if task_results and topic in task_results:
            tr = task_results[topic]
            total_tasks = tr.get("total", 0)
            failed_tasks = tr.get("failed", 0)
            if total_tasks > 0:
                failure_rate = failed_tasks / total_tasks
                if failure_rate > 0.5:
                    severity = "HIGH" if severity == "MEDIUM" else severity
                    failure_info = f" ({failed_tasks}/{total_tasks} tasks failed)"

        entry = {
            "area": topic,
            "average_score": round(avg, 2),
            "num_assessments": len(scores),
            "severity": severity,
            "reason": f"Average score {round(avg, 2)}/10{failure_info}",
        }

        if avg < THRESHOLDS["HIGH"]:
            weak_areas.append(entry)
        elif avg >= THRESHOLDS["LOW"]:
            strong_areas.append(entry)

    # Sort weak areas by severity (lowest score first)
    weak_areas.sort(key=lambda x: x["average_score"])

    # Overall performance
    overall_avg = sum(all_averages) / max(len(all_averages), 1)
    overall_performance = _get_performance_level(overall_avg)

    # Generate improvement suggestions
    suggestions = _generate_suggestions(weak_areas)

    return {
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "overall_average": round(overall_avg, 2),
        "overall_performance": overall_performance,
        "suggestions": suggestions,
        "total_topics_assessed": len(topic_scores),
    }


def _get_severity(score: float) -> str:
    """Map a score to a severity level."""
    if score < THRESHOLDS["CRITICAL"]:
        return "CRITICAL"
    elif score < THRESHOLDS["HIGH"]:
        return "HIGH"
    elif score < THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    elif score < THRESHOLDS["LOW"]:
        return "LOW"
    else:
        return "NONE"


def _get_performance_level(avg: float) -> str:
    """Map an average score to a performance level."""
    for level, (low, high) in PERFORMANCE_LEVELS.items():
        if low <= avg < high:
            return level
    return "Excellent" if avg >= 8.0 else "Poor"


def _generate_suggestions(weak_areas: list) -> list:
    """Generate actionable improvement suggestions for weak areas."""
    TOPIC_RESOURCES = {
        "DSA": "Practice 2-3 LeetCode problems daily. Focus on Arrays, Trees, and DP patterns.",
        "DBMS": "Revise normalization and SQL JOINs. Practice on SQLZoo and LeetCode SQL.",
        "OS": "Review process management and deadlocks. Study from Galvin's textbook.",
        "CN": "Revise OSI model and TCP/IP. Practice subnetting problems.",
        "OOP": "Implement design patterns in your preferred language. Study SOLID principles.",
        "Web Development": "Build a small full-stack project. Study REST API design.",
        "System Design": "Study common system design patterns on educative.io.",
    }

    suggestions = []
    for wa in weak_areas:
        area = wa["area"]
        resource = TOPIC_RESOURCES.get(area, f"Dedicate extra study time to {area}.")
        suggestions.append({
            "area": area,
            "priority": wa["severity"],
            "suggestion": resource,
        })

    return suggestions


def detect_from_interview_history(interview_sessions: list) -> dict:
    """
    Detect weak areas from a list of mock interview session results.

    Args:
        interview_sessions: List of dicts, each with:
            - domain: str
            - interview_score: float (0-10)

    Returns:
        Same format as detect_weak_areas.
    """
    topic_scores = {}

    for session in interview_sessions:
        domain = session.get("domain", "General")
        score = session.get("interview_score", 0)
        if domain not in topic_scores:
            topic_scores[domain] = []
        topic_scores[domain].append(score)

    return detect_weak_areas(topic_scores)


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw = sys.argv[1]
        if raw.startswith("'") and raw.endswith("'"):
            raw = raw[1:-1]
        data = json.loads(raw)

        if "scores" in data:
            result = detect_weak_areas(
                topic_scores=data["scores"],
                task_results=data.get("task_results"),
            )
        elif "interview_sessions" in data:
            result = detect_from_interview_history(data["interview_sessions"])
        else:
            result = {"error": "Provide 'scores' dict or 'interview_sessions' list."}

        print(json.dumps(result))
    else:
        # Demo
        demo = detect_weak_areas(
            topic_scores={
                "DSA": [3, 4, 5],
                "DBMS": [2, 3],
                "OS": [7, 8, 9],
                "CN": [5, 4],
                "OOP": [8, 9],
            }
        )
        print(json.dumps(demo, indent=2))
