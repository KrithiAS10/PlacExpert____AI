import random

# Configuration
TOTAL_RECORDS = 200
READINESS_COUNTS = {
    "Just Starting": 40,
    "Learning Basics": 60,
    "Actively Practicing": 50,
    "Ready for Interviews": 50
}

DOMAINS = [
    "Web Development", "Data Science", "Full Stack", "Mobile App", 
    "Cloud/DevOps", "Cyber Security", "Not Decided"
]

# Seed records (1-40)
seed_data = """CSE001,Just Starting,Not Decided,Mass Recruiter,None,Never tried,Zero,Poor,Very Nervous
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

def generate_record(sid, readiness, prev_readiness):
    while readiness == prev_readiness:
        # This shouldn't happen with our pool-based approach but for safety
        pass

    # Domain Interest
    domain = random.choice(DOMAINS)
    
    # Target Company & Core CS Strength based on domain
    if domain == "Not Decided":
        target = random.choice(["Mass Recruiter", "Service-based"])
        strength = random.choice(["None", "DBMS"])
    elif domain == "Data Science":
        target = random.choice(["Product-based", "Service-based", "Startup", "Mass Recruiter"])
        strength = random.choice(["DSA", "OS", "DBMS"])
    elif domain == "Cloud/DevOps":
        target = random.choice(["Product-based", "Service-based", "Startup", "Mass Recruiter"])
        strength = random.choice(["Networking", "OS", "DSA"])
    elif domain == "Cyber Security":
        target = random.choice(["Product-based", "Service-based", "Startup", "Mass Recruiter"])
        strength = random.choice(["Networking", "OS"])
    else:
        target = random.choice(["Product-based", "Service-based", "Startup", "Mass Recruiter"])
        strength = random.choice(["DSA", "DBMS", "OS", "Networking", "None"])

    # Consistency with Strength
    if strength == "None":
        platform = random.choice(["Never tried", "HackerRank"])
    else:
        platform = random.choice(["LeetCode", "HackerRank", "GeeksforGeeks", "CodeChef", "Never tried"])

    # Readiness Logic
    if readiness == "Just Starting":
        target = random.choice(["Service-based", "Startup", "Mass Recruiter"]) # Cannot be Product-based
        platform = random.choice(["Never tried", "HackerRank"])
        exposure = random.choice(["Zero", "1 basic"])
        aptitude = random.choice(["Poor", "Average"])
        confidence = random.choice(["Very Nervous", "Nervous"])
    
    elif readiness == "Learning Basics":
        platform = random.choice(["HackerRank", "GeeksforGeeks", "Never tried"])
        exposure = random.choice(["Zero", "1 basic"])
        aptitude = random.choice(["Poor", "Average"])
        confidence = random.choice(["Very Nervous", "Nervous", "Need Practice"])
        
    elif readiness == "Actively Practicing":
        platform = random.choice(["LeetCode", "HackerRank", "CodeChef", "GeeksforGeeks"])
        exposure = random.choice(["1 basic", "2+ projects"])
        # Major Internship is allowed but rare
        if random.random() < 0.2: exposure = "Major Internship"
        aptitude = random.choice(["Average", "Good"])
        confidence = random.choice(["Need Practice", "Fairly Confident"])

    elif readiness == "Ready for Interviews":
        platform = random.choice(["LeetCode", "GeeksforGeeks"])
        exposure = random.choice(["2+ projects", "Major Internship"])
        aptitude = random.choice(["Good", "Excellent"])
        confidence = random.choice(["Fairly Confident", "Very Confident"])

    # Final Product-based check
    if target == "Product-based":
        if readiness == "Just Starting":
            target = "Startup" # Fallback
        aptitude = random.choice(["Good", "Excellent"])

    return f"{sid},{readiness},{domain},{target},{strength},{platform},{exposure},{aptitude},{confidence}"

# Initialize pool
records = seed_data.split('\n')
current_counts = {
    "Just Starting": 0,
    "Learning Basics": 0,
    "Actively Practicing": 0,
    "Ready for Interviews": 0
}

for line in records:
    r = line.split(',')[1]
    current_counts[r] += 1

pool = []
for r, target in READINESS_COUNTS.items():
    diff = target - current_counts[r]
    pool.extend([r] * diff)

random.shuffle(pool)

# Generate with consecutive check
final_records = records[:]
prev_r = records[-1].split(',')[1]

for i in range(41, 201):
    sid = f"CSE{i:03d}"
    
    # Pick from pool that is not prev_r
    idx = 0
    while idx < len(pool) and pool[idx] == prev_r:
        idx += 1
    
    if idx == len(pool):
        # Swap with some previous if possible, or just pick first
        idx = 0
        
    r = pool.pop(idx)
    record = generate_record(sid, r, prev_r)
    final_records.append(record)
    prev_r = r

print("Student_ID,Readiness_Level,Domain_Interest,Target_Company,Core_CS_Strength,Coding_Platform,Project_Exposure,Aptitude_Level,Comm_Confidence")
for r in final_records:
    print(r)
