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
def main(language):
    """The scheduler Python Project."""
    data = wikipedia.random_page(language=language)

    title = data["title"]
    extract = data["extract"]

    click.secho(title, fg="green")
    click.echo(textwrap.fill(extract))
