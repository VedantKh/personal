<script>
  import SEO from '$lib/components/SEO.svelte';
  import StructuredData from '$lib/components/StructuredData.svelte';
  import DemoLink from '$lib/components/DemoLink.svelte';
  import { onMount } from 'svelte';
  import { initScrollTracking, analytics } from '$lib/utils/analytics';
  
  // Track page view and scroll depth
  onMount(() => {
    analytics.trackSectionEngagement('experience', 'view');
    const cleanup = initScrollTracking('/experience');
    
    // Add click tracking to external links
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const target = e.target as HTMLAnchorElement;
        const label = target.textContent || 'Unknown';
        analytics.trackExternalLink(target.href, label, 'resource');
      });
    });
    
    return cleanup;
  });
</script>

<SEO 
  title="Experience"
  description="My entrepreneurial journey - From founding Hazel and raising $2M at 19 to building voice-first AI applications for real estate."
  keywords="Vedant Khanna experience, Hazel, startup founder, entrepreneur, AI applications, real estate tech, Stanford"
/>

<StructuredData 
  type="WebPage"
  title="Experience - Vedant Khanna"
  description="My entrepreneurial journey - From founding Hazel and raising $2M at 19 to building voice-first AI applications for real estate."
/>

# Friends and Family

Built a community of builders at Stanford and raised $200k to give out in grants. Here are my [thoughts](https://friendsandfam.xyz/manifesto) about why this is important, and these are some [projects](https://vedantkhanna.notion.site/Projects-2398828bbc3d809fa5b6eda4ba88b539?source=copy_link) we've built.

# Hazel

I was cofounder and CEO of Hazel. Raised $2M when I was 19, and hired
3 friends to build an entirely voice-first CRM for real estate agents
to use on the go.

Here's a <DemoLink href="https://youtu.be/CKjFMmc5wi8?si=sfs4W27oi-hlZ9Yt&t=14" projectName="Hazel">demo</DemoLink>.

Did hundreds of sales calls with 50 year old realtors in states like
Arkansas, which definitively popped my tech bubble. Thought
axiomatically about new UIs unlocked by LLMs, pricing models for
enterprise, and finding PMF.

Learned the hard way that SaaS isn't venture scale in residential real
estate. A better way to capture value is to build a brokerage and
automate the backend tasks. Decided I didn't want to start a
brokerage at 20, so retreated to the comfort of a Math major at
Stanford.

# Martian

Spent a few weeks at Martian, helped close a [channel partnership](https://newsroom.accenture.com/news/2024/accenture-invests-in-martian-to-bring-dynamic-routing-of-large-language-queries-and-more-effective-ai-systems-to-clients) with Accenture.
