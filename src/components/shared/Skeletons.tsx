const pulse = 'animate-pulse rounded bg-gray-200 dark:bg-zinc-700'

function NoteCardSkeleton() {
  return (
    <div className="border-b border-l-2 border-gray-100 border-l-transparent px-5 py-3.5 dark:border-zinc-800">
      <div className={`${pulse} mb-2 h-3.5 w-2/3`} />
      <div className={`${pulse} mb-1.5 h-3 w-full`} />
      <div className={`${pulse} mb-3 h-3 w-4/5`} />
      <div className={`${pulse} h-2.5 w-16`} />
    </div>
  )
}

function ChecklistCardSkeleton() {
  return (
    <div className="border-b border-l-2 border-gray-100 border-l-transparent px-5 py-3.5 dark:border-zinc-800">
      <div className="mb-2 flex items-center gap-2">
        <div className={`${pulse} h-4 w-4 shrink-0 rounded`} />
        <div className={`${pulse} h-3.5 w-1/2`} />
      </div>
      <div className={`${pulse} h-2.5 w-20`} />
    </div>
  )
}

function SidebarProjectSkeleton() {
  return (
    <div className="flex items-center gap-2 border-l-2 border-l-transparent py-1.5 pl-4 pr-3">
      <div className={`${pulse} h-2 w-2 shrink-0 rounded-full`} />
      <div className={`${pulse} h-3 flex-1`} />
    </div>
  )
}

export function NoteListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </>
  )
}

export function PromptListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </>
  )
}

export function ChecklistListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <ChecklistCardSkeleton key={i} />
      ))}
    </>
  )
}

export function SidebarProjectsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <SidebarProjectSkeleton key={i} />
      ))}
    </>
  )
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 pb-4 pt-6 dark:border-zinc-800">
        <div className={`${pulse} mb-4 h-7 w-3/5`} />
        <div className="flex items-center gap-4">
          <div className={`${pulse} h-3 w-24`} />
          <div className={`${pulse} h-3 w-20`} />
        </div>
      </div>
      <div className="flex-1 space-y-3 px-6 py-5">
        <div className={`${pulse} h-3.5 w-full`} />
        <div className={`${pulse} h-3.5 w-5/6`} />
        <div className={`${pulse} h-3.5 w-4/5`} />
        <div className={`${pulse} h-3.5 w-full`} />
        <div className={`${pulse} h-3.5 w-3/4`} />
        <div className="pt-3">
          <div className={`${pulse} h-3.5 w-full`} />
          <div className={`${pulse} mt-3 h-3.5 w-5/6`} />
          <div className={`${pulse} mt-3 h-3.5 w-2/3`} />
        </div>
        <div className="pt-2">
          <div className={`${pulse} h-3.5 w-full`} />
          <div className={`${pulse} mt-3 h-3.5 w-4/5`} />
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-2.5 dark:border-zinc-800">
        <div className={`${pulse} h-3 w-14`} />
      </div>
    </div>
  )
}
