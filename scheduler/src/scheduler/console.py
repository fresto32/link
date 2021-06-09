# src/scheduler/console.py
import textwrap  # standard library

import click  # Third party packages

from . import __version__, wikipedia  # Local imports


@click.command()
@click.option(
    "--language",
    "-l",
    default="en",
    help="Language editon of Wikipedia",
    metavar="LANG",
    show_default=True,
)
@click.version_option(version=__version__)
def main(language: str) -> None:
    """The scheduler Python Project."""
    page = wikipedia.random_page(language=language)

    click.secho(page.title, fg="green")
    click.echo(textwrap.fill(page.extract))
