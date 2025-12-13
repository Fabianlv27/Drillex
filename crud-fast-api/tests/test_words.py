from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_words():
    response = client.get("/words/test_token/1")
    assert response.status_code == 200
