"""
roadmap_engine.py — Step 4: Adaptive Roadmap Generator
=======================================================
Rule-based engine that generates personalized placement preparation
roadmaps based on readiness level, weak areas, daily study time,
preferred language, and placement timeline.

All resource URLs point to 100% FREE platforms:
  - LeetCode (free tier)         — coding problems
  - GeeksForGeeks                — theory articles
  - freeCodeCamp                 — structured free courses
  - The Odin Project             — full-stack curriculum
  - CS50 (Harvard OpenCourseWare)— computer science fundamentals
  - Khan Academy                 — math / aptitude
  - MIT OpenCourseWare           — advanced CS
  - W3Schools / MDN Web Docs     — web references
  - YouTube (curated playlists)  — video lectures

task_subtype field:
  "PROBLEM"  → LeetCode/GFG practice problem (quiz-gated on completion)
  "COURSE"   → Free course / article to read  (quiz-gated on completion)
  "PROJECT"  → Build something (quiz-gated)
  "MOCK"     → Internal mock interview
"""

import os
import sys
import json

# ---------------------------------------------------------------------------
# RESOURCE URL MAP — 100% FREE platforms only
# ---------------------------------------------------------------------------
RESOURCE_URLS = {
    # DSA — Arrays
    "Arrays — Traversal, Search, Insert":           "https://leetcode.com/tag/array/",
    "Arrays — Two Pointers, Sliding Window":         "https://leetcode.com/tag/two-pointers/",
    "Advanced DP — Matrix Chain, Edit Distance":     "https://leetcode.com/tag/dynamic-programming/",
    # DSA — Strings
    "Strings — Palindrome, Anagram, Reversal":       "https://leetcode.com/tag/string/",
    "Strings — KMP, Rabin-Karp Pattern Matching":    "https://leetcode.com/tag/string-matching/",
    # Sorting
    "Sorting — Bubble, Selection, Insertion Sort":   "https://www.geeksforgeeks.org/sorting-algorithms/",
    # Searching
    "Searching — Linear Search, Binary Search":      "https://leetcode.com/tag/binary-search/",
    # Recursion
    "Recursion — Basics and Simple Problems":        "https://www.geeksforgeeks.org/recursion/",
    "Recursion & Backtracking — N-Queens, Subsets":  "https://leetcode.com/tag/backtracking/",
    # Stacks/Queues
    "Stacks and Queues — Implementation and Applications": "https://leetcode.com/tag/stack/",
    # Linked Lists
    "Linked Lists — Singly, Doubly, Circular":       "https://leetcode.com/tag/linked-list/",
    # Hashing
    "Hashing — HashMaps and Frequency Counting":     "https://leetcode.com/tag/hash-table/",
    # Trees
    "Trees — BST, DFS, BFS Traversal":              "https://leetcode.com/tag/tree/",
    # Graphs
    "Graphs — BFS, DFS, Adjacency List":             "https://leetcode.com/tag/graph/",
    "Graphs — Dijkstra, Bellman-Ford, Topological Sort": "https://leetcode.com/tag/shortest-path/",
    # Greedy
    "Greedy Algorithms — Activity Selection, Huffman": "https://leetcode.com/tag/greedy/",
    # DP
    "Dynamic Programming — Fibonacci, Knapsack, LCS": "https://leetcode.com/tag/dynamic-programming/",
    # Advanced
    "Segment Trees and Fenwick Trees":               "https://www.geeksforgeeks.org/segment-tree-data-structure/",
    "Tries and Suffix Arrays":                       "https://leetcode.com/tag/trie/",
    "Advanced Backtracking — Sudoku Solver, Word Search": "https://leetcode.com/tag/backtracking/",
    "System Design Fundamentals":                    "https://www.geeksforgeeks.org/system-design-tutorial/",
    "Competitive Programming Patterns":              "https://leetcode.com/explore/",

    # DBMS — all free
    "ER Diagrams":                                   "https://www.geeksforgeeks.org/introduction-of-er-model/",
    "Normalization (1NF-BCNF)":                      "https://www.geeksforgeeks.org/normal-forms-in-dbms/",
    "Normalization (1NF–BCNF)":                      "https://www.geeksforgeeks.org/normal-forms-in-dbms/",
    "Basic SQL — SELECT, WHERE, ORDER BY":            "https://www.w3schools.com/sql/",
    "SQL JOINs — INNER, LEFT, RIGHT, CROSS":          "https://www.w3schools.com/sql/sql_join.asp",
    "Subqueries and CTEs":                           "https://leetcode.com/tag/database/",
    "Indexing and Query Optimization":               "https://www.geeksforgeeks.org/indexing-in-databases-set-1/",
    "Transactions and ACID Properties":              "https://www.geeksforgeeks.org/acid-properties-in-dbms/",
    "Concurrency Control":                           "https://www.geeksforgeeks.org/concurrency-control-in-dbms/",
    "Database Sharding and Replication":             "https://www.geeksforgeeks.org/database-sharding-a-system-design-concept/",

    # OS — all free
    "Process vs Thread":                             "https://www.geeksforgeeks.org/difference-between-process-and-thread/",
    "CPU Scheduling — FCFS, SJF, Round Robin":        "https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/",
    "Deadlock — Detection, Prevention, Avoidance":   "https://www.geeksforgeeks.org/introduction-of-deadlock-in-operating-system/",
    "Memory Management — Paging, Segmentation":      "https://www.geeksforgeeks.org/paging-in-operating-system/",
    "Virtual Memory — Page Replacement Algorithms":  "https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/",
    "Disk Scheduling":                               "https://www.geeksforgeeks.org/disk-scheduling-algorithms/",
    "OS Internals — System Calls":                   "https://www.geeksforgeeks.org/introduction-of-system-call/",

    # CN — all free
    "OSI and TCP/IP Model":                          "https://www.geeksforgeeks.org/layers-of-osi-model/",
    "IP Addressing and Subnetting":                  "https://www.geeksforgeeks.org/introduction-classful-ip-addressing/",
    "TCP vs UDP":                                    "https://www.geeksforgeeks.org/differences-between-tcp-and-udp/",
    "DNS, DHCP, HTTP/HTTPS":                         "https://www.geeksforgeeks.org/domain-name-server-dns-in-application-layer/",
    "Network Security — TLS, Firewalls":             "https://www.geeksforgeeks.org/transport-layer-security-tls/",
    "Socket Programming":                            "https://www.geeksforgeeks.org/socket-programming-python/",

    # OOP — all free
    "Classes, Objects, Encapsulation":               "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/",
    "Inheritance and Polymorphism":                  "https://www.geeksforgeeks.org/inheritance-in-c/",
    "Abstraction, Interfaces":                       "https://www.geeksforgeeks.org/abstraction-in-cpp/",
    "SOLID Principles":                              "https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/",
    "Design Patterns — Singleton, Factory, Observer": "https://www.geeksforgeeks.org/design-patterns-set-1-introduction/",
    "UML Diagrams":                                  "https://www.geeksforgeeks.org/unified-modeling-language-uml-introduction/",

    # Language-specific — replaced HackerRank premium with free alternatives
    "Practice Python List Comprehensions":           "https://www.freecodecamp.org/news/list-comprehension-in-python/",
    "Learn Python Collections Module":              "https://www.geeksforgeeks.org/python-collections-module/",
    "Learn Java Collections Framework":             "https://www.geeksforgeeks.org/collections-in-java-2/",
    "Practice Java Streams and Lambdas":            "https://www.geeksforgeeks.org/stream-in-java/",
    "Learn C++ STL — Vectors, Maps, Sets":           "https://www.geeksforgeeks.org/the-c-standard-template-library-stl/",
    "Practice C++ Smart Pointers":                  "https://www.geeksforgeeks.org/smart-pointers-cpp/",
    "Practice ES6+ Features — Promises, Async/Await": "https://javascript.info/promise-basics",
    "Learn Node.js Fundamentals":                   "https://www.freecodecamp.org/news/what-is-node-js/",
    "Practice Pointer Arithmetic":                  "https://www.geeksforgeeks.org/pointer-arithmetics-in-c-with-examples/",
    "Implement Data Structures in C":               "https://www.geeksforgeeks.org/data-structures/",

    # System Design — free resources
    "System Design — URL Shortener":                "https://www.geeksforgeeks.org/system-design-url-shortening-service/",
    "System Design — Chat Application":             "https://www.geeksforgeeks.org/system-design-of-whatsapp-messenger/",
    "System Design — Rate Limiter":                 "https://www.geeksforgeeks.org/system-design-rate-limiter/",
    "Database Design — E-commerce Schema":          "https://www.geeksforgeeks.org/system-design-of-e-commerce-website/",
}

FALLBACK_URLS = {
    "PROBLEM":  "https://leetcode.com/problemset/",
    "TOPIC":    "https://www.geeksforgeeks.org/",
    "COURSE":   "https://www.freecodecamp.org/",
    "MOCK":     "https://www.geeksforgeeks.org/interview-preparation/",
    "REVISION": "https://www.geeksforgeeks.org/",
    "SETUP":    "https://www.geeksforgeeks.org/",
    "PROJECT":  "https://www.freecodecamp.org/news/tag/projects/",
}

def _resolve_url(title: str, task_type: str) -> str:
    """Find the best matching resource URL for a task title."""
    # Exact match first
    for key, url in RESOURCE_URLS.items():
        if key.lower() in title.lower() or title.lower() in key.lower():
            return url
    return FALLBACK_URLS.get(task_type, "https://www.geeksforgeeks.org/")

# ---------------------------------------------------------------------------
# ROADMAP TEMPLATES — Organized by readiness tier
# ---------------------------------------------------------------------------

TOPIC_POOLS = {
    "DSA": {
        "Beginner": [
            "Arrays — Traversal, Search, Insert",
            "Strings — Palindrome, Anagram, Reversal",
            "Sorting — Bubble, Selection, Insertion Sort",
            "Searching — Linear Search, Binary Search",
            "Recursion — Basics and Simple Problems",
            "Stacks and Queues — Implementation and Applications",
            "Linked Lists — Singly, Doubly, Circular",
        ],
        "Intermediate": [
            "Arrays — Two Pointers, Sliding Window",
            "Strings — KMP, Rabin-Karp Pattern Matching",
            "Hashing — HashMaps and Frequency Counting",
            "Trees — BST, DFS, BFS Traversal",
            "Graphs — BFS, DFS, Adjacency List",
            "Recursion & Backtracking — N-Queens, Subsets",
            "Greedy Algorithms — Activity Selection, Huffman",
            "Dynamic Programming — Fibonacci, Knapsack, LCS",
        ],
        "Advanced": [
            "Advanced DP — Matrix Chain, Edit Distance",
            "Graphs — Dijkstra, Bellman-Ford, Topological Sort",
            "Segment Trees and Fenwick Trees",
            "Tries and Suffix Arrays",
            "Advanced Backtracking — Sudoku Solver, Word Search",
            "System Design Fundamentals",
            "Competitive Programming Patterns",
        ],
    },
    "DBMS": {
        "Beginner":     ["ER Diagrams", "Normalization (1NF–BCNF)", "Basic SQL — SELECT, WHERE, ORDER BY"],
        "Intermediate": ["SQL JOINs — INNER, LEFT, RIGHT, CROSS", "Subqueries and CTEs", "Indexing and Query Optimization"],
        "Advanced":     ["Transactions and ACID Properties", "Concurrency Control", "Database Sharding and Replication"],
    },
    "OS": {
        "Beginner":     ["Process vs Thread", "CPU Scheduling — FCFS, SJF, Round Robin"],
        "Intermediate": ["Deadlock — Detection, Prevention, Avoidance", "Memory Management — Paging, Segmentation"],
        "Advanced":     ["Virtual Memory — Page Replacement Algorithms", "Disk Scheduling", "OS Internals — System Calls"],
    },
    "CN": {
        "Beginner":     ["OSI and TCP/IP Model", "IP Addressing and Subnetting"],
        "Intermediate": ["TCP vs UDP", "DNS, DHCP, HTTP/HTTPS"],
        "Advanced":     ["Network Security — TLS, Firewalls", "Socket Programming"],
    },
    "OOP": {
        "Beginner":     ["Classes, Objects, Encapsulation", "Inheritance and Polymorphism"],
        "Intermediate": ["Abstraction, Interfaces", "SOLID Principles"],
        "Advanced":     ["Design Patterns — Singleton, Factory, Observer", "UML Diagrams"],
    },
}

LANGUAGE_TASKS = {
    "Python":     ["Practice Python List Comprehensions", "Learn Python Collections Module"],
    "Java":       ["Learn Java Collections Framework", "Practice Java Streams and Lambdas"],
    "C++":        ["Learn C++ STL — Vectors, Maps, Sets", "Practice C++ Smart Pointers"],
    "JavaScript": ["Practice ES6+ Features — Promises, Async/Await", "Learn Node.js Fundamentals"],
    "C":          ["Practice Pointer Arithmetic", "Implement Data Structures in C"],
}

TIMELINE_MAP = {
    "1 Month":  30,
    "45 Days":  45,
    "2 Months": 60,
    "3 Months": 90,
    "6 Months": 180,
}

STUDY_TIME_TASKS = {
    "<1 hour":   1,
    "1-2 hours": 2,
    "2-3 hours": 3,
    "3-5 hours": 4,
    "5+ hours":  5,
}


def generate_roadmap(params: dict) -> dict:
    readiness        = params.get("readiness", "Beginner")
    daily_time       = params.get("daily_study_time", "2-3 hours")
    language         = params.get("preferred_language", "Python")
    timeline         = params.get("placement_timeline", "45 Days")
    weak_areas       = params.get("weak_areas", [])
    domain           = params.get("domain_interest", "Full Stack")
    strength         = params.get("core_cs_strength", "None")
    platform         = params.get("coding_platform", "LeetCode")

    total_days   = TIMELINE_MAP.get(timeline, 45)
    tasks_per_day = STUDY_TIME_TASKS.get(daily_time, 2)

    phases    = _build_phases(readiness, total_days)
    all_tasks = []
    day_counter = 1

    for phase in phases:
        phase_tasks = _get_phase_tasks(
            phase["focus"],
            readiness,
            language,
            weak_areas,
            strength,
            tasks_per_day,
            platform,
        )
        for task in phase_tasks:
            if day_counter > total_days:
                break
            task["day"]    = day_counter
            task["phase"]  = phase["name"]
            task["status"] = "PENDING"
            # Resolve real resource URL
            task["resource_url"] = _resolve_url(task["title"], task.get("type", "TOPIC"))
            all_tasks.append(task)
            day_counter += 1

    # Remediation tasks for weak areas
    if weak_areas:
        remediation = _get_remediation_tasks(weak_areas, readiness, day_counter, total_days)
        all_tasks.extend(remediation)

    return {
        "title":              f"{readiness} Track — {total_days}-Day Personalized Roadmap",
        "description":        f"Personalized {timeline} plan for {language} targeting {domain}",
        "total_days":         total_days,
        "readiness":          readiness,
        "daily_study_time":   daily_time,
        "preferred_language": language,
        "phases":             phases,
        "tasks":              all_tasks,
        "tasks_per_day":      tasks_per_day,
    }


def _build_phases(readiness: str, total_days: int) -> list:
    if readiness == "Beginner":
        phase_ratios = [
            ("Foundation Setup",  0.15, "foundation"),
            ("Core CS Subjects",  0.25, "core_cs"),
            ("DSA Basics",        0.25, "dsa"),
            ("Project Building",  0.15, "projects"),
            ("Interview Prep",    0.10, "interview"),
            ("Final Sprint",      0.10, "sprint"),
        ]
    elif readiness == "Intermediate":
        phase_ratios = [
            ("Core CS Deep Dive",     0.15, "core_cs"),
            ("DSA Problem Solving",   0.30, "dsa"),
            ("Project & Portfolio",   0.20, "projects"),
            ("Mock Interviews",       0.15, "interview"),
            ("Company-Specific Prep", 0.10, "company"),
            ("Final Sprint",          0.10, "sprint"),
        ]
    else:  # Advanced
        phase_ratios = [
            ("Advanced DSA & Patterns", 0.30, "dsa"),
            ("System Design",           0.20, "system_design"),
            ("Company-Specific Prep",   0.15, "company"),
            ("Mock Interview Marathon", 0.20, "interview"),
            ("Final Polish",            0.15, "sprint"),
        ]

    phases    = []
    day_start = 1
    for i, (name, ratio, focus) in enumerate(phase_ratios):
        days    = max(1, round(total_days * ratio))
        day_end = min(day_start + days - 1, total_days)
        phases.append({
            "name":      name,
            "order":     i + 1,
            "days":      f"{day_start}-{day_end}",
            "day_start": day_start,
            "day_end":   day_end,
            "focus":     focus,
            "status":    "locked" if i > 0 else "active",
            "color":     ["cyan", "blue", "teal", "purple", "orange", "green"][i % 6],
        })
        day_start = day_end + 1
    return phases


def _leetcode_url(difficulty: str = "") -> str:
    if difficulty == "easy":
        return "https://leetcode.com/problemset/?difficulty=EASY"
    if difficulty == "medium":
        return "https://leetcode.com/problemset/?difficulty=MEDIUM"
    if difficulty == "hard":
        return "https://leetcode.com/problemset/?difficulty=HARD"
    return "https://leetcode.com/problemset/"


def _get_phase_tasks(focus, readiness, language, weak_areas, strength, tasks_per_day, platform="LeetCode") -> list:
    tasks = []

    if focus == "foundation":
        # FREE language learning URLs (no account required to read)
        lang_url = {
            "Python":     "https://www.freecodecamp.org/news/the-python-handbook/",
            "Java":       "https://www.freecodecamp.org/news/the-java-handbook/",
            "C++":        "https://www.freecodecamp.org/news/the-cplusplus-handbook/",
            "JavaScript": "https://javascript.info/",
            "C":          "https://www.geeksforgeeks.org/c-programming-language/",
        }.get(language, "https://www.freecodecamp.org/")

        tasks = [
            {"title": f"Set up {language} development environment & IDE",
             "type": "SETUP", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/setting-up-development-environment/"},
            {"title": "Create GitHub profile and push your first repository",
             "type": "SETUP", "task_subtype": "COURSE",
             "resource_url": "https://www.freecodecamp.org/news/git-and-github-for-beginners/"},
            {"title": "Understand placement process — rounds, expectations, timeline",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/placement-preparation-a-students-guide/"},
            {"title": f"Complete freeCodeCamp {language} warm-up challenges (10 problems)",
             "type": "PROBLEM", "task_subtype": "PROBLEM", "resource_url": lang_url},
        ]
        for t in LANGUAGE_TASKS.get(language, []):
            tasks.append({"title": t, "type": "TOPIC", "task_subtype": "COURSE", "resource_url": _resolve_url(t, "TOPIC")})

    elif focus == "core_cs":
        subjects = ["DSA", "DBMS", "OS", "CN", "OOP"]
        for subj in subjects:
            pool = TOPIC_POOLS.get(subj, {}).get(readiness, [])
            for topic in pool[:2]:
                priority = "HIGH" if subj in weak_areas else "NORMAL"
                tasks.append({
                    "title":        f"{subj} — {topic}",
                    "type":         "TOPIC",
                    "task_subtype": "COURSE",
                    "priority":     priority,
                    "resource_url": _resolve_url(topic, "TOPIC"),
                })

    elif focus == "dsa":
        pool = TOPIC_POOLS.get("DSA", {}).get(readiness, [])
        for topic in pool:
            url = _resolve_url(topic, "PROBLEM")
            tasks.append({"title": topic, "type": "PROBLEM", "task_subtype": "PROBLEM", "resource_url": url})
        # Tiered LeetCode challenge (free tier — no premium required)
        diff = {"Beginner": "easy", "Intermediate": "medium", "Advanced": "hard"}.get(readiness, "easy")
        tasks.append({
            "title":        f"Solve 10 {readiness}-level LeetCode problems (free tier)",
            "type":         "PROBLEM",
            "task_subtype": "PROBLEM",
            "resource_url": _leetcode_url(diff),
        })

    elif focus == "projects":
        if readiness == "Beginner":
            tasks = [
                {"title": "Build a personal portfolio website (HTML/CSS/JS)",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-build-a-portfolio-website-html-css-and-js/"},
                {"title": "Build a CRUD To-Do app with your preferred stack",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-build-a-todo-app-with-react/"},
            ]
        elif readiness == "Intermediate":
            tasks = [
                {"title": "Build a full-stack web app with JWT authentication",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-secure-your-mern-stack-application/"},
                {"title": "Contribute to an open-source project on GitHub",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-contribute-to-open-source-projects-beginners-guide/"},
                {"title": "Deploy your project for free on Vercel or Render",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-deploy-your-site-using-vercel/"},
            ]
        else:
            tasks = [
                {"title": "Build a scalable microservices project with Docker (free)",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/a-beginners-guide-to-docker/"},
                {"title": "Implement a real-time chat feature using WebSockets",
                 "type": "PROJECT", "task_subtype": "PROJECT",
                 "resource_url": "https://www.freecodecamp.org/news/how-to-build-a-real-time-chat-app-with-reactjs-socketio-node/"},
            ]

    elif focus == "interview":
        tasks = [
            {"title": "Practice 30 HR interview questions with answers",
             "type": "MOCK", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/top-50-hr-interview-questions-with-answers/"},
            {"title": "Mock technical interview — DSA round (timed, in-platform)",
             "type": "MOCK", "task_subtype": "MOCK",
             "resource_url": "/mock-interview"},
            {"title": "Practice explaining your projects in 2 minutes (elevator pitch)",
             "type": "MOCK", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/tips-for-technical-interview-preparation/"},
            {"title": "Behavioral question prep — STAR method with examples",
             "type": "MOCK", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/star-interview-technique/"},
        ]

    elif focus == "system_design":
        tasks = [
            {"title": "System Design — URL Shortener (Bit.ly clone)",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/system-design-url-shortening-service/"},
            {"title": "System Design — WhatsApp / Chat Application",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/system-design-of-whatsapp-messenger/"},
            {"title": "System Design — Rate Limiter",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/system-design-rate-limiter/"},
            {"title": "Database Design — E-commerce schema with indexing",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/system-design-of-e-commerce-website/"},
        ]

    elif focus == "company":
        tasks = [
            {"title": "Research target companies — recent interview patterns & OA format",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/must-do-coding-questions-company-wise/"},
            {"title": "Solve previous year company-specific questions (LeetCode free)",
             "type": "PROBLEM", "task_subtype": "PROBLEM",
             "resource_url": "https://leetcode.com/problemset/?listId=top-interview-questions"},
            {"title": "Practice aptitude & logical reasoning (free)",
             "type": "PROBLEM", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/aptitude-questions-and-answers/"},
        ]

    elif focus == "sprint":
        tasks = [
            {"title": "Revision — Core CS cheat sheets (OS, CN, DBMS, OOP)",
             "type": "REVISION", "task_subtype": "COURSE",
             "resource_url": "https://www.geeksforgeeks.org/last-minute-notes-operating-systems/"},
            {"title": "Revision — Top 75 LeetCode must-solve problems (free)",
             "type": "PROBLEM", "task_subtype": "PROBLEM",
             "resource_url": "https://leetcode.com/list/xi4ci4ig/"},
            {"title": "Final full mock interview simulation (DSA + HR) — in-platform",
             "type": "MOCK", "task_subtype": "MOCK",
             "resource_url": "/mock-interview"},
            {"title": "Polish resume & LinkedIn — free templates on Canva",
             "type": "TOPIC", "task_subtype": "COURSE",
             "resource_url": "https://www.freecodecamp.org/news/how-to-write-a-great-resume-for-software-engineers/"},
        ]

    return tasks[:tasks_per_day * 6]


def _get_remediation_tasks(weak_areas, readiness, start_day, total_days) -> list:
    tasks = []
    day   = start_day
    for area in weak_areas:
        if day > total_days:
            break
        area_key = area.upper() if area.upper() in TOPIC_POOLS else area
        pool     = TOPIC_POOLS.get(area_key, {}).get(readiness, [])
        if pool:
            topic = pool[0]
            tasks.append({
                "title":        f"[REMEDIATION] {area} — {topic}",
                "type":         "REVISION",
                "day":          day,
                "phase":        "Remediation",
                "status":       "PENDING",
                "priority":     "HIGH",
                "resource_url": _resolve_url(topic, "REVISION"),
            })
            day += 1
    return tasks


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw = sys.argv[1]
        if raw.startswith("'") and raw.endswith("'"):
            raw = raw[1:-1]
        params = json.loads(raw)
        result = generate_roadmap(params)
        print(json.dumps(result))
    else:
        demo = generate_roadmap({
            "readiness":          "Beginner",
            "daily_study_time":   "2-3 hours",
            "preferred_language": "Python",
            "placement_timeline": "45 Days",
            "weak_areas":         ["DBMS", "DSA"],
            "domain_interest":    "Full Stack",
            "core_cs_strength":   "None",
        })
        print(json.dumps(demo, indent=2))
