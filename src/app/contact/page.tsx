import { Mail, MapPin, Phone, Github, Linkedin, Twitter } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
          Get in touch
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Let&rsquo;s build something.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Tell me about your project, your team, or the thing you wish existed
          but doesn&rsquo;t yet. I read every message myself and reply within a
          day or two.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-semibold">Send me a message</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Fields marked with{' '}
            <span className="text-destructive">*</span> are required.
          </p>
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Direct channels</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href={process.env.EMAIL}
                    className="text-muted-foreground hover:text-foreground"
                  >
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">. </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">
                    Lusaka, Zambia. Open to work worldwide 
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Elsewhere</h3>
            <div className="flex gap-3">
              <a
                href={process.env.github}
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Typical response time: under 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
