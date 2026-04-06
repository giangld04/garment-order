"""
train_product_potential.py — Score products by growth potential for business decisions.

Metrics per product:
  - recent_qty:    total quantity in last 3 months
  - prev_qty:      total quantity in 3 months before that
  - growth_rate:   (recent - prev) / max(prev, 1)  → positive = growing
  - order_breadth: % of orders that included this product (popularity)
  - velocity:      recent_qty × order_breadth  → high = hot product
  - trend_slope:   linear regression slope over monthly qty (from sklearn)
  - potential_score: composite score combining all above

Output: saves ranked list to ml_models/product_potential.joblib
"""
import os
import warnings
import numpy as np
import pandas as pd
import joblib
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from orders.models import OrderDetail, Order

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), '..', '..', '..', 'ml_models', 'product_potential.joblib'
)


class Command(BaseCommand):
    help = 'Score products by growth potential to guide catalog/production decisions'

    def handle(self, *args, **options):
        today = date.today()
        cutoff_recent = today - timedelta(days=90)   # last 3 months
        cutoff_prev   = today - timedelta(days=180)  # 3-6 months ago

        total_orders = Order.objects.exclude(status='cancelled').count()
        if total_orders == 0:
            self.stdout.write(self.style.WARNING('No order data. Run seed_all first.'))
            return

        base_qs = OrderDetail.objects.exclude(order__status='cancelled')

        # ── Recent vs previous period totals ──────────────────────────────────
        recent = (
            base_qs.filter(order__order_date__gte=cutoff_recent)
            .values('product_id', 'product__name', 'product__category')
            .annotate(recent_qty=Sum('quantity'), recent_orders=Count('order_id', distinct=True))
        )
        prev = (
            base_qs.filter(order__order_date__gte=cutoff_prev, order__order_date__lt=cutoff_recent)
            .values('product_id')
            .annotate(prev_qty=Sum('quantity'))
        )

        recent_df = pd.DataFrame(list(recent)).rename(columns={
            'product__name': 'name', 'product__category': 'category'
        })
        prev_df = pd.DataFrame(list(prev)) if list(prev) else pd.DataFrame(columns=['product_id', 'prev_qty'])

        df = recent_df.merge(prev_df, on='product_id', how='left').fillna(0)
        df['recent_qty']    = df['recent_qty'].astype(float)
        df['prev_qty']      = df['prev_qty'].astype(float)
        df['recent_orders'] = df['recent_orders'].astype(float)

        # ── Growth rate ───────────────────────────────────────────────────────
        df['growth_rate'] = (df['recent_qty'] - df['prev_qty']) / df['prev_qty'].clip(lower=1)

        # ── Order breadth: % of total orders containing this product ─────────
        df['order_breadth'] = df['recent_orders'] / max(total_orders, 1)

        # ── Trend slope per product (monthly qty over all history) ────────────
        monthly_qs = (
            base_qs
            .annotate(month=TruncMonth('order__order_date'))
            .values('product_id', 'month')
            .annotate(qty=Sum('quantity'))
            .order_by('product_id', 'month')
        )
        monthly_df = pd.DataFrame(list(monthly_qs))
        monthly_df['qty'] = monthly_df['qty'].astype(float)

        slopes = {}
        if not monthly_df.empty:
            from sklearn.linear_model import LinearRegression
            for pid, grp in monthly_df.groupby('product_id'):
                grp = grp.sort_values('month').reset_index(drop=True)
                if len(grp) < 2:
                    slopes[pid] = 0.0
                    continue
                X = grp.index.values.reshape(-1, 1)
                y = grp['qty'].values
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore')
                    reg = LinearRegression().fit(X, y)
                slopes[pid] = float(reg.coef_[0])

        df['trend_slope'] = df['product_id'].map(slopes).fillna(0)

        # ── Composite potential score (normalized, weighted) ──────────────────
        def _minmax(s):
            rng = s.max() - s.min()
            return (s - s.min()) / rng if rng > 0 else s * 0

        df['score_growth']  = _minmax(df['growth_rate'])
        df['score_breadth'] = _minmax(df['order_breadth'])
        df['score_slope']   = _minmax(df['trend_slope'])
        df['score_recent']  = _minmax(df['recent_qty'])

        # Weights: trend slope matters most for "potential", recent volume for safety
        df['potential_score'] = (
            0.35 * df['score_slope']   +
            0.30 * df['score_growth']  +
            0.20 * df['score_breadth'] +
            0.15 * df['score_recent']
        ).round(4)

        df = df.sort_values('potential_score', ascending=False).reset_index(drop=True)
        df['rank'] = df.index + 1

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump({'results': df, 'generated_at': today.isoformat()}, MODEL_PATH)

        self.stdout.write(self.style.SUCCESS(
            f'Product potential scored for {len(df)} products. Top: {df["name"].iloc[0]} '
            f'(score={df["potential_score"].iloc[0]})'
        ))
