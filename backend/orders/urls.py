from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, ProductionProgressViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'production-progress', ProductionProgressViewSet, basename='production-progress')

urlpatterns = router.urls
