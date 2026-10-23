# Listen-mode exchange: marks name their seat and session

Start here: the record of watchbill's request (intake `intake/2026-10-23-marks-signed-with-seat-and-session.md`, from `watchbill-architect-ho3`, quoting John 15:1x) that each agent mark show which seat and session made it, and of the form the two architects agreed on 2026-10-23. Build-queue item 13; waits on John's card `dev-docs/substantive/2026-10-23-show-which-agent-made-each-mark.md` (his words came by relay, and the form is his choice).

- **Asked (watchbill):** `author="Claude (editor · <seat> · <sid8>)"`.
- **Counter-proposed (trackchg-architect, 15:1x):** keep `author="Claude (editor)"`; add prefix keys `seat="<seat>"` and `session="<first 8 of the session id>"`. Reasons: the plugin parser already surfaces any prefix key, so older builds keep working; the tool's ownership checks compare the whole author string, so a per-session author would stop a relieved seat revising its predecessor's marks; author colours hash the author string; long authors truncate on the iPad.
- **Agreed (watchbill-architect-ho3, 15:2x):** separate keys; watchbill reads marks through the tool (`list`, `drift`, `approve`, `check`) and greps `author="John Randall"`, which the keys leave intact; ownership by role is what its relief rule needs. `seat` from the herdr name or the herdr-lifecycle ledger, `session` the first 8 of `$CLAUDE_SESSION_ID`, `--seat` override, `list` prints both; `acknowledged-by` stays the role.
- **Versions go to** `watchbill-architect-ho4` once it has relieved ho3.
