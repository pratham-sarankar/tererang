import { useState } from "react";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Footer } from "../components/Footer.jsx";
import { apiUrl } from "../config/env";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({ type: "success", message: data.message || "Message sent successfully!" });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({ type: "error", message: data.message || "Failed to send message. Please try again." });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus({ type: "error", message: "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-secondary px-6 py-16 text-center sm:py-20">
          <p className="text-sm font-semibold tracking-[0.08em] text-accent">Boutique care</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-5xl lowercase leading-none sm:text-6xl">get in touch</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Questions about sizing, custom stitching, styling, or an order? The designer desk is here to help.
          </p>
        </header>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <aside className="border border-border bg-secondary p-8 sm:p-10">
            <h2 className="font-serif text-4xl lowercase leading-none text-foreground">contact information</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Reach out for fit guidance, custom requests, delivery questions, or collaboration ideas.
            </p>

            <div className="mt-8 space-y-5 text-sm leading-6 text-muted-foreground">
              <p className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" /> Moradabad, Uttar Pradesh, India</p>
              <p className="flex gap-3"><Phone className="mt-1 h-4 w-4 shrink-0 text-primary" /> <a href="tel:+919548971147" className="hover:text-primary">+91 9548971147</a></p>
              <p className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-primary" /> <a href="mailto:tererangofficial@gmail.com" className="hover:text-primary">tererangofficial@gmail.com</a></p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://www.instagram.com/tererang.official/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
                instagram
              </a>
              <a href="https://api.whatsapp.com/send?phone=919548971147" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                whatsapp
              </a>
            </div>
          </aside>

          <div className="border border-border bg-card p-8 sm:p-10">
            <h2 className="font-serif text-4xl lowercase leading-none text-foreground">send us a message</h2>

            {submitStatus.message ? (
              <div className={`mt-6 border p-4 text-sm ${submitStatus.type === "success" ? "border-border bg-secondary text-primary" : "border-red-200 bg-red-50 text-destructive"}`}>
                {submitStatus.message}
              </div>
            ) : null}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Your name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className="w-full border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Your email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Write your message..." className="w-full border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary px-6 py-4 text-sm font-semibold lowercase tracking-[0.18em] text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "sending..." : "send message"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
