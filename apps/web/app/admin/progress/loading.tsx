import Skeleton from '../../../components/ui/Skeleton'

export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </section>
  )
}
