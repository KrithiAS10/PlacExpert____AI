"""
train_readiness.py — Step 2 & 2A: Readiness Prediction Model Training
=====================================================================
Trains and compares Decision Tree, Random Forest, and XGBoost classifiers
to predict student readiness level (Beginner / Intermediate / Advanced).

Pipeline:
  Load Dataset → Clean Data → Handle Missing Values → Encode Features →
  Feature Engineering → Train/Test Split (80/20) → GridSearchCV →
  Train XGBoost → Evaluate → Feature Importance → Save readiness_model.pkl
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
import xgboost as xgb

# ---------------------------------------------------------------------------
# 1. LOAD DATASET
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "student_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("PlacExpert-AI — Readiness Model Training Pipeline")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)
print(f"\n[INFO] Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns")

# ---------------------------------------------------------------------------
# 2. CLEAN DATA & HANDLE MISSING VALUES
# ---------------------------------------------------------------------------
# Standardize column values to match the profiling questionnaire
DOMAIN_MAP = {
    "Mobile Development": "Mobile App Development",
    "Computer Networks": "CN",
    "Operating Systems": "OS",
}

df["Domain_Interest"] = df["Domain_Interest"].replace(DOMAIN_MAP)
df["Core_CS_Strength"] = df["Core_CS_Strength"].replace(DOMAIN_MAP)

# Fill missing values with 'None' for categorical columns
categorical_fill = {
    "Projects": "None",
    "Core_CS_Strength": "None",
    "Hackathons": "None",
}
df.fillna(categorical_fill, inplace=True)

print("[INFO] Missing values handled and data standardized.")

# ---------------------------------------------------------------------------
# 3. FEATURE SELECTION — ML features only (excludes Phase 4 roadmap fields)
# ---------------------------------------------------------------------------
ML_FEATURES = [
    "Academic_Year",
    "Domain_Interest",
    "Target_Company",
    "DSA_Count",
    "Projects",
    "Core_CS_Strength",
    "Coding_Platform",
    "Aptitude",
    "Communication",
    "Mock_Interview_Experience",
    "Coding_Confidence",
]

TARGET = "Readiness_Level"

X = df[ML_FEATURES].copy()
y = df[TARGET].copy()

# ---------------------------------------------------------------------------
# 4. ENCODE FEATURES
# ---------------------------------------------------------------------------
# Ordinal encoding for columns with natural ordering
ORDINAL_MAPPINGS = {
    "Academic_Year": ["2nd Year", "3rd Year", "4th Year", "Graduate"],
    "DSA_Count": ["0-20", "20-100", "100-300", "300+"],
    "Projects": ["None", "1", "2-3", "4+"],
    "Aptitude": ["Poor", "Average", "Good", "Excellent"],
    "Communication": [
        "Very Nervous",
        "Nervous",
        "Need Practice",
        "Fairly Confident",
        "Very Confident",
    ],
    "Mock_Interview_Experience": ["Never", "Once", "2-5 Times", "Frequently"],
    "Coding_Confidence": ["Low", "Medium", "High", "Excellent"],
}

# Apply ordinal encoding for ordered features
ordinal_cols = list(ORDINAL_MAPPINGS.keys())
ordinal_categories = [ORDINAL_MAPPINGS[col] for col in ordinal_cols]
ordinal_encoder = OrdinalEncoder(
    categories=ordinal_categories, handle_unknown="use_encoded_value", unknown_value=-1
)
X[ordinal_cols] = ordinal_encoder.fit_transform(X[ordinal_cols])

# Label encoding for nominal (unordered) features
nominal_cols = ["Domain_Interest", "Target_Company", "Core_CS_Strength", "Coding_Platform"]
label_encoders = {}
for col in nominal_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

# Encode target variable
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y)

print(f"[INFO] Features encoded. Shape: {X.shape}")
print(f"[INFO] Target classes: {list(target_encoder.classes_)}")

# ---------------------------------------------------------------------------
# 5. TRAIN/TEST SPLIT (80/20)
# ---------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"[INFO] Train size: {len(X_train)}, Test size: {len(X_test)}")

# ---------------------------------------------------------------------------
# 6. STEP 2A — MODEL COMPARISON
# ---------------------------------------------------------------------------

def evaluate_model(name, model, X_tr, y_tr, X_te, y_te):
    """Train a model and return evaluation metrics."""
    model.fit(X_tr, y_tr)
    y_pred = model.predict(X_te)
    metrics = {
        "accuracy": round(accuracy_score(y_te, y_pred), 4),
        "precision": round(precision_score(y_te, y_pred, average="weighted", zero_division=0), 4),
        "recall": round(recall_score(y_te, y_pred, average="weighted", zero_division=0), 4),
        "f1_score": round(f1_score(y_te, y_pred, average="weighted", zero_division=0), 4),
    }
    print(f"\n{'-' * 40}")
    print(f"  {name}")
    print(f"{'-' * 40}")
    for k, v in metrics.items():
        print(f"  {k:>12s}: {v:.4f}")
    return metrics, model


models_to_compare = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "XGBoost": xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective="multi:softprob",
        eval_metric="mlogloss",
        random_state=42,
        use_label_encoder=False,
    ),
}

comparison_results = {}
trained_models = {}

print("\n" + "=" * 60)
print("STEP 2A: Model Comparison")
print("=" * 60)

for name, model in models_to_compare.items():
    metrics, fitted = evaluate_model(name, model, X_train, y_train, X_test, y_test)
    comparison_results[name] = metrics
    trained_models[name] = fitted

# Select best model by F1 Score
best_model_name = max(comparison_results, key=lambda k: comparison_results[k]["f1_score"])
print(f"\n[RESULT] Best model: {best_model_name} (F1={comparison_results[best_model_name]['f1_score']:.4f})")

# ---------------------------------------------------------------------------
# 7. HYPERPARAMETER TUNING — GridSearchCV on XGBoost
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("STEP 2: XGBoost Hyperparameter Tuning (GridSearchCV)")
print("=" * 60)

param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [3, 5, 7],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.8, 1.0],
}

xgb_base = xgb.XGBClassifier(
    objective="multi:softprob",
    eval_metric="mlogloss",
    random_state=42,
    use_label_encoder=False,
)

grid_search = GridSearchCV(
    xgb_base,
    param_grid,
    cv=3,
    scoring="f1_weighted",
    n_jobs=-1,
    verbose=0,
)
grid_search.fit(X_train, y_train)

best_xgb = grid_search.best_estimator_
print(f"[INFO] Best XGBoost params: {grid_search.best_params_}")

# ---------------------------------------------------------------------------
# 8. FINAL EVALUATION
# ---------------------------------------------------------------------------
y_pred_final = best_xgb.predict(X_test)

print("\n" + "=" * 60)
print("FINAL XGBoost EVALUATION")
print("=" * 60)
print(classification_report(y_test, y_pred_final, target_names=target_encoder.classes_))

cm = confusion_matrix(y_test, y_pred_final)
print("Confusion Matrix:")
print(cm)

# Feature importance
importances = best_xgb.feature_importances_
feat_imp = sorted(zip(ML_FEATURES, importances), key=lambda x: x[1], reverse=True)
print("\nFeature Importance:")
for feat, imp in feat_imp:
    print(f"  {feat:>30s}: {imp:.4f}")

# ---------------------------------------------------------------------------
# 9. SAVE MODEL
# ---------------------------------------------------------------------------
model_artifact = {
    "model": best_xgb,
    "ordinal_encoder": ordinal_encoder,
    "ordinal_cols": ordinal_cols,
    "label_encoders": label_encoders,
    "nominal_cols": nominal_cols,
    "target_encoder": target_encoder,
    "features": ML_FEATURES,
    "comparison_results": comparison_results,
    "best_model_name": best_model_name,
    "best_params": grid_search.best_params_,
}

MODEL_PATH = os.path.join(MODEL_DIR, "readiness_model.pkl")
joblib.dump(model_artifact, MODEL_PATH)
print(f"\n[SAVED] Model artifact -> {MODEL_PATH}")

# Also save comparison report as JSON for frontend display
report_path = os.path.join(MODEL_DIR, "model_comparison_report.json")
with open(report_path, "w") as f:
    json.dump(comparison_results, f, indent=2)
print(f"[SAVED] Comparison report -> {report_path}")

print("\n[DONE] Training pipeline complete!")

