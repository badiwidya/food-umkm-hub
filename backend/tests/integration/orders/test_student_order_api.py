from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_student_creates_qris_order(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
) -> None:
    response = await client.post(
        "/orders/",
        headers=auth_header(student_token),
        json={
            "storeId": str(approved_store.id),
            "paymentMethod": "qris",
            "orderItems": [{"productId": str(available_product.id), "quantity": 2}],
            "notes": "Tidak pedas",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["paymentMethod"] == "qris"
    assert body["totalPrice"] == 30000
    assert body["orderItems"][0]["subtotal"] == 30000


async def test_student_creates_cash_order_and_payment_is_waiting_for_confirmation(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
) -> None:
    response = await client.post(
        "/orders/",
        headers=auth_header(student_token),
        json={
            "storeId": str(approved_store.id),
            "paymentMethod": "cash",
            "orderItems": [{"productId": str(available_product.id), "quantity": 1}],
        },
    )

    assert response.status_code == 201
    assert response.json()["status"] == "waiting_for_confirmation"


async def test_student_cannot_create_order_from_closed_store(
    client: AsyncClient,
    student_token: str,
    seller_token: str,
    approved_store,
    available_product,
) -> None:
    close_response = await client.post(
        "/stores/me/close",
        headers=auth_header(seller_token),
    )
    assert close_response.status_code == 204

    response = await client.post(
        "/orders/",
        headers=auth_header(student_token),
        json={
            "storeId": str(approved_store.id),
            "paymentMethod": "qris",
            "orderItems": [{"productId": str(available_product.id), "quantity": 1}],
        },
    )

    assert response.status_code == 400
