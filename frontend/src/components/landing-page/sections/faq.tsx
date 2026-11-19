import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// TODO: confirm each answer matches how the platform actually works before launch.
const faqs = [
  {
    q: "How do I join a tournament?",
    a: "Create an account, add money to your wallet, then pick an open tournament and pay the entry fee from your wallet.",
  },
  {
    q: "Which games can I play?",
    a: "Right now: eFootball, 8Ball Pool and Call of Duty.",
  },
  {
    q: "What are League and Cup tournaments?",
    a: "In a League, players are ranked on a table based on their results. A Cup is knockout: some Cups start straight with elimination, and others begin with a group stage first.",
  },
  {
    q: "How is the prize pool worked out?",
    a: "The prize pool is 30% of the total entry fees paid by all players in that tournament. The number is shown on every tournament before you join.",
  },
  {
    q: "How do I withdraw my winnings?",
    a: "Prize money is added to your wallet. Open your wallet and request a withdrawal to your bank account.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions players ask</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}