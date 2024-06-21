"""The home page of the app."""

from personal_website import styles
from personal_website.templates import template

import reflex as rx


@template(route="/", title="Me")
def index() -> rx.Component:
    """About me, intro page.

    Returns:
        The UI for the home page.
    """
    return rx.box(
        rx.container(
            rx.vstack(
                rx.image(src="https://avatars.githubusercontent.com/u/77445964?v=4", height="10em"),
                rx.spacer(),
                rx.text("I'm Vedant, and I'm currently figuring out my life at Stanford.", size="7"),
                rx.text(""),
                rx.text("I like exploring contradictions. I'm a Hindu and a physicist. I don't like small talk but I love telling stories."),
                rx.text("I get a lot of gut feelings, and I enjoy testing them out. \
                        I prefer to learn through talking to folks & shipping experiments over meticulous research and analysis. The unknown unknowns usually have high variance."),
                rx.text("I actively dislike social media, but I need an outlet for my thoughts, so I'll be posting them here. I end up musing about a lot of things, so this website will have a bit of everything."),
                rx.spacer(),
                rx.text(""),
                rx.text("I'm figuring out how unfiltered I want to be here, so I'll tune it as I go."),
                rx.text(""),
                rx.spacer(),
                rx.text("Beliefs", size="6"),
                rx.accordion.root(
                    rx.accordion.item(
                        header="First Item",
                        content="The first accordion item's content",
                    ),
                    rx.accordion.item(
                        header="Second Item",
                        content="The second accordion item's content",
                    ),
                    rx.accordion.item(
                        header="Third item",
                        content="The third accordion item's content",
                    ),
                    collapsible=True,
                    width="100%",
                    type="multiple",
                    variant="outline"
                ),
            ),

        ),
        align="center",
        padding_x=("flex", "10em"),
    )