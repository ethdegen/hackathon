import pytest
from httpx import ASGITransport, AsyncClient

from src.app import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


async def test_healthz_reports_up(client: AsyncClient):
    response = await client.get("/v1/healthz")

    assert response.status_code == 200
    assert response.json() == {"up": True}


async def test_index_greets(client: AsyncClient):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}
