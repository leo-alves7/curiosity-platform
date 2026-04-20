from curiosity.common.configuration import CuriositySettings


def test_settings_loads_defaults():
    s = CuriositySettings()
    assert s.app_title == "Curiosity Platform"
    assert "postgresql" in s.database_url


def test_settings_env_override(monkeypatch):
    monkeypatch.setenv("APP_TITLE", "Test App")
    s = CuriositySettings()
    assert s.app_title == "Test App"


def test_keycloak_defaults():
    s = CuriositySettings()
    assert s.keycloak_url == "http://localhost:8180"
    assert s.keycloak_realm == "curiosity"
    assert s.keycloak_client_id == "curiosity-backend"


def test_keycloak_url_env_override(monkeypatch):
    monkeypatch.setenv("KEYCLOAK_URL", "http://kc:9090")
    s = CuriositySettings()
    assert s.keycloak_url == "http://kc:9090"
