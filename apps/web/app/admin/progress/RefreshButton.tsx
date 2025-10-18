'use client'
import Button from '../../../components/ui/Button'

export default function RefreshButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.reload()}
      aria-label="再読み込み"
    >
      再読み込み
    </Button>
  )
}
