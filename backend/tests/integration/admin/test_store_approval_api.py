from httpx import AsyncClient


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_admin_approves_pending_store(
    client: AsyncClient,
    admin_token: str,
    pending_store,
) -> None:
    response = await client.post(
        f"/admin/stores/{pending_store.id}/approve",
        headers=auth_header(admin_token),
    )

    assert response.status_code == 204

    detail_response = await client.get(
        f"/admin/stores/{pending_store.id}",
        headers=auth_header(admin_token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["approvalStatus"] == "approved"


async def test_admin_rejects_pending_store_with_notes(
    client: AsyncClient,
    admin_token: str,
    pending_store,
) -> None:
    response = await client.post(
        f"/admin/stores/{pending_store.id}/reject",
        headers=auth_header(admin_token),
        json={"notes": "Foto toko belum jelas"},
    )

    assert response.status_code == 204

    detail_response = await client.get(
        f"/admin/stores/{pending_store.id}",
        headers=auth_header(admin_token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["approvalStatus"] == "rejected"
    assert detail_response.json()["approvalNotes"] == "Foto toko belum jelas"


async def test_non_admin_cannot_approve_store(
    client: AsyncClient,
    seller_token: str,
    pending_store,
) -> None:
    response = await client.post(
        f"/admin/stores/{pending_store.id}/approve",
        headers=auth_header(seller_token),
    )

    assert response.status_code == 403
