# tests/test_console.py
import click.testing
import pytest

from scheduler import console

@pytest.fixture
def runner():
    return click.testing.CliRunner()


def test_main_suceeds(runner):
    result = runner.invoke(console.main)
    assert result.exit_code == 0
