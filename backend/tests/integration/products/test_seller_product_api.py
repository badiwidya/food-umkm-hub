from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_seller_can_create_list_update_toggle_and_delete_product(
    client: AsyncClient,
    approved_store,
    seller_token: str,
) -> None:
    create_response = await client.post(
        "/products/",
        headers=auth_header(seller_token),
        json={
            "name": "Ayam Geprek",
            "price": 18000,
            "category": "food",
            "description": "Pedas",
            "photoUrl": "https://example.com/ayam.jpg",
        },
    )
    assert create_response.status_code == 201
    product = create_response.json()
    product_id = product["id"]
    assert product["store"]["id"] == str(approved_store.id)
    assert product["isAvailable"] is False

    list_response = await client.get(
        "/stores/me/products",
        headers=auth_header(seller_token),
    )
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1

    update_response = await client.patch(
        f"/products/{product_id}",
        headers=auth_header(seller_token),
        json={"name": "Ayam Geprek Keju", "price": 22000},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Ayam Geprek Keju"
    assert update_response.json()["price"] == 22000

    availability_response = await client.patch(
        f"/products/{product_id}/availability",
        headers=auth_header(seller_token),
        json={"isAvailable": True},
    )
    assert availability_response.status_code == 200
    assert availability_response.json()["isAvailable"] is True

    delete_response = await client.delete(
        f"/products/{product_id}",
        headers=auth_header(seller_token),
    )
    assert delete_response.status_code == 204

    details_response = await client.get(f"/products/{product_id}")
    assert details_response.status_code == 404


async def test_seller_cannot_modify_another_store_product(
    client: AsyncClient,
    available_product,
    seller_token: str,
    pending_store,
    admin_token: str,
) -> None:
    await client.post(
        f"/admin/stores/{pending_store.id}/approve",
        headers=auth_header(admin_token),
    )
    other_seller_login = await client.post(
        "/auth/login",
        json={"email": pending_store.owner.email, "password": "password123"},
    )
    other_token = other_seller_login.json()["accessToken"]

    response = await client.patch(
        f"/products/{available_product.id}",
        headers=auth_header(other_token),
        json={"name": "Tidak Boleh"},
    )

    assert response.status_code == 403
