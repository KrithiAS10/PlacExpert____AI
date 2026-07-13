import pandas as pd
import io
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# 1. Load the generated dataset
# (For the script, we'll read the output of the generation or use the file if saved)
# We will regenerate a small snippet here or assume the user has the CSV
try:
    df = pd.read_csv('student_dataset.csv')
except FileNotFoundError:
    print("Error: student_dataset.csv not found. Please save the generated CSV first.")
    exit()

# 2. Preprocessing
# Encode categorical variables
le_dict = {}
categorical_cols = [
    'Domain_Interest', 'Target_Company', 'Core_CS_Strength', 
    'Coding_Platform', 'Project_Exposure', 'Aptitude_Level', 'Comm_Confidence'
]

X = df[categorical_cols].copy()
y = df['Readiness_Level']

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    le_dict[col] = le

# Encode target
le_y = LabelEncoder()
y = le_y.fit_transform(y)

# 3. Train Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Save Model and Encoders
with open('ml/readiness_model.pkl', 'wb') as f:
    pickle.dump({
        'model': model,
        'encoders': le_dict,
        'target_encoder': le_y,
        'features': categorical_cols
    }, f)

print("ML Model trained successfully and saved to ml/readiness_model.pkl")
print(f"Accuracy on test set: {model.score(X_test, y_test):.2f}")
