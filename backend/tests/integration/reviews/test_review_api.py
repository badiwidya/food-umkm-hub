from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_student_creates_reviews_for_completed_order(
    client: AsyncClient,
    student_token: str,
    completed_order,
    available_product,
) -> None:
    response = await client.post(
        f"/orders/{completed_order.id}/reviews",
        headers=auth_header(student_token),
        json={
            "reviews": [
                {
                    "productId": str(available_product.id),
                    "rating": 5,
                    "comment": "Enak",
                }
            ]
        },
    )

    assert response.status_code == 201
    assert response.json()[0]["productId"] == str(available_product.id)
    assert response.json()[0]["rating"] == 5

    duplicate_response = await client.post(
        f"/orders/{completed_order.id}/reviews",
        headers=auth_header(student_token),
        json={
            "reviews": [
                {
                    "productId": str(available_product.id),
                    "rating": 4,
                    "comment": "Masih enak",
                }
            ]
        },
    )
    assert duplicate_response.status_code == 400


async def test_student_cannot_review_incomplete_order(
    client: AsyncClient,
    student_token: str,
    approved_store,
    available_product,
) -> None:
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

    response = await client.post(
        f"/orders/{order['id']}/reviews",
        headers=auth_header(student_token),
        json={
            "reviews": [
                {
                    "productId": str(available_product.id),
                    "rating": 5,
                    "comment": "Belum boleh",
                }
            ]
        },
    )

    assert response.status_code == 400
