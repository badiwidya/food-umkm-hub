from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def create_waiting_qris_order(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
) -> dict:
    create_response = await client.post(
        "/orders/",
        headers=auth_header(student_token),
        json={
            "storeId": str(approved_store.id),
            "paymentMethod": "qris",
            "orderItems": [{"productId": str(available_product.id), "quantity": 1}],
        },
    )
    assert create_response.status_code == 201
    order = create_response.json()

    proof_response = await client.post(
        f"/orders/{order['id']}/payment/proof",
        headers=auth_header(student_token),
        json={"paymentProofUrl": "https://example.com/proof.jpg"},
    )
    assert proof_response.status_code == 200
    return proof_response.json()


async def test_student_uploads_qris_payment_proof(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
) -> None:
    order = await create_waiting_qris_order(
        client, student_token, approved_store, available_product
    )

    assert order["status"] == "waiting_for_confirmation"
    assert order["paymentProofUrl"] == "https://example.com/proof.jpg"


async def test_seller_accepts_marks_ready_and_completes_order(
    client: AsyncClient,
    student_token: str,
    seller_token: str,
    approved_store,
    available_product,
    celery_delay_calls: dict,
) -> None:
    order = await create_waiting_qris_order(
        client, student_token, approved_store, available_product
    )

    accept_response = await client.post(
        f"/stores/me/orders/{order['id']}/accept",
        headers=auth_header(seller_token),
    )
    assert accept_response.status_code == 200
    assert accept_response.json()["status"] == "in_process"

    ready_response = await client.post(
        f"/stores/me/orders/{order['id']}/ready",
        headers=auth_header(seller_token),
    )
    assert ready_response.status_code == 200
    assert ready_response.json()["status"] == "ready_to_pickup"
    assert len(celery_delay_calls["send_notification"]) == 1

    complete_response = await client.post(
        f"/stores/me/orders/{order['id']}/complete",
        headers=auth_header(seller_token),
    )
    assert complete_response.status_code == 200
    assert complete_response.json()["status"] == "completed"


async def test_seller_rejects_and_reconsiders_order(
    client: AsyncClient,
    student_token: str,
    seller_token: str,
    approved_store,
    available_product,
) -> None:
    order = await create_waiting_qris_order(
        client, student_token, approved_store, available_product
    )

    reject_response = await client.post(
        f"/stores/me/orders/{order['id']}/reject",
        headers=auth_header(seller_token),
        json={"reason": "Stok habis"},
    )
    assert reject_response.status_code == 200
    assert reject_response.json()["status"] == "rejected"
    assert reject_response.json()["rejectionReason"] == "Stok habis"

    reconsider_response = await client.post(
        f"/stores/me/orders/{order['id']}/reconsider",
        headers=auth_header(seller_token),
    )
    assert reconsider_response.status_code == 200
    assert reconsider_response.json()["status"] == "in_process"
    assert reconsider_response.json()["rejectionReason"] is None
