# Code Review Report — Garment Order New Features

**Date:** 2026-03-27
**Reviewer:** code-reviewer
**Plan:** `/Users/giang/plans/260327-1509-garment-order-new-features/`

---

## Code Review Summary

### Scope
- **Files reviewed:** ~35 files across backend (suppliers, materials, notifications, accounts) and frontend (components, services, pages, types, i18n)
- **Lines of code analyzed:** ~1,200 (backend ~350, frontend ~850)
- **Review focus:** 4 new feature modules — security, error handling, pattern consistency, bugs, i18n completeness
- **Updated plans:** `/Users/giang/plans/260327-1509-garment-order-new-features/plan.md` (task status updated below)

---

### Overall Assessment

Code quality is **good**. Follows established patterns closely (mirrors customers app, uses same ViewSet/serializer/service/component structure). No SQL injection or XSS issues found (DRF ORM + React rendering). Two critical/high bugs found.

---

## Critical Issues

### 1. `UserManagementViewSet.update` — Password Update Race Condition / Double-Write Bug

**File:** `/Users/giang/Documents/Giang-Project/Test/backend/accounts/views.py` lines 46–54

**Problem:** `super().update()` saves the instance (via `UserManagementSerializer`). The serializer does NOT include password, so the password field is untouched by the super call. However, `instance` is a stale Python object fetched _before_ `super().update()` runs. If any other field on `instance` changed during the super call, `instance.save(update_fields=['password'])` will correctly only save the password column — that part is fine. **The real bug:** `instance.set_password(password)` is called on the stale `instance`, then saved. This is actually correct behavior for password. **However**, the `AUTH_PASSWORD_VALIDATORS` in settings are **not invoked** — `set_password()` bypasses Django's validation pipeline. An admin can set a 1-character password.

Additionally, `UserManagementSerializer` excludes `password` from fields, so when `super().update()` is called, the raw `password` in `request.data` is silently ignored by the serializer — **but it was already read** at line 49. The flow is correct but fragile and unintuitive.

**Fix:** Use `UserCreateSerializer` logic for updates too, or explicitly call `validate_password()`:

```python
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

def update(self, request, *args, **kwargs):
    password = request.data.get('password')
    if password:
        try:
            validate_password(password)
        except DjangoValidationError as e:
            return Response({'password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    response = super().update(request, *args, **kwargs)
    if password:
        instance = self.get_object()  # re-fetch after super() saved
        instance.set_password(password)
        instance.save(update_fields=['password'])
    return response
```

---

## High Priority Findings

### 2. `NotificationSerializer` — Exposes `user` FK (user ID) in All Endpoints

**File:** `/Users/giang/Documents/Giang-Project/Test/backend/notifications/serializers.py`

```python
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'  # includes 'user' field
```

`NotificationViewSet` filters by `request.user` so a user can only read _their own_ notifications. But the serialized response includes `user: <id>` — harmless for read. The **real issue**: `fields = '__all__'` means `user` is a writable field on `POST /notifications/notifications/`. A malicious user could `POST` a notification and set `user` to any user's ID, creating notifications for other accounts.

`NotificationViewSet` doesn't override `create()` or `perform_create()` to set `user = request.user`, so the endpoint accepts arbitrary `user` values.

**Fix:** Override `perform_create` and make `user` read-only:

```python
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at', 'user']

# in NotificationViewSet:
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```

### 3. `UserManagementViewSet` — Missing `IsAuthenticated` in `permission_classes`

**File:** `/Users/giang/Documents/Giang-Project/Test/backend/accounts/views.py` line 35

```python
permission_classes = [IsAdmin]  # IsAuthenticated missing
```

`IsAdmin.has_permission` checks `request.user.is_authenticated` internally, so unauthenticated requests will return 403 (not 401). This is a convention violation — DRF sends 401 when `IsAuthenticated` is the first class, which triggers clients to refresh tokens. Without it, clients see 403 and may not attempt token refresh.

The global `DEFAULT_PERMISSION_CLASSES` includes `IsAuthenticated`, so this is somewhat mitigated, but explicit declaration on the view overrides it. All other new views correctly include `[IsAuthenticated, IsAdmin]` or `[IsAuthenticated, IsOrderManager]`.

**Fix:**
```python
permission_classes = [IsAuthenticated, IsAdmin]
```

### 4. `production_notification` Signal — Fires on Every Save (Including Creates)

**File:** `/Users/giang/Documents/Giang-Project/Test/backend/notifications/signals.py` lines 29–45

`order_status_notification` correctly guards with `if not created:`. The `production_notification` signal has **no such guard** — it fires on both `created=True` and `created=False`, generating duplicate notifications on initial `ProductionProgress` creation and every subsequent save. This will cause notification spam.

**Fix:**
```python
@receiver(post_save, sender=ProductionProgress)
def production_notification(sender, instance, created, **kwargs):
    try:
        if created:  # or handle both cases but with different titles
            return
        ...
```
Or add a deliberate `created` branch with an appropriate title.

---

## Medium Priority Improvements

### 5. `UserManagementViewSet.destroy` — Soft-Deletes But Confirms "Deleted" on Frontend

**Backend:** `destroy()` sets `is_active=False` and calls `super().destroy()` — wait, no. It actually calls `super().destroy()` which hard-deletes. Let me re-read... actually the backend does `return super().destroy(request, *args, **kwargs)` which performs a hard delete. The plan said "soft delete (is_active=False)" but the implementation does a real delete. The `user-delete-dialog.tsx` says "Hành động này không thể hoàn tác" (irreversible) which matches hard delete. Inconsistency with plan but the behavior is consistent between backend and frontend. **Document this decision** — the plan says soft delete but the code does hard delete.

### 6. `SuppliersPage` / `UsersPage` — `fetchData` in `useCallback` Dependencies Causes Stale Closure Warning

**Files:** `frontend/app/(dashboard)/suppliers/page.tsx` line 29, `users/page.tsx` line 40

```typescript
const fetchData = useCallback(async (pg = page, q = search) => { ... }, [page, search]);
```

`fetchData` captures `page` and `search` in deps but the function signature takes them as params — the closure deps are unnecessary and cause `fetchData` to be recreated on every search/page change. Not a bug but causes extra re-renders. Low impact.

### 7. `ActivityLogTable` — Entity Type Filter Options Derived from Current Page Data Only

**File:** `frontend/components/activity-log/activity-log-table.tsx` line 31

```typescript
const entityTypes = Array.from(new Set(data.map((l) => l.entity_type))).sort();
```

Filter options are derived from the currently loaded page. If page 2 has entity types not on page 1, they won't appear in the filter dropdown until the user navigates to a page containing them. The backend supports `entity_type` as a `filterset_field` but the frontend filter is entirely client-side from visible data. Consider using a static list of known entity types or a dedicated API call.

### 8. `NotificationBell` — `timeAgo` Strings Are Hard-coded Vietnamese

**File:** `frontend/components/layout/notification-bell.tsx` lines 13–21

All time-ago strings (`'vừa xong'`, `'phút trước'`, etc.) and UI labels (`'Thông báo'`, `'Đang tải...'`, `'Không có thông báo'`) are hard-coded Vietnamese. The app supports `vi`/`en` locale toggle but this component bypasses `useTranslations`. When locale is switched to English, the notification bell still shows Vietnamese text.

**Fix:** Use `useTranslations('notifications')` and add keys to both i18n files, or at minimum move to `en.json`/`vi.json`.

---

## Low Priority Suggestions

### 9. `constants.ts` — `materials` and `products` Share the Same `Package` Icon

Lines 48 and 65: both `products` and `materials` menu items use `icon: 'Package'`. Visually confusing in the sidebar. Consider `Layers` or `Boxes` for materials.

### 10. `BLACKLIST_AFTER_ROTATION: False` in JWT Settings

`settings.py` line 133: refresh tokens are rotated but not blacklisted. Old refresh tokens remain valid until expiry (`1 day`). If a refresh token is stolen, the attacker can use it. Low risk for internal system but worth documenting as an accepted trade-off.

---

## Positive Observations

- **Solid permission model:** All new endpoints have explicit `permission_classes`. Backend `IsOrderManager` correctly allows both admin and order_manager. `IsAdmin` correctly checks `role == 'admin'`.
- **User isolation in notifications:** `get_queryset` filters `Notification` by `request.user` — users cannot read each other's notifications.
- **Password never returned:** `UserCreateSerializer.password` is `write_only=True`. `UserManagementSerializer` omits password entirely.
- **Self-delete prevention** is enforced server-side (not just UI) — correct layering.
- **`select_related` usage** in material and activity log querysets is correct and avoids N+1.
- **Signal error swallowing** with `except Exception: pass` correctly prevents signal failures from breaking order saves.
- **i18n completeness:** Both `vi.json` and `en.json` contain matching keys for all 4 new feature sections (`suppliers`, `materials`, `notifications`, `activityLog`, `users`). Keys are symmetric between files.
- **Frontend auth guard** in `layout.tsx` correctly redirects unauthenticated users — all dashboard pages are protected.
- **Soft form validation** in `user-form-modal.tsx` — correct logic for password required on create, optional on edit.

---

## Recommended Actions

1. **[HIGH]** Fix `NotificationViewSet` — make `user` read-only in serializer, override `perform_create` to set `user=request.user`
2. **[HIGH]** Fix `production_notification` signal — add `created` guard to prevent spam on new `ProductionProgress` records
3. **[HIGH]** Add `validate_password()` call in `UserManagementViewSet.update` before calling `set_password`
4. **[MEDIUM]** Add `IsAuthenticated` to `UserManagementViewSet.permission_classes`
5. **[MEDIUM]** Fix `NotificationBell` to use `useTranslations` for i18n support
6. **[MEDIUM]** Clarify soft vs. hard delete in user management — update plan or change implementation to match

---

## Metrics

- **Type Coverage:** Full TypeScript types for all new entities (`Supplier`, `Material`, `MaterialUsage`, `Notification`, `ActivityLog`, `UserFormData`) — no `any` usage observed
- **Test Coverage:** No tests added (not in scope per plan Phase 5)
- **Linting Issues:** None observed (no linter output available without running build)
- **i18n Completeness:** Both locale files are symmetric — 100% for new features. `NotificationBell` component bypasses i18n (1 component)

---

## Task Completeness Verification

All plan phase todo items appear implemented:

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Supplier Management | **Complete** | Backend + frontend fully implemented |
| Phase 2: Material Management | **Complete** | Backend + frontend + low_stock action |
| Phase 3: Notifications & Activity Log | **Complete** | Signals, ViewSets, bell component, activity log page |
| Phase 4: User Management | **Complete** | Admin CRUD, soft/hard delete, role filter |
| Phase 5: Integration & Testing | **Not started** | No tests written |

---

## Unresolved Questions

1. **Hard delete vs. soft delete for users:** Plan specifies soft delete (`is_active=False`), implementation does hard delete via `super().destroy()`. Intentional change or oversight?
2. **ActivityLog population:** No `ActivityLog.objects.create` calls anywhere in the codebase. The model and API exist but logs are never written. Is logging meant to be added separately or was it expected to use signals?
3. **`low_stock` endpoint returns non-paginated list:** `MaterialViewSet.low_stock` returns all matching materials without pagination. Could be large. Intentional?
4. **No `BLACKLIST_AFTER_ROTATION`:** Is token blacklisting deliberately skipped (performance/simplicity trade-off)?
