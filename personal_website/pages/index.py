"""The home page of the app."""

from personal_website import styles
from personal_website.templates import template

import reflex as rx


def vedant_intro_component() -> rx.Component:
    return rx.vstack(
        rx.text("I'm Vedant, currently figuring out my life at Stanford.", size="7"),
        rx.text(""),
        rx.text("I like exploring contradictions. I'm a Hindu and a physicist. I don't like small talk but I love swapping stories."),
        rx.text("I get a lot of gut feelings, and I enjoy testing them out. \
                Talking to folks & shipping experiments usually works a lot better than in depth research and analysis."),
        rx.text("I actively dislike social media, but need an outlet for my thoughts, so I'll be posting them here. This website will have a bit of everything."),
        rx.spacer(),
        rx.text(""),
        rx.text("I'm figuring out how unfiltered I want to be here, so I'll tune it as I go."),
        rx.text(""),
    )

def beliefs_accordion() -> rx.Component:
    return rx.accordion.root(
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
#rx.vstack (# rx.spacer(),
                    # rx.text("Things I believe", size="6"),)
                    
             

@template(route="/", title="Me")
def index() -> rx.Component:
    """About me, intro page.

    Returns:
        The UI for the home page.
    """
    return rx.box(
        rx.desktop_only(
            rx.container(
                rx.vstack(
                    rx.hstack(
                        vedant_intro_component(),
                        rx.spacer(),
                        rx.image(src="https://avatars.githubusercontent.com/u/77445964?v=4", height="10em"),                
                    ),
                    # beliefs_accordion(),
                ),
            ),
        ),
        rx.mobile_and_tablet(
            rx.container(
                rx.vstack(
                    rx.image(src="https://avatars.githubusercontent.com/u/77445964?v=4", height="10em", ),
                    vedant_intro_component(),
                    # beliefs_accordion(),
                ),
            ),
        ),
        align="center",
        padding_x="flex",
    )