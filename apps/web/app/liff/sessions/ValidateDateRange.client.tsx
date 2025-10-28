"use client"

import { useEffect } from 'react'

export default function ValidateDateRange({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (!form) return
    const startsDate = form.elements.namedItem('startsDate') as HTMLInputElement | null
    const startsHour = form.elements.namedItem('startsHour') as HTMLSelectElement | null
    const startsMin = form.elements.namedItem('startsMin') as HTMLSelectElement | null
    const endsDate = form.elements.namedItem('endsDate') as HTMLInputElement | null
    const endsHour = form.elements.namedItem('endsHour') as HTMLSelectElement | null
    const endsMin = form.elements.namedItem('endsMin') as HTMLSelectElement | null
    const startsErr = document.getElementById('error-startsAt')
    const endsErr = document.getElementById('error-endsAt')
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null

    const makeDate = (d?: string|null, h?: string|null, m?: string|null) => {
      if (!d || !h || !m) return null
      const iso = `${d}T${h}:${m}:00`
      const x = new Date(iso)
      return isNaN(x.getTime()) ? null : x
    }

    const clearErrors = () => {
      if (startsErr) startsErr.textContent = ''
      if (endsErr) endsErr.textContent = ''
    }

    const validate = () => {
      clearErrors()
      const s = makeDate(startsDate?.value, startsHour?.value, startsMin?.value)
      const e = makeDate(endsDate?.value, endsHour?.value, endsMin?.value)
      let ok = true
      if (s && e && s >= e) {
        if (endsErr) endsErr.textContent = '終了は開始より後の時刻を指定してください。'
        ok = false
      }
      if (submitBtn) submitBtn.disabled = !ok
      return ok
    }

    const onSubmit = (ev: Event) => {
      if (!validate()) {
        ev.preventDefault()
      }
    }

    const onChange = () => validate()

    form.addEventListener('submit', onSubmit)
    form.addEventListener('input', onChange)
    form.addEventListener('change', onChange)
    return () => {
      form.removeEventListener('submit', onSubmit)
      form.removeEventListener('input', onChange)
      form.removeEventListener('change', onChange)
    }
  }, [formId])

  return null
}

