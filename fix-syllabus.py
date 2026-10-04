import re

with open("src/pages/Syllabus.jsx", "r") as f:
    text = f.read()

# 1, 2, 3: Edit2, getSubjectColor, idx
text = text.replace("import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';", 
                    "import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';")
text = re.sub(r"import \{ getSubjectColor \} from '\.\.\/utils\/helpers';\n", "", text)
text = text.replace("subjects.map((subject, idx) =>", "subjects.map((subject) =>")

# 4: generate unique ID without Date.now() during render. Actually the code only uses Date.now() inside event handlers!
# Wait, looking at the code:
# it uses it in handleAddChapter: id: `ch-${Date.now()}` - that is in an event handler handler, NOT in render!
# Ah wait! Wait, line 42: `id: \`ch-${Date.now()}\`` ? No, that's inside arrow function `handleAddChapter`.
# Let's check where Date.now() actually happens. Maybe I can replace `Date.now()` with `crypto.randomUUID()` in these handlers to be pure.
text = text.replace("Date.now()", "crypto.randomUUID()")

with open("src/pages/Syllabus.jsx", "w") as f:
    f.write(text)
