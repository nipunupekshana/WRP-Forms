import { useTheme } from './use-theme'

type Theme = 'light' | 'dark' | 'system'

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const options: Array<{ label: string; value: Theme }> = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ]

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-input bg-background p-1 text-sm">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={
            theme === option.value
              ? 'rounded-sm bg-primary px-2 py-1 text-primary-foreground'
              : 'rounded-sm px-2 py-1 hover:bg-accent hover:text-accent-foreground'
          }
          aria-pressed={theme === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
