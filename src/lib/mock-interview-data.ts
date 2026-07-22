export type MockInterviewDomainId = string;

export type MockInterviewQuestion = {
  id: string;
  question: string;
  idealAnswer: string;
  keyConcepts: string[];
  difficulty?: string;
  expectedQuality?: string;
  reviewerTone?: string;
  intent?: string;
};

export type MockInterviewDomain = {
  id: MockInterviewDomainId;
  name: string;
  questions: MockInterviewQuestion[];
};

// Add or replace your mock interview dataset here.
// Keep each item in this shape: question, idealAnswer, and keyConcepts.
export const mockInterviewDomains: MockInterviewDomain[] = [
  {
    id: "dsa",
    name: "DSA",
    questions: [
      {
        id: "dsa-array-linked-list",
        question: "Explain the difference between an array and a linked list.",
        idealAnswer:
          "Arrays store elements in contiguous memory and provide O(1) random access, but insertion and deletion can be O(n). Linked lists store nodes with pointers, grow dynamically, and allow efficient insertion or deletion when the node is known, but access is O(n).",
        keyConcepts: ["contiguous memory", "random access", "linked list", "nodes", "pointers", "insertion", "deletion", "O(1)", "O(n)"],
      },
      {
        id: "dsa-dp",
        question: "What is dynamic programming? Give one example.",
        idealAnswer:
          "Dynamic programming solves problems by breaking them into overlapping subproblems with optimal substructure and storing results using memoization or tabulation. Fibonacci, knapsack, and longest common subsequence are common examples.",
        keyConcepts: ["overlapping subproblems", "optimal substructure", "memoization", "tabulation", "fibonacci", "knapsack"],
      },
      {
        id: "dsa-bfs-dfs",
        question: "Explain BFS and DFS traversal in graphs.",
        idealAnswer:
          "BFS explores level by level using a queue and can find shortest paths in unweighted graphs. DFS explores deeply using recursion or a stack and is useful for cycle detection, connected components, and topological sorting.",
        keyConcepts: ["BFS", "DFS", "queue", "stack", "recursion", "shortest path", "cycle detection", "topological sort"],
      },
    ],
  },
  {
    id: "dbms",
    name: "DBMS",
    questions: [
      {
        id: "dbms-normalization",
        question: "What is normalization? Explain up to 3NF.",
        idealAnswer:
          "Normalization organizes data to reduce redundancy and anomalies. 1NF requires atomic values, 2NF removes partial dependency on composite keys, and 3NF removes transitive dependency so non-key attributes depend only on the key.",
        keyConcepts: ["normalization", "redundancy", "1NF", "2NF", "3NF", "partial dependency", "transitive dependency", "anomalies"],
      },
      {
        id: "dbms-joins",
        question: "Explain the main types of SQL joins.",
        idealAnswer:
          "INNER JOIN returns matching rows, LEFT JOIN returns all rows from the left table with matching right rows, RIGHT JOIN does the reverse, FULL OUTER JOIN returns all rows from both tables, and CROSS JOIN returns a Cartesian product.",
        keyConcepts: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "matching rows", "NULL"],
      },
    ],
  },
  {
    id: "os",
    name: "OS",
    questions: [
      {
        id: "os-deadlock",
        question: "What is deadlock? Explain its four necessary conditions.",
        idealAnswer:
          "Deadlock occurs when processes wait forever for resources held by each other. The four conditions are mutual exclusion, hold and wait, no preemption, and circular wait.",
        keyConcepts: ["deadlock", "mutual exclusion", "hold and wait", "no preemption", "circular wait", "resources"],
      },
    ],
  },
  {
    id: "cn",
    name: "CN",
    questions: [
      {
        id: "cn-osi",
        question: "Explain the seven layers of the OSI model.",
        idealAnswer:
          "The OSI model has physical, data link, network, transport, session, presentation, and application layers. It separates networking responsibilities and helps standardize communication between systems.",
        keyConcepts: ["physical", "data link", "network", "transport", "session", "presentation", "application", "layers"],
      },
    ],
  },
  {
    id: "web",
    name: "Web Dev",
    questions: [
      {
        id: "web-rest-graphql",
        question: "What is the difference between REST and GraphQL?",
        idealAnswer:
          "REST usually exposes multiple resource endpoints and uses HTTP methods. GraphQL commonly uses a single endpoint where clients request exactly the fields they need, reducing over-fetching and under-fetching but adding schema complexity.",
        keyConcepts: ["REST", "GraphQL", "endpoints", "HTTP methods", "single endpoint", "schema", "over-fetching", "under-fetching"],
      },
    ],
  },
];
