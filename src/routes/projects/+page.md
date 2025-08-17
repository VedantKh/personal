<script>
  import SEO from '$lib/components/SEO.svelte';
  import StructuredData from '$lib/components/StructuredData.svelte';
</script>

<SEO 
  title="Projects"
  description="My portfolio of AI projects including Vmail (talk to your email), Co-scientist (AI research assistant), multilingual medical scribe, and more innovative applications."
  keywords="Vedant Khanna projects, AI projects, portfolio, Vmail, Co-scientist, medical AI, startup projects, Stanford projects"
/>

<StructuredData 
  type="WebPage"
  title="Projects - Vedant Khanna"
  description="My portfolio of AI projects including Vmail (talk to your email), Co-scientist (AI research assistant), multilingual medical scribe, and more innovative applications."
/>

# Projects

### Vmail <span class="links"><a href="https://www.youtube.com/watch?v=3ePO_Qi2jCg">demo</a></span>

Talk to your email. Built with <a href="https://www.goodhart.ai/">Ethan</a>.

---

### Co-scientist <span class="links"><a href="https://youtu.be/h4_JFms3kIc?si=EQQzfFpUWeooGuux&t=43">demo</a></span>

Get recommended novel research directions instead of spending time on literature review. Built with <a href="https://www.igor.fyi/">Igor</a>.

---

### Multilingual AI medical scribe <span class="links"><a href="https://www.youtube.com/watch?v=KQSOck-XG5k">demo</a></span>

Automated medical transcription system built specifically for a clinic in Abu Dhabi to eliminate the pain of notetaking.

---

### Voice-based CRM for realtors <span class="links"><a href="https://youtu.be/CKjFMmc5wi8?si=sfs4W27oi-hlZ9Yt&t=14">demo</a></span>

Making data entry feel like a conversation. Built with <a href="https://www.masonjwang.com/">Mason</a>.

<style>
  h3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    border-bottom: none;
    font-color: 
  }
  
  .links {
    font-size: 1rem;
    font-weight: normal;
    margin-left: auto;
  }
  
  .links a {
    margin-left: 1rem;
  }
  
  .coming-soon {
    margin-left: 1rem;
    padding: 0.2rem 0.5rem;
    background-color: rgba(110, 209, 255, 0.15);
    border-radius: 4px;
    color: rgba(110, 209, 255, 0.891);
    font-size: 0.8rem;
  }
  
  p {
    margin-top: 0.5rem;
    color: #b8b8b8;
  }
  
  hr {
    margin: 2rem 0;
    height: 1px;
    background-color: #4a4a4a;
    border: none;
  }
</style>
