"""The dashboard page."""

from personal_website.templates import template

import reflex as rx


@template(route="/blogs", title="Blogs")
def blogs() -> rx.Component:
    """The dashboard page.

    Returns:
        The UI for the dashboard page.
    """
    return rx.vstack(
        rx.heading("Blogs", size="8"),
        rx.text("I'll write a blog if I've enjoyed the same meaty conversation with at least 2 people."),
                        rx.spacer(),
                rx.text(""),
                rx.text(rx.link("Snippets", href="/snippets"), " will be a place for my shower thoughts so I don't have to use my friends as a repo."),
                rx.text(rx.link("Annotations", href="/annotations"), " will hold my thoughts on things others have said (at least those I remember to write down)."),
        )
