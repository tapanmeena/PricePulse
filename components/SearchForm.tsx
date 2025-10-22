import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Section } from '@/components/Section'

export default function SearchForm() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <form>
          <div className="flex gap-x-4">
            <Input
              type="url"
              placeholder="Enter Myntra Product URL"
              required
              className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
            />
            <Button type="submit" size="lg">
              Track Product
            </Button>
          </div>
        </form>
      </div>
    </Section>
  )
}
