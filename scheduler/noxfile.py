# noxfile.py
import tempfile
from typing import Any

import nox
from nox.sessions import Session

package = "scheduler"
nox.options.sessions = "lint", "mypy", "tests"
locations = "src", "tests", "noxfile.py"


def install_with_constraints(session: Session, *args: str, **kwargs: Any) -> None:
    with tempfile.NamedTemporaryFile() as requirements:
        session.run(
            "poetry",
            "export",
            "--dev",
            "--format=requirements.txt",
            f"--output={requirements.name}",
            external=True,
        )
        try:
            session.install(f"--constraint={requirements.name}", *args, **kwargs)
        except Exception:
            session.install(*args, **kwargs)


@nox.session(python="3.8")
def black(session: Session) -> None:
    args = session.posargs or locations
    install_with_constraints(session, "black")
    session.run("black", *args)


@nox.session(python=["3.8", "3.7"])
def lint(session: Session) -> None:
    args = session.posargs or locations
    install_with_constraints(
        session,
        "flake8",
        "flake8-bandit",
        "flake8-black",
        "flake8-bugbear",
        "flake8-import-order",
    )
    session.run("flake8", *args)


@nox.session(python="3.8")
def safety(session: Session) -> None:
    with tempfile.NamedTemporaryFile() as requirements:
        session.run(
            "poetry",
            "export",
            "--dev",
            "--format=requirements.txt",
            "--without-hashes",
            f"--output={requirements.name}",
            external=True,
        )
        install_with_constraints(session, "safety")
        session.run("safety", "check", f"--file={requirements.name}", "--full-report")


@nox.session(python="3.8")
def mypy(session: Session) -> None:
    args = session.posargs or locations
    install_with_constraints(session, "mypy")
    session.run("mypy", *args)


# Only works with Python 3.7
# @nox.session(python="3.7")
# def pytype(session: Session) -> None:
#     args = session.posargs or ["--disable=import-error", *locations]
#     install_with_constraints(session, "pytype")
#     session.run("pytype", *args)


@nox.session(python=["3.8", "3.7"])
def tests(session: Session) -> None:
    args = session.posargs or ["--cov", "-m", "not e2e"]
    session.run("poetry", "install", "--no-dev", external=True)
    install_with_constraints(
        session, "coverage[toml]", "pytest", "pytest-cov", "pytest-mock"
    )
    session.run("pytest", *args)


# Position of typeguard
@nox.session(python=["3.8", "3.7"])
def typeguard(session):
    args = session.posargs or ["-m", "not e2e"]
    session.run("poetry", "install", "--no-dev", external=True)
    install_with_constraints(session, "pytest", "pytest-mock", "typeguard")
    session.run("pytest", f"--typeguard-packages={package}", *args)
