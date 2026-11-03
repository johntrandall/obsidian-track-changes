# The watchbill design seat's script of 2026-11-03 13:17:36Z, verbatim except N, S (copies) and the mtime wait removed.
import re
N='note.md'
S='gates-bullets.md'
blocks={}
for chunk in open(S).read().strip().split('\n\n'):
    ls=chunk.split('\n'); g=re.match(r'\*\*(\w+) ·',ls[0]).group(1); blocks[g]=ls[1:]
lines=open(N).read().split('\n'); out=[]; done=[]
mark_re=re.compile(r'\{author="[^"]*"[^}]*?(?:>>.*?<<|\+\+.*?\+\+|--.*?--|~~.*?~~)\}', re.S)
for i,ln in enumerate(lines):
    if i>340:
        hm=re.search(r'\*\*((?:DG|BG|RG|IG)\d) · [^*]*\.\*\*', ln)
        nxt=lines[i+1] if i+1<len(lines) else ''
        if hm and hm.group(1) in blocks and not nxt.startswith('- **Triggered by:**'):
            g=hm.group(1); head_end=hm.end(); head=ln[:head_end]; tail=ln[head_end:]
            kept=''.join(mark_re.findall(tail))
            out.append(head+kept); out.extend(blocks[g]); done.append(g); continue
    out.append(ln)
open(N,'w').write('\n'.join(out)); print('restructured now:', done)
