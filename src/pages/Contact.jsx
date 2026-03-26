// Postcard layout Contact page
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { contactData, socialLinks } from "../data/siteData";
import { FaPaperPlane } from "react-icons/fa";

const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailJsPublicKey || !emailJsServiceId || !emailJsTemplateId) {
      setStatus({
        type: "error",
        message: "Email service is not configured yet. Add the EmailJS keys in your .env file.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: "", message: "" });

      await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          reply_to: form.email,
          to_email: contactData.email,
        },
        {
          publicKey: emailJsPublicKey,
        }
      );

      setStatus({
        type: "success",
        message: "Postcard sent successfully. We'll get back to you soon!",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Could not send the postcard. Verify your EmailJS IDs and template variables.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 min-h-[80vh] w-full bg-[#e6e4dc] relative overflow-hidden flex flex-col items-center">
      {/* Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* The Postcard */}
      <motion.div
         initial={{ opacity: 0, scale: 0.9, y: 50, rotate: "2deg" }}
         animate={{ opacity: 1, scale: 1, y: 0, rotate: "-1deg" }}
         transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
         className="relative w-full max-w-5xl bg-[#fffef5] border border-black/10 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row p-8 md:p-14 z-10"
      >
        {/* Postcard Stamp - Lilac Accent */}
        <div className="absolute top-8 right-8 w-20 h-24 flex items-center justify-center rotate-[15deg] pointer-events-none z-30">
           <div className="w-16 h-20 bg-[#ba9ed1] text-black font-serif flex items-center justify-center text-[10px] text-center p-1 border border-black/20 shadow-sm" style={{ clipPath: "polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)" }}>
             Express<br/>Mail
           </div>
           <div className="absolute inset-0 border-[3px] border-black/20 rounded-full w-24 h-24 -left-2 -top-2" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }} />
           <div className="absolute inset-0 border-[3px] border-black/20 rounded-full w-20 h-20 left-0 top-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }} />
        </div>

        {/* Left Side: Form (The Message side of postcard) */}
        <div className="w-full md:w-1/2 md:pr-14 md:border-r-[3px] border-double border-black/10 relative z-20">
           <h2 className="text-4xl font-black font-serif text-black mb-8">
             {contactData.tagline}
           </h2>

           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="relative border-b-2 border-black/10 pb-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 block mb-1">
                 From: (Name)
               </label>
               <input
                 type="text"
                 required
                 value={form.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })}
                 className="w-full bg-transparent text-xl font-serif italic text-black outline-none placeholder:text-black/10"
                 placeholder="John Doe"
               />
             </div>

             <div className="relative border-b-2 border-black/10 pb-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 block mb-1">
                 Return Address: (Email)
               </label>
               <input
                 type="email"
                 required
                 value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })}
                 className="w-full bg-transparent text-lg font-mono text-black outline-none placeholder:text-black/10"
                 placeholder="john@example.com"
               />
             </div>

             {/* Message utilizes lined paper background */}
             <div className="relative pt-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 block mb-2">
                 Message:
               </label>
               <div className="relative">
                 {/* Lined paper effect */}
                 <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent 95%, rgba(0,0,0,0.1) 95%)', backgroundSize: '100% 2.5rem' }} />
                 <textarea
                   required
                   rows={5}
                   value={form.message}
                   onChange={(e) => setForm({ ...form, message: e.target.value })}
                   className="w-full bg-transparent text-xl font-serif text-black outline-none resize-none placeholder:text-black/20 leading-[2.5rem]"
                   placeholder="Write your note here..."
                 />
               </div>
             </div>

             <button
               type="submit"
               disabled={isSubmitting}
               className="mt-8 px-8 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0px_#ccc] hover:shadow-[2px_2px_0px_#ccc] w-full border border-black flex items-center justify-center gap-3 hover:bg-[#a3b18a] hover:text-black disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
             >
               {isSubmitting ? "Sending..." : <> Drop in Mailbox <FaPaperPlane className="text-xs" /></>}
             </button>

             {status.message ? (
               <p
                 className={`text-sm font-semibold ${
                   status.type === "success" ? "text-green-700" : "text-red-700"
                 }`}
               >
                 {status.message}
               </p>
             ) : null}
           </form>
        </div>

        {/* Right Side: Destination Address (The Address side of postcard) */}
        <div className="w-full md:w-1/2 md:pl-16 pt-16 md:pt-24 flex flex-col relative z-20">
           
           <div className="space-y-12">
             <div className="border-b-2 border-black/20 pb-2 flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Deliver To:</span>
                <h3 className="text-3xl font-black font-serif text-black mt-2">The CodeCrafters Desk</h3>
                <p className="text-sm font-bold text-black/50 font-sans mt-2 uppercase tracking-widest">Student Tech Club Room</p>
             </div>
             
             <div className="border-b-2 border-black/20 pb-2 flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Digital Inbox:</span>
                <p className="text-xl font-bold font-mono text-black mt-2 bg-[#dce4f0] border-[2px] border-black shadow-[3px_3px_0px_#2b2a27] px-2 py-1 transform rotate-1">{contactData.email}</p>
             </div>

             <div className="pb-2 flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Connect Details:</span>
                <div className="flex gap-4 mt-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white border-2 border-dashed border-black/30 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-sm hover:rotate-12"
                    >
                      <s.icon size={20} />
                    </a>
                  ))}
                </div>
             </div>
           </div>
           
           {/* Decorative Barcode */}
           <div className="absolute bottom-0 right-0 h-12 w-48 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to right, #2b2a27 0, #2b2a27 2px, transparent 2px, transparent 4px, #2b2a27 4px, #2b2a27 5px, transparent 5px, transparent 8px, #2b2a27 8px, #2b2a27 12px, transparent 12px, transparent 14px)', backgroundSize: '100% 100%' }} />

        </div>

      </motion.div>
    </div>
  );
}
