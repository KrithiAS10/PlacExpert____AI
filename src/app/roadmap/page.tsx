"use client";

import React, { useState, useEffect } from "react";
import { ReadinessChart } from "./components/ReadinessChart";
import {
  CheckCircle2,
  Play,
  TrendingUp,
  AlertCircle,
  Zap,
  Calendar,
  Clock,
  Target,
  Code2,
  BookOpen,
  Brain,
  Sparkles,
  ChevronDown,
  Lock,
  Star,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Check,
  HelpCircle,
  Trophy,
  ChevronRight,
  XCircle,
  FileCheck,
  X,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  description: string | null; // stores resource_url
  day: number;
  status: string;
  type: string;
  _count?: { solvedProblems: number };
}
interface Phase {
  id: string;
  title: string;
  description: string | null;
  order: number;
  tasks: Task[];
}
interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  phases: Phase[];
}
interface UserProfile {
  name: string | null;
  email: string;
  readinessScore: number;
  currentDay: number;
  streak: number;
  readinessLevel: string | null;
  domainInterest: string | null;
  targetCompany: string | null;
  coreCsStrength: string | null;
  codingPlatform: string | null;
  projects: string | null;
  aptitude: string | null;
  communication: string | null;
  dailyStudyTime: string | null;
  preferredLang: string | null;
  placementTimeline: string | null;
  analytics?: any[];
  totalSolvedProblems?: number;
}
interface WeakArea {
  name: string;
  reason: string;
  severity: string;
}

// ─────────────────────────────────────────────
// Dynamic Platform & Accurate Resource URL Resolver
// ─────────────────────────────────────────────
function getAccurateResourceUrl(taskTitle: string, rawUrl: string | null): string {
  const title = taskTitle.toLowerCase();
  
  if (rawUrl && rawUrl !== "https://roadmap.sh" && rawUrl !== "https://www.geeksforgeeks.org/" && rawUrl.trim().length > 0) {
    return rawUrl;
  }

  // Exact GeeksforGeeks and platform mappings based on task title keywords
  if (title.includes("java") && (title.includes("setup") || title.includes("environment") || title.includes("ide") || title.includes("install"))) {
    return "https://www.geeksforgeeks.org/how-to-set-up-java-development-environment/";
  }
  if (title.includes("python") && (title.includes("setup") || title.includes("environment") || title.includes("ide"))) {
    return "https://www.geeksforgeeks.org/set-up-python-development-environment/";
  }
  if (title.includes("c++") && (title.includes("setup") || title.includes("environment") || title.includes("ide"))) {
    return "https://www.geeksforgeeks.org/setting-up-c-development-environment/";
  }
  if (title.includes("java") && (title.includes("collection") || title.includes("stream") || title.includes("list"))) {
    return "https://www.geeksforgeeks.org/collections-in-java-2/";
  }
  if (title.includes("java")) {
    return "https://www.geeksforgeeks.org/java/";
  }
  if (title.includes("python")) {
    return "https://www.geeksforgeeks.org/python-programming-language/";
  }
  if (title.includes("c++") || title.includes("cpp")) {
    return "https://www.geeksforgeeks.org/c-plus-plus/";
  }
  if (title.includes("git") || title.includes("github")) {
    return "https://www.geeksforgeeks.org/git-tutorial/";
  }
  if (title.includes("html") || title.includes("css") || title.includes("web")) {
    return "https://www.geeksforgeeks.org/web-development/";
  }
  if (title.includes("array") || title.includes("two pointer") || title.includes("sliding")) {
    return "https://www.geeksforgeeks.org/array-data-structure/";
  }
  if (title.includes("string") || title.includes("palindrome") || title.includes("anagram")) {
    return "https://www.geeksforgeeks.org/string-data-structure/";
  }
  if (title.includes("sql") || title.includes("dbms") || title.includes("database") || title.includes("normalization")) {
    return "https://www.geeksforgeeks.org/dbms/";
  }
  if (title.includes("os") || title.includes("process") || title.includes("thread") || title.includes("scheduling") || title.includes("deadlock")) {
    return "https://www.geeksforgeeks.org/operating-systems/";
  }
  if (title.includes("tcp") || title.includes("udp") || title.includes("osi") || title.includes("dns") || title.includes("network")) {
    return "https://www.geeksforgeeks.org/computer-network-tutorials/";
  }
  if (title.includes("react")) {
    return "https://www.geeksforgeeks.org/reactjs-tutorial/";
  }
  if (title.includes("system design")) {
    return "https://www.geeksforgeeks.org/system-design-tutorial/";
  }
  if (title.includes("oop") || title.includes("encapsulat") || title.includes("inherit")) {
    return "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/";
  }

  return "https://www.geeksforgeeks.org/explore";
}

// ─────────────────────────────────────────────
// Interactive Topic Checkpoint Question Bank
// ─────────────────────────────────────────────
interface CheckpointQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

const CHECKPOINT_QUESTION_BANK: Record<string, CheckpointQuestion[]> = {
  java_setup: [
    { q: "Which CLI tool in the JDK compiles Java source files (.java) into bytecode (.class)?", options: ["java", "javac", "javadoc", "jar"], correct: 1, explanation: "javac (Java Compiler) reads .java source code files and compiles them into .class bytecode." },
    { q: "What should the JAVA_HOME environment variable point to?", options: ["The JRE bin directory", "The root directory of your installed JDK", "The System32 directory", "The C:\\Users home folder"], correct: 1, explanation: "JAVA_HOME must point to the root directory where the JDK is installed." },
    { q: "Which Java component executes compiled bytecode on any host operating system?", options: ["JVM (Java Virtual Machine)", "JDK Compiler", "JavaFX Engine", "Maven"], correct: 0, explanation: "The JVM is the engine that provides the runtime environment to execute Java bytecode." },
    { q: "What file extension do compiled Java bytecode files have?", options: [".exe", ".jar", ".class", ".java"], correct: 2, explanation: "Java compiler generates .class files containing JVM bytecode." },
    { q: "Which IDE is widely considered the industry standard for modern enterprise Java development?", options: ["Notepad++", "IntelliJ IDEA", "Turbo C++", "Sublime Text"], correct: 1, explanation: "IntelliJ IDEA by JetBrains is widely used for Java development." }
  ],
  python_setup: [
    { q: "Which built-in module creates isolated virtual environments in Python 3?", options: ["pip", "venv", "pyenv", "conda"], correct: 1, explanation: "python -m venv creates an isolated virtual environment." },
    { q: "Which command installs third-party packages from PyPI?", options: ["pip install <package>", "python get <package>", "npm install <package>", "apt-get python-<package>"], correct: 0, explanation: "pip is the official package installer for Python." },
    { q: "Which standard file lists project Python package dependencies?", options: ["package.json", "requirements.txt", "Pipfile.lock", "setup.py"], correct: 1, explanation: "requirements.txt lists dependencies for pip install -r requirements.txt." },
    { q: "How do you run a Python script named app.py from terminal?", options: ["exec app.py", "python app.py", "run app.py", "compile app.py"], correct: 1, explanation: "python app.py executes the script through the Python interpreter." },
    { q: "What is PEP 8 in the Python ecosystem?", options: ["A performance compiler", "The official style guide for Python code formatting", "A virtual machine spec", "A database connector"], correct: 1, explanation: "PEP 8 provides guidelines and best practices for writing clean Python code." }
  ],
  cpp_setup: [
    { q: "Which command invokes the GNU C++ compiler to compile main.cpp?", options: ["gcc main.cpp", "g++ main.cpp -o main", "cpp main.cpp", "make main.cpp"], correct: 1, explanation: "g++ is the standard GNU C++ compiler command." },
    { q: "Which header file must be included for std::cout and std::cin?", options: ["<stdio.h>", "<iostream>", "<stdlib.h>", "<math.h>"], correct: 1, explanation: "<iostream> defines standard input/output stream objects." },
    { q: "What extension is standard for C++ source code files?", options: [".c", ".cpp", ".class", ".cs"], correct: 1, explanation: ".cpp (or .cc / .cxx) is standard for C++ source files." },
    { q: "Which keyword brings standard C++ library symbols into the global namespace?", options: ["import std;", "using namespace std;", "include <std>", "package std;"], correct: 1, explanation: "using namespace std; imports the std namespace." },
    { q: "What tool automates cross-platform building of large C++ projects?", options: ["CMake", "npm", "pip", "Gradle"], correct: 0, explanation: "CMake generates platform-native build files for C++." }
  ],
  web_setup: [
    { q: "Which HTML5 semantic tag defines navigation links?", options: ["<section>", "<nav>", "<aside>", "<div>"], correct: 1, explanation: "<nav> is the semantic element for major navigation blocks." },
    { q: "In the CSS Box Model, what sits directly between the element content and border?", options: ["Margin", "Padding", "Outline", "Gap"], correct: 1, explanation: "Box Model order from inside out: Content -> Padding -> Border -> Margin." },
    { q: "Which CSS Flexbox property aligns items along the main axis?", options: ["align-items", "justify-content", "align-content", "flex-direction"], correct: 1, explanation: "justify-content aligns items along the main axis." },
    { q: "Which JavaScript keyword declares a variable scoped to its block that cannot be reassigned?", options: ["var", "let", "const", "static"], correct: 2, explanation: "const creates a block-scoped, read-only constant." },
    { q: "What method adds an event listener to an HTML DOM element?", options: ["element.attachEvent()", "element.addEventListener()", "element.on()", "element.bind()"], correct: 1, explanation: "addEventListener() attaches event handler functions." }
  ],
  arrays: [
    { q: "What is the time complexity to access an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2, explanation: "Arrays provide O(1) constant time random access by index." },
    { q: "The Two-Pointer technique on a sorted array can find pair sums in:", options: ["O(n²)", "O(n)", "O(log n)", "O(n log n)"], correct: 1, explanation: "Two pointers move inwards from opposite ends in linear O(n) time." },
    { q: "What does the Sliding Window technique optimize?", options: ["Space complexity only", "Time complexity from O(n²) to O(n) for contiguous subarray problems", "Tree height", "Graph cycles"], correct: 1, explanation: "Sliding window avoids recomputing sums/states for overlapping subarrays." },
    { q: "In a 0-indexed array of length N, what is the index of the last element?", options: ["N", "N - 1", "N + 1", "1"], correct: 1, explanation: "Indices range from 0 to N-1." },
    { q: "Prefix Sum array allows calculating any range sum query [L, R] in:", options: ["O(1) time", "O(N) time", "O(R - L) time", "O(log N) time"], correct: 0, explanation: "Range sum = Prefix[R] - Prefix[L-1] in constant time O(1)." }
  ],
  strings: [
    { q: "Which technique checks if a string is a palindrome in O(n) time and O(1) space?", options: ["Stack reversal", "Two pointers from start and end moving inwards", "Generating all permutations", "Regex matching"], correct: 1, explanation: "Two pointers compare s[left] and s[right] moving towards the center." },
    { q: "Two strings are anagrams if they:", options: ["Have the same length only", "Contain the exact same character frequencies", "Start with the same letter", "Have the same hash code only"], correct: 1, explanation: "Anagrams contain identical characters in different orders." },
    { q: "What is the time complexity of the KMP pattern matching algorithm?", options: ["O(N * M)", "O(N + M)", "O(N²)", "O(log N)"], correct: 1, explanation: "KMP avoids backtracking by building the LPS array in O(N + M) time." },
    { q: "What is the ASCII value of uppercase letter 'A'?", options: ["97", "65", "48", "90"], correct: 1, explanation: "ASCII 'A' is 65; lowercase 'a' is 97." },
    { q: "Which approach finds all substrings of length N in a string?", options: ["O(N²) nested loops", "O(N) single loop", "O(2ⁿ)", "O(1)"], correct: 0, explanation: "There are N*(N+1)/2 total substrings, requiring O(N²) time." }
  ],
  linked_lists: [
    { q: "Inserting a node at the head of a Singly Linked List takes:", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, explanation: "Updating newNode.next = head and head = newNode takes O(1) time." },
    { q: "A Doubly Linked List node contains:", options: ["Only a data value", "Data and a Next pointer", "Data, Next pointer, and Prev pointer", "Data and a parent pointer"], correct: 2, explanation: "Doubly linked nodes store data, next node pointer, and prev node pointer." },
    { q: "Floyd's Cycle Detection algorithm uses:", options: ["A Hash Set", "Fast & Slow Pointers (Tortoise & Hare)", "Recursion", "Binary Search"], correct: 1, explanation: "If a cycle exists, the fast pointer (2 steps) will meet the slow pointer (1 step)." },
    { q: "Finding the middle node of a linked list in one pass requires:", options: ["Counting total nodes first", "Fast & Slow pointers (slow moves 1 step, fast moves 2 steps)", "Reversing the list", "Sorting"], correct: 1, explanation: "When fast reaches the end, slow will be at the exact middle node." },
    { q: "Reversing a Singly Linked List iteratively requires keeping track of:", options: ["Prev, Curr, and Next pointers", "Left and Right pointers", "Head and Tail only", "Stack size"], correct: 0, explanation: "Updating curr.next = prev requires saving next = curr.next first." }
  ],
  stacks_queues: [
    { q: "Which ordering principle does a Stack follow?", options: ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Priority Based", "Random Access"], correct: 1, explanation: "Stack is Last-In-First-Out." },
    { q: "Which ordering principle does a Queue follow?", options: ["LIFO", "FIFO (First In First Out)", "Sorted order", "LILO only"], correct: 1, explanation: "Queue is First-In-First-Out." },
    { q: "Evaluating postfix mathematical expressions (e.g., 3 4 +) uses which structure?", options: ["Queue", "Stack", "Binary Tree", "Heap"], correct: 1, explanation: "Operands are pushed onto a stack; operators pop 2 operands and push the result." },
    { q: "In a Queue, new elements are inserted at the:", options: ["Front (Dequeue)", "Rear (Enqueue)", "Middle", "Random position"], correct: 1, explanation: "Enqueue inserts at the rear; Dequeue removes from the front." },
    { q: "Which algorithm uses a Queue for level-by-level traversal?", options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Binary Search", "Quick Sort"], correct: 1, explanation: "BFS uses a Queue to visit all neighbors level by level." }
  ],
  trees_graphs: [
    { q: "In a valid Binary Search Tree (BST), the left child value is always:", options: ["Greater than the root", "Smaller than the root node", "Equal to the right child", "Any value"], correct: 1, explanation: "BST property: Left < Node < Right." },
    { q: "Which graph traversal strategy uses recursion or an explicit Stack?", options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm"], correct: 1, explanation: "DFS goes deep along paths using a Stack or call stack." },
    { q: "Dijkstra's Shortest Path algorithm fails when the graph has:", options: ["Cycles", "Negative edge weights", "Multiple components", "Directed edges"], correct: 1, explanation: "Dijkstra assumes non-negative edge weights; use Bellman-Ford for negative weights." },
    { q: "Topological Sorting can only be applied to:", options: ["Undirected graphs", "Directed Acyclic Graphs (DAG)", "Complete graphs", "Bipartite graphs"], correct: 1, explanation: "Topological sort requires a DAG with no directed cycles." },
    { q: "Inorder traversal of a Binary Search Tree (BST) visits nodes in:", options: ["Random order", "Sorted ascending order", "Descending order", "Reverse level order"], correct: 1, explanation: "Inorder (Left -> Root -> Right) on a BST yields sorted elements." }
  ],
  dp_greedy: [
    { q: "Dynamic Programming is applicable when a problem exhibits:", options: ["Greedy choices only", "Overlapping subproblems & Optimal substructure", "No base cases", "Linear time complexity"], correct: 1, explanation: "DP solves overlapping subproblems once and stores their solutions." },
    { q: "Memoization refers to:", options: ["Bottom-up DP table filling", "Top-down recursion with caching", "Stack frames", "Sorting array"], correct: 1, explanation: "Memoization caches recursive function return values." },
    { q: "Tabulation DP approach is built:", options: ["Top-down", "Bottom-up iteratively filling a DP table", "Using recursion only", "Randomly"], correct: 1, explanation: "Tabulation fills base cases first and iterates up to N." },
    { q: "The 0/1 Knapsack problem with N items and Capacity W has time complexity:", options: ["O(N log N)", "O(N * W)", "O(2ⁿ)", "O(W²)"], correct: 1, explanation: "Standard DP table size is N x W." },
    { q: "Greedy algorithms make choices that are:", options: ["Locally optimal at each step hoping for global optimum", "Globally optimal first", "Recursive always", "Backtracking based"], correct: 0, explanation: "Greedy picks the best immediate choice without looking back." }
  ],
  dbms_sql: [
    { q: "Which SQL clause filters aggregated results produced by GROUP BY?", options: ["WHERE", "HAVING", "FILTER", "ORDER BY"], correct: 1, explanation: "HAVING filters groups post-aggregation; WHERE filters individual rows pre-aggregation." },
    { q: "Which SQL JOIN returns all rows from the left table regardless of matches in the right table?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 1, explanation: "LEFT JOIN retains all left records." },
    { q: "In ACID properties, 'Atomicity' guarantees:", options: ["Data is isolated from other transactions", "Transactions are All-or-Nothing", "Data persists after crash", "Types are consistent"], correct: 1, explanation: "Atomicity ensures every operation in a transaction succeeds or all are rolled back." },
    { q: "Which Normal Form eliminates transitive functional dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correct: 2, explanation: "3NF removes transitive dependencies (X -> Y and Y -> Z)." },
    { q: "Which database indexing data structure is optimized for disk reads and range queries?", options: ["Binary Search Tree", "B+ Tree", "Linked List", "Hash Map"], correct: 1, explanation: "B+ Trees store keys in leaves linked sequentially for fast range scans." }
  ],
  os: [
    { q: "A process in an operating system is best defined as:", options: ["A file on disk", "A program in active execution", "A hardware component", "A thread pool"], correct: 1, explanation: "A process is an instance of a computer program being executed." },
    { q: "Which CPU scheduling algorithm can lead to the Convoy Effect?", options: ["Round Robin", "First-Come, First-Served (FCFS)", "Shortest Remaining Time First", "Multilevel Queue"], correct: 1, explanation: "Short processes wait behind a long CPU-bound process in FCFS." },
    { q: "Which condition is NOT one of the 4 necessary conditions for Deadlock?", options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Preemption"], correct: 3, explanation: "The 4 Coffman conditions are: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait." },
    { q: "Paging in OS memory management eliminates:", options: ["Internal Fragmentation", "External Fragmentation", "Page Faults", "Cache Misses"], correct: 1, explanation: "Paging allocates non-contiguous fixed-size physical frames." },
    { q: "A context switch saves the CPU state in which data structure?", options: ["Stack", "PCB (Process Control Block)", "Page Table", "Inode"], correct: 1, explanation: "PCB holds process ID, registers, program counter, and scheduling info." }
  ],
  cn: [
    { q: "Which layer of the OSI model handles logical IP routing across networks?", options: ["Data Link Layer (Layer 2)", "Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)"], correct: 1, explanation: "Layer 3 (Network Layer) manages IP addressing and packet routing." },
    { q: "TCP provides which guarantees that UDP does NOT?", options: ["Lower latency", "Reliable, ordered, error-checked data stream", "Multicast support", "Zero packet overhead"], correct: 1, explanation: "TCP guarantees delivery and ordering via sequence numbers and ACKs." },
    { q: "Why is UDP preferred over TCP for live video streaming and gaming?", options: ["It encrypts data automatically", "Low latency without blocking on retransmissions", "Higher bandwidth", "No port numbers"], correct: 1, explanation: "UDP avoids delay caused by retransmitting lost packets." },
    { q: "Which protocol translates human-readable domain names to IP addresses?", options: ["DHCP", "DNS", "ARP", "FTP"], correct: 1, explanation: "DNS (Domain Name System) resolves hostnames to IP addresses." },
    { q: "What is the standard port for HTTPS encrypted traffic?", options: ["80", "443", "22", "8080"], correct: 1, explanation: "Port 443 is standard for HTTPS; 80 is HTTP." }
  ],
  oop: [
    { q: "Binding data fields and methods into a single unit while restricting direct access is:", options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"], correct: 1, explanation: "Encapsulation hides internal implementation using private fields and getters/setters." },
    { q: "Which SOLID principle states classes should be open for extension but closed for modification?", options: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution", "Dependency Inversion"], correct: 1, explanation: "Open/Closed Principle (OCP)." },
    { q: "Method Overriding in OOP is an example of:", options: ["Compile-time Polymorphism", "Run-time (Dynamic) Polymorphism", "Data Hiding", "Multiple Inheritance"], correct: 1, explanation: "Overridden methods are dispatched dynamically at runtime based on object type." },
    { q: "A Singleton Design Pattern guarantees:", options: ["Multiple thread-safe instances", "Exactly one instance of a class with a global point of access", "Static classes only", "Interface inheritance"], correct: 1, explanation: "Singleton restricts instantiation to a single object." },
    { q: "An abstract class differs from an interface because an abstract class can:", options: ["Have constructors and non-abstract instance fields", "Be instantiated directly", "Be inherited by multiple child classes in Java", "Not contain methods"], correct: 0, explanation: "Abstract classes can hold state and concrete method implementations." }
  ],
  react: [
    { q: "Which React Hook declares a local state variable in a functional component?", options: ["useEffect", "useState", "useContext", "useRef"], correct: 1, explanation: "const [state, setState] = useState(initialValue);" },
    { q: "Which React Hook executes side-effects like data fetching after rendering?", options: ["useMemo", "useEffect", "useCallback", "useReducer"], correct: 1, explanation: "useEffect runs side-effects after component render." },
    { q: "Why are 'key' props necessary when mapping lists in React?", options: ["For CSS styling", "To help React track item identity for efficient DOM diffing", "To enable event handlers", "To validate TypeScript types"], correct: 1, explanation: "Keys give elements a stable identity across re-renders." },
    { q: "Props passed to a React component are:", options: ["Mutable within the child", "Read-only (immutable)", "Global state variables", "Database queries"], correct: 1, explanation: "Props flow top-down and must not be mutated by child components." },
    { q: "Which React feature avoids 'prop drilling' through multiple layout levels?", options: ["Redux store only", "Context API", "React Router", "Higher Order Components"], correct: 1, explanation: "Context passes data through the tree without explicitly passing props at every level." }
  ],
  system_design: [
    { q: "Horizontal scaling (Scale-out) means:", options: ["Adding CPU/RAM to a single machine", "Adding more commodity servers to distribute traffic", "Using SSDs instead of HDDs", "Optimizing SQL queries"], correct: 1, explanation: "Horizontal scaling adds more instances to a cluster." },
    { q: "What component sits between clients and backend servers to distribute incoming traffic?", options: ["Database Index", "Load Balancer", "Reverse Proxy Cache", "API Gateway"], correct: 1, explanation: "Load Balancers distribute network/application traffic across servers." },
    { q: "A Content Delivery Network (CDN) speeds up static asset loading by:", options: ["Caching content geographically closer to users", "Compressing database rows", "Using faster CPU servers", "Encrypting passwords"], correct: 0, explanation: "CDNs serve assets from edge servers nearest to the client." },
    { q: "In CAP Theorem, what does 'C' stand for?", options: ["Capacity", "Consistency", "Concurrency", "Commit"], correct: 1, explanation: "CAP = Consistency, Availability, Partition Tolerance." },
    { q: "In-memory caches like Redis improve performance by:", options: ["Storing data on NVMe drives", "Serving frequent queries directly from RAM in microseconds", "Compiling JavaScript", "Sharding relational tables"], correct: 1, explanation: "RAM access is order of magnitude faster than disk I/O." }
  ],
  generic: [
    { q: "What does Big-O notation measure?", options: ["Lines of code", "How execution time or memory grows relative to input size N", "Network bandwidth", "CPU temperature"], correct: 1, explanation: "Big-O characterizes algorithm efficiency as N approaches infinity." },
    { q: "What MUST a recursive function include to avoid a Stack Overflow error?", options: ["A while loop", "A Base Case", "Global variables", "A try-catch block"], correct: 1, explanation: "A base case terminates recursive self-calls." },
    { q: "Average case time complexity for searching a key in a Hash Table is:", options: ["O(N)", "O(1)", "O(log N)", "O(N²)"], correct: 1, explanation: "Hash tables provide average O(1) key lookup." },
    { q: "Which data structure follows Last-In-First-Out (LIFO) ordering?", options: ["Queue", "Stack", "Heap", "Tree"], correct: 1, explanation: "Stack is LIFO." },
    { q: "Which data structure follows First-In-First-Out (FIFO) ordering?", options: ["Stack", "Queue", "Set", "Graph"], correct: 1, explanation: "Queue is FIFO." }
  ]
};

function getCheckpointQuestionsForTask(task: Task): CheckpointQuestion[] {
  const t = task.title.toLowerCase();
  
  if (t.includes("java") && (t.includes("setup") || t.includes("environment") || t.includes("ide") || t.includes("install"))) {
    return CHECKPOINT_QUESTION_BANK.java_setup;
  }
  if (t.includes("python") && (t.includes("setup") || t.includes("environment") || t.includes("ide"))) {
    return CHECKPOINT_QUESTION_BANK.python_setup;
  }
  if (t.includes("c++") && (t.includes("setup") || t.includes("environment") || t.includes("ide"))) {
    return CHECKPOINT_QUESTION_BANK.cpp_setup;
  }
  if (t.includes("set up") || t.includes("setup") || t.includes("environment") || t.includes("ide") || t.includes("web") || t.includes("html") || t.includes("git")) {
    return CHECKPOINT_QUESTION_BANK.web_setup;
  }
  if (t.includes("array") || t.includes("two pointer") || t.includes("sliding")) {
    return CHECKPOINT_QUESTION_BANK.arrays;
  }
  if (t.includes("string") || t.includes("palindrome") || t.includes("anagram")) {
    return CHECKPOINT_QUESTION_BANK.strings;
  }
  if (t.includes("linked list")) {
    return CHECKPOINT_QUESTION_BANK.linked_lists;
  }
  if (t.includes("stack") || t.includes("queue")) {
    return CHECKPOINT_QUESTION_BANK.stacks_queues;
  }
  if (t.includes("tree") || t.includes("graph") || t.includes("bfs") || t.includes("dfs") || t.includes("dijkstra")) {
    return CHECKPOINT_QUESTION_BANK.trees_graphs;
  }
  if (t.includes("dp") || t.includes("dynamic") || t.includes("knapsack") || t.includes("greedy")) {
    return CHECKPOINT_QUESTION_BANK.dp_greedy;
  }
  if (t.includes("sql") || t.includes("dbms") || t.includes("database") || t.includes("normalization")) {
    return CHECKPOINT_QUESTION_BANK.dbms_sql;
  }
  if (t.includes("process") || t.includes("thread") || t.includes("os") || t.includes("scheduling") || t.includes("deadlock")) {
    return CHECKPOINT_QUESTION_BANK.os;
  }
  if (t.includes("tcp") || t.includes("udp") || t.includes("osi") || t.includes("dns") || t.includes("network")) {
    return CHECKPOINT_QUESTION_BANK.cn;
  }
  if (t.includes("class") || t.includes("oop") || t.includes("encapsulat") || t.includes("inherit") || t.includes("solid")) {
    return CHECKPOINT_QUESTION_BANK.oop;
  }
  if (t.includes("react")) {
    return CHECKPOINT_QUESTION_BANK.react;
  }
  if (t.includes("system design") || t.includes("load balancer") || t.includes("cdn") || t.includes("scaling")) {
    return CHECKPOINT_QUESTION_BANK.system_design;
  }

  return CHECKPOINT_QUESTION_BANK.generic;
}

// ─────────────────────────────────────────────
// Topic Quiz Question Bank (FreeCodeCamp-style)
// ─────────────────────────────────────────────
interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // index
}

const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  // Arrays
  default_arrays: [
    { q: "What is the time complexity of accessing an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2 },
    { q: "Which of the following sorting algorithms has the best average-case time complexity?", options: ["Bubble Sort — O(n²)", "Quick Sort — O(n log n)", "Insertion Sort — O(n²)", "Selection Sort — O(n²)"], correct: 1 },
    { q: "The Two-Pointer technique is most useful for problems on:", options: ["Binary Trees", "Sorted Arrays or Linked Lists", "Graph traversal", "Hash Maps"], correct: 1 },
    { q: "Which data structure uses LIFO (Last-In-First-Out) ordering?", options: ["Queue", "Heap", "Stack", "Deque"], correct: 2 },
    { q: "What does the Sliding Window technique reduce?", options: ["Space complexity from O(n²) to O(1)", "Time complexity from O(n²) to O(n)", "The number of recursive calls", "Graph cycles"], correct: 1 },
    { q: "Binary Search requires the array to be:", options: ["Sorted", "Reversed", "Of even length", "Containing unique elements only"], correct: 0 },
  ],
  default_strings: [
    { q: "What is the time complexity of the KMP string matching algorithm?", options: ["O(n²)", "O(n·m)", "O(n + m)", "O(log n)"], correct: 2 },
    { q: "A palindrome reads the same forwards and backwards. Which check is O(n)?", options: ["Using a Stack", "Two-Pointer from both ends", "Building all substrings", "Comparing hash codes"], correct: 1 },
    { q: "An anagram of 'listen' is:", options: ["silent", "tinsel", "enlist", "All of the above"], correct: 3 },
    { q: "Which approach finds ALL substrings of a string in O(n²)?", options: ["Trie traversal", "Nested loop over start/end indices", "KMP preprocessing", "Binary Search"], correct: 1 },
    { q: "ASCII value of character 'A' is:", options: ["97", "65", "48", "90"], correct: 1 },
    { q: "Which Python built-in checks if a string contains only alphanumeric chars?", options: ["str.isalpha()", "str.isdigit()", "str.isalnum()", "str.isnumeric()"], correct: 2 },
  ],
  default_graphs: [
    { q: "BFS uses which data structure internally?", options: ["Stack", "Heap", "Queue", "Deque"], correct: 2 },
    { q: "Dijkstra's algorithm does NOT work correctly when:", options: ["Graph has cycles", "Graph has negative weight edges", "Graph is directed", "Graph is dense"], correct: 1 },
    { q: "Topological sort applies to which type of graph?", options: ["Undirected Weighted", "Directed Acyclic Graph (DAG)", "Directed Cyclic Graph", "Complete Bipartite"], correct: 1 },
    { q: "The time complexity of BFS / DFS on a graph with V vertices and E edges is:", options: ["O(V²)", "O(V + E)", "O(E log V)", "O(V log E)"], correct: 1 },
    { q: "Which algorithm detects negative cycles in a graph?", options: ["Dijkstra", "Prim's", "Bellman-Ford", "Floyd-Warshall (also correct but pick the standard answer)"], correct: 2 },
    { q: "In DFS, when do we use a visited[] array?", options: ["To store parent nodes", "To avoid revisiting already explored nodes", "To count connected components only", "It is optional"], correct: 1 },
  ],
  default_dp: [
    { q: "Dynamic Programming is applicable when a problem has:", options: ["Greedy substructure only", "Overlapping subproblems and optimal substructure", "No base cases", "Only linear recurrences"], correct: 1 },
    { q: "Memoization refers to:", options: ["Bottom-up DP with a table", "Top-down recursion with caching", "Storing the call stack", "Graph coloring"], correct: 1 },
    { q: "The 0/1 Knapsack problem has time complexity:", options: ["O(n log n)", "O(2ⁿ) naive, O(n·W) with DP", "O(n²)", "O(W²)"], correct: 1 },
    { q: "LCS stands for:", options: ["Longest Common Substring", "Longest Contiguous Sequence", "Longest Common Subsequence", "Lexical Character Span"], correct: 2 },
    { q: "Fibonacci(n) using DP (bottom-up) reduces time from O(2ⁿ) to:", options: ["O(n log n)", "O(n)", "O(log n)", "O(n²)"], correct: 1 },
    { q: "Which of these is a classic DP problem?", options: ["Merge Sort", "Coin Change Problem", "Binary Search", "Heap Sort"], correct: 1 },
  ],
  default_dbms: [
    { q: "ACID stands for:", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Insert, Delete", "Aggregate, Condition, Index, Data", "None of the above"], correct: 0 },
    { q: "Which normal form eliminates transitive functional dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correct: 2 },
    { q: "A PRIMARY KEY constraint ensures:", options: ["NULL values only", "Uniqueness and NOT NULL", "Foreign key referencing", "Duplicate values allowed"], correct: 1 },
    { q: "SQL JOIN that returns all records from both tables, matching where possible:", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 3 },
    { q: "An index in a database primarily improves:", options: ["Write performance", "Read/Query performance", "Storage efficiency", "Data encryption"], correct: 1 },
    { q: "The 'isolation' property in ACID prevents:", options: ["Data loss", "Dirty reads and uncommitted data exposure between concurrent transactions", "Schema changes", "Index fragmentation"], correct: 1 },
  ],
  default_os: [
    { q: "Which CPU scheduling algorithm can lead to starvation?", options: ["Round Robin", "FCFS", "Shortest Job First (SJF)", "Multilevel Feedback Queue"], correct: 2 },
    { q: "Deadlock requires all four Coffman conditions. Which is NOT one of them?", options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"], correct: 2 },
    { q: "Paging eliminates which memory problem?", options: ["Internal Fragmentation", "External Fragmentation", "Stack Overflow", "Cache Miss"], correct: 1 },
    { q: "A context switch saves:", options: ["Only CPU registers", "The process control block (PCB) including registers, PC, and stack pointer", "Only the stack", "The file descriptors"], correct: 1 },
    { q: "LRU (Least Recently Used) is a:", options: ["CPU scheduling algorithm", "Page replacement algorithm", "Disk scheduling algorithm", "Memory allocation strategy"], correct: 1 },
    { q: "A system call transfers execution from:", options: ["User space to kernel space", "Kernel space to user space", "One process to another", "RAM to CPU cache"], correct: 0 },
  ],
  default_cn: [
    { q: "Which layer of the OSI model handles routing?", options: ["Data Link Layer", "Transport Layer", "Network Layer", "Session Layer"], correct: 2 },
    { q: "TCP provides which guarantees that UDP does NOT?", options: ["Speed", "Low latency", "Reliable, ordered delivery", "Broadcast support"], correct: 2 },
    { q: "DNS resolves:", options: ["IP addresses to MAC addresses", "Domain names to IP addresses", "URLs to HTML files", "Ports to services"], correct: 1 },
    { q: "What does HTTPS add over HTTP?", options: ["Faster speed", "Better caching", "TLS encryption", "WebSocket support"], correct: 2 },
    { q: "Subnetting divides a network to:", options: ["Improve DNS resolution", "Reduce broadcast domains and improve routing efficiency", "Increase IP address length", "Enable multicast"], correct: 1 },
    { q: "The 3-way handshake in TCP is: SYN → ?", options: ["SYN → ACK → FIN", "SYN → SYN-ACK → ACK", "SYN → RST → ACK", "SYN → DATA → ACK"], correct: 1 },
  ],
  default_oop: [
    { q: "Encapsulation in OOP means:", options: ["A class can inherit from multiple parents", "Binding data and methods together, hiding internal state", "Overriding parent class methods", "Instantiating abstract classes"], correct: 1 },
    { q: "Which SOLID principle states a class should have only one reason to change?", options: ["Open/Closed Principle", "Single Responsibility Principle", "Liskov Substitution", "Interface Segregation"], correct: 1 },
    { q: "Polymorphism allows:", options: ["Objects of different classes to be treated through a common interface", "A class to have private constructors only", "Multiple inheritance only", "Static methods to be overridden"], correct: 0 },
    { q: "A Singleton design pattern ensures:", options: ["Multiple instances of a class", "Exactly one instance of a class with global access", "Classes cannot be instantiated", "All methods are static"], correct: 1 },
    { q: "Abstract classes differ from interfaces in Java because:", options: ["Interfaces can have state; abstract classes cannot", "Abstract classes can have constructor and concrete methods; interfaces (pre-Java 8) cannot", "Abstract classes support multiple inheritance", "Interfaces are slower at runtime"], correct: 1 },
    { q: "Method overloading (compile-time polymorphism) is determined by:", options: ["Return type alone", "Method name and parameter list", "Access modifiers", "Inheritance hierarchy"], correct: 1 },
  ],
  default_setup: [
    { q: "Git command to initialize a new repository:", options: ["git start", "git init", "git create", "git begin"], correct: 1 },
    { q: "Which command stages all changed files for commit?", options: ["git commit -a", "git push", "git add .", "git stage --all"], correct: 2 },
    { q: "A .gitignore file is used to:", options: ["Ignore broken commits", "Specify files Git should not track", "Encrypt repository contents", "Set branch permissions"], correct: 1 },
    { q: "Git rebase vs merge: rebase is preferred when:", options: ["You want to preserve the full branch history", "You want a linear, cleaner commit history", "Working on the main/master branch directly", "Merging hotfixes into production"], correct: 1 },
    { q: "Which VS Code shortcut opens the integrated terminal?", options: ["Ctrl + T", "Ctrl + `", "Ctrl + Shift + P", "Alt + T"], correct: 1 },
    { q: "pip install is used for:", options: ["JavaScript packages", "Python packages", "Java dependencies", "Linux packages"], correct: 1 },
  ],
  default_system_design: [
    { q: "A CDN (Content Delivery Network) primarily improves:", options: ["Database write speed", "Static asset delivery latency globally", "Authentication security", "Server-side rendering speed"], correct: 1 },
    { q: "Horizontal scaling means:", options: ["Upgrading a single server's CPU/RAM", "Adding more servers to distribute load", "Using faster storage", "Optimizing SQL queries"], correct: 1 },
    { q: "A Load Balancer distributes traffic to:", options: ["A single powerful server", "Multiple backend servers to prevent overload", "The database directly", "Client browsers"], correct: 1 },
    { q: "CAP Theorem states a distributed system cannot guarantee all three of:", options: ["Consistency, Availability, Partition Tolerance", "Capacity, Atomicity, Performance", "Caching, API, Proxy", "Commit, Acknowledge, Persist"], correct: 0 },
    { q: "URL shorteners like bit.ly primarily use which data structure for redirects?", options: ["Binary Search Tree", "Hash Map (key: short code → value: long URL)", "Linked List", "Trie"], correct: 1 },
    { q: "Rate limiting is implemented to:", options: ["Cache static files", "Prevent API abuse by restricting requests per time window", "Compress HTTP responses", "Load balance traffic"], correct: 1 },
  ],
  default_project: [
    { q: "REST API uses which HTTP method to CREATE a resource?", options: ["GET", "DELETE", "PUT", "POST"], correct: 3 },
    { q: "JWT (JSON Web Token) consists of:", options: ["Only a payload", "Header, Payload, and Signature (Base64 encoded)", "A session ID and cookie", "An encrypted username/password"], correct: 1 },
    { q: "Which HTTP status code means 'Unauthorized'?", options: ["403", "404", "401", "500"], correct: 2 },
    { q: "CORS stands for:", options: ["Cross-Origin Resource Sharing", "Client-Only Request System", "Cached Object Response Storage", "Custom Origin Routing Service"], correct: 0 },
    { q: "Git branching strategy: 'feature branches' are merged into:", options: ["main/master via pull requests after review", "Directly into production", "The database", "CDN"], correct: 0 },
    { q: "Which deployment platform is 100% free for hobby projects?", options: ["AWS EC2 (paid)", "Vercel (free tier)", "Azure (paid)", "Digital Ocean (paid)"], correct: 1 },
  ],
  default_generic: [
    { q: "Big-O notation O(1) means:", options: ["Linear time", "Constant time — independent of input size", "Quadratic time", "Logarithmic time"], correct: 1 },
    { q: "A recursive function MUST have a:", options: ["Loop inside it", "Base case to stop recursion", "Global variable", "Return type of void"], correct: 1 },
    { q: "Which data structure is used in BFS traversal?", options: ["Stack", "Priority Queue", "Queue", "Deque"], correct: 2 },
    { q: "Time complexity of searching in a Hash Table (average case):", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correct: 2 },
    { q: "Space complexity measures:", options: ["Execution time", "Memory used relative to input size", "Number of function calls", "Lines of code"], correct: 1 },
    { q: "Which of these is an example of a greedy algorithm?", options: ["Merge Sort", "Dijkstra's Shortest Path", "Bubble Sort", "Binary Search"], correct: 1 },
  ],
};

function pickQuizQuestions(task: Task): QuizQuestion[] {
  const t = task.title.toLowerCase();
  if (t.includes("array") || t.includes("two pointer") || t.includes("sliding")) return QUESTION_BANK.default_arrays;
  if (t.includes("string") || t.includes("palindrome") || t.includes("anagram")) return QUESTION_BANK.default_strings;
  if (t.includes("graph") || t.includes("bfs") || t.includes("dfs") || t.includes("dijkstra") || t.includes("topological")) return QUESTION_BANK.default_graphs;
  if (t.includes("dp") || t.includes("dynamic") || t.includes("knapsack") || t.includes("fibonacci") || t.includes("lcs")) return QUESTION_BANK.default_dp;
  if (t.includes("sql") || t.includes("dbms") || t.includes("database") || t.includes("normalization") || t.includes("acid") || t.includes("join") || t.includes("er diagram")) return QUESTION_BANK.default_dbms;
  if (t.includes("process") || t.includes("thread") || t.includes("scheduling") || t.includes("deadlock") || t.includes("paging") || t.includes("os") || t.includes("memory management") || t.includes("virtual memory") || t.includes("system call")) return QUESTION_BANK.default_os;
  if (t.includes("tcp") || t.includes("udp") || t.includes("osi") || t.includes("dns") || t.includes("ip ") || t.includes("network") || t.includes("socket") || t.includes("http")) return QUESTION_BANK.default_cn;
  if (t.includes("class") || t.includes("oop") || t.includes("encapsulat") || t.includes("inherit") || t.includes("polymorphism") || t.includes("solid") || t.includes("design pattern") || t.includes("singleton")) return QUESTION_BANK.default_oop;
  if (t.includes("set up") || t.includes("github") || t.includes("git") || t.includes("environment") || t.includes("ide") || t.includes("warm-up")) return QUESTION_BANK.default_setup;
  if (t.includes("system design") || t.includes("url shortener") || t.includes("rate limiter") || t.includes("load balancer") || t.includes("cdn")) return QUESTION_BANK.default_system_design;
  if (t.includes("build") || t.includes("project") || t.includes("deploy") || t.includes("portfolio") || t.includes("open-source")) return QUESTION_BANK.default_project;
  return QUESTION_BANK.default_generic;
}

// ─────────────────────────────────────────────
// Dynamic Platform Matcher based on URL
// ─────────────────────────────────────────────
interface PlatformMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

function resolvePlatform(url: string | null, taskType: string, taskTitle?: string): PlatformMeta {
  const targetUrl = url ? getAccurateResourceUrl(taskTitle || "", url) : "";
  
  if (targetUrl.includes("oracle.com")) {
    return { label: "Oracle Docs", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("leetcode.com")) {
    return { label: "LeetCode", color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: Code2 };
  }
  if (targetUrl.includes("hackerrank.com")) {
    return { label: "HackerRank", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: Code2 };
  }
  if (targetUrl.includes("codechef.com")) {
    return { label: "CodeChef", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Code2 };
  }
  if (targetUrl.includes("freecodecamp.org")) {
    return { label: "freeCodeCamp", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20", icon: BookOpen };
  }
  if (targetUrl.includes("javascript.info")) {
    return { label: "javascript.info", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Code2 };
  }
  if (targetUrl.includes("geeksforgeeks.org")) {
    return { label: "GeeksforGeeks", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", icon: BookOpen };
  }
  if (targetUrl.includes("w3schools.com")) {
    return { label: "W3Schools", color: "text-brand-teal", bg: "bg-brand-teal/10", border: "border-brand-teal/20", icon: BookOpen };
  }
  if (targetUrl.includes("baeldung.com")) {
    return { label: "Baeldung", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("spring.io")) {
    return { label: "Spring Docs", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("developer.mozilla.org")) {
    return { label: "MDN Web Docs", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("programiz.com")) {
    return { label: "Programiz", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("react.dev") || targetUrl.includes("reactjs.org")) {
    return { label: "React Docs", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", icon: Code2 };
  }
  if (targetUrl.includes("testbook.com")) {
    return { label: "Testbook", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("byjus.com")) {
    return { label: "BYJU'S", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("github.com")) {
    return { label: "GitHub", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("render.com")) {
    return { label: "Render Docs", color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20", icon: BookOpen };
  }
  if (targetUrl.includes("pramp.com")) {
    return { label: "Pramp", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20", icon: Brain };
  }
  if (targetUrl === "/mock-interview") {
    return { label: "Mock Interview", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Brain };
  }

  // Dynamic domain extractor for any unhandled external URL
  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
    try {
      const hostname = new URL(targetUrl).hostname.replace(/^www\./, "");
      const mainDomain = hostname.split(".")[0];
      const capitalized = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
      return { label: capitalized, color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: BookOpen };
    } catch (e) {
      // fallback
    }
  }

  // Fallbacks based on task types
  if (taskType === "PROBLEM") {
    return { label: "GeeksforGeeks", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", icon: BookOpen };
  }
  if (taskType === "MOCK") {
    return { label: "Mock Interview", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20", icon: Brain };
  }
  return { label: "Resource", color: "text-brand-cyan", bg: "bg-brand-cyan/10", border: "border-brand-cyan/20", icon: BookOpen };
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  // ── Quiz State ──
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Realistic Verification & Proof Modal State ──
  const [visitedLinks, setVisitedLinks] = useState<Record<string, boolean>>({});
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofInput, setProofInput] = useState("");
  const [proofError, setProofError] = useState<string | null>(null);
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});
  const [solvingProblem, setSolvingProblem] = useState(false);
  const [checkpointSelectedOpt, setCheckpointSelectedOpt] = useState<number | null>(null);
  const [checkpointFeedback, setCheckpointFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const REQUIRED_SOLVED = 5;

  const [showExitModal, setShowExitModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleExitRoadmap = async () => {
    setIsExiting(true);
    try {
      const res = await fetch("/api/roadmap/exit", { method: "POST" });
      if (res.ok) {
        window.location.href = "/profiling";
      } else {
        alert("Failed to exit roadmap. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error exiting roadmap.");
    } finally {
      setIsExiting(false);
    }
  };

  const fetchRoadmapData = () => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (data.roadmap) {
          setRoadmap(data.roadmap);
          const todayPhase = data.roadmap.phases.find((p: Phase) =>
            p.tasks.some((t: Task) => t.day === data.user?.currentDay)
          );
          setExpandedPhaseId((prev) => prev || todayPhase?.id || data.roadmap.phases[0]?.id || null);
        }
        if (data.user) setUser(data.user);
        if (data.weakAreas) setWeakAreas(data.weakAreas.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  // ── Track external platform link visit ──
  const handleLinkVisit = (taskId: string) => {
    setVisitedLinks(prev => ({ ...prev, [taskId]: true }));
  };

  // ── Evaluate checkpoint question and submit proof to mark solved ──
  const submitProofAndSolve = async (
    taskId: string,
    taskType: string,
    selectedOpt: number | null,
    activeQuestion?: CheckpointQuestion
  ) => {
    setProofError(null);
    setCheckpointFeedback(null);

    if (activeQuestion) {
      if (selectedOpt === null) {
        setProofError("Please select an answer to the checkpoint question above.");
        return;
      }
      if (selectedOpt !== activeQuestion.correct) {
        setCheckpointFeedback({
          isCorrect: false,
          message: `❌ Incorrect answer. ${activeQuestion.explanation} Please review the GeeksforGeeks guide above and try again!`
        });
        return;
      }
    }

    const noteText = activeQuestion
      ? `Verified Checkpoint Q: "${activeQuestion.q}" -> Answer: ${activeQuestion.options[selectedOpt!]}`
      : proofInput.trim() || "Checkpoint completed";

    setSolvingProblem(true);
    try {
      const res = await fetch("/api/roadmap/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId,
          proofUrl: null,
          notes: noteText
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckpointFeedback({
          isCorrect: true,
          message: `🎉 Correct answer! Checkpoint verified successfully.`
        });
        setTimeout(() => {
          setSolvedCounts(prev => ({ ...prev, [taskId]: data.solvedCount }));
          setShowProofModal(false);
          setProofInput("");
          setCheckpointSelectedOpt(null);
          setCheckpointFeedback(null);
          fetchRoadmapData();
        }, 900);
      } else {
        setProofError(data.error || "Failed to verify completion");
      }
    } catch {
      setProofError("An unexpected error occurred while verifying");
    } finally {
      setSolvingProblem(false);
    }
  };

  // ── Start a fresh quiz for the current task ──
  const startQuiz = (task: Task) => {
    const qs = pickQuizQuestions(task);
    const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizQuestions(shuffled);
    setCurrentQ(0);
    setSelectedOption(null);
    setRevealed(false);
    setScore(0);
    setQuizDone(false);
    setQuizPassed(false);
    setQuizActive(true);
  };

  // ── Handle selecting an option ──
  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedOption(idx);
  };

  // ── Confirm answer and advance ──
  const handleConfirm = () => {
    if (selectedOption === null) return;
    const correct = quizQuestions[currentQ].correct === selectedOption;
    const newScore = correct ? score + 1 : score;
    setScore(newScore);
    setRevealed(true);

    setTimeout(() => {
      if (currentQ + 1 < quizQuestions.length) {
        setCurrentQ((q) => q + 1);
        setSelectedOption(null);
        setRevealed(false);
      } else {
        // Quiz finished
        const passed = newScore >= 4; // need 4/5 correct (80%)
        setQuizPassed(passed);
        setQuizDone(true);
        if (passed) markTaskComplete();
      }
    }, 900);
  };

  // ── Mark task complete in DB ──
  const markTaskComplete = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/roadmap/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: todayTaskRef.current?.id, status: "COMPLETED" }),
      });
      setTimeout(() => {
        setQuizActive(false);
        setSubmitting(false);
        fetchRoadmapData();
      }, 1400);
    } catch {
      setSubmitting(false);
    }
  };

  const todayTaskRef = React.useRef<Task | null>(null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 animate-pulse">
        <div className="h-7 w-56 bg-white/5 rounded-xl" />
        <div className="h-4 w-36 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-[450px] bg-white/5 rounded-2xl" />
          <div className="h-[450px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!roadmap || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-28 text-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto">
          <Target className="w-12 h-12 text-brand-cyan/40" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">No Roadmap Generated</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Please complete the assesment profiling to build your dynamic preparation roadmap.
          </p>
        </div>
        <Link
          href="/profiling"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-2xl shadow-glow-cyan hover:bg-brand-cyan/90 transition-all group"
        >
          <Sparkles className="w-4 h-4" />
          Start Profiling
        </Link>
      </div>
    );
  }

  const sortedPhases  = [...roadmap.phases].sort((a, b) => a.order - b.order);
  const allTasks      = sortedPhases.flatMap((p) => [...p.tasks].sort((a, b) => a.day - b.day));
  
  const firstPendingIdx = allTasks.findIndex((t) => t.status !== "COMPLETED");
  const todayTask     = firstPendingIdx !== -1 ? allTasks[firstPendingIdx] : allTasks[allTasks.length - 1];
  const isAllDone     = firstPendingIdx === -1;

  if (todayTaskRef) todayTaskRef.current = todayTask ?? null;

  const totalDays     = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.day)) : 45;
  const doneTasks     = allTasks.filter((t) => t.status === "COMPLETED").length;
  const progressPct   = Math.min(100, Math.round((doneTasks / allTasks.length) * 100));
  const readinessTier = user.readinessScore >= 7.5 ? "Advanced" : user.readinessScore >= 4.5 ? "Intermediate" : "Beginner";

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-5 pb-16">
      
      {/* ── Compact Header & Inline Progress ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md">
              {readinessTier} Track
            </span>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
              {isAllDone ? "Completed" : `Day ${user.currentDay} of ${totalDays}`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{roadmap.title}</h1>
        </div>

        {/* Compact overall progress bar */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">Roadmap Progress</span>
            <span className="text-brand-cyan">{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Side: Accordion phases */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span>PREPARATION TRACK</span>
            <span>{doneTasks}/{allTasks.length} COMPLETED</span>
          </div>

          <div className="space-y-2">
            {sortedPhases.map((phase, pi) => {
              const startDay  = phase.tasks.length ? Math.min(...phase.tasks.map((t) => t.day)) : phase.order * 7 - 6;
              const endDay    = phase.tasks.length ? Math.max(...phase.tasks.map((t) => t.day)) : phase.order * 7;
              
              const phaseDone = phase.tasks.filter((t) => t.status === "COMPLETED").length;
              const isPhaseComplete = phaseDone === phase.tasks.length;
              
              const isPhaseActive = !isPhaseComplete && phase.tasks.some(t => {
                const gIdx = allTasks.findIndex(at => at.id === t.id);
                return gIdx === firstPendingIdx;
              });

              const phColors = ["cyan", "blue", "teal", "purple", "orange", "green"][pi % 6];
              const clr: Record<string, string> = {
                cyan:   "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5",
                blue:   "text-brand-blue border-brand-blue/20 bg-brand-blue/5",
                teal:   "text-brand-teal border-brand-teal/20 bg-brand-teal/5",
                purple: "text-brand-purple border-brand-purple/20 bg-brand-purple/5",
                orange: "text-brand-orange border-brand-orange/20 bg-brand-orange/5",
                green:  "text-brand-green border-brand-green/20 bg-brand-green/5",
              };

              const isOpen = expandedPhaseId === phase.id;

              return (
                <div
                  key={phase.id}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isOpen ? "border-white/10 bg-white/[0.01]" : "border-white/[0.04] bg-dark-card"
                  }`}
                >
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => setExpandedPhaseId(isOpen ? null : phase.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left focus:outline-none"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${clr[phColors] || clr.cyan}`}>
                      {isPhaseComplete ? <CheckCircle2 className="w-4 h-4" /> :
                       isPhaseActive   ? <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> :
                                         <Lock className="w-3.5 h-3.5 opacity-40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{phase.title}</span>
                      <p className="text-[10px] text-gray-500">Days {startDay}–{endDay} · {phaseDone}/{phase.tasks.length} done</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Tasks nested inside phase */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-black/10 border-t border-white/[0.03]"
                      >
                        <div className="divide-y divide-white/[0.03]">
                          {[...phase.tasks].sort((a, b) => a.day - b.day).map((task) => {
                            const globalIdx = allTasks.findIndex((t) => t.id === task.id);
                            const isLocked = firstPendingIdx !== -1 && globalIdx > firstPendingIdx;
                            const isToday = !isLocked && todayTask && task.id === todayTask.id;
                            const isDone  = task.status === "COMPLETED";
                            const pMeta   = resolvePlatform(task.description, task.type, task.title);
                            const PlatformIcon = pMeta.icon;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.01] transition-colors ${
                                  isToday ? "bg-brand-cyan/[0.03]" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                                  ) : isLocked ? (
                                    <Lock className="w-4 h-4 text-gray-600 shrink-0" />
                                  ) : isToday ? (
                                    <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan/20 shrink-0 animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                                      <span className="text-[8px] text-gray-500 font-bold">{task.day}</span>
                                    </div>
                                  )}
                                  <span className={`text-xs font-medium truncate ${
                                    isDone ? "text-gray-600 line-through" : isLocked ? "text-gray-600 select-none cursor-not-allowed" : "text-gray-300"
                                  }`}>
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                    isLocked ? "text-gray-600 bg-white/5 border-white/15" : `${pMeta.color} ${pMeta.bg} ${pMeta.border}`
                                  }`}>
                                    {!isLocked && <PlatformIcon className="w-2.5 h-2.5" />}
                                    {isLocked ? "Locked" : pMeta.label}
                                  </span>
                                  {task.description && !isLocked && (
                                    <a
                                      href={getAccurateResourceUrl(task.title, task.description)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => handleLinkVisit(task.id)}
                                      className="p-1 rounded-md bg-white/5 border border-white/10 hover:text-brand-cyan hover:border-brand-cyan/20 transition-all text-gray-500"
                                      title={`Solve/Study on ${pMeta.label}`}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sidebar */}
        <div className="space-y-4">
          
          {/* Today's Focus Card / Completion Card */}
          {isAllDone ? (
            <div className="relative overflow-hidden rounded-xl border border-brand-green/20 bg-gradient-to-br from-brand-green/10 via-brand-blue/5 to-transparent p-4">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-green/5 blur-2xl pointer-events-none" />
              <div className="relative space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-brand-green uppercase tracking-widest">CONGRATULATIONS!</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">All Tasks Completed!</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You have successfully finished your preparation track. Ready to test your skills?
                </p>
                <Link
                  href="/mock-interview"
                  className="w-full py-2 bg-brand-green text-dark-bg font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-brand-green/95 transition-all text-xs shadow-glow-green"
                >
                  Start AI Mock Interview
                </Link>
              </div>
            </div>
          ) : todayTask ? (() => {
            const pMeta = resolvePlatform(todayTask.description, todayTask.type, todayTask.title);
            const PlatformIcon = pMeta.icon;
            const linkVisited = Boolean(visitedLinks[todayTask.id]);
            return (
              <div className="relative overflow-hidden rounded-xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/10 via-brand-blue/5 to-transparent p-4">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-cyan/5 blur-3xl pointer-events-none" />
                <div className="relative space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-cyan uppercase tracking-widest">ACTIVE TASK · DAY {todayTask.day}</span>
                    <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${pMeta.color} ${pMeta.bg} ${pMeta.border}`}>
                      <PlatformIcon className="w-2.5 h-2.5" />
                      {pMeta.label}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white leading-tight">{todayTask.title}</h3>
                  
                  <p className="text-[11px] text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-2.5 rounded-lg">
                    💡 <strong>Step 1:</strong> Click the resource link below to solve/study on {pMeta.label}.<br />
                    💡 <strong>Step 2:</strong> Submit proof of your completed work to unlock the quiz!
                  </p>
                  
                  {(() => {
                    const accurateUrl = getAccurateResourceUrl(todayTask.title, todayTask.description);
                    return (
                      <a
                        href={accurateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLinkVisit(todayTask.id)}
                        className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs shadow-glow-cyan ${
                          linkVisited
                            ? "bg-brand-green/20 border border-brand-green/40 text-brand-green"
                            : "bg-brand-cyan text-dark-bg hover:bg-brand-cyan/95"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {linkVisited ? `✅ Visited ${pMeta.label} Resource` : `Open & Study on ${pMeta.label}`}
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })() : null}

          {/* Quiz-Gated Task Completion Section */}
          {!isAllDone && todayTask && (
            <div className="glass-card rounded-xl p-4 space-y-3 border border-white/[0.04]">
              {!quizActive ? (
                // Pre-quiz state: ALL task types need solving/completing 5 items first with realistic proof
                (() => {
                  const currentSolved = solvedCounts[todayTask.id] ?? todayTask._count?.solvedProblems ?? 0;
                  const quizReady = currentSolved >= REQUIRED_SOLVED;
                  const solvedPct = Math.min(100, Math.round((currentSolved / REQUIRED_SOLVED) * 100));
                  const linkVisited = Boolean(visitedLinks[todayTask.id]);

                  // Adaptive labels based on task type
                  const taskLabels = todayTask.type === "PROBLEM"
                    ? { doneMsg: "✅ 5 Problems Solved & Verified!", pendingMsg: "🔥 Practice 5 Questions First", btnLabel: "⚡ Submit Proof & Verify Question", description: "Solve", itemName: "question", allDone: "questions solved & verified" }
                    : todayTask.type === "MOCK"
                    ? { doneMsg: "✅ 5 Practices Verified!", pendingMsg: "🎯 Practice 5 Items First", btnLabel: "⚡ Submit Proof & Verify Practice", description: "Complete", itemName: "practice item", allDone: "practice items completed" }
                    : { doneMsg: "✅ 5 Checkpoints Verified!", pendingMsg: "📚 Study 5 Questions/Checkpoints First", btnLabel: "⚡ Submit Proof & Verify Checkpoint", description: "Complete", itemName: "question", allDone: "questions verified" };

                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-brand-cyan shrink-0" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Realistic Work Verification</h4>
                      </div>

                      {/* Solve/Complete gate for ALL task types */}
                      <div className={`rounded-lg p-3 border space-y-2.5 ${
                        quizReady
                          ? "border-brand-green/20 bg-brand-green/[0.04]"
                          : "border-brand-orange/20 bg-brand-orange/[0.04]"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            quizReady ? "text-brand-green" : "text-brand-orange"
                          }`}>
                            {quizReady ? taskLabels.doneMsg : taskLabels.pendingMsg}
                          </span>
                          <span className={`text-xs font-bold ${
                            quizReady ? "text-brand-green" : "text-brand-orange"
                          }`}>
                            {currentSolved}/{REQUIRED_SOLVED}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              quizReady
                                ? "bg-gradient-to-r from-brand-green to-brand-teal"
                                : "bg-gradient-to-r from-brand-orange to-brand-cyan"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${solvedPct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>

                        {/* Individual progress dots */}
                        <div className="flex gap-1.5">
                          {Array.from({ length: REQUIRED_SOLVED }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                i < currentSolved ? "bg-brand-green" : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>

                        {!quizReady && (
                          <>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                              {!linkVisited ? (
                                <span className="text-brand-orange font-semibold">
                                  ⚠️ Click the resource link above to open and study the platform first.
                                </span>
                              ) : (
                                <span>
                                  Submit proof of work (submission URL or solution summary) for each of your {REQUIRED_SOLVED - currentSolved} remaining {taskLabels.itemName}{REQUIRED_SOLVED - currentSolved > 1 ? "s" : ""}.
                                </span>
                              )}
                            </p>

                            <button
                              onClick={() => {
                                if (!linkVisited) {
                                  alert("Please click and open the resource link above first before submitting proof of completion!");
                                  return;
                                }
                                setShowProofModal(true);
                              }}
                              disabled={solvingProblem}
                              className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-all text-xs border ${
                                linkVisited
                                  ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange hover:bg-brand-orange/30 cursor-pointer shadow-glow-orange"
                                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              {taskLabels.btnLabel}
                            </button>
                          </>
                        )}

                        {quizReady && (
                          <p className="text-[10px] text-brand-green leading-relaxed font-semibold">
                            🎉 All {REQUIRED_SOLVED} {taskLabels.allDone}! Quiz is now unlocked below!
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => startQuiz(todayTask)}
                        disabled={!quizReady}
                        className={`w-full py-2.5 font-bold rounded-lg flex items-center justify-center gap-2 transition-all text-xs ${
                          quizReady
                            ? "bg-gradient-to-r from-brand-cyan to-brand-blue text-dark-bg hover:opacity-90 shadow-glow-cyan cursor-pointer"
                            : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        {quizReady
                          ? "Take Quiz to Complete Task"
                          : `🔒 Verify ${REQUIRED_SOLVED} Items to Unlock Quiz`}
                      </button>
                    </>
                  );
                })()
              ) : quizDone ? (
                // Quiz finished — show result
                <>
                  <div className={`rounded-lg p-4 border flex flex-col gap-3 ${
                    quizPassed
                      ? "border-brand-green/20 bg-brand-green/[0.04]"
                      : "border-brand-red/20 bg-brand-red/[0.03]"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        quizPassed ? "bg-brand-green/10" : "bg-brand-red/10"
                      }`}>
                        {quizPassed
                          ? <Trophy className="w-5 h-5 text-brand-green" />
                          : <XCircle className="w-5 h-5 text-brand-red" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${
                          quizPassed ? "text-brand-green" : "text-brand-red"
                        }`}>
                          {quizPassed ? "Task Unlocked! 🎉" : "Try Again"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Score: {score}/{quizQuestions.length} · {quizPassed ? "Moving to next task..." : "Need 4/5 to pass"}
                        </p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            quizPassed ? "bg-brand-green" : "bg-brand-red"
                          }`}
                          style={{ width: `${(score / quizQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!quizPassed && (
                      <button
                        onClick={() => startQuiz(todayTask)}
                        className="w-full py-2 bg-white/5 border border-white/10 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Quiz
                      </button>
                    )}
                  </div>
                </>
              ) : (
                // Active quiz — show question
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-brand-cyan" />
                        <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Quiz · Q{currentQ + 1}/{quizQuestions.length}</span>
                      </div>
                      {/* dot progress */}
                      <div className="flex gap-1">
                        {quizQuestions.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i < currentQ ? "bg-brand-green" : i === currentQ ? "bg-brand-cyan" : "bg-white/10"
                          }`} />
                        ))}
                      </div>
                    </div>

                    {/* Question */}
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      {quizQuestions[currentQ]?.q}
                    </p>

                    {/* Options */}
                    <div className="space-y-1.5">
                      {quizQuestions[currentQ]?.options.map((opt, i) => {
                        const isCorrect  = i === quizQuestions[currentQ].correct;
                        const isSelected = i === selectedOption;
                        let cls = "border border-white/10 bg-white/[0.02] text-gray-300 hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.03]";
                        if (revealed) {
                          if (isCorrect)  cls = "border border-brand-green/40 bg-brand-green/10 text-brand-green font-semibold";
                          else if (isSelected && !isCorrect) cls = "border border-brand-red/40 bg-brand-red/10 text-brand-red";
                          else cls = "border border-white/5 bg-white/[0.01] text-gray-600";
                        } else if (isSelected) {
                          cls = "border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan font-semibold";
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={revealed}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center gap-2 ${cls} ${
                              revealed ? "cursor-default" : "cursor-pointer"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px] font-bold ${
                              revealed && isCorrect
                                ? "border-brand-green bg-brand-green/20 text-brand-green"
                                : revealed && isSelected && !isCorrect
                                ? "border-brand-red bg-brand-red/20 text-brand-red"
                                : isSelected
                                ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                                : "border-white/20 text-gray-500"
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Confirm button */}
                    <button
                      onClick={handleConfirm}
                      disabled={selectedOption === null || revealed}
                      className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all ${
                        selectedOption === null || revealed
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 shadow-glow-cyan cursor-pointer"
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      {revealed ? "Loading next..." : "Confirm Answer"}
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Mini score progression card */}
          <div className="glass-card rounded-xl p-4 space-y-2 border border-white/[0.04]">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-brand-cyan" />Readiness Curve</span>
              <span>Score: {user.readinessScore.toFixed(1)}</span>
            </div>
            <ReadinessChart score={user.readinessScore} analytics={user.analytics} />
          </div>

          {/* Focus Subjects */}
          {weakAreas.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">FOCUS AREAS</span>
              {weakAreas.map((w, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-dark-card border border-dark-border hover:border-white/10 transition-all">
                  <div className={`w-1 h-6 rounded-full shrink-0 ${w.severity === "HIGH" ? "bg-brand-red" : "bg-brand-orange"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{w.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{w.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Topic Checkpoint Question Verification Modal ── */}
      <AnimatePresence>
        {showProofModal && todayTask && (() => {
          const currentSolvedIdx = solvedCounts[todayTask.id] ?? todayTask._count?.solvedProblems ?? 0;
          const checkpointQs = getCheckpointQuestionsForTask(todayTask);
          const activeQ = checkpointQs[currentSolvedIdx % checkpointQs.length];
          const accurateUrl = getAccurateResourceUrl(todayTask.title, todayTask.description);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-card border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setProofError(null);
                    setProofInput("");
                    setCheckpointSelectedOpt(null);
                    setCheckpointFeedback(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Topic Checkpoint Evaluation</h3>
                    <p className="text-xs text-brand-cyan font-semibold">
                      Checkpoint Question #{currentSolvedIdx + 1} of 5 · {todayTask.title}
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">
                    Evaluation Question #{currentSolvedIdx + 1}
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    {activeQ.q}
                  </p>

                  <div className="space-y-2 pt-1">
                    {activeQ.options.map((opt, i) => {
                      const isSelected = checkpointSelectedOpt === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setCheckpointSelectedOpt(i)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 border ${
                            isSelected
                              ? "border-brand-cyan bg-brand-cyan/15 text-white font-semibold shadow-glow-cyan"
                              : "border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isSelected ? "border-brand-cyan bg-brand-cyan text-dark-bg" : "border-white/20 text-gray-400"
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Evaluation Feedback Alert */}
                {checkpointFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-2 ${
                    checkpointFeedback.isCorrect
                      ? "border-brand-green/30 bg-brand-green/10 text-brand-green"
                      : "border-brand-red/30 bg-brand-red/10 text-brand-red"
                  }`}>
                    {checkpointFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span>{checkpointFeedback.message}</span>
                  </div>
                )}

                {proofError && !checkpointFeedback && (
                  <p className="text-[11px] text-brand-red font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {proofError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowProofModal(false);
                      setProofError(null);
                      setProofInput("");
                      setCheckpointSelectedOpt(null);
                      setCheckpointFeedback(null);
                    }}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitProofAndSolve(todayTask.id, todayTask.type, checkpointSelectedOpt, activeQ)}
                    disabled={solvingProblem || checkpointSelectedOpt === null}
                    className="flex-1 py-2.5 bg-brand-cyan text-dark-bg rounded-xl text-xs font-bold hover:bg-brand-cyan/90 transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {solvingProblem ? (
                      <span>Evaluating...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit & Verify Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
