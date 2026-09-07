# E2E acceptance criteria

Each AC maps 1:1 to a Playwright test in `tests/e2e/*.spec.ts` (test titles are prefixed with the AC id).

| AC   | Area           | Given                                           | When                     | Then                                                                           |
| ---- | -------------- | ----------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| AC1  | RSS            | the site is built                               | I request `/rss.xml`     | I get 200 with an XML content type and a `<rss>` root with a `<channel>`       |
| AC2  | RSS            | published essays exist                          | I parse `/rss.xml`       | there is one `<item>` per published essay, each with title/link/guid/pubDate   |
| AC3  | RSS            | some essays are `draft`/`hidden`                | I parse `/rss.xml`       | none of those slugs appear                                                     |
| AC4  | RSS            | the feed lists items                            | I read the item order    | items are newest-first and links use the production origin                     |
| AC5  | RSS            | I open any HTML page                            | I inspect `<head>`       | there is a `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` |
| AC6  | Sitemap        | the site is built                               | I request `/sitemap.xml` | it lists `/snippets` and `/books`, not the dead `/readings`                    |
| AC7  | Related        | I open a published essay                        | I scroll to the bottom   | a "Related thoughts" section follows the article body                          |
| AC8  | Related        | an essay declares `related` slugs               | I read the section       | each link's text is the target essay's title and href is `/writings/<slug>`    |
| AC9  | Related        | a `related` slug points to a hidden/draft essay | I read the section       | that link is omitted (only published essays are recommended)                   |
| AC10 | Related        | I am on an essay                                | I click a related link   | I land on the target essay and its `<h1>` matches the link text                |
| AC11 | Related        | an essay lists itself in `related`              | I read the section       | the essay never links to itself                                                |
| AC12 | Related        | I open every published essay                    | I count related links    | each has between 1 and 3 links, all distinct                                   |
| AC13 | Cleanup        | I open `/`, `/writings`, `/snippets`, `/books`  | the page loads           | status 200 and a visible `<h1>`/heading, no console errors                     |
| AC14 | Related (a11y) | I open an essay                                 | I inspect the section    | it is an `<aside>` labelled by its heading, using a list of links              |
