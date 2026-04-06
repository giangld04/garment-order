"""
seed_all.py — Full project seed: users, suppliers, materials, customers, products, orders.
Run: python manage.py seed_all [--clear]
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from customers.models import Customer
from products.models import Product
from orders.models import Order, OrderDetail, ProductionProgress
from suppliers.models import Supplier
from materials.models import Material, MaterialUsage

User = get_user_model()

# ── Static data ────────────────────────────────────────────────────────────────

USERS = [
    ('admin',      'admin@example.com',   'admin123',  'admin'),
    ('order_mgr',  'order@example.com',   'order123',  'order_manager'),
    ('prod_mgr',   'prod@example.com',    'prod123',   'production_manager'),
]

SUPPLIERS_DATA = [
    ('Vải Thành Công',    'Nguyễn Văn An',   '0901111111', 'vaitc@email.com',     '123 Lê Lợi, HCM',     '0300123456'),
    ('Vải Phú Hòa',       'Trần Thị Bình',   '0902222222', 'vaiphuho@email.com',  '45 Nguyễn Trãi, HN',  '0300234567'),
    ('Phụ Liệu Đông Nam', 'Lê Văn Cường',    '0903333333', 'phulieu@email.com',   '67 Bạch Đằng, ĐN',    '0300345678'),
    ('Vải Tơ Tằm Huế',    'Phạm Thị Dung',   '0904444444', 'totamhue@email.com',  '12 Hùng Vương, Huế',  '0300456789'),
    ('Cúc & Khóa Minh',   'Hoàng Văn Em',    '0905555555', 'cuckhoa@email.com',   '89 Trần Phú, BD',     '0300567890'),
]

MATERIALS_DATA = [
    # (code, name, unit, qty_stock, min_stock, unit_price, supplier_idx)
    ('VAI001', 'Vải cotton trắng',        'm', 500,  50, 45000, 0),
    ('VAI002', 'Vải jean xanh',           'm', 350,  40, 65000, 1),
    ('VAI003', 'Vải lụa tơ tằm',          'm', 120,  20, 180000, 3),
    ('VAI004', 'Vải polyester màu',       'm', 600,  60, 35000, 0),
    ('VAI005', 'Vải kaki nâu',            'm', 280,  30, 55000, 1),
    ('VAI006', 'Vải dệt kim',             'm', 200,  25, 42000, 0),
    ('CHI001', 'Chỉ may trắng',          'kg', 80,   10, 120000, 2),
    ('CHI002', 'Chỉ may đen',            'kg', 60,   10, 120000, 2),
    ('CHI003', 'Chỉ thêu màu',           'kg', 30,    5, 250000, 2),
    ('CUC001', 'Cúc nhựa trắng',    'cuon', 200,  20, 15000, 4),
    ('CUC002', 'Cúc kim loại',       'cuon', 150,  15, 35000, 4),
    ('KHOA001','Khóa kéo nylon',    'cuon', 300,  30, 8000,  4),
    ('KHOA002','Khóa kéo kim loại', 'cuon', 100,  15, 22000, 4),
    ('NHAN001','Nhãn vải thêu',     'cuon', 500,  50, 5000,  2),
    ('LOT001', 'Vải lót trắng',          'm', 250,  30, 28000, 0),
]

CUSTOMER_NAMES = [
    'Nguyễn Thị Lan', 'Trần Văn Nam', 'Lê Thị Hoa', 'Phạm Văn Minh',
    'Hoàng Thị Mai', 'Vũ Văn Hùng', 'Đặng Thị Thu', 'Bùi Văn Đức',
    'Đỗ Thị Nga', 'Nguyễn Văn Tùng', 'Trần Thị Linh', 'Lê Văn Khoa',
    'Phạm Thị Bích', 'Hoàng Văn Long', 'Vũ Thị Nhung', 'Đặng Văn Sơn',
    'Bùi Thị Hằng', 'Đỗ Văn Thắng', 'Nguyễn Thị Yến', 'Trần Văn Phúc',
    'Lý Thị Kim', 'Mai Văn Tuấn', 'Đinh Thị Loan', 'Cao Văn Dũng',
    'Tạ Thị Hương', 'Dương Văn Quân', 'Hồ Thị Thảo', 'Võ Văn Hiếu',
]

PRODUCTS_DATA = [
    ('AO001',   'Áo sơ mi nam trắng',       'ao',    185000),
    ('AO002',   'Áo thun polo nam',          'ao',    220000),
    ('AO003',   'Áo khoác nữ mùa đông',      'ao',    450000),
    ('AO004',   'Áo dài truyền thống nữ',    'ao',    650000),
    ('AO005',   'Áo blazer công sở nữ',      'ao',    520000),
    ('AO006',   'Áo thun unisex basic',      'ao',    150000),
    ('QUAN001', 'Quần tây nam công sở',      'quan',  380000),
    ('QUAN002', 'Quần jean nữ slim fit',     'quan',  320000),
    ('QUAN003', 'Quần short nam thể thao',   'quan',  150000),
    ('QUAN004', 'Quần âu nữ ống rộng',       'quan',  290000),
    ('QUAN005', 'Quần kaki nam',             'quan',  260000),
    ('VAY001',  'Váy xòe hoa nữ mùa hè',    'vay',   280000),
    ('VAY002',  'Váy body sự kiện',          'vay',   420000),
    ('VAY003',  'Chân váy denim nữ',         'vay',   260000),
    ('BO001',   'Bộ đồ thể thao nam',        'do_bo', 350000),
    ('BO002',   'Bộ đồ công sở nữ',          'do_bo', 680000),
    ('BO003',   'Đồ bộ mặc nhà cotton',      'do_bo', 180000),
]

STATUS_WEIGHTS = [
    ('pending', 5), ('confirmed', 10), ('producing', 15),
    ('completed', 60), ('cancelled', 10),
]

STAGES = ['cutting', 'sewing', 'finishing', 'quality_check', 'packaging']


# ── Helpers ───────────────────────────────────────────────────────────────────

def weighted_status():
    pool = [s for s, w in STATUS_WEIGHTS for _ in range(w)]
    return random.choice(pool)


def rand_date(start: date, end: date) -> date:
    return start + timedelta(days=random.randint(0, (end - start).days))


# ── Command ───────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Seed full project data: users, suppliers, materials, customers, products, orders'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear all seeded data first')
        parser.add_argument('--orders', type=int, default=300, help='Number of orders (default: 300)')

    def handle(self, *args, **options):
        if options['clear']:
            self._clear()

        users   = self._seed_users()
        supps   = self._seed_suppliers()
        mats    = self._seed_materials(supps)
        custs   = self._seed_customers()
        prods   = self._seed_products()
        self._seed_orders(users, custs, prods, mats, options['orders'])

    # ── Clear ──────────────────────────────────────────────────────────────────

    def _clear(self):
        self.stdout.write('Clearing data...')
        MaterialUsage.objects.all().delete()
        Order.objects.all().delete()
        Customer.objects.all().delete()
        Product.objects.filter(code__in=[p[0] for p in PRODUCTS_DATA]).delete()
        Material.objects.filter(code__in=[m[0] for m in MATERIALS_DATA]).delete()
        Supplier.objects.filter(name__in=[s[0] for s in SUPPLIERS_DATA]).delete()
        User.objects.filter(username__in=[u[0] for u in USERS]).delete()

    # ── Seeders ────────────────────────────────────────────────────────────────

    def _seed_users(self):
        self.stdout.write('Seeding users...')
        users = []
        for username, email, password, role in USERS:
            if User.objects.filter(username=username).exists():
                u = User.objects.get(username=username)
            elif role == 'admin':
                u = User.objects.create_superuser(username=username, email=email, password=password, role=role)
            else:
                u = User.objects.create_user(username=username, email=email, password=password, role=role)
            users.append(u)
        self.stdout.write(f'  {len(users)} users ready')
        return users

    def _seed_suppliers(self):
        self.stdout.write('Seeding suppliers...')
        supps = []
        for name, contact, phone, email, address, tax_code in SUPPLIERS_DATA:
            s, _ = Supplier.objects.get_or_create(
                name=name,
                defaults=dict(contact_person=contact, phone=phone,
                              email=email, address=address, tax_code=tax_code)
            )
            supps.append(s)
        self.stdout.write(f'  {len(supps)} suppliers ready')
        return supps

    def _seed_materials(self, suppliers):
        self.stdout.write('Seeding materials...')
        mats = []
        for code, name, unit, qty, min_qty, price, sup_idx in MATERIALS_DATA:
            m, _ = Material.objects.get_or_create(
                code=code,
                defaults=dict(name=name, unit=unit, quantity_in_stock=qty,
                              min_stock_level=min_qty, unit_price=price,
                              supplier=suppliers[sup_idx])
            )
            mats.append(m)
        self.stdout.write(f'  {len(mats)} materials ready')
        return mats

    def _seed_customers(self):
        self.stdout.write('Seeding customers...')
        custs = []
        for name in CUSTOMER_NAMES:
            c, _ = Customer.objects.get_or_create(
                name=name,
                defaults=dict(
                    phone=f'09{random.randint(10000000, 99999999)}',
                    email=f'{name.replace(" ", "").lower()[:8]}{random.randint(1, 99)}@email.com',
                )
            )
            custs.append(c)
        self.stdout.write(f'  {len(custs)} customers ready')
        return custs

    def _seed_products(self):
        self.stdout.write('Seeding products...')
        prods = []
        for code, name, category, price in PRODUCTS_DATA:
            p, _ = Product.objects.get_or_create(
                code=code,
                defaults=dict(name=name, category=category, unit_price=price)
            )
            prods.append(p)
        self.stdout.write(f'  {len(prods)} products ready')
        return prods

    def _seed_orders(self, users, customers, products, materials, num_orders):
        self.stdout.write(f'Seeding {num_orders} orders...')
        admin = next((u for u in users if u.role == 'admin'), users[0])
        end_date = date.today()
        start_date = date(end_date.year - 2, end_date.month, 1)
        created = 0

        for _ in range(num_orders):
            order_date    = rand_date(start_date, end_date)
            delivery_date = order_date + timedelta(days=random.randint(14, 60))
            status        = weighted_status()

            order = Order.objects.create(
                customer=random.choice(customers),
                created_by=admin,
                order_date=order_date,
                delivery_date=delivery_date,
                status=status,
                total_amount=0,
            )

            # Order details
            total = 0
            for product in random.sample(products, random.randint(1, 5)):
                quantity   = random.randint(10, 200)
                unit_price = product.unit_price
                detail = OrderDetail.objects.create(
                    order=order, product=product,
                    quantity=quantity, unit_price=unit_price,
                )
                total += detail.subtotal

            order.total_amount = total
            order.save(update_fields=['total_amount'])

            # Production stages
            if status not in ('pending', 'cancelled'):
                stage_status = 'completed' if status == 'completed' else 'in_progress'
                for stage in STAGES[:random.randint(1, 5)]:
                    ProductionProgress.objects.get_or_create(
                        order=order, stage=stage,
                        defaults={'status': stage_status}
                    )

            # Material usages (50% of orders)
            if status not in ('pending', 'cancelled') and random.random() < 0.5:
                for mat in random.sample(materials, random.randint(1, 4)):
                    MaterialUsage.objects.create(
                        order=order, material=mat,
                        quantity_used=round(random.uniform(1, 50), 2),
                    )

            created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. {created} orders created with production progress and material usages.'
        ))
