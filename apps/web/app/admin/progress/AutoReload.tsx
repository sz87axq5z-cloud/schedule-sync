'use client'
export default function AutoReload({ intervalMs = 60_000 }: { intervalMs?: number }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `;(function(){try{setInterval(function(){if(document.visibilityState==='visible'){location.reload()}}, ${intervalMs});}catch(e){}})();`,
      }}
    />
  )
}
