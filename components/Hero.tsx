import { Button } from '@/components/ui'
import { MotionDiv } from '@/components/motion'
import { ArrowRight } from 'lucide-react'
import { Section } from './Section'

export default function Hero() {
  return (
    <Section className="text-center">
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
          Track Myntra Prices, Effortlessly.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Never miss a deal again. Paste a Myntra product URL to start tracking its price history.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </MotionDiv>
    </Section>
  )
}
