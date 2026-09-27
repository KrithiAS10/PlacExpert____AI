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
    
    # Map frontend keys to model feature keys
    mapped_data = {}
    key_mapping = {
        'domain': 'Domain_Interest',
        'target': 'Target_Company',
        'strength': 'Core_CS_Strength',
        'platform': 'Coding_Platform',
        'exposure': 'Project_Exposure',
        'aptitude': 'Aptitude_Level',
        'comm': 'Comm_Confidence',
        # Keep originals if they are already mapped
        'Domain_Interest': 'Domain_Interest',
        'Target_Company': 'Target_Company',
        'Core_CS_Strength': 'Core_CS_Strength',
        'Coding_Platform': 'Coding_Platform',
        'Project_Exposure': 'Project_Exposure',
        'Aptitude_Level': 'Aptitude_Level',
        'Comm_Confidence': 'Comm_Confidence',
    }
    for k, v in input_data.items():
        if k in key_mapping:
            mapped_data[key_mapping[k]] = v
        else:
            mapped_data[k] = v

    # 1. XGBoost Readiness Prediction
    input_dict = {}
    for col in features:
        if col in mapped_data:
            try:
                input_dict[col] = le_dict[col].transform([str(mapped_data[col])])[0]
            except:
                input_dict[col] = 0 # Fallback
        else:
            input_dict[col] = 0
    input_df = pd.DataFrame([input_dict])[features]
    
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
        for col, val in mapped_data.items():
            if col in info['conditionals']:
                # P(Value | Domain)
                p_val = info['conditionals'][col].get(val, 0.001) # Laplace smoothing
                score += np.log(p_val)
        domain_results[domain] = float(np.exp(score))
    
    # Normalize domain results
    total = sum(domain_results.values())
    if total > 0:
        domain_results = {k: v/total for k, v in domain_results.items()}

    # Prioritize user's explicit domain interest if specified
    user_domain = mapped_data.get('Domain_Interest') or mapped_data.get('domain')
    if user_domain and str(user_domain).strip() and str(user_domain).strip() != "Not Decided":
        clean_user_domain = str(user_domain).strip()
        matched_key = None
        for k in domain_results.keys():
            if k.lower() == clean_user_domain.lower() or (k.lower() in clean_user_domain.lower()) or (clean_user_domain.lower() in k.lower()):
                matched_key = k
                break
        
        if not matched_key:
            matched_key = clean_user_domain
            domain_results[matched_key] = 0.0

        other_total = sum(v for k, v in domain_results.items() if k != matched_key)
        new_results = {}
        for k, v in domain_results.items():
            if k == matched_key:
                new_results[k] = 0.85
            else:
                new_results[k] = float((v / other_total * 0.15) if other_total > 0 else (0.15 / max(1, len(domain_results) - 1)))
        
        domain_results = dict(sorted(new_results.items(), key=lambda item: item[1], reverse=True))

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
