"""
train_recommendations.py — Train collaborative filtering model for product recommendations.

Algorithm:
  1. Build customer-product purchase matrix (rows=customers, cols=products, values=total qty)
  2. Compute cosine similarity between customers
  3. Save matrix + similarity + product metadata to joblib
"""
import os
import numpy as np
import pandas as pd
import joblib
from django.core.management.base import BaseCommand
from django.db.models import Sum
from orders.models import OrderDetail

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), '..', '..', '..', 'ml_models', 'recommendations.joblib'
)


class Command(BaseCommand):
    help = 'Train collaborative filtering model for product recommendations'

    def handle(self, *args, **options):
        # Aggregate customer-product purchase totals (separate from metadata lookups)
        qs = (
            OrderDetail.objects
            .exclude(order__status='cancelled')
            .values('order__customer_id', 'product_id')
            .annotate(total_qty=Sum('quantity'))
        )

        rows = list(qs)
        if len(rows) < 5:
            self.stdout.write(self.style.WARNING('Not enough data (need at least 5 order-detail rows). Run seed_all first.'))
            return

        df = pd.DataFrame(rows).rename(columns={
            'order__customer_id': 'customer_id',
        })

        # Fetch product metadata separately
        from products.models import Product
        from customers.models import Customer
        product_meta = {
            p.id: {'product_name': p.name, 'category': p.category}
            for p in Product.objects.all()
        }
        customer_meta = {
            c.id: {'customer_name': c.name}
            for c in Customer.objects.all()
        }

        # Build customer-product matrix (normalize each row so popularity doesn't dominate)
        matrix = df.pivot_table(
            index='customer_id', columns='product_id',
            values='total_qty', fill_value=0
        )

        # Drop customers with zero purchases, convert to binary (bought/not)
        matrix = matrix.loc[matrix.sum(axis=1) > 0]
        binary = (matrix.values > 0).astype(np.float64)

        # Cosine similarity matrix: shape (n_customers, n_customers)
        import warnings
        from sklearn.metrics.pairwise import cosine_similarity
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', RuntimeWarning)
            similarity = cosine_similarity(binary)

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump({
            'matrix': matrix,           # DataFrame: index=customer_id, cols=product_id
            'similarity': similarity,    # ndarray (n_customers, n_customers)
            'product_meta': product_meta,
            'customer_meta': customer_meta,
        }, MODEL_PATH)

        self.stdout.write(self.style.SUCCESS(
            f'Recommendation model trained: {len(matrix)} customers × {len(matrix.columns)} products. '
            f'Saved to {MODEL_PATH}'
        ))
