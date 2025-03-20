<style>
  ul {
    list-style-type: square; /* Changes bullets to squares */
    margin-left: 1.5rem;
  }
  
  /* Or for custom bullets */
  ul li {
    list-style-type: none;
    position: relative;
  }
  
  ul li::before {
    content: "→"; /* Custom bullet character */
    position: absolute;
    left: -1.2rem;
    color: #ff3e00; /* Svelte orange */
  }
</style>

# Uses

**Here's some stuff I use**

- _SvelteKit_
- VS Code
- Emojis 😎

```python
# Python goes here,
# And will be syntax-highlighted!

def problem(a, b):
    print(a, b)
```
