from django.urls import path
from .views import DashboardView, MonthlyRevenueView, OrderTrendsView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='analytics-dashboard'),
    path('revenue/', MonthlyRevenueView.as_view(), name='analytics-revenue'),
    path('order-trends/', OrderTrendsView.as_view(), name='analytics-order-trends'),
]
