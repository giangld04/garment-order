from rest_framework.permissions import BasePermission

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOrderManager(BasePermission):
    """Allows admin and order_manager roles."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'order_manager')


class IsProductionManager(BasePermission):
    """Allows admin and production_manager roles."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'production_manager')


class IsAdminOrReadOnly(BasePermission):
    """Read-only for any authenticated user; write requires admin."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'
