Hello.

I implemented an Equipment Ability system.

However, this was mainly built for my personal use, so the code is messy.
I’m sharing this commit to get a review. It works well for me, and I thought it might also help others.

===[ Changes / Notes ]=================

I created a new folder in the engine.
I split the logic into smaller parts and added tag-style comments to quickly find issues.
Some hardcoding was unavoidable.
Since this is based on the Korean version, many hardcoded parts are written in Korean. :(

It works in my environment. Probably.
While testing, I keep adding missing cases whenever I find them.

I hoped that if roBrowser could directly use scripts from rAthena’s item_db,
I would only need to hardcode bonus and if statements… but I failed to achieve that.

Also, this was made with the help of AI, so it may be inaccurate or messy.
It’s mostly a collection of conditions stacked together.

===[ About Korean handling ]=============

I added something like this:

const ELEMENT_KO = {
    Ele_Neutral: 'Neutral',
    Ele_Water: 'Water',
};

But I’m not sure if this approach will work for other languages. :(
If I had more knowledge, I would try applying language-based conversion when loading .lub files,
similar to how encoding is handled… but I didn’t try it because it seemed risky.

====[ Side note ]=====================

Honestly, I don’t really understand programming.

To me, developers look like alchemists who can easily turn stone into gold.
But I only know how to paint a stone gold — in a complicated and inefficient way.

This Equipment Ability system is exactly like that.

Like my nickname, I’m just a potato (gamja, as pronounced in Korean).

I hope that, through your review, these files — which probably exceed 10,000 lines combined —
can become simpler and cleaner.

Thank you for your time.

– Gamja