from rest_framework.routers import DefaultRouter
from .views import MaterialViewSet, MaterialUsageViewSet

router = DefaultRouter()
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'material-usages', MaterialUsageViewSet, basename='material-usage')

urlpatterns = router.urls
