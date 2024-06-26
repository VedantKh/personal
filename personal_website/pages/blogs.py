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
        rx.text("These are usually seeded by meaty conversations I've had with thoughtful people."),
                rx.spacer(),
                rx.text(""),
                # rx.text(rx.link("Snippets", href="/snippets"), " will be a place for my shower thoughts so I don't have to use my friends as a repo."),
                # rx.text(rx.link("Annotations", href="/annotations"), " will hold my thoughts on things others have said (at least those I remember to write down)."),
        
        rx.vstack(
            rx.card(
                rx.hstack(
                    rx.image(src="/github.svg", width="auto", height="50px", aspect_ratio="auto"),
                    rx.divider(orientation="vertical", height="60px"),
                    rx.text("Example Blog Post 1", size="4"),
                    spacing="4",
                    align_items="center",
                ),
                width="100%",
            ),
            rx.card(
                rx.hstack(
                    rx.image(src="/github.svg", width="auto", height="50px", aspect_ratio="auto"),
                    rx.divider(orientation="vertical", height="60px"),
                    rx.text("Example Blog Post 2", size="4"),
                    spacing="4",
                    align_items="center",
                ),
                width="100%",
            ),
            rx.card(
                rx.hstack(
                    rx.image(src="/github.svg", width="auto", height="50px", aspect_ratio="auto"),
                    rx.divider(orientation="vertical", height="60px"),
                    rx.text("Example Blog Post 3", size="4"),
                    spacing="4",
                    align_items="center",
                ),
                width="100%",
            ),
            spacing="4",
            width="100%",
            ),
        )
