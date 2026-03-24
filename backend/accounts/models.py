from django.contrib.auth.models import AbstractUser
from django.db import models


# Custom User model - extends AbstractUser
# Full implementation in Phase 2
class User(AbstractUser):
    class Meta:
        db_table = 'accounts_user'
