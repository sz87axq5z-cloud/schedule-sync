import Skeleton from '../../../components/ui/Skeleton'

export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="p-4"><Skeleton className="h-5 w-40" /></div>
      </div>
      <div className="space-y-3">
        <div className="p-4 space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </section>
  )
}
