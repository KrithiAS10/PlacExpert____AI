"""
bayesian_recommendation.py — Step 3: Career Domain Recommendation
=================================================================
Uses Bayesian Inference to generate probability-based career domain
recommendations based on student profiling answers.

Algorithm:
  P(Domain | Answers) ∝ P(Domain) × ∏ P(Answer_i | Domain)

Stores learned probabilities in bayesian_probabilities.json.

Usage (CLI):
  python bayesian_recommendation.py '{"Academic_Year":"3rd Year",...}'

Returns JSON:
  {
    "recommendations": [
      {"domain": "AI/ML", "probability": 0.35},
      {"domain": "Data Science", "probability": 0.28},
      ...
    ],
    "top_domain": "AI/ML"
  }
"""

import os
import sys
import json
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "student_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
PROBS_PATH = os.path.join(MODEL_DIR, "bayesian_probabilities.json")

# Feature columns used for Bayesian inference
BAYESIAN_FEATURES = [
    "Academic_Year",
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

# Standardization maps (must match train_readiness.py)
DOMAIN_MAP = {
    "Mobile Development": "Mobile App Development",
    "Computer Networks": "CN",
    "Operating Systems": "OS",
}


def train_bayesian():
    """
    Train the Bayesian inference model by computing prior and
    conditional probabilities from the training dataset.

    Saves probabilities to bayesian_probabilities.json.
    """
    df = pd.read_csv(DATASET_PATH)

    # Standardize
    df["Domain_Interest"] = df["Domain_Interest"].replace(DOMAIN_MAP)
    df["Core_CS_Strength"] = df["Core_CS_Strength"].replace(DOMAIN_MAP)

    # Fill missing values
    df.fillna({"Projects": "None", "Core_CS_Strength": "None", "Hackathons": "None"}, inplace=True)

    domains = df["Domain_Interest"].unique().tolist()
    total = len(df)

    bayesian_model = {}

    for domain in domains:
        subset = df[df["Domain_Interest"] == domain]
        # Prior: P(Domain)
        prior = len(subset) / total

        # Conditionals: P(Feature_Value | Domain) with Laplace smoothing
        conditionals = {}
        for col in BAYESIAN_FEATURES:
            value_counts = subset[col].value_counts()
            all_values = df[col].unique()
            num_unique = len(all_values)

            # Laplace smoothing: (count + 1) / (total_in_domain + num_unique_values)
            col_probs = {}
            for val in all_values:
                count = value_counts.get(val, 0)
                col_probs[str(val)] = (count + 1) / (len(subset) + num_unique)

            conditionals[col] = col_probs

        bayesian_model[domain] = {
            "prior": prior,
            "conditionals": conditionals,
        }

    # Save to JSON
    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(PROBS_PATH, "w") as f:
        json.dump(bayesian_model, f, indent=2)

    print(f"[SAVED] Bayesian probabilities → {PROBS_PATH}")
    print(f"[INFO] Domains: {domains}")
    return bayesian_model


def load_bayesian():
    """Load previously trained Bayesian probabilities from disk."""
    if not os.path.exists(PROBS_PATH):
        print("[INFO] No saved model found. Training from dataset...")
        return train_bayesian()

    with open(PROBS_PATH, "r") as f:
        return json.load(f)


def recommend(input_data: dict) -> dict:
    """
    Given student profiling answers, compute posterior probabilities
    for each domain using Bayesian Inference.

    Args:
        input_data: Dict with keys from BAYESIAN_FEATURES.

    Returns:
        Dict with ranked domain recommendations and probabilities.
    """
    model = load_bayesian()

    domain_scores = {}

    for domain, info in model.items():
        # Start with log-prior
        log_score = np.log(info["prior"])

        for col in BAYESIAN_FEATURES:
            val = str(input_data.get(col, "None"))
            if col in info["conditionals"]:
                # P(Value | Domain) — fallback to small probability for unseen values
                p_val = info["conditionals"][col].get(val, 0.001)
                log_score += np.log(p_val)

        domain_scores[domain] = float(np.exp(log_score))

    # Normalize to sum to 1
    total = sum(domain_scores.values())
    if total > 0:
        domain_scores = {k: round(v / total, 4) for k, v in domain_scores.items()}

    # Sort by probability descending
    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)

    recommendations = [
        {"domain": domain, "probability": prob} for domain, prob in sorted_domains
    ]

    return {
        "recommendations": recommendations,
        "top_domain": sorted_domains[0][0] if sorted_domains else None,
    }


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--train":
            train_bayesian()
            print("✅ Bayesian model trained successfully!")
        else:
            if arg.startswith("'") and arg.endswith("'"):
                arg = arg[1:-1]
            input_json = json.loads(arg)
            result = recommend(input_json)
            print(json.dumps(result))
    else:
        # Default: train if no args provided
        train_bayesian()
        print("✅ Bayesian model trained. Use --train to retrain or pass JSON to predict.")
