import re, sys, glob, os, json

SRC = '/home/claude/app/MCALeads-4efe928-main/src'
SKIP = {'components/Sidebar.tsx','components/Header.tsx','components/QuickActionDock.tsx',
        'components/command-center/ExecutiveTelemetryGrid.tsx','components/command-center/ExecutiveOverviewView.tsx',
        'components/command-center/SophiaExecutiveInsightsWidget.tsx','components/command-center/CallIntelligenceAndObjectionsWidget.tsx'}
NEUTRAL = 'slate|gray|zinc|neutral|stone'
COLORS  = 'indigo|blue|emerald|rose|amber|red|orange|yellow|green|teal|cyan|sky|purple|violet|fuchsia|pink|lime'
PREFIXES = 'bg|text|border|ring|divide|from|to|via|placeholder|outline|fill|stroke|decoration|accent|caret'

TOKEN = re.compile(r'(?<![\w\-/])((?:[a-z0-9\[\]\-_&>*]+:)*)(' + PREFIXES + r')-(white|black|' + NEUTRAL + '|' + COLORS + r')(?:-(\d{2,3}))?(/(?:\d+|\[[^\]]+\]))?(?![\w\-])')

def neutral_map(p, shade, sfx, full):
    """return replacement body (without variants) or None to keep"""
    s = sfx or ''
    if p in ('bg',):
        return {
          'white': 'bg-mca-card'+s, '50': 'bg-mca-void'+(s or '/40'), '100': 'bg-mca-hover'+s,
          '200': 'bg-slate-700'+s, '300': 'bg-slate-600'+s,
          '900': ('bg-mca-hover'+s) if full else None,
        }.get(shade)
    if p == 'text':
        m = {'900':'text-white','800':'text-slate-100','700':'text-slate-200'}
        if full: m.update({'600':'text-slate-300','500':'text-slate-400','400':'text-slate-500','300':'text-slate-600'})
        v = m.get(shade); return (v+s) if v else None
    if p == 'border':
        return {'100':'border-white/5','200':'border-white/10','300':'border-white/15'}.get(shade)
    if p == 'divide':
        return {'100':'divide-white/5','200':'divide-white/10'}.get(shade)
    if p == 'ring':
        return {'100':'ring-white/5','200':'ring-white/10','300':'ring-white/15'}.get(shade)
    if p in ('from','to','via'):
        return {'white': p+'-mca-card', '50': p+'-mca-void/40', '100': p+'-mca-hover'}.get(shade)
    if p == 'placeholder':
        return {'400':'placeholder-slate-500','300':'placeholder-slate-500'}.get(shade)
    return None

def color_map(p, c, shade, sfx, full):
    s = sfx or ''
    if p == 'bg':
        if shade == '50':  return f'bg-{c}-950'+(s or '/50')
        if shade == '100': return f'bg-{c}-950'+s
        if shade == '200': return f'bg-{c}-900'+(s or '/60')
        if shade == '300': return f'bg-{c}-800'+s
        if c == 'indigo' and shade in ('500','600','700'): return {'500':'bg-blue-500','600':'bg-blue-600','700':'bg-blue-700'}[shade]+s
    if p == 'text':
        if shade in ('900','800','700'): return f'text-{c}-300'+s
        if shade in ('600','500') and full: return f'text-{c}-400'+s
    if p == 'border':
        if shade in ('50','100'): return f'border-{c}-900/40'
        if shade == '200': return f'border-{c}-800/50'
        if shade == '300': return f'border-{c}-700/60'
    if p == 'ring':
        if shade in ('50','100','200'): return f'ring-{c}-900/50'
    if p in ('from','to','via'):
        if shade in ('50','100'): return f'{p}-{c}-950/40'
    if p == 'divide' and shade in ('100','200'): return f'divide-{c}-900/40'
    return None

def convert(text, full):
    count = [0]
    def rep(m):
        variants, p, name, shade, sfx = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        new = None
        if name == 'white' and shade is None:
            new = neutral_map(p, 'white', sfx, full) if p in ('bg','from','to','via') else None
        elif name in NEUTRAL.split('|') and shade:
            new = neutral_map(p, shade, sfx, full)
        elif name in COLORS.split('|') and shade:
            new = color_map(p, name, shade, sfx, full)
        # hover/active variants of indigo solid buttons go to blue-500 for contrast
        if new is None: return m.group(0)
        if 'hover:' in variants and new.startswith('bg-blue-') and name=='indigo' and shade in ('700','600'):
            new = 'bg-blue-500'
        count[0] += 1
        return variants + new
    out = TOKEN.sub(rep, text)
    # geometry + shadow normalisation toward Stitch (rounded-xl panels, no light-mode drop shadows)
    for a, b in (('rounded-3xl','rounded-xl'),('rounded-2xl','rounded-xl')):
        c = len(re.findall(r'(?<![\w-])'+a+r'(?![\w-])', out)); count[0]+=c
        out = re.sub(r'(?<![\w-])'+a+r'(?![\w-])', b, out)
    out = re.sub(r' shadow-(?:2xs|xs)(?![\w-])', '', out)
    return out, count[0]

LIGHT = re.compile(r'\b(?:hover:)?(?:bg-white|bg-slate-50|bg-slate-100|text-slate-900|text-slate-800|text-slate-700|border-slate-200|border-slate-100|border-slate-300|divide-slate-100|bg-gray-50|bg-gray-100|text-gray-900)\b')
DARK  = re.compile(r'\b(?:hover:)?(?:bg-slate-950|bg-slate-900|bg-slate-800|border-slate-800|border-slate-700|text-slate-300|text-slate-200|bg-gray-800|bg-gray-900|border-gray-700|text-gray-300)\b')

def classify(s):
    l, d = len(LIGHT.findall(s)), len(DARK.findall(s))
    if l + d == 0: return 'NONE', l, d
    return ('LIGHT' if l > d*1.5 else 'DARK' if d > l*1.5 else 'MIXED'), l, d

if __name__ == '__main__':
    apply = '--apply' in sys.argv
    report = []
    for f in sorted(glob.glob(SRC + '/**/*.tsx', recursive=True)):
        rel = os.path.relpath(f, SRC)
        if rel in SKIP: continue
        s = open(f).read()
        kind, l, d = classify(s)
        if kind in ('NONE', 'DARK'):
            continue
        out, n = convert(s, full=(kind == 'LIGHT'))
        report.append((rel, kind, l, d, n))
        if apply and out != s: open(f, 'w').write(out)
    for r in report: print(f'{r[0]:70s} {r[1]:5s} light={r[2]:4d} dark={r[3]:4d} changes={r[4]}')
    print('files:', len(report), 'total changes:', sum(r[4] for r in report))
