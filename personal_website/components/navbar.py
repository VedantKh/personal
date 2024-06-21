"""Navbar component for the app."""

from personal_website import styles

import reflex as rx


def sidebar_header() -> rx.Component:
    """Sidebar header.

    Returns:
        The sidebar header component.
    """
    return rx.hstack(
        # The logo.
        rx.color_mode_cond(
            rx.image(src="/Vedant_Khanna_black_font.svg", height="2em"),
            rx.image(src="/Vedant_Khanna_white_font.svg", height="2em"),
        ),
        rx.spacer(),
        align="center",
        width="100%",
        border_bottom=styles.border,
        padding_x="1em",
        padding_y="2em",
    )


def sidebar_footer() -> rx.Component:
    """Sidebar footer.

    Returns:
        The sidebar footer component.
    """
    return rx.hstack(
        rx.icon("moon"),
        rx.color_mode.switch(default_checked=True),
        rx.spacer(),
        width="100%",
        border_top=styles.border,
        padding="1em",
    )


def sidebar_item(text: str, url: str) -> rx.Component:
    """Sidebar item.

    Args:
        text: The text of the item.
        url: The URL of the item.

    Returns:
        rx.Component: The sidebar item component.
    """
    # Whether the item is active.
    active = (rx.State.router.page.path == url.lower()) | (
        (rx.State.router.page.path == "/") & text == "Home"
    )

    return rx.link(
        rx.hstack(
            rx.text(
                text,
            ),
            bg=rx.cond(
                active,
                rx.color("accent", 2),
                "transparent",
            ),
            border=rx.cond(
                active,
                f"1px solid {rx.color('accent', 6)}",
                f"1px solid {rx.color('gray', 6)}",
            ),
            color=rx.cond(
                active,
                styles.accent_text_color,
                styles.text_color,
            ),
            align="center",
            border_radius=styles.border_radius,
            width="100%",
            padding="1em",
        ),
        href=url,
        width="100%",
    )


def sidebar() -> rx.Component:
    """The sidebar.

    Returns:
        The sidebar component.
    """
    # Get all the decorated pages and add them to the sidebar.
    from reflex.page import get_decorated_pages

    return rx.box(
        rx.vstack(
            sidebar_header(),
            rx.vstack(
                *[
                    sidebar_item(
                        text=page.get("title", page["route"].strip("/").capitalize()),
                        url=page["route"],
                    )
                    for page in get_decorated_pages()
                ],
                width="100%",
                overflow_y="auto",
                align_items="flex-start",
                padding="1em",
            ),
            rx.spacer(),
            sidebar_footer(),
            height="100dvh",
        ),
        display=["none", "none", "block"],
        min_width=styles.sidebar_width,
        height="100%",
        position="sticky",
        top="0px",
        border_right=styles.border,
    )

def navbar_icons_item(
    text: str, icon: str, url: str
) -> rx.Component:
    return rx.link(
        rx.hstack(
            rx.icon(icon),
            rx.text(text, size="4", weight="medium"),
        ),
        href=url,
    )


def navbar_icons_menu_item(
    text: str, icon: str, url: str
) -> rx.Component:
    return rx.link(
        rx.hstack(
            rx.icon(icon, size=16),
            rx.text(text, size="3", weight="medium"),
        ),
        href=url,
    )


def navbar_icons() -> rx.Component:
    from reflex.page import get_decorated_pages
    pages = get_decorated_pages()
    return rx.box(
        rx.desktop_only(
            rx.hstack(
                rx.color_mode_cond(
                    rx.image(src="/Vedant_Khanna_black_font.svg", height="2em"),
                    rx.image(src="/Vedant_Khanna_white_font.svg", height="2em"),
                ),
                rx.hstack(
                    *[navbar_icons_item(page.get("title", page["route"].strip("/").capitalize()), "home", page["route"]) for page in pages],
                    spacing="6",
                ),
                justify="between",
                align_items="center",
            ),
        ),
        rx.mobile_and_tablet(
            rx.hstack(
                rx.hstack(
                    rx.image(
                        src="/logo.jpg",
                        width="2em",
                        height="auto",
                        border_radius="25%",
                    ),
                    rx.heading(
                        "Reflex", size="6", weight="bold"
                    ),
                    align_items="center",
                ),
                rx.menu.root(
                    rx.menu.trigger(
                        rx.icon("menu", size=30)
                    ),
                    rx.menu.content(
                        *[navbar_icons_menu_item(page.get("title", page["route"].strip("/").capitalize()), "home", page["route"]) for page in pages],
                    ),
                    justify="end",
                ),
                justify="between",
                align_items="center",
            ),
        ),
        bg=rx.color("accent", 3),
        padding="1em",
        width="100%",
    )