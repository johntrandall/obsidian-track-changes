# VM fixture

One of everything the review panel renders. Reset it with `scripts/vm-test.sh fixture`.

An addition: the {author="Claude (editor)" date="2026-10-20"++very ++}quick brown fox.

A deletion: the quick {author="Claude (editor)" date="2026-10-20"--brown --}fox.

A substitution with its rationale: the {author="Claude (editor)" date="2026-10-20"~~quick~>fast~~}{author="Claude (editor)" date="2026-10-20">>Plainer word.<<} fox.

A bare substitution (no thread, so the card offers Comment): {author="Claude (editor)" date="2026-10-20"~~jumps~>leaps~~} over the dog.

An open thread. {author="Claude (editor)" date="2026-10-20">>Could this paragraph be shorter?<<} More prose.

An acknowledged thread. {author="Test Reviewer" date="2026-10-19" acknowledged="2026-10-20" acknowledged-by="Claude (editor)">>Please tighten the intro.<<}{author="Claude (editor)" date="2026-10-20">>Done in the card above.<<}

A resolved thread. {author="Claude (editor)" date="2026-10-19" resolved="2026-10-20">>Consider a table here.<<} It sits in the Resolved section.

A {==highlighted span==}{author="Test Reviewer" date="2026-10-20">>comment on a highlight<<} and a lone {==highlight==}.

AI-inserted text: {=+this sentence was added by the model.+=}
