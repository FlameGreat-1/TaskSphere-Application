from django_filters import rest_framework as filters
from .models import Notification

class NotificationFilter(filters.FilterSet):
    created_after = filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    is_read = filters.BooleanFilter(field_name="read_at", lookup_expr="isnull", exclude=True)

    class Meta:
        model = Notification
        fields = ['category', 'priority', 'is_read']
