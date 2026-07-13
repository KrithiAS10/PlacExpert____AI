import random

# Constants and Allowed Values
READINESS_LEVELS = ["Just Starting", "Learning Basics", "Actively Practicing", "Ready for Interviews"]
DOMAINS = ["Web Development", "Data Science", "Full Stack", "Mobile App", "Cloud/DevOps", "Cyber Security", "Not Decided"]
TARGETS = ["Product-based", "Service-based", "Startup", "Mass Recruiter"]
STRENGTHS = ["DSA", "DBMS", "OS", "Networking", "None"]
PLATFORMS = ["LeetCode", "HackerRank", "GeeksforGeeks", "CodeChef", "Never tried"]
EXPOSURES = ["Zero", "1 basic", "2+ projects", "Major Internship"]
APTITUDES = ["Poor", "Average", "Good", "Excellent"]
CONFIDENCES = ["Very Nervous", "Nervous", "Need Practice", "Fairly Confident", "Very Confident"]

# Distribution Counts
TOTAL_RECORDS = 200
READINESS_COUNTS = {"Just Starting": 40, "Learning Basics": 60, "Actively Practicing": 50, "Ready for Interviews": 50}
DOMAIN_COUNTS = {"Not Decided": 40, "Web Development": 36, "Data Science": 30, "Full Stack": 30, "Cloud/DevOps": 24, "Cyber Security": 20, "Mobile App": 20}
TARGET_COUNTS = {"Mass Recruiter": 50, "Service-based": 50, "Startup": 50, "Product-based": 50}
APTITUDE_COUNTS = {"Poor": 40, "Average": 60, "Good": 60, "Excellent": 40}

# Seed Records (1-40)
seed_csv = """CSE001,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Very Nervous
CSE002,Ready for Interviews,Full Stack,Product-based,DSA,LeetCode,2+ projects,Excellent,Very Confident
CSE003,Learning Basics,Web Development,Startup,DBMS,HackerRank,1 basic,Average,Need Practice
CSE004,Actively Practicing,Data Science,Product-based,OS,GeeksforGeeks,2+ projects,Good,Fairly Confident
CSE005,Just Starting,Cyber Security,Service-based,Networking,Never tried,Zero,Average,Nervous
CSE006,Learning Basics,Not Decided,Mass Recruiter,DBMS,HackerRank,Zero,Poor,Need Practice
CSE007,Ready for Interviews,Cloud/DevOps,Product-based,Networking,LeetCode,2+ projects,Excellent,Very Confident
CSE008,Actively Practicing,Mobile App,Startup,DSA,CodeChef,1 basic,Good,Fairly Confident
CSE009,Learning Basics,Web Development,Service-based,DBMS,HackerRank,1 basic,Average,Need Practice
CSE010,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Very Nervous
CSE011,Ready for Interviews,Data Science,Product-based,DSA,LeetCode,Major Internship,Excellent,Very Confident
CSE012,Actively Practicing,Full Stack,Startup,OS,GeeksforGeeks,2+ projects,Good,Fairly Confident
CSE013,Learning Basics,Cyber Security,Service-based,Networking,HackerRank,Zero,Average,Need Practice
CSE014,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Nervous
CSE015,Ready for Interviews,Cloud/DevOps,Product-based,DSA,LeetCode,2+ projects,Excellent,Very Confident
CSE016,Learning Basics,Web Development,Startup,DBMS,HackerRank,1 basic,Average,Need Practice
CSE017,Actively Practicing,Data Science,Product-based,OS,CodeChef,2+ projects,Good,Fairly Confident
CSE018,Just Starting,Not Decided,Service-based,None,Never tried,Zero,Poor,Very Nervous
CSE019,Ready for Interviews,Full Stack,Product-based,DSA,LeetCode,Major Internship,Excellent,Very Confident
CSE020,Actively Practicing,Mobile App,Startup,DBMS,HackerRank,1 basic,Good,Fairly Confident
CSE021,Just Starting,Cyber Security,Mass Recruiter,Networking,Never tried,Zero,Average,Nervous
CSE022,Learning Basics,Not Decided,Service-based,OS,HackerRank,Zero,Poor,Need Practice
CSE023,Ready for Interviews,Data Science,Product-based,DSA,LeetCode,2+ projects,Excellent,Very Confident
CSE024,Actively Practicing,Web Development,Startup,DBMS,GeeksforGeeks,2+ projects,Good,Fairly Confident
CSE025,Learning Basics,Full Stack,Service-based,OS,HackerRank,1 basic,Average,Need Practice
CSE026,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Very Nervous
CSE027,Ready for Interviews,Cloud/DevOps,Product-based,Networking,LeetCode,2+ projects,Excellent,Very Confident
CSE028,Actively Practicing,Data Science,Startup,DSA,CodeChef,1 basic,Good,Fairly Confident
CSE029,Learning Basics,Mobile App,Service-based,DBMS,HackerRank,Zero,Average,Need Practice
CSE030,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Nervous
CSE031,Ready for Interviews,Full Stack,Product-based,DSA,LeetCode,Major Internship,Excellent,Very Confident
CSE032,Actively Practicing,Cyber Security,Startup,Networking,GeeksforGeeks,2+ projects,Good,Fairly Confident
CSE033,Learning Basics,Web Development,Service-based,OS,HackerRank,1 basic,Average,Need Practice
CSE034,Just Starting,Data Science,Mass Recruiter,None,Never tried,Zero,Poor,Very Nervous
CSE035,Ready for Interviews,Cloud/DevOps,Product-based,DSA,LeetCode,2+ projects,Excellent,Very Confident
CSE036,Actively Practicing,Full Stack,Startup,DBMS,CodeChef,2+ projects,Good,Fairly Confident
CSE037,Learning Basics,Not Decided,Service-based,OS,HackerRank,Zero,Average,Need Practice
CSE038,Just Starting,Web Development,Mass Recruiter,None,Never tried,Zero,Poor,Nervous
CSE039,Ready for Interviews,Data Science,Product-based,DSA,LeetCode,Major Internship,Excellent,Very Confident
CSE040,Actively Practicing,Mobile App,Startup,DBMS,GeeksforGeeks,1 basic,Good,Fairly Confident"""

# Parse seed to track current counts
current_readiness = {"Just Starting": 0, "Learning Basics": 0, "Actively Practicing": 0, "Ready for Interviews": 0}
current_domains = {d: 0 for d in DOMAINS}
current_targets = {t: 0 for t in TARGETS}
current_aptitudes = {a: 0 for a in APTITUDES}

seed_lines = seed_csv.split('\n')
for line in seed_lines:
    parts = line.split(',')
    current_readiness[parts[1]] += 1
    current_domains[parts[2]] += 1
    current_targets[parts[3]] += 1
    current_aptitudes[parts[7]] += 1

def generate_record(sid, prev_readiness):
    # Determine Readiness (Respecting consecutive constraint)
    r_options = [r for r, count in READINESS_COUNTS.items() if count > current_readiness[r] and r != prev_readiness]
    if not r_options: # Fallback if only one option left and it's consecutive
        r_options = [r for r, count in READINESS_COUNTS.items() if count > current_readiness[r]]
    readiness = random.choice(r_options)

    # Determine Domain
    d_options = [d for d, count in DOMAIN_COUNTS.items() if count > current_domains[d]]
    domain = random.choice(d_options)

    # Determine Target
    t_options = [t for t, count in TARGET_COUNTS.items() if count > current_targets[t]]
    # Product-based constraint: Not Just Starting
    if readiness == "Just Starting":
        t_options = [t for t in t_options if t != "Product-based"]
    target = random.choice(t_options)

    # Core_CS_Strength based on Domain
    if domain == "Web Development": strength = random.choice(["DBMS", "OS", "None"])
    elif domain == "Data Science": strength = random.choice(["DSA", "DBMS", "OS"])
    elif domain == "Full Stack": strength = random.choice(["DSA", "DBMS", "OS"])
    elif domain == "Mobile App": strength = random.choice(["DSA", "OS", "None"])
    elif domain == "Cloud/DevOps": strength = random.choice(["Networking", "OS", "DSA"])
    elif domain == "Cyber Security": strength = random.choice(["Networking", "OS"])
    else: strength = random.choice(["None", "DBMS"]) # Not Decided

    # Coding_Platform based on Readiness and Strength
    if readiness == "Just Starting": platform = random.choice(["Never tried", "HackerRank"])
    elif readiness == "Learning Basics": platform = random.choice(["HackerRank", "GeeksforGeeks", "Never tried"])
    elif readiness == "Actively Practicing": platform = random.choice(["LeetCode", "HackerRank", "CodeChef", "GeeksforGeeks"])
    else: platform = random.choice(["LeetCode", "GeeksforGeeks"]) # Ready for Interviews

    # Rule 5: Strength None only if Platform Never tried or HackerRank
    if strength == "None":
        platform = random.choice(["Never tried", "HackerRank"])

    # Project_Exposure based on Readiness
    if readiness == "Just Starting": exposure = random.choice(["Zero", "1 basic"])
    elif readiness == "Learning Basics": exposure = random.choice(["Zero", "1 basic"])
    elif readiness == "Actively Practicing": exposure = random.choice(["1 basic", "2+ projects"])
    else: exposure = random.choice(["2+ projects", "Major Internship"]) # Ready for Interviews

    # Aptitude_Level based on Readiness and Target
    a_options = [a for a, count in APTITUDE_COUNTS.items() if count > current_aptitudes[a]]
    
    if target == "Product-based":
        a_options = [a for a in a_options if a in ["Good", "Excellent"]]
    
    if readiness == "Just Starting": a_options = [a for a in a_options if a in ["Poor", "Average"]]
    elif readiness == "Learning Basics": a_options = [a for a in a_options if a in ["Poor", "Average"]]
    elif readiness == "Actively Practicing": a_options = [a for a in a_options if a in ["Average", "Good"]]
    elif readiness == "Ready for Interviews": a_options = [a for a in a_options if a in ["Good", "Excellent"]]

    if not a_options: a_options = APTITUDES # Absolute fallback
    aptitude = random.choice(a_options)

    # Comm_Confidence based on Readiness
    if readiness == "Just Starting": confidence = random.choice(["Very Nervous", "Nervous"])
    elif readiness == "Learning Basics": confidence = random.choice(["Nervous", "Need Practice"])
    elif readiness == "Actively Practicing": confidence = random.choice(["Need Practice", "Fairly Confident"])
    else: confidence = random.choice(["Fairly Confident", "Very Confident"]) # Ready for Interviews

    # Update counts
    current_readiness[readiness] += 1
    current_domains[domain] += 1
    current_targets[target] += 1
    current_aptitudes[aptitude] += 1

    return f"{sid},{readiness},{domain},{target},{strength},{platform},{exposure},{aptitude},{confidence}"

# Generate the remaining 160 records
final_lines = seed_lines[:]
last_r = seed_lines[-1].split(',')[1]

for i in range(41, 201):
    sid = f"CSE{i:03d}"
    record = generate_record(sid, last_r)
    final_lines.append(record)
    last_r = record.split(',')[1]

with open("student_dataset.csv", "w", encoding="utf-8") as f:
    f.write("Student_ID,Readiness_Level,Domain_Interest,Target_Company,Core_CS_Strength,Coding_Platform,Project_Exposure,Aptitude_Level,Comm_Confidence\n")
    for line in final_lines:
        f.write(line + "\n")
print("Dataset saved to student_dataset.csv")
