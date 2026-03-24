"""
ml_predictor.py — Load saved model and predict next N months of order volume.
Returns None if model file doesn't exist (prompts user to run train_model).
"""
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'order_prediction.joblib')


def predict_orders(current_month_num: int, months_ahead: int = 3):
    """
    Predict order volumes for the next N months.

    Args:
        current_month_num: Months elapsed since earliest order (0-indexed)
        months_ahead: Number of future months to predict (default 3)

    Returns:
        List of {month_offset, predicted_count} dicts, or None if model missing.
    """
    if not os.path.exists(MODEL_PATH):
        return None

    import joblib
    meta = joblib.load(MODEL_PATH)
    model = meta['model']

    predictions = []
    for i in range(1, months_ahead + 1):
        month_num = current_month_num + i
        # Quarter: 1-4 based on position in 12-month cycle
        quarter = ((month_num % 12) // 3) + 1
        pred = model.predict(np.array([[month_num, quarter]]))[0]
        predictions.append({
            'month_offset': i,
            'predicted_count': max(0, round(float(pred))),
        })

    return predictions
