import re

def fix(path):
    with open(path, "r") as f:
        text = f.read()
    
    if "Login.jsx" in path:
        text = text.replace("import { useNavigate, Link } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';")
    if "Profile.jsx" in path:
        text = text.replace("User, Mail, Calendar, Award, TrendingUp, Target, Flame, Edit2, LogOut, Check, X", "User, Mail, Calendar, Award, TrendingUp, Target, Edit2, LogOut, Check, X")
    if "Notes.jsx" in path:
        text = text.replace("import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';", "import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';")
        text = text.replace("Tag, FileText, BookOpen, X, Download, Youtube", "Tag, X, Download, Youtube")
        text = text.replace("formatDate, getRelativeTime, getYouTubeId", "getRelativeTime, getYouTubeId")
    
    with open(path, "w") as f:
        f.write(text)

fix("src/pages/Login.jsx")
fix("src/pages/Profile.jsx")
fix("src/pages/Notes.jsx")
