import sys
import pickle
import json
import pandas as pd
import numpy as np

# Load the model
with open('ml/advanced_analytics.pkl', 'rb') as f:
    data = pickle.load(f)

model = data['xgboost_model']
le_dict = data['label_encoders']
le_y = data['target_encoder']
features = data['features']
bayesian_mapping = data['bayesian_mapping']

def predict(input_data):
    # input_data is a dict of feature: value
    
    # 1. XGBoost Readiness Prediction
    input_df = pd.DataFrame([input_data])
    for col in features:
        if col in input_data:
            try:
                input_df[col] = le_dict[col].transform([str(input_data[col])])
            except:
                input_df[col] = 0 # Fallback
    
    # Prediction
    pred_idx = model.predict(input_df)[0]
    readiness = le_y.inverse_transform([pred_idx])[0]
    
    # Confidence (Probabilities)
    probs = model.predict_proba(input_df)[0]
    readiness_probs = {le_y.inverse_transform([i])[0]: float(probs[i]) for i in range(len(probs))}

    # 2. Bayesian Domain Mapping
    # Calculate P(Domain | Answers)
    domain_results = {}
    for domain, info in bayesian_mapping.items():
        score = np.log(info['prior'])
        for col, val in input_data.items():
            if col in info['conditionals']:
                # P(Value | Domain)
                p_val = info['conditionals'][col].get(val, 0.001) # Laplace smoothing
                score += np.log(p_val)
        domain_results[domain] = float(np.exp(score))
    
    # Normalize domain results
    total = sum(domain_results.values())
    if total > 0:
        domain_results = {k: v/total for k, v in domain_results.items()}

    return {
        'readiness': readiness,
        'readiness_confidence': readiness_probs,
        'domain_mapping': domain_results
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg.startswith("'") and arg.endswith("'"):
            arg = arg[1:-1]
        input_json = json.loads(arg)
        result = predict(input_json)
        print(json.dumps(result))
