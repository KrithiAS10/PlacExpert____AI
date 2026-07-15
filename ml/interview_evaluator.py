"""
interview_evaluator.py — Step 5: Mock Interview Evaluator
=========================================================
Uses Sentence Transformer (all-MiniLM-L6-v2) + Cosine Similarity
to evaluate mock interview answers against ideal reference answers.

Returns:
  - Similarity Score (0–1)
  - Interview Score (0–10)
  - Strengths (concepts correctly addressed)
  - Weaknesses (poorly explained concepts)
  - Missing Concepts (not mentioned at all)
  - Suggestions (study resources for missing areas)

Usage (CLI):
  python interview_evaluator.py '{"domain":"DSA","question":"...","answer":"..."}'
"""

import os
import sys
import json
import numpy as np

# Lazy load to avoid slow startup when not needed
_model = None


def _get_model():
    """Lazy-load the Sentence Transformer model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


# ---------------------------------------------------------------------------
# REFERENCE ANSWERS & CONCEPT DATABASE
# ---------------------------------------------------------------------------
# Each domain has questions, ideal answers, and key sub-concepts to check

INTERVIEW_BANK = {
    "DSA": [
        {
            "question": "Explain the difference between Array and Linked List.",
            "ideal_answer": "Arrays store elements in contiguous memory locations with O(1) random access but O(n) insertion/deletion. Linked Lists store elements as nodes with pointers, allowing O(1) insertion/deletion at known positions but O(n) access. Arrays have fixed size (static) or need reallocation (dynamic), while Linked Lists grow dynamically. Arrays have better cache performance due to spatial locality.",
            "key_concepts": ["contiguous memory", "random access", "O(1) access", "O(n) insertion", "pointers", "nodes", "dynamic size", "cache performance", "spatial locality"],
        },
        {
            "question": "What is Dynamic Programming? Give an example.",
            "ideal_answer": "Dynamic Programming is an optimization technique that solves complex problems by breaking them into overlapping subproblems and storing their solutions to avoid redundant computation. It uses either top-down memoization or bottom-up tabulation. A classic example is the Fibonacci sequence where naive recursion is O(2^n) but DP reduces it to O(n). Other examples include Knapsack problem, Longest Common Subsequence, and Coin Change problem.",
            "key_concepts": ["overlapping subproblems", "optimal substructure", "memoization", "tabulation", "top-down", "bottom-up", "Fibonacci", "time complexity reduction"],
        },
        {
            "question": "Explain BFS and DFS traversal in graphs.",
            "ideal_answer": "BFS (Breadth-First Search) explores all neighbors at the current depth before moving deeper, using a queue. It finds the shortest path in unweighted graphs. DFS (Depth-First Search) explores as deep as possible along each branch before backtracking, using a stack or recursion. BFS has O(V+E) time complexity. DFS is useful for topological sorting, cycle detection, and connected components.",
            "key_concepts": ["queue", "stack", "shortest path", "neighbors", "backtracking", "O(V+E)", "topological sort", "cycle detection"],
        },
    ],
    "DBMS": [
        {
            "question": "What is Normalization? Explain up to 3NF.",
            "ideal_answer": "Normalization is a process of organizing data to minimize redundancy and dependency. 1NF requires atomic values and no repeating groups. 2NF requires 1NF plus no partial dependencies on composite keys. 3NF requires 2NF plus no transitive dependencies — every non-prime attribute must depend directly on the primary key. Normalization reduces data anomalies (insertion, update, deletion) but may impact query performance.",
            "key_concepts": ["redundancy", "atomic values", "1NF", "2NF", "3NF", "partial dependency", "transitive dependency", "primary key", "anomalies"],
        },
        {
            "question": "Explain different types of SQL JOINs.",
            "ideal_answer": "INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULL for non-matches). RIGHT JOIN is the reverse. FULL OUTER JOIN returns all rows from both tables. CROSS JOIN produces a Cartesian product. SELF JOIN joins a table with itself. JOINs are essential for querying relational data across multiple tables.",
            "key_concepts": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "SELF JOIN", "Cartesian product", "NULL", "matching rows"],
        },
    ],
    "OS": [
        {
            "question": "Explain deadlock and its conditions.",
            "ideal_answer": "Deadlock occurs when processes are blocked forever, each waiting for a resource held by another. Four necessary conditions (Coffman conditions): Mutual Exclusion — only one process can use a resource. Hold and Wait — a process holds resources while waiting for others. No Preemption — resources cannot be forcibly taken. Circular Wait — a circular chain of processes exists. Prevention strategies include breaking any one condition.",
            "key_concepts": ["mutual exclusion", "hold and wait", "no preemption", "circular wait", "Coffman conditions", "prevention", "avoidance", "detection"],
        },
    ],
    "CN": [
        {
            "question": "Explain the OSI model layers.",
            "ideal_answer": "The OSI model has 7 layers: Physical (bit transmission), Data Link (framing, MAC addressing), Network (routing, IP addressing), Transport (TCP/UDP, segmentation), Session (session management), Presentation (encryption, compression), Application (HTTP, FTP, DNS). Each layer provides services to the layer above and uses services from below. This modular approach enables interoperability.",
            "key_concepts": ["7 layers", "Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application", "encapsulation", "TCP/IP"],
        },
    ],
    "Web Development": [
        {
            "question": "What is the difference between REST and GraphQL?",
            "ideal_answer": "REST uses multiple endpoints with fixed data structures and HTTP methods (GET, POST, PUT, DELETE). GraphQL uses a single endpoint where clients specify exactly what data they need, avoiding over-fetching and under-fetching. REST is simpler and cacheable. GraphQL offers flexible queries but adds complexity. REST follows resource-based URLs while GraphQL uses a type system and schema.",
            "key_concepts": ["endpoints", "over-fetching", "under-fetching", "HTTP methods", "single endpoint", "schema", "type system", "caching", "flexible queries"],
        },
    ],
}

SUGGESTIONS_MAP = {
    "DSA": "Practice on LeetCode/HackerRank. Watch Abdul Bari's algorithm videos on YouTube.",
    "DBMS": "Practice SQL on SQLZoo or LeetCode SQL. Study normalization from GFG articles.",
    "OS": "Study OS concepts from Galvin textbook. Practice scheduling algorithms on paper.",
    "CN": "Review OSI/TCP layers from Kurose & Ross. Practice subnetting calculations.",
    "Web Development": "Build a REST API project. Study system design basics on educative.io.",
}


def evaluate_answer(domain: str, question: str, user_answer: str, question_idx: int = None) -> dict:
    """
    Evaluate a mock interview answer using semantic similarity.

    Args:
        domain: Interview domain (DSA, DBMS, OS, CN, Web Development)
        question: The interview question asked
        user_answer: The student's answer text
        question_idx: Optional index into INTERVIEW_BANK for the domain

    Returns:
        Evaluation dictionary with scores, strengths, weaknesses, etc.
    """
    model = _get_model()

    # Find matching question in the bank
    bank = INTERVIEW_BANK.get(domain, [])
    matched = None

    if question_idx is not None and question_idx < len(bank):
        matched = bank[question_idx]
    else:
        # Try to find by question text similarity
        if bank:
            q_embeddings = model.encode([question] + [q["question"] for q in bank])
            from sklearn.metrics.pairwise import cosine_similarity
            sims = cosine_similarity([q_embeddings[0]], q_embeddings[1:])[0]
            best_idx = int(np.argmax(sims))
            if sims[best_idx] > 0.5:
                matched = bank[best_idx]

    if not matched:
        # Fallback: generic evaluation
        return _generic_evaluation(domain, user_answer)

    # Compute semantic similarity between user answer and ideal answer
    embeddings = model.encode([user_answer, matched["ideal_answer"]])
    from sklearn.metrics.pairwise import cosine_similarity
    similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])

    # Map similarity to interview score (0-10)
    interview_score = round(min(10.0, similarity * 12.5), 1)

    # Check key concept coverage
    key_concepts = matched["key_concepts"]
    user_lower = user_answer.lower()

    mentioned = []
    missing = []

    for concept in key_concepts:
        if concept.lower() in user_lower:
            mentioned.append(concept)
        else:
            missing.append(concept)

    # Determine strengths and weaknesses
    coverage_ratio = len(mentioned) / max(len(key_concepts), 1)

    strengths = []
    weaknesses = []

    if coverage_ratio >= 0.7:
        strengths.append("Excellent concept coverage")
    elif coverage_ratio >= 0.4:
        strengths.append("Good partial concept coverage")

    if similarity > 0.7:
        strengths.append("Strong semantic understanding of the topic")
    elif similarity > 0.5:
        strengths.append("Decent conceptual understanding")

    if len(user_answer.split()) > 50:
        strengths.append("Detailed and thorough explanation")
    elif len(user_answer.split()) < 15:
        weaknesses.append("Answer is too brief — elaborate more")

    if missing:
        weaknesses.append(f"Missing key concepts: {', '.join(missing[:5])}")

    if coverage_ratio < 0.3:
        weaknesses.append("Most critical concepts were not addressed")

    suggestions = []
    if missing:
        suggestions.append(f"Study these concepts: {', '.join(missing[:5])}")
    suggestions.append(SUGGESTIONS_MAP.get(domain, "Keep practicing!"))

    return {
        "similarity_score": round(similarity, 4),
        "interview_score": interview_score,
        "concept_coverage": round(coverage_ratio * 100, 1),
        "strengths": strengths if strengths else ["Shows basic awareness of the topic"],
        "weaknesses": weaknesses if weaknesses else ["No major weaknesses detected"],
        "missing_concepts": missing,
        "mentioned_concepts": mentioned,
        "suggestions": suggestions,
        "domain": domain,
    }


def _generic_evaluation(domain: str, user_answer: str) -> dict:
    """Fallback evaluation when no matching question is found in the bank."""
    word_count = len(user_answer.split())

    if word_count > 80:
        score = 7.0
        strengths = ["Detailed response provided"]
    elif word_count > 30:
        score = 5.0
        strengths = ["Reasonable explanation length"]
    else:
        score = 3.0
        strengths = ["Attempted the question"]

    return {
        "similarity_score": 0.0,
        "interview_score": score,
        "concept_coverage": 0.0,
        "strengths": strengths,
        "weaknesses": ["Could not match to reference — manual review recommended"],
        "missing_concepts": [],
        "mentioned_concepts": [],
        "suggestions": [SUGGESTIONS_MAP.get(domain, "Keep practicing!")],
        "domain": domain,
    }


def get_questions(domain: str) -> list:
    """Return available interview questions for a given domain."""
    bank = INTERVIEW_BANK.get(domain, [])
    return [{"index": i, "question": q["question"]} for i, q in enumerate(bank)]


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw = sys.argv[1]
        if raw.startswith("'") and raw.endswith("'"):
            raw = raw[1:-1]
        data = json.loads(raw)

        if "answer" in data:
            result = evaluate_answer(
                domain=data.get("domain", "DSA"),
                question=data.get("question", ""),
                user_answer=data["answer"],
                question_idx=data.get("question_idx"),
            )
        else:
            # Return questions for the domain
            result = {"questions": get_questions(data.get("domain", "DSA"))}

        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Pass JSON input with domain, question, and answer."}))
