"""
E2E fixtures, on top of `seed_inventory`. Piped into `manage.py shell`.

Each spec that changes stock owns its own title, so specs do not depend on
the order they run in. Stock goes in through `apply_stock_movement()`, the
backend's single write path — never a direct balance write.
"""

import os

from inventory.models import (
    Book,
    MovementType,
    Rack,
    Section,
    Vendor,
    Warehouse,
    apply_stock_movement,
)
from staff_auth.models import Employee

# Superusers are created APPROVED with role ADMIN.
admin = Employee.objects.create_superuser(
    email=os.environ["E2E_ADMIN_EMAIL"],
    password=os.environ["E2E_ADMIN_PASSWORD"],
    name=os.environ["E2E_ADMIN_NAME"],
)

vendor = Vendor.objects.get(gst_number="22AAAAA0000A1Z5")  # Penguin Distributors
rack_a1 = Rack.objects.get(name="A1-Top")
rack_cs = Rack.objects.get(name="CS-101")
rack_ref = Rack.objects.get(name="REF-101")

# 20 extra racks, so there are more racks than one API page (25) holds.
hub = Warehouse.objects.get(name="North Zone Main Hub")
overflow = Section.objects.create(warehouse=hub, name="E2E Overflow")
for n in range(1, 21):
    Rack.objects.create(section=overflow, name=f"E2E-R{n:02d}", max_capacity=500)

# Holds five books, so a delivery of more is refused by the backend — the
# IN Entry spec uses it to make one line of a multi-line entry fail.
Rack.objects.create(section=overflow, name="E2E-TINY", max_capacity=5)


def book(isbn, title, *, mrp, min_stock, low_selling=False):
    return Book.objects.create(
        isbn=isbn, title=title, mrp=mrp, min_stock=min_stock, low_selling=low_selling
    )


def stock(b, rack, quantity, movement_type=MovementType.IN):
    apply_stock_movement(
        book=b,
        rack=rack,
        quantity=quantity,
        movement_type=movement_type,
        actor=admin,
        vendor=vendor if movement_type == MovementType.IN else None,
        reason="E2E fixture",
    )


book("E2E-IN-0001", "E2E Existing Title", mrp="250.00", min_stock=5)
book("E2E-QUICK-0001", "E2E Quick Title", mrp="180.00", min_stock=5)

# Stocked, then booked out entirely: its ledger row on REF-102 stays, at 0.
cleared = book("E2E-CLR-0001", "E2E Cleared Title", mrp="90.00", min_stock=5)
stock(cleared, Rack.objects.get(name="REF-102"), 4)
stock(cleared, Rack.objects.get(name="REF-102"), 4, MovementType.OUT)
stock(book("E2E-OUT-0001", "E2E Outbound Title", mrp="300.00", min_stock=5), rack_ref, 30)
stock(book("E2E-LOW-0001", "E2E Low Stock Atlas", mrp="410.00", min_stock=30), rack_a1, 5)
book("E2E-EMPTY-0001", "E2E Empty Shelf", mrp="120.00", min_stock=10)
stock(
    book("E2E-SLOW-0001", "E2E Slow Seller", mrp="199.00", min_stock=5, low_selling=True),
    rack_cs,
    40,
)

print("E2E fixtures loaded.")
