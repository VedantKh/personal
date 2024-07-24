from reflex import Page, Markdown

class PromptEngineeringBlog(Page):
    def content(self):
        return Markdown("""
# General tips for effective prompting

## 1. Be clear and specific
- Clearly state your task or question at the beginning of your message.
- Provide context and details to help Claude understand your needs.
- Break complex tasks into smaller, manageable steps.

Bad prompt:
<prompt>
"Help me with a presentation."
</prompt>

Good prompt:
<prompt>
"I need help creating a 10-slide presentation for our quarterly sales meeting. The presentation should cover our Q2 sales performance, top-selling products, and sales targets for Q3. Please provide an outline with key points for each slide."
</prompt>

Why it's better: The good prompt provides specific details about the task, including the number of slides, the purpose of the presentation, and the key topics to be covered.

## 2. Use examples
- Provide examples of the kind of output you're looking for.
- If you want a specific format or style, show Claude an example.

Bad prompt:
<prompt>
"Write a professional email."
</prompt>

Good prompt:
<prompt>
"I need to write a professional email to a client about a project delay. Here's a similar email I've sent before:

'Dear [Client],
I hope this email finds you well. I wanted to update you on the progress of [Project Name]. Unfortunately, we've encountered an unexpected issue that will delay our completion date by approximately two weeks. We're working diligently to resolve this and will keep you updated on our progress.
Please let me know if you have any questions or concerns.
Best regards,
[Your Name]'

Help me draft a new email following a similar tone and structure, but for our current situation where we're delayed by a month due to supply chain issues."
</prompt>

Why it's better: The good prompt provides a concrete example of the desired style and tone, giving Claude a clear reference point for the new email.

## 3. Encourage thinking
- For complex tasks, ask Claude to "think step-by-step" or "explain your reasoning."
- This can lead to more accurate and detailed responses.

Bad prompt:
<prompt>
"How can I improve team productivity?"
</prompt>

Good prompt:
<prompt>
"I'm looking to improve my team's productivity. Think through this step-by-step, considering the following factors:
1. Current productivity blockers (e.g., too many meetings, unclear priorities)
2. Potential solutions (e.g., time management techniques, project management tools)
3. Implementation challenges
4. Methods to measure improvement

For each step, please provide a brief explanation of your reasoning. Then summarize your ideas at the end."
</prompt>

Why it's better: The good prompt asks Claude to think through the problem systematically, providing a guided structure for the response and asking for explanations of the reasoning process. It also prompts Claude to create a summary at the end for easier reading.

## 4. Iterative refinement
- If Claude's first response isn't quite right, ask for clarifications or modifications.
- You can always say "That's close, but can you adjust X to be more like Y?"

Bad prompt:
<prompt>
"Make it better."
</prompt>

Good prompt:
<prompt>
"That’s a good start, but please refine it further. Make the following adjustments:
1. Make the tone more casual and friendly
2. Add a specific example of how our product has helped a customer
3. Shorten the second paragraph to focus more on the benefits rather than the features"
</prompt>

Why it's better: The good prompt provides specific feedback and clear instructions for improvements, allowing Claude to make targeted adjustments instead of just relying on Claude’s innate sense of what “better” might be — which is likely different from the user’s definition!

## 5. Leverage Claude's knowledge
- Claude has broad knowledge across many fields. Don't hesitate to ask for explanations or background information
- Be sure to include relevant context and details so that Claude’s response is maximally targeted to be helpful

Bad prompt:
<prompt>
"What is marketing? How do I do it?"
</prompt>

Good prompt:
<prompt>
"I'm developing a marketing strategy for a new eco-friendly cleaning product line. Can you provide an overview of current trends in green marketing? Please include:
1. Key messaging strategies that resonate with environmentally conscious consumers
2. Effective channels for reaching this audience
3. Examples of successful green marketing campaigns from the past year
4. Potential pitfalls to avoid (e.g., greenwashing accusations)

This information will help me shape our marketing approach."
</prompt>

Why it's better: The good prompt asks for specific, contextually relevant information that leverages Claude's broad knowledge base. It provides context for how the information will be used, which helps Claude frame its answer in the most relevant way.

## 6. Use role-playing
- Ask Claude to adopt a specific role or perspective when responding.

Bad prompt:
<prompt>
"Help me prepare for a negotiation."
</prompt>

Good prompt:
<prompt>
"You are a fabric supplier for my backpack manufacturing company. I'm preparing for a negotiation with this supplier to reduce prices by 10%. As the supplier, please provide:
1. Three potential objections to our request for a price reduction
2. For each objection, suggest a counterargument from my perspective
3. Two alternative proposals the supplier might offer instead of a straight price cut

Then, switch roles and provide advice on how I, as the buyer, can best approach this negotiation to achieve our goal."
</prompt>

Why it's better: This prompt uses role-playing to explore multiple perspectives of the negotiation, providing a more comprehensive preparation. Role-playing also encourages Claude to more readily adopt the nuances of specific perspectives, increasing the intelligence and performance of Claude’s response.
""")