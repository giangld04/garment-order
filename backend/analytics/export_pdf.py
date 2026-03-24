"""
export_pdf.py — Export orders to PDF using reportlab.
Uses ASCII Vietnamese (no diacritics) to avoid font issues.
Supports optional start_date/end_date filtering. Streams as HttpResponse.
"""
import io
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from django.http import HttpResponse
from orders.models import Order

# Table column headers in ASCII Vietnamese
TABLE_HEADERS = ['Ma DH', 'Khach hang', 'Ngay dat', 'Trang thai', 'Tong tien (VND)']

TABLE_STYLE = TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0F4FF')]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 1), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
])


def _ascii_status(status_display: str) -> str:
    """Map Vietnamese status to ASCII fallback."""
    mapping = {
        'Chờ xử lý': 'Cho xu ly',
        'Đã xác nhận': 'Da xac nhan',
        'Đang sản xuất': 'Dang san xuat',
        'Hoàn thành': 'Hoan thanh',
        'Đã hủy': 'Da huy',
    }
    return mapping.get(status_display, status_display)


def export_orders_pdf(start_date=None, end_date=None):
    """Build and return a PDF HttpResponse with filtered order data."""
    queryset = (
        Order.objects
        .select_related('customer')
        .order_by('order_date')
    )
    if start_date:
        queryset = queryset.filter(order_date__gte=start_date)
    if end_date:
        queryset = queryset.filter(order_date__lte=end_date)

    # Cap at 1000 rows to prevent timeout
    orders = list(queryset[:1000])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=2 * cm,
        bottomMargin=1.5 * cm,
    )
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph('BAO CAO DON HANG', styles['Title']))
    elements.append(Spacer(1, 0.5 * cm))

    # Summary line
    total_count = len(orders)
    total_revenue = sum(float(o.total_amount) for o in orders)
    summary = f'Tong so don hang: {total_count}  |  Tong doanh thu: {total_revenue:,.0f} VND'
    elements.append(Paragraph(summary, styles['Normal']))
    elements.append(Spacer(1, 0.5 * cm))

    if not orders:
        elements.append(Paragraph('Khong co du lieu don hang.', styles['Normal']))
    else:
        # Build table data
        table_data = [TABLE_HEADERS]
        for order in orders:
            table_data.append([
                str(order.id),
                order.customer.name[:30],  # truncate long names
                str(order.order_date),
                _ascii_status(order.get_status_display()),
                f"{float(order.total_amount):,.0f}",
            ])

        col_widths = [2 * cm, 7 * cm, 3.5 * cm, 4 * cm, 5 * cm]
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        table.setStyle(TABLE_STYLE)
        elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="bao-cao-don-hang.pdf"'
    return response
