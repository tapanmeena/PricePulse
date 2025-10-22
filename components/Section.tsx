import { cn } from '@/lib/utils'
import { MotionDiv } from '@/components/motion'

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn('py-16 sm:py-20', className)}
    >
      {children}
    </MotionDiv>
  )
}
