"""
train_model.py — Management command to train the order prediction ML model.
Aggregates monthly order counts, trains LinearRegression, saves via joblib.
"""
import os
import pandas as pd
import joblib
from django.core.management.base import BaseCommand
from django.db.models import Count
from django.db.models.functions import TruncMonth
from orders.models import Order

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'order_prediction.joblib')


class Command(BaseCommand):
    help = 'Train order prediction model using LinearRegression on monthly order counts'

    def handle(self, *args, **options):
        # Aggregate monthly order counts (exclude cancelled)
        queryset = (
            Order.objects
            .exclude(status='cancelled')
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        data = list(queryset)
        if len(data) < 3:
            self.stdout.write(
                self.style.WARNING('Not enough data to train (need at least 3 months). Run seed_data first.')
            )
            return

        # Build DataFrame with feature engineering
        df = pd.DataFrame(data)
        df['month_num'] = range(len(df))
        df['quarter'] = df['month'].apply(lambda x: (x.month - 1) // 3 + 1)

        X = df[['month_num', 'quarter']]
        y = df['count']

        # Train model — import here to avoid startup cost
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        model.fit(X, y)

        # Save model
        os.makedirs(MODEL_DIR, exist_ok=True)
        meta = {
            'model': model,
            'total_months': len(df),
            'last_month_num': int(df['month_num'].iloc[-1]),
        }
        joblib.dump(meta, MODEL_PATH)

        score = model.score(X, y)
        self.stdout.write(self.style.SUCCESS(
            f'Model trained on {len(df)} months of data. R² = {score:.3f}. Saved to {MODEL_PATH}'
        ))
