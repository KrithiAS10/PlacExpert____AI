export interface QuestionItem {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const TOPIC_QUESTION_DATABASE: Record<string, QuestionItem[]> = {
  // ─────────────────────────────────────────────
  // 1. JAVA SETUP & JAVA CORE (30+ questions)
  // ─────────────────────────────────────────────
  java_setup: [
    { q: "Which CLI tool in the JDK compiles Java source files (.java) into bytecode (.class)?", options: ["java", "javac", "javadoc", "jar"], correct: 1, explanation: "javac (Java Compiler) reads .java source code files and compiles them into .class bytecode." },
    { q: "What should the JAVA_HOME environment variable point to?", options: ["The JRE bin directory", "The root directory of your installed JDK", "The System32 directory", "The C:\\Users home folder"], correct: 1, explanation: "JAVA_HOME must point to the root directory where the JDK is installed." },
    { q: "Which Java component executes compiled bytecode on any host operating system?", options: ["JVM (Java Virtual Machine)", "JDK Compiler", "JavaFX Engine", "Maven"], correct: 0, explanation: "The JVM is the engine that provides the runtime environment to execute Java bytecode." },
    { q: "What file extension do compiled Java bytecode files have?", options: [".exe", ".jar", ".class", ".java"], correct: 2, explanation: "Java compiler generates .class files containing JVM bytecode." },
    { q: "Which IDE is widely considered the industry standard for modern enterprise Java development?", options: ["Notepad++", "IntelliJ IDEA", "Turbo C++", "Sublime Text"], correct: 1, explanation: "IntelliJ IDEA by JetBrains is widely used for Java development." },
    { q: "What is the difference between JDK and JRE?", options: ["JDK is for running only, JRE includes compiler", "JDK contains development tools and compiler; JRE is only runtime", "They are identical", "JRE is for C++, JDK is for Java"], correct: 1, explanation: "JDK (Java Development Kit) includes the compiler (javac) and tools, while JRE only runs bytecode." },
    { q: "Which build tool uses pom.xml for dependency management in Java?", options: ["Gradle", "Maven", "Ant", "Make"], correct: 1, explanation: "Apache Maven uses Project Object Model (pom.xml) for dependency and build configuration." },
    { q: "How do you run a compiled Java class named 'Main' from the command line?", options: ["javac Main", "java Main.class", "java Main", "run Main"], correct: 2, explanation: "The 'java Main' command instructs the JVM to load and execute the class Main." },
    { q: "What is the role of the CLASSPATH environment variable in Java?", options: ["Defines JDK installation path", "Tells the JVM and javac where to find user-defined classes and packages", "Sets RAM limit", "Configures garbage collection"], correct: 1, explanation: "CLASSPATH specifies the paths to bytecode directories and external JAR libraries." },
    { q: "What does the 'jar' command utility do in Java?", options: ["Compiles code to native binary", "Packages multiple .class files and metadata into a single compressed archive", "Runs unit tests", "Formats source code"], correct: 1, explanation: "The jar tool creates, views, and extracts Java Archive (.jar) zip packages." },
    { q: "What is the JIT (Just-In-Time) compiler in the JVM?", options: ["Compiles Java source to bytecode", "Compiles frequently executed bytecode into native machine code at runtime", "Checks syntax before compilation", "Cleans unused memory"], correct: 1, explanation: "JIT analyzes hot spots during runtime and translates bytecode into native CPU instructions for speed." },
    { q: "Which garbage collection region in the HotSpot JVM stores newly instantiated objects?", options: ["Old / Tenured Generation", "Eden Space in Young Generation", "Metaspace", "Permanent Generation"], correct: 1, explanation: "New objects are initially allocated in the Eden space of the Young Generation." },
    { q: "Which file in Gradle defines project dependencies and build tasks?", options: ["build.gradle or build.gradle.kts", "package.json", "Makefile", "settings.xml"], correct: 0, explanation: "build.gradle configures plugins, repositories, and dependencies in Gradle." },
    { q: "What does the 'javac -d <directory> Source.java' command option do?", options: ["Deletes source files", "Specifies destination directory for generated .class files", "Runs debugger", "Decompiles bytecode"], correct: 1, explanation: "-d sets the output directory for compiled class files." },
    { q: "What is the purpose of Maven Wrapper (mvnw)?", options: ["Encrypts credentials", "Allows executing Maven builds without pre-installing Maven on the host machine", "Runs Java in browser", "Converts Java to Kotlin"], correct: 1, explanation: "mvnw downloads and executes the declared version of Maven automatically." },
    { q: "In Java Collections, which class implements a resizable array?", options: ["LinkedList", "ArrayList", "Vector", "HashSet"], correct: 1, explanation: "ArrayList is backed by a dynamic array that grows automatically." },
    { q: "What does the Java 8 Streams map() operation do?", options: ["Filters items based on a predicate", "Transforms each element by applying a function", "Reduces elements to a single value", "Sorts elements in place"], correct: 1, explanation: "map() transforms elements of a stream using a mapping function." },
    { q: "In Java, what is the default capacity of a newly created ArrayList?", options: ["0", "10", "16", "32"], correct: 1, explanation: "An empty ArrayList initializes with default capacity of 10 upon first element addition." },
    { q: "Which Java collection does NOT allow duplicate elements?", options: ["List", "Set (e.g. HashSet, TreeSet)", "ArrayList", "Queue"], correct: 1, explanation: "Set interface models mathematical sets and disallows duplicate entries." },
    { q: "What is the purpose of the 'transient' keyword in Java?", options: ["Makes variable immutable", "Prevents a field from being serialized", "Enables thread-safe access", "Allows variable to be shared across classes"], correct: 1, explanation: "transient fields are omitted during object serialization." },
    { q: "What does the 'volatile' keyword guarantee in Java multi-threading?", options: ["Atomic operations for all expressions", "Reads and writes to the variable are directly visible to all threads without CPU caching", "Thread sleep", "Method locking"], correct: 1, explanation: "volatile guarantees memory visibility across CPU cores by bypassing thread-local caches." },
    { q: "What is the difference between Comparable and Comparator in Java?", options: ["Comparable defines natural ordering via compareTo() inside the class; Comparator defines custom external ordering via compare()", "Comparable is faster", "Comparator is for strings only", "They are identical"], correct: 0, explanation: "Comparable is implemented on the domain class; Comparator is passed as separate comparator objects." },
    { q: "What does Java 8 Optional<T> prevent?", options: ["Syntax errors", "NullPointerExceptions by encapsulating optional presence of values", "Memory leaks", "Infinite loops"], correct: 1, explanation: "Optional<T> represents a container that either has a value or is empty." },
    { q: "What is the difference between String, StringBuilder, and StringBuffer in Java?", options: ["String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and synchronized (thread-safe)", "String is mutable", "StringBuilder is slower", "They are aliases"], correct: 0, explanation: "StringBuilder is faster for single-threaded string manipulations; StringBuffer is synchronized." },
    { q: "What is a Java Record (introduced in Java 14+)?", options: ["A database table", "An immutable transparent carrier for a shallowly immutable tuple of data", "An audio format", "A thread pool"], correct: 1, explanation: "Records generate constructor, getters, equals(), hashCode(), and toString() automatically." },
    { q: "Which exception is thrown when an array is accessed with an invalid index in Java?", options: ["NullPointerException", "ArrayIndexOutOfBoundsException", "IllegalArgumentException", "IndexMismatchError"], correct: 1, explanation: "ArrayIndexOutOfBoundsException is thrown when accessing index < 0 or >= array.length." },
    { q: "What is the role of the 'final' keyword on a Java method?", options: ["Makes method private", "Prevents the method from being overridden by subclasses", "Deletes method after execution", "Runs method on separate thread"], correct: 1, explanation: "A final method cannot be overridden in any subclass." },
    { q: "Which interface must be implemented to create a thread via the interface approach in Java?", options: ["Runnable", "Threadable", "Executable", "CallableRunner"], correct: 0, explanation: "Implementing java.lang.Runnable and defining run() is standard." },
    { q: "In Java memory management, where are local primitive variables stored?", options: ["Heap space", "Call Stack frame", "Metaspace", "Hard drive swap"], correct: 1, explanation: "Local primitive variables and method frames reside on the thread stack." },
    { q: "What does the 'synchronized' block provide in Java concurrency?", options: ["Parallel computation without locks", "Mutual exclusion lock on a monitor object preventing simultaneous access", "Faster memory garbage collection", "Database transaction rollback"], correct: 1, explanation: "synchronized acquires an intrinsic monitor lock on the specified object." }
  ],

  // ─────────────────────────────────────────────
  // 2. PYTHON SETUP & PYTHON CORE (30+ questions)
  // ─────────────────────────────────────────────
  python_setup: [
    { q: "Which built-in module creates isolated virtual environments in Python 3?", options: ["pip", "venv", "pyenv", "conda"], correct: 1, explanation: "python -m venv creates an isolated virtual environment." },
    { q: "Which command installs third-party packages from PyPI?", options: ["pip install <package>", "python get <package>", "npm install <package>", "apt-get python-<package>"], correct: 0, explanation: "pip is the official package installer for Python." },
    { q: "Which standard file lists project Python package dependencies?", options: ["package.json", "requirements.txt", "Pipfile.lock", "setup.py"], correct: 1, explanation: "requirements.txt lists dependencies for pip install -r requirements.txt." },
    { q: "How do you run a Python script named app.py from terminal?", options: ["exec app.py", "python app.py", "run app.py", "compile app.py"], correct: 1, explanation: "python app.py executes the script through the Python interpreter." },
    { q: "What is PEP 8 in the Python ecosystem?", options: ["A performance compiler", "The official style guide for Python code formatting", "A virtual machine spec", "A database connector"], correct: 1, explanation: "PEP 8 provides guidelines and best practices for writing clean Python code." },
    { q: "What command creates a requirements.txt file with current environment packages?", options: ["pip save", "pip freeze > requirements.txt", "pip dump", "python export"], correct: 1, explanation: "pip freeze outputs all installed packages in the format package==version." },
    { q: "Which tool is commonly used for Python code formatting according to PEP 8?", options: ["ESLint", "Black / autopep8", "Prettier", "Checkstyle"], correct: 1, explanation: "Black and autopep8 are standard auto-formatters for Python." },
    { q: "How do you activate a virtual environment named 'env' on Windows in cmd/powershell?", options: ["env\\Scripts\\activate", "source env/bin/activate", "python start env", "pip activate"], correct: 0, explanation: "On Windows, the activation script is located under env\\Scripts\\activate." },
    { q: "What does python's __pycache__ folder contain?", options: ["Cached web downloads", "Compiled bytecode files (.pyc) for faster loading", "Source backups", "Log traces"], correct: 1, explanation: "Python stores precompiled bytecode in __pycache__ to avoid recompiling unchanged files." },
    { q: "What is PyPI?", options: ["Python Profiling Interface", "Python Package Index — official third-party repository", "Python Interpreter Engine", "Python Plugin Installer"], correct: 1, explanation: "PyPI (Python Package Index) hosts hundreds of thousands of open-source Python packages." },
    { q: "Which interactive environment allows executing Python code in browser cells?", options: ["Notepad", "Jupyter Notebook", "Vim", "Command Prompt"], correct: 1, explanation: "Jupyter notebooks allow code execution, markdown, and charts in browser cells." },
    { q: "What is the purpose of the pyproject.toml file in modern Python packaging?", options: ["Database schema configuration", "Unified specification for build tool requirements and project metadata (PEP 518/621)", "CSS theme settings", "OS kernel configuration"], correct: 1, explanation: "pyproject.toml is the standardized modern build system configuration for Python." },
    { q: "Which command upgrades an already installed pip package?", options: ["pip update <pkg>", "pip install --upgrade <pkg>", "pip refresh <pkg>", "pip get -u <pkg>"], correct: 1, explanation: "pip install --upgrade installs the latest compatible release from PyPI." },
    { q: "What does the command 'python -m pip' do compared to running 'pip' directly?", options: ["Runs pip with root privileges", "Ensures pip is executed for the exact Python interpreter invoked", "Compiles pip from source", "Runs in silent mode"], correct: 1, explanation: "python -m pip avoids PATH discrepancies and targets the active Python environment." },
    { q: "What does the Python debugger command 'pdb.set_trace()' do?", options: ["Prints memory stats", "Sets a hard breakpoint to inspect variables in terminal", "Restarts the script", "Cleans cache"], correct: 1, explanation: "pdb.set_trace() pauses script execution and launches an interactive debugger." },
    { q: "What is the output of [x**2 for x in range(5) if x % 2 == 0] in Python?", options: ["[0, 1, 4, 9, 16]", "[0, 4, 16]", "[1, 9]", "[4, 16]"], correct: 1, explanation: "For x in 0, 2, 4 -> 0^2 = 0, 2^2 = 4, 4^2 = 16." },
    { q: "In Python's collections module, which structure provides a dictionary that returns default values for missing keys?", options: ["OrderedDict", "defaultdict", "Counter", "namedtuple"], correct: 1, explanation: "defaultdict(factory) automatically initializes missing keys with default values." },
    { q: "What is the Global Interpreter Lock (GIL) in CPython?", options: ["A file lock on disk", "A mutex that prevents multiple native threads from executing Python bytecodes simultaneously", "A security firewall", "A garbage collection algorithm"], correct: 1, explanation: "GIL ensures thread safety in CPython memory management by serializing bytecode execution." },
    { q: "What keyword creates a generator function in Python that produces items lazily on demand?", options: ["return", "yield", "generate", "lazy"], correct: 1, explanation: "yield pauses function execution and returns a value to the caller as an iterator." },
    { q: "What is the time complexity of looking up a key in a Python dict on average?", options: ["O(N)", "O(1)", "O(log N)", "O(N²)"], correct: 1, explanation: "Python dicts are implemented as hash tables offering average O(1) time complexity." },
    { q: "What does Counter('banana') return from Python's collections module?", options: ["{'b': 1, 'a': 3, 'n': 2}", "6", "['b', 'a', 'n']", "{'banana': 1}"], correct: 0, explanation: "Counter tallies element frequencies into a dictionary-like multiset." },
    { q: "What is a Python Decorator (@decorator)?", options: ["A function that takes another function as an argument and extends its behavior without modifying its source code", "A CSS styling rule", "A class destructor", "A package manager"], correct: 0, explanation: "Decorators wrap functions with reusable pre/post logic." },
    { q: "What is the difference between 'is' and '==' in Python?", options: ["'is' checks object identity (same memory address); '==' checks value equality", "'is' is for numbers only", "'==' checks memory address", "They are identical"], correct: 0, explanation: "'is' compares pointer references; '==' compares evaluated equality." },
    { q: "What does the 'zip()' built-in function do in Python?", options: ["Compresses files to .zip", "Pairs corresponding elements from multiple iterables into tuples", "Sorts numbers", "Splits strings"], correct: 1, explanation: "zip([1,2], ['a','b']) yields (1, 'a'), (2, 'b')." },
    { q: "How does Python handle memory management and cleanup?", options: ["Manual free() calls", "Reference counting combined with a cyclic garbage collector", "Static allocation only", "Kernel swap only"], correct: 1, explanation: "Python automatically reaps objects when reference count drops to zero, and detects cyclic references." },
    { q: "What does the 'pass' statement do in Python?", options: ["Exits loop", "A null placeholder statement that executes nothing", "Skips next function", "Prints error"], correct: 1, explanation: "pass is a syntactical no-op placeholder." },
    { q: "What is the difference between list.append() and list.extend() in Python?", options: ["append adds an object as a single element; extend iterates and appends all items from an iterable", "extend is for strings only", "append is faster", "They are aliases"], correct: 0, explanation: "append([1,2]) nests the list; extend([1,2]) flattens items into the list." },
    { q: "What does *args and **kwargs in a Python function signature allow?", options: ["Pointers and addresses", "Variable number of positional arguments (*args) and keyword arguments (**kwargs)", "Multi-threading", "Type annotations"], correct: 1, explanation: "*args unpacks positional arguments as a tuple; **kwargs unpacks keyword arguments as a dict." },
    { q: "Which built-in Python function returns an iterator of tuples containing (index, element)?", options: ["index()", "enumerate()", "range()", "iterate()"], correct: 1, explanation: "enumerate(iterable) produces (0, seq[0]), (1, seq[1]), etc." }
  ],

  // ─────────────────────────────────────────────
  // 3. C++ SETUP & C++ CORE (30+ questions)
  // ─────────────────────────────────────────────
  cpp_setup: [
    { q: "Which command invokes the GNU C++ compiler to compile main.cpp?", options: ["gcc main.cpp", "g++ main.cpp -o main", "cpp main.cpp", "make main.cpp"], correct: 1, explanation: "g++ is the standard GNU C++ compiler command." },
    { q: "Which header file must be included for std::cout and std::cin?", options: ["<stdio.h>", "<iostream>", "<stdlib.h>", "<math.h>"], correct: 1, explanation: "<iostream> defines standard input/output stream objects." },
    { q: "What extension is standard for C++ source code files?", options: [".c", ".cpp", ".class", ".cs"], correct: 1, explanation: ".cpp (or .cc / .cxx) is standard for C++ source files." },
    { q: "Which keyword brings standard C++ library symbols into the global namespace?", options: ["import std;", "using namespace std;", "include <std>", "package std;"], correct: 1, explanation: "using namespace std; imports the std namespace." },
    { q: "What tool automates cross-platform building of large C++ projects?", options: ["CMake", "npm", "pip", "Gradle"], correct: 0, explanation: "CMake generates platform-native build files for C++." },
    { q: "What does the compiler flag -Wall do in g++?", options: ["Wall off errors", "Enable all standard compiler warnings", "Generate write-all logs", "Compile 64-bit"], correct: 1, explanation: "-Wall enables all compiler's warning messages to catch subtle bugs." },
    { q: "Which standard header provides vector, map, and algorithm in C++?", options: ["<stl.h>", "<vector>, <map>, <algorithm>", "<collection>", "<std.h>"], correct: 1, explanation: "C++ STL provides dedicated headers like <vector>, <map>, <algorithm>." },
    { q: "What is the role of the linker in C++ compilation?", options: ["Compiles source to assembly", "Combines object files and libraries into an executable", "Preprocesses #include macros", "Runs code"], correct: 1, explanation: "The linker (ld) combines object files and resolves external references into a single binary." },
    { q: "What does the compiler flag -O2 or -O3 specify in g++?", options: ["Output version 2", "Optimization level for runtime performance", "Include 2 headers", "Debug verbosity"], correct: 1, explanation: "-O2 and -O3 enable compiler code optimization for faster execution speed." },
    { q: "What does the flag -std=c++17 or -std=c++20 do in g++?", options: ["Specifies which C++ language standard version to compile against", "Sets maximum memory to 20MB", "Loads 17 threads", "Enables legacy mode"], correct: 0, explanation: "-std specifies the C++ language standard revision." },
    { q: "What is the function of the C++ preprocessor (#include, #define)?", options: ["Executes SQL queries", "Performs text substitution and header inclusion before code compilation", "Links binary objects", "Manages heap memory"], correct: 1, explanation: "The preprocessor processes compiler directives starting with '#' before lexical analysis." },
    { q: "What is an object file (.o or .obj) in C++?", options: ["A finished installer", "Compiled machine code for a single translation unit before linking", "A JSON configuration", "An uncompiled header"], correct: 1, explanation: "Each source file compiles into an object file containing machine instructions." },
    { q: "What is AddressSanitizer (-fsanitize=address) in modern C++ compilers?", options: ["A code formatter", "A memory error detector for buffer overflows, use-after-free, and memory leaks", "A compiler optimization", "A network firewall"], correct: 1, explanation: "ASan instruments binary code to catch memory corruption bugs at runtime." },
    { q: "Which file in CMake specifies targets, sources, and compile flags?", options: ["CMakeLists.txt", "package.json", "Makefile.in", "build.xml"], correct: 0, explanation: "CMakeLists.txt is the project specification file for CMake." },
    { q: "What does header guard (#ifndef HEADER_H ... #endif) prevent in C++?", options: ["Compile-time crashes", "Multiple definition / redefinition errors from double header inclusion", "Syntax errors", "Memory leaks"], correct: 1, explanation: "Header guards ensure a header file is only included once per translation unit." },
    { q: "In C++ STL, which container stores elements in contiguous memory and supports O(1) random access?", options: ["std::list", "std::vector", "std::set", "std::map"], correct: 1, explanation: "std::vector is a dynamic contiguous array with O(1) index access." },
    { q: "Which C++ smart pointer represents exclusive ownership of a dynamically allocated object?", options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"], correct: 1, explanation: "std::unique_ptr cannot be copied, only moved, guaranteeing single ownership." },
    { q: "What is the underlying data structure of std::map in C++?", options: ["Hash Table", "Red-Black Tree (Self-balancing BST)", "Doubly Linked List", "Heap"], correct: 1, explanation: "std::map uses a Red-Black Tree keeping keys sorted with O(log N) operations." },
    { q: "What is std::unordered_map backed by in C++ STL?", options: ["Binary Search Tree", "Hash Table", "B+ Tree", "Array"], correct: 1, explanation: "std::unordered_map is backed by a hash table with average O(1) lookup." },
    { q: "What does RAII (Resource Acquisition Is Initialization) ensure in C++?", options: ["Fast compilation", "Resource lifecycle is tied to object lifetime, preventing resource/memory leaks", "Dynamic typing", "Virtual inheritance"], correct: 1, explanation: "Destructors release held resources automatically when objects go out of scope." },
    { q: "What is std::move in modern C++ (C++11)?", options: ["Copies an object to new memory", "Casts an lvalue to an rvalue reference, enabling efficient resource theft without copying", "Deletes memory", "Moves pointer to disk"], correct: 1, explanation: "std::move enables Move Semantics to avoid expensive deep copies." },
    { q: "What is the difference between passing by value, reference (&), and const reference (const &)?", options: ["Value copies; Reference allows in-place mutation; Const reference avoids copying and prevents mutation", "They all copy data", "Const reference is slowest", "Passing by value is fastest"], correct: 0, explanation: "const & passes large objects efficiently without copy overhead or mutation risk." },
    { q: "What operator in C++ dynamically allocates memory on the Heap?", options: ["malloc() only", "new operator", "alloc()", "create"], correct: 1, explanation: "new allocates heap memory and calls class constructors; delete deallocates and calls destructors." },
    { q: "What is a segmentation fault (SIGSEGV) in C++?", options: ["Compile syntax error", "An attempt by the program to access memory that it does not have authorization to access", "Disk full error", "Infinite recursion without memory access"], correct: 1, explanation: "Segfault occurs on null pointer dereference, wild pointers, or buffer overruns." },
    { q: "What is the purpose of virtual destructors in C++ base classes?", options: ["Speed up deletion", "Ensure the derived class destructor is called when deleting an object through a base pointer", "Make destructor private", "Disable garbage collection"], correct: 1, explanation: "Virtual destructors prevent partial destruction and memory leaks in polymorphic hierarchies." }
  ],

  // ─────────────────────────────────────────────
  // 4. GIT & VERSION CONTROL (25+ questions)
  // ─────────────────────────────────────────────
  git_setup: [
    { q: "Which Git command initializes a new local repository in the current folder?", options: ["git start", "git init", "git new", "git create"], correct: 1, explanation: "git init creates a new .git version control directory." },
    { q: "Which command stages all modified and untracked files for commit?", options: ["git commit -a", "git push", "git add .", "git save"], correct: 2, explanation: "git add . stages all changes in the current directory and subdirectories." },
    { q: "What is the purpose of a .gitignore file?", options: ["Ignore merge conflicts", "Specify intentional untracked files that Git should ignore", "Delete unneeded files", "Lock git branches"], correct: 1, explanation: ".gitignore lists file patterns that Git should avoid tracking (e.g. node_modules, build artifacts)." },
    { q: "Which command switches to an existing branch or creates a new branch named 'feature'?", options: ["git branch switch feature", "git checkout -b feature (or git switch -c feature)", "git move feature", "git fork feature"], correct: 1, explanation: "git checkout -b <name> or git switch -c <name> creates and switches to a new branch." },
    { q: "What is the difference between git fetch and git pull?", options: ["git fetch merges immediately; git pull does not", "git fetch downloads remote changes without merging; git pull downloads and merges", "They are identical", "git fetch is for deleting branches"], correct: 1, explanation: "git fetch retrieves remote commits and references; git pull fetches and automatically merges them into current branch." },
    { q: "Which command records staged snapshots in Git history with a message?", options: ["git snapshot -m 'msg'", "git commit -m 'msg'", "git save 'msg'", "git checkin 'msg'"], correct: 1, explanation: "git commit -m commits staged changes with a descriptive message." },
    { q: "How do you view the chronological history of commits?", options: ["git status", "git history", "git log", "git track"], correct: 2, explanation: "git log displays commit history, authors, dates, and commit hashes." },
    { q: "What does 'git stash' do?", options: ["Deletes all unstaged changes permanently", "Temporarily saves modified tracking files so you have a clean working directory", "Pushes commits to GitHub", "Creates a release tag"], correct: 1, explanation: "git stash shelves dirty working tree changes for later retrieval with git stash pop." },
    { q: "What is git rebase used for?", options: ["Rewriting branch commits linearly on top of another base commit", "Creating a merge commit", "Deleting old branches", "Cloning a remote repo"], correct: 0, explanation: "git rebase reapplies commits on top of another base tip, maintaining a clean linear history." },
    { q: "What does the command 'git diff' show?", options: ["List of all branches", "Unstaged changes between working directory and the staging area (index)", "List of commit authors", "Remote repository URLs"], correct: 1, explanation: "git diff displays line-by-line modifications that have not yet been staged." },
    { q: "Which command sets your global Git username for all commits?", options: ["git user set 'name'", "git config --global user.name 'Your Name'", "git profile 'name'", "git auth 'name'"], correct: 1, explanation: "git config --global user.name sets author attribution." },
    { q: "How do you discard all uncommitted modifications in a tracked file 'index.ts'?", options: ["git delete index.ts", "git restore index.ts (or git checkout -- index.ts)", "git clean -f", "git drop index.ts"], correct: 1, explanation: "git restore reverts file content back to the latest staged or committed snapshot." },
    { q: "What is a detached HEAD state in Git?", options: ["A corrupted Git index", "When HEAD points directly to a specific commit hash rather than a named branch", "A disconnected network connection", "A merge collision"], correct: 1, explanation: "Detached HEAD means you are checking out a commit rather than a branch tip." },
    { q: "What does 'git cherry-pick <commit-hash>' do?", options: ["Deletes a commit", "Applies the exact changes from an existing commit onto your current branch", "Reverts repository", "Renames branch"], correct: 1, explanation: "Cherry-pick selects a specific commit from another branch and reapplies it to HEAD." },
    { q: "Which command links a local repository to a remote GitHub repository?", options: ["git link remote <url>", "git remote add origin <url>", "git connect <url>", "git bind origin <url>"], correct: 1, explanation: "git remote add origin attaches the remote repository URL." }
  ],

  // ─────────────────────────────────────────────
  // 5. WEB & JAVASCRIPT & FRONTEND (25+ questions)
  // ─────────────────────────────────────────────
  web_setup: [
    { q: "Which HTML5 semantic tag defines navigation links?", options: ["<section>", "<nav>", "<aside>", "<div>"], correct: 1, explanation: "<nav> is the semantic element for major navigation blocks." },
    { q: "In the CSS Box Model, what sits directly between the element content and border?", options: ["Margin", "Padding", "Outline", "Gap"], correct: 1, explanation: "Box Model order from inside out: Content -> Padding -> Border -> Margin." },
    { q: "Which CSS Flexbox property aligns items along the main axis?", options: ["align-items", "justify-content", "align-content", "flex-direction"], correct: 1, explanation: "justify-content aligns items along the main axis." },
    { q: "Which JavaScript keyword declares a variable scoped to its block that cannot be reassigned?", options: ["var", "let", "const", "static"], correct: 2, explanation: "const creates a block-scoped, read-only constant." },
    { q: "What method adds an event listener to an HTML DOM element?", options: ["element.attachEvent()", "element.addEventListener()", "element.on()", "element.bind()"], correct: 1, explanation: "addEventListener() attaches event handler functions." },
    { q: "Which CSS property specifies how elements wrap when there is not enough horizontal room in Flexbox?", options: ["flex-wrap", "flex-flow", "flex-shrink", "flex-overflow"], correct: 0, explanation: "flex-wrap: wrap allows flex items to wrap onto multiple lines." },
    { q: "What is the difference between synchronous and asynchronous execution in JavaScript?", options: ["Async blocks thread execution", "Async allows long operations without blocking the main event loop", "Sync runs in background", "There is no difference"], correct: 1, explanation: "Async operations execute via promises/callbacks without freezing the browser's UI thread." },
    { q: "What does 'z-index' in CSS control?", options: ["Element font size", "Stacking order of positioned elements along the z-axis", "Horizontal alignment", "Animation duration"], correct: 1, explanation: "z-index determines which overlapping element renders in front." },
    { q: "Which CSS Grid property specifies column sizing template?", options: ["grid-template-columns", "grid-column-gap", "grid-auto-flow", "grid-display"], correct: 0, explanation: "grid-template-columns defines the number and widths of grid columns." },
    { q: "What is the DOM in web development?", options: ["Data Object Mode", "Document Object Model — hierarchical tree representation of HTML elements", "Database Operations Module", "Direct Output Memory"], correct: 1, explanation: "The DOM represents web page structure as an interactive object tree." },
    { q: "What does 'rem' unit in CSS compute relative to?", options: ["Parent element's font-size", "Root (html) element's font-size", "Viewport height", "Device physical pixels"], correct: 1, explanation: "rem is relative to the root element's font size (typically 16px default)." },
    { q: "What does 'event.preventDefault()' do in a JavaScript event handler?", options: ["Stops event bubbling", "Prevents browser default action (e.g. form submit page reload or link navigation)", "Deletes event listener", "Refreshes page"], correct: 1, explanation: "preventDefault() cancels default browser actions for that event." },
    { q: "Which HTTP header protects web applications from Clickjacking attacks?", options: ["X-Frame-Options / Content-Security-Policy frame-ancestors", "Access-Control-Allow-Origin", "Cache-Control", "Accept-Encoding"], correct: 0, explanation: "X-Frame-Options prevents embedding pages in iframes." },
    { q: "What is LocalStorage in web browsers?", options: ["Temporary session cookies", "Persistent client-side key-value storage with ~5MB limit that survives browser restarts", "Server database", "RAM cache"], correct: 1, explanation: "LocalStorage persists strings in the browser across sessions until cleared." },
    { q: "What is the CSS pseudo-class for styling an element when mouse cursor hovers over it?", options: [":active", ":hover", ":focus", ":visited"], correct: 1, explanation: ":hover applies styling when the user points to an element." },
    { q: "What is the output of typeof null in JavaScript?", options: ["'null'", "'undefined'", "'object'", "'boolean'"], correct: 2, explanation: "typeof null returning 'object' is a historical JavaScript legacy behavior." },
    { q: "What is the Event Loop in JavaScript responsible for?", options: ["Compiling JS code to bytecode", "Managing the execution of asynchronous callbacks and microtasks on the single call stack", "Rendering CSS styles", "Handling garbage collection only"], correct: 1, explanation: "The event loop continuously checks if the call stack is empty to process task queue callbacks." },
    { q: "What does Promise.all([p1, p2, p3]) do?", options: ["Resolves as soon as the first promise settles", "Waits for all promises to resolve, or rejects immediately if any promise rejects", "Runs promises in strict sequence", "Catches all errors silently"], correct: 1, explanation: "Promise.all fulfills when all input promises fulfill, or rejects on first rejection." },
    { q: "What is a Closure in JavaScript?", options: ["A function bundled with references to its surrounding lexical environment", "Closing a database connection", "An anonymous function", "A syntax error"], correct: 0, explanation: "A closure gives an inner function access to an outer function’s scope." },
    { q: "What is the difference between '==' and '===' in JavaScript?", options: ["'==' performs type coercion before comparison; '===' checks both value and type strictly without coercion", "'===' is legacy syntax", "'==' is faster", "There is no difference"], correct: 0, explanation: "=== strictly checks type and value without automatic type casting." },
    { q: "What is Debouncing in JavaScript frontend development?", options: ["Delaying function execution until a specified delay has passed since the last event trigger (e.g. search input)", "Running function continuously", "Encrypting passwords", "Caching DOM elements"], correct: 0, explanation: "Debouncing limits rapid consecutive function calls." }
  ],

  // ─────────────────────────────────────────────
  // 6. ARRAYS & TWO POINTERS & SLIDING WINDOW (30+ questions)
  // ─────────────────────────────────────────────
  arrays: [
    { q: "What is the time complexity to access an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2, explanation: "Arrays provide O(1) constant time random access by index." },
    { q: "The Two-Pointer technique on a sorted array can find pair sums in:", options: ["O(n²)", "O(n)", "O(log n)", "O(n log n)"], correct: 1, explanation: "Two pointers move inwards from opposite ends in linear O(n) time." },
    { q: "What does the Sliding Window technique optimize?", options: ["Space complexity only", "Time complexity from O(n²) to O(n) for contiguous subarray problems", "Tree height", "Graph cycles"], correct: 1, explanation: "Sliding window avoids recomputing sums/states for overlapping subarrays." },
    { q: "In a 0-indexed array of length N, what is the index of the last element?", options: ["N", "N - 1", "N + 1", "1"], correct: 1, explanation: "Indices range from 0 to N-1." },
    { q: "Prefix Sum array allows calculating any range sum query [L, R] in:", options: ["O(1) time", "O(N) time", "O(R - L) time", "O(log N) time"], correct: 0, explanation: "Range sum = Prefix[R] - Prefix[L-1] in constant time O(1)." },
    { q: "Kadane's Algorithm finds the maximum contiguous subarray sum in what time complexity?", options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], correct: 2, explanation: "Kadane's algorithm processes the array in a single O(n) pass." },
    { q: "Dutch National Flag algorithm sorts an array of 0s, 1s, and 2s in:", options: ["O(n) time and O(1) space", "O(n log n) time", "O(n²) time", "O(n) auxiliary space"], correct: 0, explanation: "Using 3 pointers (low, mid, high), Dutch National Flag sorts 3 values in one O(n) pass in-place." },
    { q: "Inserting an element at the beginning of an array of size N requires:", options: ["O(1) time", "O(n) time due to shifting all elements", "O(log n) time", "O(n²) time"], correct: 1, explanation: "All N elements must be shifted one position to the right." },
    { q: "What is the amortized time complexity of appending an element to a Dynamic Array (e.g. ArrayList / vector)?", options: ["O(1)", "O(N)", "O(log N)", "O(N²)"], correct: 0, explanation: "Doubling array capacity when full yields O(1) amortized append time." },
    { q: "How do you find the single missing number in an array containing numbers 1 to N with one missing in O(n) time and O(1) space?", options: ["Sort and search", "Sum formula N*(N+1)/2 minus actual sum (or XOR sum)", "Use hash map", "Binary search"], correct: 1, explanation: "Total expected sum minus array sum gives missing number in O(n) time and O(1) space." },
    { q: "What is Boyer-Moore Majority Voting Algorithm used for?", options: ["Sorting strings", "Finding the element appearing more than N/2 times in O(n) time and O(1) space", "Finding duplicates", "Graph traversal"], correct: 1, explanation: "Boyer-Moore uses a candidate and count variable in a single pass." },
    { q: "How do you rotate an array of size N by K steps to the right in O(1) extra space?", options: ["Reverse whole array, reverse first K, reverse remaining N-K", "Shift elements one by one", "Use auxiliary array", "Sort the array"], correct: 0, explanation: "Three reversals achieve in-place rotation in O(n) time and O(1) space." },
    { q: "In the Trapping Rain Water problem, what optimal time and space complexity can be achieved?", options: ["O(n²) time, O(1) space", "O(n) time, O(1) space using Two Pointers", "O(n log n) time, O(n) space", "O(n) time, O(n²) space"], correct: 1, explanation: "Left and right max two-pointer approach solves rain trapping in O(n) time and O(1) space." },
    { q: "What technique finds the longest subarray with sum equal to K (including negative numbers)?", options: ["Sliding Window", "Hash Map storing prefix sums and their earliest indices", "Binary Search", "Two Pointers from ends"], correct: 1, explanation: "Prefix sums + Hash Map handles negative numbers where sliding window fails." },
    { q: "What is the space complexity of creating a 2D matrix of size M x N?", options: ["O(1)", "O(M + N)", "O(M * N)", "O(M^N)"], correct: 2, explanation: "A 2D array contains M * N elements, taking O(M * N) memory." },
    { q: "In the Container With Most Water problem, how do two pointers move to maximize area?", options: ["Move the pointer with the smaller height inwards", "Move the pointer with greater height", "Move both randomly", "Always move left"], correct: 0, explanation: "Moving the taller line cannot increase water height; only moving the shorter line can find a taller container." },
    { q: "What is the Product of Array Except Self problem solvable in without using division?", options: ["O(n) time and O(1) extra space using prefix and suffix running products", "O(n²) nested loops only", "O(n log n)", "O(2ⁿ)"], correct: 0, explanation: "Compute left products in first pass and multiply right products in second pass in O(n) time." },
    { q: "How do you merge two sorted arrays of sizes M and N in-place without extra space in nums1 (size M+N)?", options: ["Three pointers starting from the back (indices M-1, N-1, and M+N-1)", "Sort nums1 at end in O((M+N)log(M+N))", "Copy to linked list", "Bubble sort"], correct: 0, explanation: "Placing larger elements from the back avoids overwriting unprocessed elements in nums1." },
    { q: "What is the Next Permutation algorithm order of operations?", options: ["Find rightmost drop, swap with next greater on right, reverse suffix", "Sort ascending", "Swap first and last element", "Shift all elements right"], correct: 0, explanation: "Locating pivot a[i] < a[i+1], swapping with successor, and reversing right suffix produces next lexicographical permutation." },
    { q: "How do you find all triplets in an array that sum to zero in O(N²) time?", options: ["Sort array and use Two Pointers for each fixed element while skipping duplicates", "Three nested loops taking O(N³)", "Use a binary tree", "Use BFS"], correct: 0, explanation: "Sorting in O(N log N) followed by N two-pointer scans yields optimal O(N²) solution." }
  ],

  // ─────────────────────────────────────────────
  // 7. STRINGS & PATTERN MATCHING (25+ questions)
  // ─────────────────────────────────────────────
  strings: [
    { q: "Which technique checks if a string is a palindrome in O(n) time and O(1) space?", options: ["Stack reversal", "Two pointers from start and end moving inwards", "Generating all permutations", "Regex matching"], correct: 1, explanation: "Two pointers compare s[left] and s[right] moving towards the center." },
    { q: "Two strings are anagrams if they:", options: ["Have the same length only", "Contain the exact same character frequencies", "Start with the same letter", "Have the same hash code only"], correct: 1, explanation: "Anagrams contain identical characters in different orders." },
    { q: "What is the time complexity of the KMP pattern matching algorithm for text of length N and pattern M?", options: ["O(N * M)", "O(N + M)", "O(N²)", "O(log N)"], correct: 1, explanation: "KMP avoids backtracking by building the LPS array in O(N + M) time." },
    { q: "What is the ASCII value of uppercase letter 'A'?", options: ["97", "65", "48", "90"], correct: 1, explanation: "ASCII 'A' is 65; lowercase 'a' is 97." },
    { q: "Which approach finds all substrings of length N in a string?", options: ["O(N²) nested loops", "O(N) single loop", "O(2ⁿ)", "O(1)"], correct: 0, explanation: "There are N*(N+1)/2 total substrings, requiring O(N²) time." },
    { q: "In Java/C#, strings are immutable. What class is used for efficient string concatenation in loops?", options: ["StringArray", "StringBuilder / StringBuffer", "CharStream", "Vector"], correct: 1, explanation: "StringBuilder avoids creating temporary string objects on every concatenation." },
    { q: "Rabin-Karp algorithm searches for patterns using which concept?", options: ["Rolling hash", "Prefix tree", "Binary search", "Dynamic programming"], correct: 0, explanation: "Rabin-Karp calculates rolling hash values of pattern and window substrings in O(N+M) average time." },
    { q: "What is the Longest Common Prefix of ['flower', 'flow', 'flight']?", options: ["flo", "fl", "f", "flow"], correct: 1, explanation: "All three strings share the prefix 'fl'." },
    { q: "What is the LPS array in the KMP algorithm?", options: ["Longest Palindromic Substring", "Longest Proper Prefix which is also a Suffix", "Lowest Priority Stack", "Linear Pattern State"], correct: 1, explanation: "LPS array stores length of longest matching prefix-suffix to determine shift distance." },
    { q: "How do you check if string s2 is a rotation of string s1?", options: ["Check if s1.length == s2.length and (s1 + s1) contains s2", "Sort both strings", "Reverse s1", "Use Two Pointers"], correct: 0, explanation: "Concatenating s1+s1 contains all possible cyclic rotations of s1." },
    { q: "What data structure enables O(L) autocomplete word searches for words of length L?", options: ["Binary Search Tree", "Trie (Prefix Tree)", "Linked List", "Heap"], correct: 1, explanation: "Trie nodes store characters on edges for prefix-based searching in O(L)." },
    { q: "In Manacher's Algorithm, what problem is solved in linear O(N) time?", options: ["String sorting", "Longest Palindromic Substring", "Edit distance", "Pattern matching"], correct: 1, explanation: "Manacher's algorithm finds the longest palindromic substring in O(N) time." },
    { q: "What is the minimum number of character edits to transform string A into string B called?", options: ["Hamming Distance", "Levenshtein / Edit Distance", "Manhattan Distance", "Euclidean Distance"], correct: 1, explanation: "Edit distance measures minimum insertions, deletions, and replacements." },
    { q: "What does the sliding window with hash map approach find in string problems?", options: ["Longest Substring Without Repeating Characters in O(N)", "Sorting strings", "String compression", "Trie height"], correct: 0, explanation: "Maintaining char frequencies within a window finds longest non-repeating substring in O(N)." },
    { q: "What is the output of converting character '5' to its integer digit in C/C++?", options: ["'5' - '0' = 5", "'5' - 5 = 0", "(int)'5' = 5", "'5' + 0"], correct: 0, explanation: "Subtracting ASCII '0' (48) from character '5' (53) yields integer 5." },
    { q: "In Z-Algorithm for pattern matching, what does Z[i] represent?", options: ["Length of the longest substring starting at index i that matches a prefix of string S", "Frequency of character", "Character hash", "String length"], correct: 0, explanation: "Z-array allows exact string matching in linear O(N + M) time." },
    { q: "How do you group anagrams from an array of strings in O(N * K log K)?", options: ["Sort each word as a hash map key and append word to map[sortedKey]", "Compare every pair in O(N²)", "Use KMP", "Count consonants"], correct: 0, explanation: "Sorted character string serves as the canonical key for anagram equivalence classes." }
  ],

  // ─────────────────────────────────────────────
  // 8. SORTING & SEARCHING (25+ questions)
  // ─────────────────────────────────────────────
  sorting_searching: [
    { q: "Binary Search requires the array to be:", options: ["Sorted", "Reversed", "Distinct only", "Even-length"], correct: 0, explanation: "Binary search divides search space by half at each step on sorted data." },
    { q: "What is the worst-case time complexity of Quick Sort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(2ⁿ)"], correct: 2, explanation: "Worst-case occurs when the pivot is always the extreme element (already sorted array)." },
    { q: "Which sorting algorithm is guaranteed O(n log n) in best, average, and worst case?", options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"], correct: 1, explanation: "Merge Sort consistently divides the array and merges in O(n log n) time." },
    { q: "What is the space complexity of standard Merge Sort on arrays?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, explanation: "Merge sort requires O(n) auxiliary memory for merging subarrays." },
    { q: "Which sorting algorithm is stable and performs exceptionally well on small or nearly sorted arrays?", options: ["Heap Sort", "Insertion Sort", "Selection Sort", "Quick Sort"], correct: 1, explanation: "Insertion Sort runs in O(n) time on already sorted arrays." },
    { q: "What is the time complexity of Binary Search on an array of size N?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correct: 1, explanation: "Binary search halves the search space each iteration: O(log n)." },
    { q: "How many comparisons does Selection Sort make in all cases for an array of size N?", options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"], correct: 1, explanation: "Selection sort always scans the unsorted portion: N(N-1)/2 comparisons." },
    { q: "What is a Stable Sorting Algorithm?", options: ["An algorithm that never crashes", "An algorithm that preserves relative order of elements with equal keys", "An in-place algorithm", "A parallel sort"], correct: 1, explanation: "Stability means duplicate elements appear in output in the same order as input." },
    { q: "What is the time complexity of Heap Sort?", options: ["O(n log n) in all cases", "O(n²)", "O(n)", "O(log n)"], correct: 0, explanation: "Building heap takes O(n), extracting N elements takes O(n log n)." },
    { q: "Which non-comparison sorting algorithm runs in O(N + K) time where K is range of values?", options: ["Counting Sort", "Merge Sort", "Quick Sort", "Bubble Sort"], correct: 0, explanation: "Counting Sort counts key frequencies and constructs sorted output in linear time." },
    { q: "What does Binary Search on Answer / Monotonic Predicate mean?", options: ["Searching for target value directly", "Finding optimal boundary value x where condition P(x) transitions from True to False in O(log(range))", "Searching in 2D array", "Using linear search"], correct: 1, explanation: "Binary searching the answer space solves optimization problems (e.g., Book Allocation, Koko Eating Bananas)." },
    { q: "How do you find the first or last occurrence of a target in a sorted array with duplicates?", options: ["Linear scan only", "Modified Binary Search continuing to search left/right half on match", "Sort again", "Hash Map"], correct: 1, explanation: "Modified binary search records candidate index and narrows search to find bound." },
    { q: "What is the time complexity of Radix Sort with D digits for N numbers?", options: ["O(D * (N + B))", "O(N²)", "O(N log N)", "O(2ⁿ)"], correct: 0, explanation: "Radix sort runs Counting Sort on each of the D digit places." },
    { q: "How does QuickSelect find the K-th smallest element in an array?", options: ["Sorts entire array", "Uses partition logic like QuickSort to discard one partition half in average O(N) time", "Uses binary search", "Uses BFS"], correct: 1, explanation: "QuickSelect only recurses into the partition containing index K, taking O(N) average time." },
    { q: "What is the time complexity of searching an element in a Rotated Sorted Array?", options: ["O(N)", "O(log N)", "O(1)", "O(N log N)"], correct: 1, explanation: "Comparing mid with bounds identifies the sorted half for O(log N) binary search." }
  ],

  // ─────────────────────────────────────────────
  // 9. RECURSION & BACKTRACKING (25+ questions)
  // ─────────────────────────────────────────────
  recursion_backtracking: [
    { q: "What MUST a recursive function include to avoid infinite recursion and Stack Overflow?", options: ["A while loop", "A Base Case", "Global variables", "A try-catch block"], correct: 1, explanation: "A base case terminates recursion when the terminating condition is satisfied." },
    { q: "What data structure does the computer use internally to manage recursive function calls?", options: ["Queue", "Call Stack", "Heap", "Hash Table"], correct: 1, explanation: "The system call stack pushes activation frames for each recursive invocation." },
    { q: "In Backtracking (e.g. N-Queens, Sudoku), what step happens after exploring a recursive branch?", options: ["Commit state", "Revert / Undo the state choice (backtrack)", "Terminate program", "Sort choices"], correct: 1, explanation: "Backtracking requires restoring state to explore alternative options." },
    { q: "What is the total number of subsets for a set with N distinct elements?", options: ["N²", "2ⁿ", "N!", "2N"], correct: 1, explanation: "Each element has 2 choices (include or exclude), yielding 2ⁿ subsets." },
    { q: "What is the number of permutations of N distinct items?", options: ["N²", "2ⁿ", "N! (N factorial)", "N log N"], correct: 2, explanation: "Permutations of N elements = N * (N-1) * ... * 1 = N!." },
    { q: "How can you convert recursion to an iterative approach?", options: ["Using an explicit Stack data structure", "Using a Queue only", "Not possible", "Using global constants"], correct: 0, explanation: "An explicit Stack mimics the system call stack for iterative traversal." },
    { q: "In the N-Queens problem, what constraint must be checked before placing a queen at (r, c)?", options: ["Column, main diagonal (r-c), and anti-diagonal (r+c) are free", "Row only", "Grid corners", "Queen count"], correct: 0, explanation: "Queens attack along row, column, and both diagonals." },
    { q: "What is Tail Recursion?", options: ["Recursion that never stops", "When the recursive call is the very last operation in the function", "Recursion with two base cases", "Loop recursion"], correct: 1, explanation: "Tail calls can be optimized by compilers into loops without growing call stack." },
    { q: "What is the time complexity of generating all valid parentheses combinations of length 2N?", options: ["O(2²ⁿ)", "O(Catalan(N))", "O(N²)", "O(N!)"], correct: 1, explanation: "Valid parentheses count is given by the N-th Catalan number C(N) = (2N)! / ((N+1)! * N!)." },
    { q: "In Word Search on an M x N grid, what prevents reusing the same cell in the current word path?", options: ["Marking cell visited and unmarking it during backtrack", "Sorting grid", "Deleting matrix row", "Checking length"], correct: 0, explanation: "Temporarily marking cell (e.g. grid[r][c] = '#') and reverting it on backtrack prevents cycles." },
    { q: "How does the Combination Sum problem allow reusing elements?", options: ["Do not increment index when recursing on chosen element", "Use while loop", "Random pick", "Sort descending"], correct: 0, explanation: "Passing the same index i in recursive call allows element reuse until target is exceeded." },
    { q: "What is the space complexity of recursion tree of max depth H?", options: ["O(1)", "O(H) auxiliary stack space", "O(2ᴴ)", "O(H!)"], correct: 1, explanation: "Call stack depth equals maximum tree height H." }
  ],

  // ─────────────────────────────────────────────
  // 10. LINKED LISTS (25+ questions)
  // ─────────────────────────────────────────────
  linked_lists: [
    { q: "Inserting a node at the head of a Singly Linked List takes:", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, explanation: "Updating newNode.next = head and head = newNode takes O(1) time." },
    { q: "A Doubly Linked List node contains:", options: ["Only a data value", "Data and a Next pointer", "Data, Next pointer, and Prev pointer", "Data and a parent pointer"], correct: 2, explanation: "Doubly linked nodes store data, next node pointer, and prev node pointer." },
    { q: "Floyd's Cycle Detection algorithm uses:", options: ["A Hash Set", "Fast & Slow Pointers (Tortoise & Hare)", "Recursion", "Binary Search"], correct: 1, explanation: "If a cycle exists, the fast pointer (2 steps) will meet the slow pointer (1 step)." },
    { q: "Finding the middle node of a linked list in one pass requires:", options: ["Counting total nodes first", "Fast & Slow pointers (slow moves 1 step, fast moves 2 steps)", "Reversing the list", "Sorting"], correct: 1, explanation: "When fast reaches the end, slow will be at the exact middle node." },
    { q: "Reversing a Singly Linked List iteratively requires keeping track of:", options: ["Prev, Curr, and Next pointers", "Left and Right pointers", "Head and Tail only", "Stack size"], correct: 0, explanation: "Updating curr.next = prev requires saving next = curr.next first." },
    { q: "What is the time complexity to delete a node given only a pointer to that node in a Singly Linked List (not tail)?", options: ["O(n)", "O(1) by copying next node's data", "O(log n)", "O(n²)"], correct: 1, explanation: "Copy node.next.val into node.val and update node.next = node.next.next in O(1)." },
    { q: "What is the space complexity of reversing a linked list iteratively in-place?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, explanation: "Iterative reversal modifies pointers in place with O(1) auxiliary space." },
    { q: "How do you find the starting node of a cycle in a linked list after fast and slow meet?", options: ["Reset one pointer to head and move both one step at a time until they meet", "Count nodes in cycle", "Reverse the list", "Delete slow pointer"], correct: 0, explanation: "Floyd's mathematical proof shows head-to-cycle-start distance equals meeting-point-to-cycle-start distance." },
    { q: "What is a Dummy / Sentinel Node used for in Linked List problems?", options: ["Stores list length", "Simplifies edge cases when inserting/deleting head node", "Reverses links", "Prevents memory leaks"], correct: 1, explanation: "Dummy node avoids special-casing empty lists or head modifications." },
    { q: "How do you merge two sorted linked lists of sizes N and M into one sorted list?", options: ["O(N * M) time", "O(N + M) time by comparing head elements iteratively", "O(log(N+M)) time", "O((N+M)²) time"], correct: 1, explanation: "Iteratively attaching smaller node takes linear O(N+M) time." },
    { q: "What is the time complexity of Merge Sort on a Linked List of N nodes?", options: ["O(n log n) time and O(log n) stack space", "O(n²)", "O(n)", "O(1)"], correct: 0, explanation: "Finding middle and merging takes O(N log N) without requiring extra array space." },
    { q: "How do you find the N-th node from the end of a Linked List in one pass?", options: ["Maintain two pointers N nodes apart and advance both until leader reaches end", "Reverse list twice", "Count length first", "Use binary search"], correct: 0, explanation: "Two pointers separated by N steps locate the target in a single pass." }
  ],

  // ─────────────────────────────────────────────
  // 11. STACKS & QUEUES (25+ questions)
  // ─────────────────────────────────────────────
  stacks_queues: [
    { q: "Which ordering principle does a Stack follow?", options: ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Priority Based", "Random Access"], correct: 1, explanation: "Stack is Last-In-First-Out." },
    { q: "Which ordering principle does a Queue follow?", options: ["LIFO", "FIFO (First In First Out)", "Sorted order", "LILO only"], correct: 1, explanation: "Queue is First-In-First-Out." },
    { q: "Evaluating postfix mathematical expressions (e.g., 3 4 +) uses which structure?", options: ["Queue", "Stack", "Binary Tree", "Heap"], correct: 1, explanation: "Operands are pushed onto a stack; operators pop 2 operands and push the result." },
    { q: "In a Queue, new elements are inserted at the:", options: ["Front (Dequeue)", "Rear (Enqueue)", "Middle", "Random position"], correct: 1, explanation: "Enqueue inserts at the rear; Dequeue removes from the front." },
    { q: "Which algorithm uses a Queue for level-by-level traversal?", options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Binary Search", "Quick Sort"], correct: 1, explanation: "BFS uses a Queue to visit all neighbors level by level." },
    { q: "How many Stacks are required to implement a FIFO Queue?", options: ["1", "2 (one for push, one for pop)", "3", "4"], correct: 1, explanation: "Two stacks (inStack and outStack) invert LIFO order to achieve FIFO behavior." },
    { q: "What is a Monotonic Stack used for?", options: ["Sorting numbers only", "Finding Next Greater / Smaller Element in O(n) time", "Managing memory heaps", "Balancing binary trees"], correct: 1, explanation: "A monotonic stack keeps elements in monotonic order to find adjacent bounds in O(n)." },
    { q: "What does the Daily Temperatures problem use for O(n) solution?", options: ["Monotonic Decreasing Stack storing indices", "Queue", "Binary Search", "Two Pointers"], correct: 0, explanation: "Monotonic decreasing stack resolves next warmer day in O(n) total operations." },
    { q: "What is a Deque (Double-Ended Queue)?", options: ["A queue with two stacks", "A sequence container allowing O(1) insertion and deletion at both ends", "A priority heap", "A circular list only"], correct: 1, explanation: "Deques support push/pop at both front and back in O(1) time." },
    { q: "In the Sliding Window Maximum problem, what data structure maintains maximum in O(1) amortized per step?", options: ["Monotonic Deque storing indices in descending value order", "Max Heap in O(log K)", "Simple Array", "Stack"], correct: 0, explanation: "Monotonic Deque removes out-of-window and smaller elements in O(1) amortized." },
    { q: "What is the Min Stack design pattern?", options: ["A stack that only holds positive numbers", "A stack supporting push, pop, top, and getMin() all in O(1) time", "A heap array", "A compressed stack"], correct: 1, explanation: "Min Stack tracks minimum alongside each element or in a companion stack in O(1)." },
    { q: "What condition causes Queue Overflow in a static array-based Circular Queue?", options: ["(rear + 1) % capacity == front", "front == rear", "front == 0", "rear == -1"], correct: 0, explanation: "In circular queue, full condition is when (rear + 1) % size == front." },
    { q: "How do you check for Valid Parentheses (e.g. '{[()]}')?", options: ["Counting total length", "Push open brackets to Stack and pop on matching closing brackets", "Binary search", "Bitwise XOR"], correct: 1, explanation: "A stack matches the most recent open bracket with the current closing bracket in O(N)." },
    { q: "In the Largest Rectangle in Histogram problem, what structure yields O(N) time?", options: ["Monotonic Increasing Stack tracking bar heights and indices", "Priority Queue", "Segment Tree", "Two Pointers"], correct: 0, explanation: "Monotonic increasing stack identifies left and right smaller boundaries in linear time." }
  ],

  // ─────────────────────────────────────────────
  // 12. HASHING & HASH MAPS (25+ questions)
  // ─────────────────────────────────────────────
  hashing: [
    { q: "Average case time complexity for searching a key in a Hash Table is:", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, explanation: "Hash tables provide average O(1) key lookup." },
    { q: "What is a Hash Collision?", options: ["When hash table memory runs out", "When two distinct keys produce the exact same hash index", "When keys are duplicated", "When types mismatch"], correct: 1, explanation: "A collision occurs when hash(k1) == hash(k2) for k1 != k2." },
    { q: "Which collision resolution technique stores colliding elements in a linked list at the bucket?", options: ["Open Addressing", "Separate Chaining", "Linear Probing", "Quadratic Probing"], correct: 1, explanation: "Separate chaining attaches a linked list (or balanced tree) at each bucket index." },
    { q: "What is the Load Factor of a Hash Table?", options: ["Table size / Element count", "Number of stored elements (N) / Total bucket capacity (M)", "Hash code size", "Memory limit in MB"], correct: 1, explanation: "Load factor = N / M. When it exceeds a threshold (e.g. 0.75), rehashing occurs." },
    { q: "What happens during Rehashing in a Hash Table?", options: ["Keys are deleted", "The bucket array size is increased and all keys are re-indexed", "Values are sorted", "Collisions are ignored"], correct: 1, explanation: "Rehashing doubles bucket array size and redistributes entries to maintain O(1) performance." },
    { q: "In Open Addressing, what is Linear Probing?", options: ["Searching sequentially at (index + 1), (index + 2)... when a collision occurs", "Using linked lists", "Double hashing", "Binary search on buckets"], correct: 0, explanation: "Linear probing inspects consecutive table slots until an empty bucket is found." },
    { q: "What issue can occur in Hash Tables using Open Addressing with Linear Probing?", options: ["Primary Clustering (long runs of occupied slots increasing search time)", "Stack Overflow", "Dangling Pointers", "Thrashing"], correct: 0, explanation: "Primary clustering forms contiguous occupied blocks, degrading lookup performance." },
    { q: "What does Java 8 HashMap do when a bucket's linked list length exceeds 8?", options: ["Throws exception", "Transforms the linked list into a Red-Black Tree for O(log N) worst-case lookup", "Deletes old keys", "Increases heap size"], correct: 1, explanation: "Java 8 treeifies heavy collision buckets into Red-Black trees to prevent O(N) degradation." },
    { q: "How do you find if two numbers in an array add up to target in O(n) time and O(n) space?", options: ["Two nested loops", "Use Hash Set / Map to store seen complements (target - x)", "Sort and binary search", "Bitwise AND"], correct: 1, explanation: "Checking if (target - num) is in Hash Map takes O(1) per element." },
    { q: "What is the difference between a HashSet and a HashMap?", options: ["HashSet stores unique keys only; HashMap stores key-value pairs", "HashSet allows duplicate keys", "HashMap is sorted", "HashSet is for numbers only"], correct: 0, explanation: "HashSet is backed by a HashMap where elements are keys with dummy values." },
    { q: "What is the time complexity of building a Frequency Map of N items?", options: ["O(N log N)", "O(N) time and O(U) space where U is unique keys", "O(N²)", "O(1)"], correct: 1, explanation: "Iterating through N elements and updating hash map count takes linear O(N) time." },
    { q: "How does an LRU (Least Recently Used) Cache achieve O(1) get and put operations?", options: ["Hash Map combined with a Doubly Linked List", "Binary Search Tree", "Array and Queue", "Single Stack"], correct: 0, explanation: "HashMap gives O(1) lookup to nodes in a Doubly Linked List which supports O(1) eviction and re-ordering." }
  ],

  // ─────────────────────────────────────────────
  // 13. TREES & BST & HEAPS (30+ questions)
  // ─────────────────────────────────────────────
  trees: [
    { q: "In a valid Binary Search Tree (BST), the left child value is always:", options: ["Greater than the root", "Smaller than the root node", "Equal to the right child", "Any value"], correct: 1, explanation: "BST property: Left < Node < Right." },
    { q: "Inorder traversal of a Binary Search Tree (BST) visits nodes in:", options: ["Random order", "Sorted ascending order", "Descending order", "Reverse level order"], correct: 1, explanation: "Inorder (Left -> Root -> Right) on a BST yields sorted elements." },
    { q: "What is the height of a balanced Binary Tree with N nodes?", options: ["O(N)", "O(log N)", "O(N²)", "O(1)"], correct: 1, explanation: "A balanced tree has depth ceil(log2(N+1))." },
    { q: "Which tree traversal strategy visits root node first: Root -> Left -> Right?", options: ["Inorder", "Preorder", "Postorder", "Level-order"], correct: 1, explanation: "Preorder visits current node before traversing subtrees." },
    { q: "What is the Lowest Common Ancestor (LCA) of two nodes u and v in a tree?", options: ["The root node always", "The deepest node that has both u and v as descendants", "The leaf node closest to u", "The leftmost node"], correct: 1, explanation: "LCA is the lowest shared ancestor node in the tree hierarchy." },
    { q: "In an AVL tree, what is the maximum allowed difference between left and right subtree heights?", options: ["0", "1", "2", "Unlimited"], correct: 1, explanation: "AVL balance factor must be -1, 0, or +1; otherwise rotations rebalance it." },
    { q: "What is the diameter of a Binary Tree?", options: ["Total node count", "The length of the longest path between any two nodes in a tree", "Height of root", "Max degree"], correct: 1, explanation: "Diameter is max(left_height + right_height) across all tree nodes." },
    { q: "What is a Trie (Prefix Tree) best suited for?", options: ["Sorting integers", "Fast prefix-based string searching and autocomplete", "Finding shortest path in graphs", "Evaluating postfix expressions"], correct: 1, explanation: "Trie allows O(L) search, insert, and prefix lookup where L is word length." },
    { q: "What is a Segment Tree used for?", options: ["Range Sum / Min / Max queries and point updates in O(log N) time", "Sorting numbers", "Graph coloring", "Memory caching"], correct: 0, explanation: "Segment trees partition intervals to answer range queries in O(log N)." },
    { q: "In a Max-Heap, where is the largest element always located?", options: ["At any leaf node", "At the root node (index 0)", "At the last index", "In the left child"], correct: 1, explanation: "Max-Heap property ensures parent >= children, placing max at root." },
    { q: "How do you validate if a binary tree is a valid BST?", options: ["Check left < node < right at every node with min/max valid range boundaries", "Check inorder traversal is strictly ascending", "Both A and B are correct", "Check node count only"], correct: 2, explanation: "Both subtree range bounds and strictly increasing inorder traversal validate BSTs." },
    { q: "What is the time complexity to insert an element into a Binary Search Tree in the worst case (skewed tree)?", options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"], correct: 2, explanation: "A degenerated skewed BST behaves like a linked list taking O(N) time." },
    { q: "What is the time complexity to build a Heap from an arbitrary array of N elements?", options: ["O(N log N)", "O(N)", "O(N²)", "O(log N)"], correct: 1, explanation: "Bottom-up heapify runs in linear O(N) time." },
    { q: "In a Min-Heap of size K, inserting an element takes what time complexity?", options: ["O(1)", "O(log K)", "O(K)", "O(K²)"], correct: 1, explanation: "Pushing into heap bubbles up in O(log K) time." }
  ],

  // ─────────────────────────────────────────────
  // 14. GRAPHS & GRAPH ALGORITHMS (30+ questions)
  // ─────────────────────────────────────────────
  graphs: [
    { q: "BFS graph traversal uses which data structure internally?", options: ["Stack", "Heap", "Queue", "Set"], correct: 2, explanation: "BFS uses a Queue to explore vertices layer by layer." },
    { q: "Which graph traversal strategy uses recursion or an explicit Stack?", options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm"], correct: 1, explanation: "DFS goes deep along paths using a Stack or call stack." },
    { q: "Dijkstra's Shortest Path algorithm fails when the graph has:", options: ["Cycles", "Negative edge weights", "Multiple components", "Directed edges"], correct: 1, explanation: "Dijkstra assumes non-negative edge weights; use Bellman-Ford for negative weights." },
    { q: "Topological Sorting can only be applied to:", options: ["Undirected graphs", "Directed Acyclic Graphs (DAG)", "Complete graphs", "Bipartite graphs"], correct: 1, explanation: "Topological sort requires a DAG with no directed cycles." },
    { q: "What is the time complexity of BFS / DFS on a graph with V vertices and E edges using adjacency lists?", options: ["O(V²)", "O(V + E)", "O(V * E)", "O(E log V)"], correct: 1, explanation: "Every vertex and edge is visited once: O(V + E)." },
    { q: "Which algorithm finds the Minimum Spanning Tree (MST) using edge weights sorted in ascending order?", options: ["Dijkstra's", "Kruskal's Algorithm", "Floyd-Warshall", "Tarjan's"], correct: 1, explanation: "Kruskal's greedily adds cheapest edges that do not form a cycle using Disjoint Set Union (DSU)." },
    { q: "How do you detect a cycle in an undirected graph?", options: ["Using DFS/BFS tracking visited and parent vertices", "Topological sort", "Binary search", "Checking node degree"], correct: 0, explanation: "If a visited adjacent node is not the parent, a cycle exists." },
    { q: "How do you detect a cycle in a Directed Graph?", options: ["Using DFS with recursion call stack / visited states (0=unvisited, 1=visiting, 2=visited)", "Kruskal's algorithm", "Dijkstra's algorithm", "Bipartite test"], correct: 0, explanation: "Encountering a node in state 1 (currently in recursion stack) indicates a back-edge cycle." },
    { q: "What is Kahn's Algorithm for Topological Sorting?", options: ["BFS-based topological sort using in-degree array and queue", "DFS-based cycle detection", "Shortest path algorithm", "MST algorithm"], correct: 0, explanation: "Kahn's repeatedly removes vertices with in-degree 0." },
    { q: "What does Bellman-Ford algorithm compute in O(V * E) time?", options: ["Single-source shortest path that can handle negative edge weights and detect negative cycles", "Maximum flow", "Topological sort", "Graph diameter"], correct: 0, explanation: "Bellman-Ford relaxes all E edges V-1 times to find shortest paths with negative weights." },
    { q: "What is Floyd-Warshall Algorithm used for?", options: ["All-Pairs Shortest Paths in O(V³) time", "Single-source shortest path in O(E log V)", "Spanning tree in O(E log E)", "Bipartite check"], correct: 0, explanation: "Floyd-Warshall dynamic programming computes shortest distance between all pairs of nodes." },
    { q: "What is Disjoint Set Union (DSU / Union-Find) used for?", options: ["Tracking elements partitioned into disjoint subsets with nearly O(1) Find and Union", "Sorting data", "Graph rendering", "Stack management"], correct: 0, explanation: "DSU with path compression and rank optimization achieves O(alpha(N)) almost O(1) operations." },
    { q: "What is a Bipartite Graph?", options: ["A graph whose vertices can be divided into two disjoint sets such that no two graph vertices within the same set are adjacent (2-colorable)", "A graph with 2 cycles", "A tree with 2 roots", "A disconnected graph"], correct: 0, explanation: "Bipartite graphs can be 2-colored without adjacent vertices sharing color (contains no odd-length cycles)." }
  ],

  // ─────────────────────────────────────────────
  // 15. DYNAMIC PROGRAMMING & GREEDY (30+ questions)
  // ─────────────────────────────────────────────
  dp_greedy: [
    { q: "Dynamic Programming is applicable when a problem exhibits:", options: ["Greedy choices only", "Overlapping subproblems & Optimal substructure", "No base cases", "Linear time complexity"], correct: 1, explanation: "DP solves overlapping subproblems once and stores their solutions." },
    { q: "Memoization refers to:", options: ["Bottom-up DP table filling", "Top-down recursion with caching", "Stack frames", "Sorting array"], correct: 1, explanation: "Memoization caches recursive function return values." },
    { q: "Tabulation DP approach is built:", options: ["Top-down", "Bottom-up iteratively filling a DP table", "Using recursion only", "Randomly"], correct: 1, explanation: "Tabulation fills base cases first and iterates up to N." },
    { q: "The 0/1 Knapsack problem with N items and Capacity W has time complexity:", options: ["O(N log N)", "O(N * W)", "O(2ⁿ)", "O(W²)"], correct: 1, explanation: "Standard DP table size is N x W." },
    { q: "Greedy algorithms make choices that are:", options: ["Locally optimal at each step hoping for global optimum", "Globally optimal first", "Recursive always", "Backtracking based"], correct: 0, explanation: "Greedy picks the best immediate choice without looking back." },
    { q: "What is the time complexity to compute the Nth Fibonacci number using DP (bottom-up)?", options: ["O(2ⁿ)", "O(N) time and O(1) space", "O(N²)", "O(log N) matrix exponentiation"], correct: 1, explanation: "Iterating with 2 variables takes O(N) time and O(1) space." },
    { q: "In Longest Common Subsequence (LCS) of strings of length M and N, DP table size is:", options: ["(M+1) x (N+1)", "M + N", "M * N * 2", "2^(M+N)"], correct: 0, explanation: "2D DP matrix dp[M+1][N+1] stores subproblem lengths." },
    { q: "What is the optimal time complexity to find Longest Increasing Subsequence (LIS) of size N?", options: ["O(N²)", "O(N log N) using patience sorting / binary search", "O(2ⁿ)", "O(N)"], correct: 1, explanation: "Binary search on tails array computes LIS in O(N log N) time." },
    { q: "In the Coin Change (Minimum Coins) problem with amount A and coins C, what is the DP state transition?", options: ["dp[i] = min(dp[i], dp[i - coin] + 1)", "dp[i] = dp[i-1] + dp[i-2]", "dp[i] = dp[i] * coin", "dp[i] = i / coin"], correct: 0, explanation: "dp[i] takes minimum coins needed by picking any valid coin from dp[i-coin]." },
    { q: "In Activity Selection problem, how should intervals be sorted for Greedy choice?", options: ["By start time ascending", "By finish time ascending", "By duration descending", "By start time descending"], correct: 1, explanation: "Sorting by finish time frees up time earliest for subsequent activities." },
    { q: "What is Fractional Knapsack solvable by?", options: ["Greedy algorithm sorting items by value/weight ratio", "0/1 DP table only", "BFS", "Binary Search"], correct: 0, explanation: "Because items can be broken into fractions, picking highest value/weight greedily is optimal." },
    { q: "In Matrix Chain Multiplication with N matrices, what is the DP time complexity?", options: ["O(N³)", "O(N²)", "O(N log N)", "O(2ⁿ)"], correct: 0, explanation: "Interval DP with 3 nested loops (length, start, partition split) runs in O(N³)." },
    { q: "What is Huffman Coding used for?", options: ["Greedy loss-less data compression by assigning variable-length prefix codes based on frequencies", "Shortest path", "Matrix multiplication", "Deadlock detection"], correct: 0, explanation: "Huffman coding builds a binary trie greedily with a priority queue." }
  ],

  // ─────────────────────────────────────────────
  // 16. DBMS, SQL & DATABASE INTERNALS (30+ questions)
  // ─────────────────────────────────────────────
  dbms_er_normalization: [
    { q: "In an ER Diagram, what does an Entity represent?", options: ["An action or query", "A real-world object or concept with distinct existence (e.g. Student, Course)", "A database index", "A SQL keyword"], correct: 1, explanation: "Entities are distinct physical or conceptual objects represented as rectangles in ER diagrams." },
    { q: "Which Normal Form eliminates transitive functional dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correct: 2, explanation: "3NF removes transitive dependencies (X -> Y and Y -> Z)." },
    { q: "A table is in First Normal Form (1NF) if and only if:", options: ["It has no foreign keys", "Every column contains atomic (indivisible) values and no repeating groups", "All non-key columns depend fully on primary key", "It is indexed"], correct: 1, explanation: "1NF requires atomic values in each cell and unique row records." },
    { q: "What does Second Normal Form (2NF) eliminate?", options: ["Transitive dependencies", "Partial functional dependencies on composite candidate keys", "Duplicate table names", "Null values"], correct: 1, explanation: "2NF requires 1NF and no non-prime attribute should depend on a subset of candidate keys." },
    { q: "What condition defines Boyce-Codd Normal Form (BCNF)?", options: ["Every determinant in functional dependency X -> Y must be a Super Key", "All attributes are strings", "No foreign keys allowed", "Tables must have at least 3 rows"], correct: 0, explanation: "BCNF is a stricter version of 3NF where for every X -> Y, X must be a super key." },
    { q: "What is a Candidate Key?", options: ["Any column that has numbers", "A minimal super key with no redundant attributes that uniquely identifies a row", "A foreign key", "An encrypted key"], correct: 1, explanation: "A candidate key is a minimal set of attributes uniquely identifying a table record." },
    { q: "In ER modeling, what is a Weak Entity?", options: ["An entity with null values", "An entity that cannot be uniquely identified by its own attributes alone and depends on an identifying owner entity", "A deleted table", "A temporary view"], correct: 1, explanation: "Weak entities use a partial key (discriminator) and foreign key of their owner." },
    { q: "What is Fourth Normal Form (4NF) designed to remove?", options: ["Multi-valued dependencies (MVD)", "Transitive dependencies", "Partial dependencies", "Null values"], correct: 0, explanation: "4NF eliminates multi-valued dependencies where independent facts are stored in one table." },
    { q: "What is Referential Integrity constraint?", options: ["Primary key cannot be null", "Foreign key value must match an existing primary key value in referenced table or be NULL", "Table names must be uppercase", "Columns must be unique"], correct: 1, explanation: "Referential integrity ensures valid relationships between referenced records." },
    { q: "What is Cardinality in database relationships?", options: ["Total column count", "The numerical relationship between entity occurrences (1:1, 1:N, M:N)", "Number of bytes per row", "Index count"], correct: 1, explanation: "Cardinality expresses how many instances of entity A relate to entity B." },
    { q: "Which SQL clause filters aggregated results produced by GROUP BY?", options: ["WHERE", "HAVING", "FILTER", "ORDER BY"], correct: 1, explanation: "HAVING filters groups post-aggregation; WHERE filters individual rows pre-aggregation." },
    { q: "Which SQL JOIN returns all rows from the left table regardless of matches in the right table?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 1, explanation: "LEFT JOIN retains all left records." },
    { q: "Which clause sorts the result set in descending order?", options: ["ORDER BY col DESC", "SORT col DOWN", "GROUP BY col DESC", "ARRANGE col DESC"], correct: 0, explanation: "ORDER BY <column> DESC sorts in descending order." },
    { q: "What is a Common Table Expression (CTE) defined by in SQL?", options: ["WITH cte_name AS (...)", "CREATE TEMP cte_name (...)", "SELECT CTE cte_name", "DECLARE cte_name"], correct: 0, explanation: "WITH cte_name AS (SELECT ...) creates a temporary named result set." },
    { q: "What is the difference between UNION and UNION ALL?", options: ["UNION preserves duplicates; UNION ALL removes duplicates", "UNION removes duplicate rows; UNION ALL keeps all rows including duplicates", "They are identical", "UNION works only on numbers"], correct: 1, explanation: "UNION performs deduplication (which costs sorting overhead), while UNION ALL keeps all records." },
    { q: "In ACID properties, 'Atomicity' guarantees:", options: ["Data is isolated from other transactions", "Transactions are All-or-Nothing", "Data persists after crash", "Types are consistent"], correct: 1, explanation: "Atomicity ensures every operation in a transaction succeeds or all are rolled back." },
    { q: "In ACID properties, 'Durability' guarantees:", options: ["Transactions execute concurrently", "Committed transactions survive system crashes and power failures", "Queries run fast", "Data types match"], correct: 1, explanation: "Durability guarantees committed changes persist via write-ahead logging (WAL)." },
    { q: "Which database indexing data structure is optimized for disk reads and range queries?", options: ["Binary Search Tree", "B+ Tree", "Linked List", "Hash Map"], correct: 1, explanation: "B+ Trees store keys in leaves linked sequentially for fast range scans." },
    { q: "What is a Dirty Read in database transactions?", options: ["Reading corrupt data from disk", "A transaction reading uncommitted data modified by another concurrent transaction", "Reading deleted tables", "Reading without permissions"], correct: 1, explanation: "Dirty read occurs when Transaction A reads data modified by Transaction B before B commits." },
    { q: "Database Sharding refers to:", options: ["Creating read-only replicas", "Horizontally partitioning a database across multiple independent servers", "Backing up data to tape", "Deleting expired records"], correct: 1, explanation: "Sharding partitions data horizontally across multiple machines to scale write throughput." }
  ],

  // ─────────────────────────────────────────────
  // 17. OPERATING SYSTEMS (30+ questions)
  // ─────────────────────────────────────────────
  os_process_threads: [
    { q: "A process in an operating system is best defined as:", options: ["A file on disk", "A program in active execution", "A hardware component", "A thread pool"], correct: 1, explanation: "A process is an instance of a computer program being executed." },
    { q: "What is the primary difference between a Process and a Thread?", options: ["Processes share memory by default; threads do not", "Threads of the same process share code, data, and heap memory; processes have separate address spaces", "Threads are slower than processes", "Processes run inside threads"], correct: 1, explanation: "Threads share address space and memory of their parent process; processes are isolated." },
    { q: "A context switch saves the CPU state in which data structure?", options: ["Stack", "PCB (Process Control Block)", "Page Table", "Inode"], correct: 1, explanation: "PCB holds process ID, registers, program counter, and scheduling info." },
    { q: "What is a Mutex (Mutual Exclusion lock)?", options: ["A CPU core", "A synchronization primitive that ensures only one thread accesses a critical section at a time", "A memory allocator", "A process scheduler"], correct: 1, explanation: "A mutex provides exclusive ownership of a shared resource to prevent race conditions." },
    { q: "What is a Race Condition?", options: ["When two processes run at identical CPU speeds", "When system behavior depends on the uncontrollable timing/order of thread execution", "A memory leak", "A network timeout"], correct: 1, explanation: "A race condition occurs when concurrent threads access shared data without synchronization." },
    { q: "Which CPU scheduling algorithm can lead to the Convoy Effect?", options: ["Round Robin", "First-Come, First-Served (FCFS)", "Shortest Remaining Time First", "Multilevel Queue"], correct: 1, explanation: "Short processes wait behind a long CPU-bound process in FCFS." },
    { q: "Which CPU scheduling algorithm gives each process a fixed time slice (quantum)?", options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"], correct: 2, explanation: "Round Robin cyclically allocates a fixed time quantum to each runnable process." },
    { q: "Which condition is NOT one of the 4 necessary conditions for Deadlock?", options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Preemption"], correct: 3, explanation: "The 4 Coffman conditions are: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait." },
    { q: "Which algorithm avoids deadlock by checking if resource allocation leaves the system in a 'Safe State'?", options: ["Dijkstra's Shortest Path", "Banker's Algorithm", "Round Robin", "LRU Algorithm"], correct: 1, explanation: "Banker's algorithm tests for safety before allocating requested resources." },
    { q: "Paging in OS memory management eliminates:", options: ["Internal Fragmentation", "External Fragmentation", "Page Faults", "Cache Misses"], correct: 1, explanation: "Paging allocates non-contiguous fixed-size physical frames." },
    { q: "What is a Page Fault?", options: ["A corrupted sector on the hard drive", "An interrupt raised when a program accesses a page not currently mapped in physical RAM", "A syntax error in C code", "A kernel panic"], correct: 1, explanation: "Page fault triggers the OS to fetch the missing page from disk (swap space) into RAM." },
    { q: "Which page replacement algorithm replaces the page that has not been accessed for the longest time?", options: ["FIFO", "LRU (Least Recently Used)", "Optimal Page Replacement", "LFU"], correct: 1, explanation: "LRU evicts the page with the oldest access timestamp." },
    { q: "What is Thrashing in an operating system?", options: ["High CPU processing throughput", "When the OS spends more time paging (swapping pages in/out) than executing actual process instructions", "Deleting files rapidly", "Network packet loss"], correct: 1, explanation: "Thrashing occurs when memory is overcommitted, causing continuous page faults." },
    { q: "A system call transfers CPU execution from:", options: ["User space (unprivileged) to Kernel space (privileged)", "Kernel space to User space only", "One RAM module to another", "CPU to GPU"], correct: 0, explanation: "System calls invoke OS kernel services using software interrupts or trap instructions." },
    { q: "In Unix/Linux, which system call creates an exact duplicate child process?", options: ["exec()", "fork()", "clone_proc()", "spawn()"], correct: 1, explanation: "fork() duplicates the calling process, returning 0 to the child and child PID to the parent." },
    { q: "What is the function of the Translation Lookaside Buffer (TLB)?", options: ["Store process instructions", "A high-speed hardware cache for virtual-to-physical address translations", "Manage disk read buffers", "Handle keyboard interrupts"], correct: 1, explanation: "TLB caches virtual-to-physical page mappings to avoid multi-level page table lookups in RAM." }
  ],

  // ─────────────────────────────────────────────
  // 18. COMPUTER NETWORKS (30+ questions)
  // ─────────────────────────────────────────────
  cn_models_transport: [
    { q: "Which layer of the OSI model handles logical IP routing across networks?", options: ["Data Link Layer (Layer 2)", "Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)"], correct: 1, explanation: "Layer 3 (Network Layer) manages IP addressing and packet routing." },
    { q: "TCP provides which guarantees that UDP does NOT?", options: ["Lower latency", "Reliable, ordered, error-checked data stream", "Multicast support", "Zero packet overhead"], correct: 1, explanation: "TCP guarantees delivery and ordering via sequence numbers and ACKs." },
    { q: "The 3-way handshake in TCP connection establishment is:", options: ["SYN -> ACK -> FIN", "SYN -> SYN-ACK -> ACK", "SYN -> RST -> ACK", "SYN -> DATA -> ACK"], correct: 1, explanation: "Client sends SYN; Server responds with SYN-ACK; Client replies with ACK." },
    { q: "Why is UDP preferred over TCP for live video streaming and gaming?", options: ["It encrypts data automatically", "Low latency without blocking on retransmissions", "Higher bandwidth", "No port numbers"], correct: 1, explanation: "UDP avoids delay caused by retransmitting lost packets." },
    { q: "Which protocol translates human-readable domain names (e.g. google.com) to IP addresses?", options: ["DHCP", "DNS", "ARP", "FTP"], correct: 1, explanation: "DNS (Domain Name System) resolves hostnames to IP addresses." },
    { q: "What protocol automatically assigns dynamic IP addresses to devices on a local network?", options: ["DNS", "DHCP", "BGP", "ICMP"], correct: 1, explanation: "DHCP (Dynamic Host Configuration Protocol) leases IP addresses to client devices." },
    { q: "What does Address Resolution Protocol (ARP) resolve?", options: ["Domain names to IP addresses", "IP addresses to physical MAC addresses", "URLs to web pages", "Ports to process IDs"], correct: 1, explanation: "ARP maps a known IP address to a physical MAC address on a local area network." },
    { q: "In IPv4 subnetting, what does the CIDR notation /24 represent?", options: ["24 host bits", "24 subnet mask bits (255.255.255.0) providing 256 addresses", "24 IP addresses total", "Class B network"], correct: 1, explanation: "/24 indicates a 24-bit subnet mask (255.255.255.0) with 254 usable host addresses." },
    { q: "What is the standard port for HTTPS encrypted traffic?", options: ["80", "443", "22", "8080"], correct: 1, explanation: "Port 443 is standard for HTTPS; 80 is HTTP; 22 is SSH." },
    { q: "What is Flow Control in TCP achieved by?", options: ["Sliding Window protocol advertised by receiver (Receiver Window / rwnd)", "Dropping packets", "Increasing timeout", "Using UDP"], correct: 0, explanation: "Flow control prevents sender from overwhelming receiver's buffer." },
    { q: "What is TCP Congestion Control designed to prevent?", options: ["Buffer overflow at intermediate network routers", "Data corruption", "Unauthorized logins", "DNS poisoning"], correct: 0, explanation: "Algorithms like Slow Start, AIMD, and Congestion Avoidance prevent network overload." },
    { q: "What is the purpose of TLS (Transport Layer Security)?", options: ["Speed up routing", "Provide encrypted, authenticated, and tamper-proof communication over TCP", "Assign IP addresses", "Prevent DDoS"], correct: 1, explanation: "TLS encrypts application payload and verifies server certificate identity." }
  ],

  // ─────────────────────────────────────────────
  // 19. OOP & SYSTEM DESIGN (30+ questions)
  // ─────────────────────────────────────────────
  oop_core: [
    { q: "Binding data fields and methods into a single unit while restricting direct access is:", options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"], correct: 1, explanation: "Encapsulation hides internal implementation using private fields and getters/setters." },
    { q: "Which SOLID principle states classes should be open for extension but closed for modification?", options: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution", "Dependency Inversion"], correct: 1, explanation: "Open/Closed Principle (OCP)." },
    { q: "Method Overriding in OOP is an example of:", options: ["Compile-time Polymorphism", "Run-time (Dynamic) Polymorphism", "Data Hiding", "Multiple Inheritance"], correct: 1, explanation: "Overridden methods are dispatched dynamically at runtime based on object type." },
    { q: "A Singleton Design Pattern guarantees:", options: ["Multiple thread-safe instances", "Exactly one instance of a class with a global point of access", "Static classes only", "Interface inheritance"], correct: 1, explanation: "Singleton restricts instantiation to a single object." },
    { q: "An abstract class differs from an interface because an abstract class can:", options: ["Have constructors and non-abstract instance fields", "Be instantiated directly", "Be inherited by multiple child classes in Java", "Not contain methods"], correct: 0, explanation: "Abstract classes can hold state and concrete method implementations." },
    { q: "Which design pattern defines a one-to-many dependency between objects so that when one changes state, all dependents are notified?", options: ["Factory Pattern", "Observer Pattern", "Adapter Pattern", "Singleton Pattern"], correct: 1, explanation: "Observer pattern notifies registered subscriber objects when state changes." },
    { q: "What does the 'L' in SOLID principles stand for?", options: ["Linear Inheritance", "Liskov Substitution Principle", "Late Binding Principle", "Loose Coupling"], correct: 1, explanation: "Liskov Substitution Principle states subtypes must be substitutable for base types without breaking correctness." },
    { q: "Horizontal scaling (Scale-out) means:", options: ["Adding CPU/RAM to a single machine", "Adding more commodity servers to distribute traffic", "Using SSDs instead of HDDs", "Optimizing SQL queries"], correct: 1, explanation: "Horizontal scaling adds more instances to a cluster." },
    { q: "What component sits between clients and backend servers to distribute incoming traffic?", options: ["Database Index", "Load Balancer", "Reverse Proxy Cache", "API Gateway"], correct: 1, explanation: "Load Balancers distribute network/application traffic across servers." },
    { q: "A Content Delivery Network (CDN) speeds up static asset loading by:", options: ["Caching content geographically closer to users", "Compressing database rows", "Using faster CPU servers", "Encrypting passwords"], correct: 0, explanation: "CDNs serve assets from edge servers nearest to the client." },
    { q: "In CAP Theorem, what does 'C' stand for?", options: ["Capacity", "Consistency", "Concurrency", "Commit"], correct: 1, explanation: "CAP = Consistency, Availability, Partition Tolerance." },
    { q: "In-memory caches like Redis improve performance by:", options: ["Storing data on NVMe drives", "Serving frequent queries directly from RAM in microseconds", "Compiling JavaScript", "Sharding relational tables"], correct: 1, explanation: "RAM access is order of magnitude faster than disk I/O." },
    { q: "What is the STAR method for behavioral interviews?", options: ["Situation, Task, Action, Result", "System, Test, Analyze, Review", "Strategy, Theory, Apply, Repeat", "Scope, Time, Action, Report"], correct: 0, explanation: "STAR provides a structured format to tell impact stories." }
  ],

  // ─────────────────────────────────────────────
  // 20. GENERIC FALLBACK
  // ─────────────────────────────────────────────
  generic: [
    { q: "What does Big-O notation characterize?", options: ["Number of lines of code", "The asymptotic upper bound on how execution time or memory grows relative to input size N", "Network throughput in MB/s", "CPU clock cycles"], correct: 1, explanation: "Big-O measures algorithm growth rate and scalability as N approaches infinity." },
    { q: "What is the space complexity of an in-place algorithm that uses a fixed number of scalar variables?", options: ["O(N)", "O(1)", "O(log N)", "O(N²)"], correct: 1, explanation: "O(1) constant auxiliary space means memory usage is independent of input size." },
    { q: "What is a space-time tradeoff in algorithm design?", options: ["Compromising code readability", "Using extra memory (e.g. hash tables/memoization) to achieve faster execution time", "Trading CPU frequency for battery", "Reducing network latency"], correct: 1, explanation: "Space-time tradeoff exchanges memory usage for reduced execution time." },
    { q: "What does an amortized time complexity of O(1) mean?", options: ["Every single operation takes O(1)", "The average time per operation over a sequence of operations is O(1), even if occasional operations take O(N)", "Random time", "Worst case O(N²)"], correct: 1, explanation: "Amortized analysis averages the cost of occasional expensive operations over many cheap ones." },
    { q: "What is the time complexity of searching in a Hash Table on average?", options: ["O(N)", "O(1)", "O(log N)", "O(N²)"], correct: 1, explanation: "Average lookup is O(1)." },
    { q: "What does LIFO stand for in data structures?", options: ["Last In First Out", "Linear Index Fast Order", "Loop In Fixed Order", "Low Index First Out"], correct: 0, explanation: "LIFO is the fundamental principle of a Stack." },
    { q: "What does FIFO stand for in data structures?", options: ["First In First Out", "Fast In Fast Out", "Fixed Input Fixed Output", "Filter In Function Out"], correct: 0, explanation: "FIFO is the fundamental principle of a Queue." }
  ]
};

// ─────────────────────────────────────────────
// Intelligent Task-to-Topic Resolver
// ─────────────────────────────────────────────
export function getTopicKeyForTask(taskTitle: string, taskType?: string): string {
  const t = (taskTitle || "").toLowerCase();

  // 1. Language Setup & IDE
  if (t.includes("java") && (t.includes("setup") || t.includes("environment") || t.includes("ide") || t.includes("install") || t.includes("collection") || t.includes("stream") || t.includes("lambda") || t.includes("basics") || t.includes("core"))) return "java_setup";
  if (t.includes("python") && (t.includes("setup") || t.includes("environment") || t.includes("ide") || t.includes("comprehension") || t.includes("collection") || t.includes("basics") || t.includes("core"))) return "python_setup";
  if ((t.includes("c++") || t.includes("cpp")) && (t.includes("setup") || t.includes("environment") || t.includes("ide") || t.includes("stl") || t.includes("pointer") || t.includes("basics") || t.includes("core") || t.includes("syntax"))) return "cpp_setup";
  if (t.includes("git") || t.includes("github") || t.includes("version control")) return "git_setup";
  if (t.includes("web") || t.includes("html") || t.includes("css") || t.includes("javascript") || t.includes("node") || t.includes("es6") || t.includes("async") || t.includes("frontend")) return "web_setup";

  // 2. DSA Topics
  if (t.includes("array") || t.includes("two pointer") || t.includes("sliding window") || t.includes("kadane") || t.includes("traversal, search")) return "arrays";
  if (t.includes("string") || t.includes("palindrome") || t.includes("anagram") || t.includes("kmp") || t.includes("rabin-karp")) return "strings";
  if (t.includes("sorting") || t.includes("searching") || t.includes("binary search") || t.includes("bubble") || t.includes("merge sort") || t.includes("quick sort")) return "sorting_searching";
  if (t.includes("recursion") || t.includes("backtracking") || t.includes("n-queen") || t.includes("subset") || t.includes("sudoku")) return "recursion_backtracking";
  if (t.includes("linked list") || t.includes("singly") || t.includes("doubly")) return "linked_lists";
  if (t.includes("stack") || t.includes("queue") || t.includes("deque")) return "stacks_queues";
  if (t.includes("hashing") || t.includes("hashmap") || t.includes("frequency counting") || t.includes("hash table")) return "hashing";
  if (t.includes("tree") || t.includes("bst") || t.includes("avl") || t.includes("inorder") || t.includes("segment tree") || t.includes("trie") || t.includes("fenwick") || t.includes("heap") || t.includes("priority queue")) return "trees";
  if (t.includes("graph") || t.includes("bfs") || t.includes("dfs") || t.includes("dijkstra") || t.includes("topological") || t.includes("bellman") || t.includes("shortest path") || t.includes("mst")) return "graphs";
  if (t.includes("dp") || t.includes("dynamic programming") || t.includes("knapsack") || t.includes("fibonacci") || t.includes("lcs") || t.includes("greedy") || t.includes("huffman")) return "dp_greedy";

  // 3. Core CS & System Design
  if (t.includes("er diagram") || t.includes("normalization") || t.includes("1nf") || t.includes("bcnf") || t.includes("sql") || t.includes("dbms") || t.includes("acid") || t.includes("transaction") || t.includes("indexing") || t.includes("join") || t.includes("database")) return "dbms_er_normalization";
  if (t.includes("process") || t.includes("thread") || t.includes("mutex") || t.includes("scheduling") || t.includes("deadlock") || t.includes("paging") || t.includes("virtual memory") || t.includes("system call") || t.includes("os") || t.includes("operating system")) return "os_process_threads";
  if (t.includes("osi") || t.includes("tcp") || t.includes("udp") || t.includes("ip ") || t.includes("subnet") || t.includes("dns") || t.includes("dhcp") || t.includes("tls") || t.includes("network") || t.includes("socket") || t.includes("http")) return "cn_models_transport";
  if (t.includes("class") || t.includes("oop") || t.includes("encapsulat") || t.includes("inherit") || t.includes("solid") || t.includes("design pattern") || t.includes("system design") || t.includes("load balancer") || t.includes("cdn") || t.includes("scaling") || taskType === "MOCK" || t.includes("mock")) return "oop_core";

  if (t.includes("c++") || t.includes("cpp")) return "cpp_setup";
  if (t.includes("java")) return "java_setup";
  if (t.includes("python")) return "python_setup";

  return "arrays";
}

/**
 * Related topic mapping for smart topic-adjacent fallback
 */
const RELATED_TOPICS: Record<string, string[]> = {
  java_setup: ["oop_core", "generic", "sorting_searching"],
  python_setup: ["oop_core", "generic", "sorting_searching"],
  cpp_setup: ["oop_core", "generic", "sorting_searching"],
  git_setup: ["web_setup", "generic"],
  web_setup: ["git_setup", "generic"],
  arrays: ["sorting_searching", "strings", "hashing"],
  strings: ["arrays", "hashing", "sorting_searching"],
  sorting_searching: ["arrays", "recursion_backtracking", "trees"],
  recursion_backtracking: ["trees", "dp_greedy", "graphs"],
  linked_lists: ["stacks_queues", "arrays", "trees"],
  stacks_queues: ["linked_lists", "arrays", "trees"],
  hashing: ["arrays", "strings", "linked_lists"],
  trees: ["graphs", "recursion_backtracking", "sorting_searching"],
  graphs: ["trees", "dp_greedy", "recursion_backtracking"],
  dp_greedy: ["recursion_backtracking", "arrays", "graphs"],
  dbms_er_normalization: ["os_process_threads", "cn_models_transport", "oop_core"],
  os_process_threads: ["cn_models_transport", "dbms_er_normalization", "oop_core"],
  cn_models_transport: ["os_process_threads", "web_setup", "oop_core"],
  oop_core: ["dbms_er_normalization", "os_process_threads", "generic"],
  generic: ["arrays", "sorting_searching", "oop_core"]
};

/**
 * Returns a single fresh verification question that has not been used
 */
export function getNextVerificationQuestion(
  taskTitle: string,
  taskType?: string,
  excludeQuestions: string[] = []
): QuestionItem {
  const topicKey = getTopicKeyForTask(taskTitle, taskType);
  const pool = TOPIC_QUESTION_DATABASE[topicKey] || TOPIC_QUESTION_DATABASE.arrays;
  
  const excluded = new Set(excludeQuestions.map(normalizeQuestion));
  const available = pool.filter(q => !excluded.has(normalizeQuestion(q.q)));
  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  // Check related topic pools
  const relatedKeys = RELATED_TOPICS[topicKey] || ["generic"];
  for (const rk of relatedKeys) {
    const relPool = TOPIC_QUESTION_DATABASE[rk] || [];
    const relAvailable = relPool.filter(q => !excluded.has(normalizeQuestion(q.q)));
    if (relAvailable.length > 0) {
      return relAvailable[Math.floor(Math.random() * relAvailable.length)];
    }
  }

  // If exhausted primary & related pools, source from any other unseen question in database
  const allOtherQuestions = uniqueQuestions(Object.values(TOPIC_QUESTION_DATABASE).flat())
    .filter(q => !excluded.has(normalizeQuestion(q.q)));
  if (allOtherQuestions.length > 0) {
    return allOtherQuestions[Math.floor(Math.random() * allOtherQuestions.length)];
  }

  // The caller should stop requesting questions when the complete database is
  // exhausted. Returning an already-seen question would break the no-repeat rule.
  return pool[0];
}

function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, " ").toLowerCase();
}

function uniqueQuestions(questions: QuestionItem[]): QuestionItem[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = normalizeQuestion(question.q);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Shuffles and returns 5 fresh quiz questions for a task.
 * STRICT RULE: NEVER pick any question that was in the excluded list (Work Verification or previous Quiz attempts).
 * Strictly guarantees all 5 questions in the quiz are unique from each other and never repeated.
 */
export function getQuizQuestionsForTask(
  taskTitle: string,
  taskType?: string,
  excludeQuestions: string[] = []
): QuestionItem[] {
  const topicKey = getTopicKeyForTask(taskTitle, taskType);
  const excluded = new Set(excludeQuestions.map(normalizeQuestion));
  const primaryPool = TOPIC_QUESTION_DATABASE[topicKey] || TOPIC_QUESTION_DATABASE.arrays;
  
  // 1. Filter out all excluded questions from primary topic pool
  const availableFromPrimary = uniqueQuestions(primaryPool)
    .filter(q => !excluded.has(normalizeQuestion(q.q)));
  
  if (availableFromPrimary.length >= 5) {
    const shuffled = [...availableFromPrimary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  // 2. If primary pool alone has fewer than 5 unseen questions, supplement from related topic pools first
  const selected: QuestionItem[] = [...availableFromPrimary];
  const relatedKeys = RELATED_TOPICS[topicKey] || ["generic"];
  
  for (const rk of relatedKeys) {
    if (selected.length >= 5) break;
    const relPool = TOPIC_QUESTION_DATABASE[rk] || [];
    const relAvailable = uniqueQuestions(relPool).filter(q =>
      !excluded.has(normalizeQuestion(q.q)) &&
      !selected.some(s => normalizeQuestion(s.q) === normalizeQuestion(q.q))
    );
    const needed = 5 - selected.length;
    const picked = [...relAvailable].sort(() => Math.random() - 0.5).slice(0, needed);
    selected.push(...picked);
  }

  if (selected.length >= 5) {
    return selected.slice(0, 5).sort(() => Math.random() - 0.5);
  }

  // 3. Supplement from any unseen question across the entire database
  const remainingNeeded = 5 - selected.length;
  const allOtherUnseen = uniqueQuestions(Object.values(TOPIC_QUESTION_DATABASE).flat())
    .filter(q => !excluded.has(normalizeQuestion(q.q)) &&
      !selected.some(s => normalizeQuestion(s.q) === normalizeQuestion(q.q)));

  const shuffledOther = [...allOtherUnseen].sort(() => Math.random() - 0.5).slice(0, remainingNeeded);
  selected.push(...shuffledOther);

  if (selected.length >= 5) {
    return selected.slice(0, 5).sort(() => Math.random() - 0.5);
  }

  // There are not enough unseen questions left for a full set. Return only
  // unseen questions instead of padding with repeats.
  return uniqueQuestions(selected).slice(0, 5).sort(() => Math.random() - 0.5);
}
