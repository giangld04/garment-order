"""
recommender.py — Load collaborative filtering model and return product recommendations.

For a given customer:
  1. Find top-K similar customers (cosine similarity)
  2. Score products those customers bought that this customer has NOT bought
  3. Return top-N scored products with metadata
"""
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'recommendations.joblib')


def get_recommendations(customer_id: int, top_n: int = 5):
    """
    Return product recommendations for a customer.

    Args:
        customer_id: The customer's DB id
        top_n: Number of products to recommend (default 5)

    Returns:
        dict with keys:
          - 'recommendations': list of {product_id, name, category, score}
          - 'is_cold_start': True if customer has no purchase history
          - 'error': present if model not trained
    """
    if not os.path.exists(MODEL_PATH):
        return {'error': 'Recommendation model not trained. Run: python manage.py train_recommendations'}

    import joblib
    data = joblib.load(MODEL_PATH)
    matrix = data['matrix']          # DataFrame
    similarity = data['similarity']  # ndarray
    product_meta = data['product_meta']

    customer_ids = list(matrix.index)

    # Cold start: customer not in training data
    if customer_id not in customer_ids:
        return _popular_products(matrix, product_meta, top_n, is_cold_start=True)

    idx = customer_ids.index(customer_id)
    sim_scores = similarity[idx]          # similarity to all other customers

    # Products this customer already bought
    bought = set(matrix.columns[matrix.iloc[idx] > 0])

    # Weighted score: sum of (similarity * quantity) for each unseen product
    scores = {}
    for other_idx, sim in enumerate(sim_scores):
        if other_idx == idx or sim <= 0:
            continue
        other_row = matrix.iloc[other_idx]
        for prod_id, qty in other_row.items():
            if qty > 0 and prod_id not in bought:
                scores[prod_id] = scores.get(prod_id, 0) + sim * qty

    if not scores:
        return _popular_products(matrix, product_meta, top_n, is_cold_start=False)

    # Sort by score, take top_n
    top_products = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    return {
        'recommendations': [
            {
                'product_id': int(pid),
                'name': product_meta.get(pid, {}).get('product_name', f'Product {pid}'),
                'category': product_meta.get(pid, {}).get('category', ''),
                'score': round(float(score), 4),
            }
            for pid, score in top_products
            if pid in product_meta
        ],
        'is_cold_start': False,
    }


def _popular_products(matrix, product_meta, top_n, is_cold_start):
    """Fallback: return globally most-purchased products."""
    totals = matrix.sum(axis=0).sort_values(ascending=False)
    top = totals.head(top_n)
    return {
        'recommendations': [
            {
                'product_id': int(pid),
                'name': product_meta.get(pid, {}).get('product_name', f'Product {pid}'),
                'category': product_meta.get(pid, {}).get('category', ''),
                'score': round(float(qty), 4),
            }
            for pid, qty in top.items()
            if pid in product_meta
        ],
        'is_cold_start': is_cold_start,
    }
