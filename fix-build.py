import os
import re
import subprocess
import sys

HELPERS_PATH = os.path.join("src", "utils", "helpers.js")
NOTES_PATH = os.path.join("src", "pages", "Notes.jsx")

HELPERS_CODE = """import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export const formatTime = (time) => {
  if (!time) return '';
  if (typeof time === 'number') {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
  try {
    if (typeof time === 'string' && /^\\d{1,2}:\\d{2}$/.test(time.trim())) {
      const [h, m] = time.trim().split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    }
    const d = typeof time === 'string' ? parseISO(time) : new Date(time);
    if (!isNaN(d.getTime())) {
      return format(d, 'h:mm a');
    }
  } catch (err) {}
  return String(time);
};

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isNaN(d.getTime())) {
      return format(d, formatStr);
    }
  } catch (err) {}
  return String(date);
};

export const getPriorityBadge = (priority) => {
  const p = (priority || 'medium').toLowerCase();
  const config = {
    urgent: { label: 'Urgent', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
    critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    high: { label: 'High', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    medium: { label: 'Medium', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    low: { label: 'Low', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  };
  const c = config[p] || config.medium;
  const className = `px-2 py-0.5 text-xs rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`;
  const badge = new String(className);
  badge.label = c.label;
  badge.bg = c.bg;
  badge.text = c.text;
  badge.border = c.border;
  badge.className = className;
  return badge;
};

export const getPriorityColor = (priority) => {
  const p = (priority || 'medium').toLowerCase();
  switch (p) {
    case 'critical':
    case 'urgent': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#64748b';
  }
};

export const getSubjectColor = (subjectId, subjects = []) => {
  if (!subjectId) return 'var(--color-accent, #6366f1)';
  const match = subjects.find(s => s.id === subjectId || s.name === subjectId);
  return match?.color || 'var(--color-accent, #6366f1)';
};

export const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([^"&?\\/\\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (url, quality = 'hqdefault') => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isNaN(d.getTime())) {
      return formatDistanceToNow(d, { addSuffix: true });
    }
  } catch (err) {}
  return String(date);
};

export const formatDuration = (minutes) => {
  const mins = Number(minutes) || 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const isOverdue = (date) => {
  if (!date) return false;
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isPast(d);
  } catch (err) {
    return false;
  }
};
"""

print("[1/3] Writing updated src/utils/helpers.js...")
with open(HELPERS_PATH, "w", encoding="utf-8") as f:
    f.write(HELPERS_CODE)

print("[2/3] Fixing Lucide Youtube imports across src/...")
for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".jsx", ".js")):
            p = os.path.join(root, file)
            with open(p, "r", encoding="utf-8") as f:
                content = f.read()
            if "from 'lucide-react'" in content and re.search(r"\bYoutube\b", content):
                new_content = re.sub(r"\bYoutube\b(?!\s*as\s)", "Video as Youtube", content)
                if new_content != content:
                    print(f"  Fixed Youtube import in {p}")
                    with open(p, "w", encoding="utf-8") as f:
                        f.write(new_content)

print("[3/3] Running 'npm run build' verification...")
cmd = "npm.cmd run build" if os.name == "nt" else "npm run build"
res = subprocess.run(cmd, shell=True)
sys.exit(res.returncode)