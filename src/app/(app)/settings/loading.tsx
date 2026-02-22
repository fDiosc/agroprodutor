import { Skeleton } from '@/components/shared/skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
  )
}
