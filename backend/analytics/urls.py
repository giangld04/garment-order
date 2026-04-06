from django.urls import path
from .views import (
    DashboardView,
    MonthlyRevenueView,
    OrderTrendsView,
    PredictView,
    RecommendView,
    ProductPotentialView,
    ExportExcelView,
    ExportPdfView,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='analytics-dashboard'),
    path('revenue/', MonthlyRevenueView.as_view(), name='analytics-revenue'),
    path('order-trends/', OrderTrendsView.as_view(), name='analytics-order-trends'),
    path('predict/', PredictView.as_view(), name='analytics-predict'),
    path('recommendations/', RecommendView.as_view(), name='analytics-recommendations'),
    path('product-potential/', ProductPotentialView.as_view(), name='analytics-product-potential'),
    path('export/excel/', ExportExcelView.as_view(), name='analytics-export-excel'),
    path('export/pdf/', ExportPdfView.as_view(), name='analytics-export-pdf'),
]
