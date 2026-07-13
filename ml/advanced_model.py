import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import json

# 1. Load Dataset
try:
    df = pd.read_csv('student_dataset.csv')
except FileNotFoundError:
    print("Dataset not found. Run generate_dataset_final.py first.")
    exit()

# 2. Preprocessing for XGBoost
categorical_cols = [
    'Domain_Interest', 'Target_Company', 'Core_CS_Strength', 
    'Coding_Platform', 'Project_Exposure', 'Aptitude_Level', 'Comm_Confidence'
]

le_dict = {}
X = df[categorical_cols].copy()
y = df['Readiness_Level']

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    le_dict[col] = le

le_y = LabelEncoder()
y_encoded = le_y.fit_transform(y)

# 3. Train XGBoost Model
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# XGBoost Classifier
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    objective='multi:softprob',
    random_state=42
)

model.fit(X_train, y_train)

# 4. Bayesian Inference Mapping
# We want to map survey answers to Domain probability
# P(Domain | Answers)
domain_probs = {}
for domain in df['Domain_Interest'].unique():
    subset = df[df['Domain_Interest'] == domain]
    # Calculate conditional probabilities for each feature
    feature_conditionals = {}
    for col in categorical_cols:
        if col == 'Domain_Interest': continue
        counts = subset[col].value_counts(normalize=True).to_dict()
        feature_conditionals[col] = counts
    
    domain_probs[domain] = {
        'prior': len(subset) / len(df),
        'conditionals': feature_conditionals
    }

# 5. Save Everything
with open('ml/advanced_analytics.pkl', 'wb') as f:
    pickle.dump({
        'xgboost_model': model,
        'label_encoders': le_dict,
        'target_encoder': le_y,
        'features': categorical_cols,
        'bayesian_mapping': domain_probs
    }, f)

print("Advanced ML Analytics (XGBoost + Bayesian) Ready.")
print(f"XGBoost Test Accuracy: {model.score(X_test, y_test):.2f}")
