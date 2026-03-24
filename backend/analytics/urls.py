from django.urls import path
from .views import (
    DashboardView,
    MonthlyRevenueView,
    OrderTrendsView,
    PredictView,
    ExportExcelView,
    ExportPdfView,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='analytics-dashboard'),
    path('revenue/', MonthlyRevenueView.as_view(), name='analytics-revenue'),
    path('order-trends/', OrderTrendsView.as_view(), name='analytics-order-trends'),
    path('predict/', PredictView.as_view(), name='analytics-predict'),
    path('export/excel/', ExportExcelView.as_view(), name='analytics-export-excel'),
    path('export/pdf/', ExportPdfView.as_view(), name='analytics-export-pdf'),
]
