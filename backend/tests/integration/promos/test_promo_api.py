from datetime import UTC, datetime, timedelta

from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_seller_creates_and_public_validates_promo(
    client: AsyncClient,
    seller_token: str,
    approved_store,
) -> None:
    now = datetime.now(UTC)
    create_response = await client.post(
        "/promos/",
        headers=auth_header(seller_token),
        json={
            "code": " hemat5 ",
            "type": "fixed",
            "value": 5000,
            "startDate": (now - timedelta(days=1)).isoformat(),
            "endDate": (now + timedelta(days=1)).isoformat(),
            "maxUsage": 5,
            "minOrderAmount": 10000,
        },
    )
    assert create_response.status_code == 201
    promo = create_response.json()
    assert promo["code"] == "HEMAT5"

    validate_response = await client.post(
        "/promos/validate",
        json={
            "code": "hemat5",
            "storeId": str(approved_store.id),
            "orderAmount": 20000,
        },
    )
    assert validate_response.status_code == 200
    assert validate_response.json()["promoId"] == promo["id"]
    assert validate_response.json()["discountAmount"] == 5000
    assert validate_response.json()["finalAmount"] == 15000


async def test_validate_promo_rejects_minimum_not_met(
    client: AsyncClient,
    active_promo,
    approved_store,
) -> None:
    response = await client.post(
        "/promos/validate",
        json={
            "code": active_promo.code,
            "storeId": str(approved_store.id),
            "orderAmount": 5000,
        },
    )

    assert response.status_code == 400


async def test_order_creation_applies_valid_promo(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
    active_promo,
) -> None:
    response = await client.post(
        "/orders/",
        headers=auth_header(student_token),
        json={
            "storeId": str(approved_store.id),
            "paymentMethod": "qris",
            "orderItems": [{"productId": str(available_product.id), "quantity": 2}],
            "promoCode": active_promo.code,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["promoCode"] == active_promo.code
    assert body["discountAmount"] == 3000
    assert body["totalPrice"] == 27000
