import re

with open("src/pages/Planner.jsx", "r") as f:
    text = f.read()

calendar_block = """      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border)]">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="flex-1 text-center font-semibold text-sm text-[var(--color-text-muted)] p-2">
                   {d}
                </div>
             ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg overflow-hidden">
             {eachDayOfInterval({
               start: startOfWeek(startOfMonth(currentDate)),
               end: endOfWeek(endOfMonth(currentDate))
             }).map((day, idx) => {
               const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), day));
               return (
                 <div
                   key={idx}
                   onClick={() => {
                     setCurrentDate(day);
                     setView('timeline');
                   }}
                   className={`min-h-[100px] p-2 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors ${
                     !isSameMonth(day, currentDate) ? 'opacity-40' : ''
                   } ${isSameDay(day, new Date()) ? 'bg-[var(--color-bg-tertiary)] ring-1 ring-[var(--color-accent)] ring-inset' : ''}`}
                 >
                   <div className="font-semibold text-sm mb-1">{format(day, 'd')}</div>
                   <div className="space-y-1">
                     {daySessions.slice(0, 3).map(session => {
                       const subject = subjects.find(s => s.id === session.subject);
                       return (
                         <div
                           key={session.id}
                           className="text-xs px-1.5 py-0.5 rounded truncate"
                           style={{
                             backgroundColor: subject ? `${subject.color}20` : 'var(--color-bg-secondary)',
                             color: subject ? subject.color : 'inherit',
                             borderLeft: `2px solid ${subject ? subject.color : 'var(--color-accent)'}`
                           }}
                         >
                           {session.topic}
                         </div>
                       );
                     })}
                     {daySessions.length > 3 && (
                       <div className="text-xs text-[var(--color-text-muted)] pl-1">
                         +{daySessions.length - 3} more
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}"""

# Replace the existing placeholder Calendar View block
text = re.sub(
    r"\{\/\* Calendar View \*\/\}.*?\{\/\* List View \*\/\}",
    calendar_block + "\n\n      {/* List View */}",
    text,
    flags=re.DOTALL
)

with open("src/pages/Planner.jsx", "w") as f:
    f.write(text)
