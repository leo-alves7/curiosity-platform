from curiosity.common.configuration import CuriositySettings


def test_settings_loads_defaults():
    s = CuriositySettings()
    assert s.app_title == "Curiosity Platform"
    assert "postgresql" in s.database_url


def test_settings_env_override(monkeypatch):
    monkeypatch.setenv("APP_TITLE", "Test App")
    s = CuriositySettings()
    assert s.app_title == "Test App"
