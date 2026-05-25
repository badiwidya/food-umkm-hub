from uuid import UUID

from fastapi import APIRouter, status

from app.auth.dependency import CurrentStudentDep
from app.dependency import PaginationQueryDep
from app.orders.dependency import AuthorizedOrderTargetDep
from app.reviews.dependency import ReviewServiceDep
from app.reviews.schema import (
    CreateReviewRequest,
    ReviewListResponse,
    ReviewResponse,
)

review_router = APIRouter(tags=["Reviews"])


@review_router.post(
    "/orders/{id}/reviews",
    status_code=status.HTTP_201_CREATED,
)
async def create_order_reviews(
    review_service: ReviewServiceDep,
    student: CurrentStudentDep,
    id: UUID,
    payload: CreateReviewRequest,
) -> list[ReviewResponse]:
    reviews = await review_service.create_for_order(
        student=student,
        order_id=id,
        payloads=[
            (review.product_id, review.rating, review.comment)
            for review in payload.reviews
        ],
    )
    return [ReviewResponse.model_validate(review) for review in reviews]


@review_router.get(
    "/orders/{id}/reviews",
    status_code=status.HTTP_200_OK,
)
async def get_order_reviews(
    review_service: ReviewServiceDep,
    order: AuthorizedOrderTargetDep,
) -> list[ReviewResponse]:
    reviews = await review_service.list_by_order(order)
    return [ReviewResponse.model_validate(review) for review in reviews]


@review_router.get(
    "/products/{id}/reviews",
    status_code=status.HTTP_200_OK,
)
async def get_product_reviews(
    review_service: ReviewServiceDep,
    pagination: PaginationQueryDep,
    id: UUID,
) -> ReviewListResponse:
    reviews, count = await review_service.list_by_product(
        product_id=id,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return ReviewListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[ReviewResponse.model_validate(review) for review in reviews],
    )


@review_router.get(
    "/stores/{id}/reviews",
    status_code=status.HTTP_200_OK,
)
async def get_store_reviews(
    review_service: ReviewServiceDep,
    pagination: PaginationQueryDep,
    id: UUID,
) -> ReviewListResponse:
    reviews, count = await review_service.list_by_store(
        store_id=id,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return ReviewListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[ReviewResponse.model_validate(review) for review in reviews],
    )
