"""
seed_data.py — Generate 18-24 months of fake order data for development/ML training.
Creates customers, products, orders with order details and production progress.
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from customers.models import Customer
from products.models import Product
from orders.models import Order, OrderDetail, ProductionProgress

User = get_user_model()

CUSTOMER_NAMES = [
    'Nguyễn Thị Lan', 'Trần Văn Nam', 'Lê Thị Hoa', 'Phạm Văn Minh',
    'Hoàng Thị Mai', 'Vũ Văn Hùng', 'Đặng Thị Thu', 'Bùi Văn Đức',
    'Đỗ Thị Nga', 'Nguyễn Văn Tùng', 'Trần Thị Linh', 'Lê Văn Khoa',
    'Phạm Thị Bích', 'Hoàng Văn Long', 'Vũ Thị Nhung', 'Đặng Văn Sơn',
    'Bùi Thị Hằng', 'Đỗ Văn Thắng', 'Nguyễn Thị Yến', 'Trần Văn Phúc',
]

PRODUCTS_DATA = [
    ('AO001', 'Áo sơ mi nam trắng', 'ao', 185000),
    ('AO002', 'Áo thun polo nam', 'ao', 220000),
    ('AO003', 'Áo khoác nữ mùa đông', 'ao', 450000),
    ('AO004', 'Áo dài truyền thống nữ', 'ao', 650000),
    ('AO005', 'Áo blazer công sở nữ', 'ao', 520000),
    ('QUAN001', 'Quần tây nam công sở', 'quan', 380000),
    ('QUAN002', 'Quần jean nữ slim fit', 'quan', 320000),
    ('QUAN003', 'Quần short nam thể thao', 'quan', 150000),
    ('QUAN004', 'Quần âu nữ ống rộng', 'quan', 290000),
    ('VAY001', 'Váy xòe hoa nữ mùa hè', 'vay', 280000),
    ('VAY002', 'Váy body sự kiện', 'vay', 420000),
    ('VAY003', 'Chân váy denim nữ', 'vay', 260000),
    ('BO001', 'Bộ đồ thể thao nam', 'do_bo', 350000),
    ('BO002', 'Bộ đồ công sở nữ', 'do_bo', 680000),
    ('BO003', 'Đồ bộ mặc nhà cotton', 'do_bo', 180000),
]

STATUS_WEIGHTS = [
    ('pending', 5),
    ('confirmed', 10),
    ('producing', 15),
    ('completed', 60),
    ('cancelled', 10),
]


def weighted_status():
    statuses = [s for s, w in STATUS_WEIGHTS for _ in range(w)]
    return random.choice(statuses)


def random_date_in_range(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


class Command(BaseCommand):
    help = 'Seed 18-24 months of fake order data for ML training'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data first')
        parser.add_argument('--orders', type=int, default=250, help='Number of orders to create')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Order.objects.all().delete()
            Customer.objects.all().delete()
            Product.objects.filter(code__in=[p[0] for p in PRODUCTS_DATA]).delete()

        # Get or create admin user for created_by
        admin_user = User.objects.filter(is_superuser=True).first()

        # Create customers
        self.stdout.write('Creating customers...')
        customers = []
        for name in CUSTOMER_NAMES:
            customer, _ = Customer.objects.get_or_create(
                name=name,
                defaults={
                    'phone': f'09{random.randint(10000000, 99999999)}',
                    'email': f'{name.split()[0].lower()}{random.randint(1, 99)}@email.com',
                }
            )
            customers.append(customer)

        # Create products
        self.stdout.write('Creating products...')
        products = []
        for code, name, category, price in PRODUCTS_DATA:
            product, _ = Product.objects.get_or_create(
                code=code,
                defaults={'name': name, 'category': category, 'unit_price': price}
            )
            products.append(product)

        # Date range: 20 months back from today
        end_date = date.today()
        start_date = date(end_date.year - 1, end_date.month, 1)
        if end_date.month <= 6:
            start_date = date(end_date.year - 2, end_date.month + 6, 1)

        # Create orders
        num_orders = options['orders']
        self.stdout.write(f'Creating {num_orders} orders...')
        created = 0

        for _ in range(num_orders):
            order_date = random_date_in_range(start_date, end_date)
            delivery_date = order_date + timedelta(days=random.randint(14, 60))
            status = weighted_status()

            order = Order.objects.create(
                customer=random.choice(customers),
                created_by=admin_user,
                order_date=order_date,
                delivery_date=delivery_date,
                status=status,
                total_amount=0,
            )

            # Create 1-5 order details
            total = 0
            num_details = random.randint(1, 5)
            for product in random.sample(products, min(num_details, len(products))):
                quantity = random.randint(10, 200)
                unit_price = product.unit_price
                detail = OrderDetail.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price,
                )
                total += detail.subtotal

            order.total_amount = total
            order.save(update_fields=['total_amount'])

            # Add production progress for non-pending orders
            if status not in ('pending', 'cancelled'):
                stages = ['cutting', 'sewing', 'finishing', 'quality_check', 'packaging']
                stage_status = 'completed' if status == 'completed' else 'in_progress'
                for stage in stages[:random.randint(1, 5)]:
                    ProductionProgress.objects.get_or_create(
                        order=order,
                        stage=stage,
                        defaults={'status': stage_status}
                    )
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. Created {len(customers)} customers, {len(products)} products, {created} orders.'
        ))
