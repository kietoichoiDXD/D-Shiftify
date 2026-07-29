type ComingSoonProps = {
  title: string
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center'>
      <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
        Sắp ra mắt
      </span>
      <h1 className='text-2xl font-bold text-slate-800'>{title}</h1>
      <p className='max-w-md text-sm leading-6 text-slate-500'>
        {description ?? 'Tính năng này đang được phát triển và sẽ sớm khả dụng.'}
      </p>
    </div>
  )
}
