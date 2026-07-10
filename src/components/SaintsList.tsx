import React, { useState } from 'react';
import { Phone, MapPin, Share2, Copy, Check, Heart, ShieldCheck, Search, Users, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const data = {
  meta_info: {
    date: "27 June 2026",
    title: "दिल्ली एन.सी.आर. में विराजित चारित्रात्माएं",
    acharya_location: "परम पूज्य युगप्रधान आचार्यश्री महाश्रमणजी अपनी धवलसेना के साथ जैन विश्व भारती लाडनूं (राजस्थान) में सानन्द सुखसातापूर्वक विराजमान हैं।",
    shivir_office_contact: { name: "हेमन्त बैद", phone: "7044448888" },
    organization: "जैन श्वेताम्बर तेरापंथी सभा, दिल्ली"
  },
  saints_list: [
    { id: 1, title: "", name: "मुनिश्री विनय कुमार जी (आलोक)", thana: "ठाणा-2", status: "स्वास्थ्य लाभ हेतु", stay_place: "तेरापंथ भवन, के-13, मॉडल टाउन-2, दिल्ली-110009", contacts: [{ designation: "कासीद अशोक", phone: "9216024300" }, { designation: "संतोष कुमार", phone: "9210095347" }] },
    { id: 2, title: "शासनश्री", name: "मुनिश्री विमल कुमारजी", thana: "ठाणा-4", status: "", stay_place: "श्री सुरेन्द्र नाहटा, ए-713, सैक्टर-19, नोएडा, उत्तर प्रदेश-201301", contacts: [{ designation: "कासीद राजेश", phone: "7827509290" }] },
    { id: 3, title: "बहुश्रुत", name: "मुनिश्री उदित कुमार जी", thana: "ठाणा-3", status: "", stay_place: "गोयल आस्था भवन, ए.जी.-21, शालीमार बाग, दिल्ली-110088", contacts: [{ designation: "कासीद लक्ष्मण", phone: "9983478999" }] },
    { id: 4, title: "", name: "मुनिश्री जय कुमार जी", thana: "ठाणा-3", status: "", stay_place: "गेल्डा प्रेक्षा सदन, ओ-62, लाजपत नगर, दिल्ली-110024", contacts: [{ designation: "कासीद अनिल", phone: "8340297415" }] },
    { id: 5, title: "डा.", name: "मुनिश्री अभिजीत कुमार जी", thana: "ठाणा-2", status: "", stay_place: "श्री कैलाश गोयल, 41, आराधना एन्क्लेव, आर. के. पुरम, सैक्टर-13, दिल्ली-110066", contacts: [{ designation: "कासीद विनय", phone: "9721168623" }] },
    { id: 6, title: "शासनश्री", name: "साध्वीश्री संघमित्राजी", thana: "ठाणा-5", status: "स्वास्थ्य लाभ हेतु", stay_place: "गोयल श्रद्धा निवास, सी-14, ग्रीन पार्क मेन, दिल्ली-110016", contacts: [{ designation: "कासीद लालराम", phone: "9950120242" }] },
    { id: 7, title: "शासनश्री", name: "साध्वीश्री सुव्रता जी", thana: "ठाणा-4", status: "", stay_place: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002", contacts: [{ designation: "कासीद अरूण", phone: "8375941210" }] },
    { id: 8, title: "शासनश्री", name: "साध्वीश्री सुमनश्री जी", thana: "ठाणा-4", status: "", stay_place: "तेरापंथ भवन, सैक्टर-05, रोहिणी, दिल्ली-110085", contacts: [{ designation: "कासीद पूरन", phone: "9915501240" }] },
    { id: 9, title: "शासनश्री", name: "साध्वीश्री रविप्रभाजी", thana: "ठाणा-5", status: "", stay_place: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली-110095", contacts: [{ designation: "कासीद जयदेव", phone: "8104273773" }] },
    { id: 10, title: "", name: "साध्वीश्री डा. कुन्दनरेखाजी", thana: "ठाणा-3", status: "", stay_place: "श्री अमरदीप जैन, बी-2/7, मॉडल टाउन-2, नई दिल्ली-110009", contacts: [{ designation: "कासीद दिनेश", phone: "9599060813" }] },
    { id: 11, title: "", name: "साध्वीश्री लब्धिप्रभाजी", thana: "ठाणा-3", status: "", stay_place: "अध्यात्म साधना केन्द्र (महाश्रमण सदन), छतरपुर रोड़, दिल्ली-110074", contacts: [{ designation: "राजू", phone: "9310563356" }] }
  ]
};

export default function SaintsList() {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSaints, setSavedSaints] = useState<any[]>(() => {
    const saved = localStorage.getItem('saved_saints');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSaveSaint = (saint: any) => {
    const compositeId = `saintslist-${saint.id}`;
    const isSaved = savedSaints.some((s: any) => s.id === compositeId);
    let updated;
    if (isSaved) {
      updated = savedSaints.filter((s: any) => s.id !== compositeId);
    } else {
      updated = [...savedSaints, {
        id: compositeId,
        name: saint.name,
        rank: saint.thana,
        loc: saint.stay_place,
        contact: saint.contacts[0]?.phone || '',
        type: 'saintsList'
      }];
    }
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
  };

  const handleCopy = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedContact(id);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  const handleShareWhatsApp = (saint: any) => {
    const contactStrings = saint.contacts.map((c: any) => `📞 ${c.designation}: +91 ${c.phone}`).join('\n');
    const message = `*☸️ ${data.meta_info.title} (2026) ☸️*\n\n👤 *संत/साध्वी संघ:* ${saint.title ? `[${saint.title}] ` : ''}${saint.name} (${saint.thana})\n${saint.status ? `🏥 *स्थिति:* ${saint.status}\n` : ''}📍 *प्रवास स्थल:* ${saint.stay_place}\n\n*सम्पर्क सूत्र:*\n${contactStrings}\n\n_प्रदाता: तेरापंथ राष्ट्रीय हेल्पलाइन एआई निर्देशिका_`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredSaints = data.saints_list.filter(saint => {
    const combined = `${saint.name} ${saint.stay_place} ${saint.title} ${saint.thana} ${saint.status}`.toLowerCase();
    return combined.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full text-[var(--text-spiritual)] transition-all duration-300 p-4 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] max-w-2xl mx-auto box-border" id="saints-list-container">
      {/* Header Section */}
      <div className="mb-5 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mb-2 flex items-center justify-center gap-1.5 font-sans tracking-tight">
          🪷 {data.meta_info.title} 🪷
        </h2>
        <p className="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-widest mb-3">
          अपडेट तिथि: {data.meta_info.date}
        </p>

        {/* Acharya Location Status Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-3.5 text-left mb-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-semibold pl-2">
            ✨ {data.meta_info.acharya_location}
          </p>
        </div>

        {/* Shivir / Organization Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-gray-500 dark:text-gray-400 font-bold border-b border-[var(--border-color)] pb-3 mb-4">
          <span>🏛️ {data.meta_info.organization}</span>
          <span className="flex items-center gap-1">
            📞 शिविर कार्यालय ({data.meta_info.shivir_office_contact.name}):{' '}
            <a 
              href={`tel:${data.meta_info.shivir_office_contact.phone}`}
              className="text-blue-600 dark:text-cyan-400 hover:underline"
            >
              +91 {data.meta_info.shivir_office_contact.phone}
            </a>
          </span>
        </div>
      </div>

      {/* Intelligent Search Input */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="चारित्रात्मा का नाम, ठाणा या प्रवास स्थान खोजें..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-2xl text-[var(--text-spiritual)] text-xs sm:text-sm outline-none box-border placeholder-gray-400 dark:placeholder-gray-500 font-semibold focus:border-rose-500 transition-colors"
        />
      </div>

      {/* List Section */}
      <div className="flex flex-col gap-4 text-left">
        <AnimatePresence mode="popLayout">
          {filteredSaints.map((saint) => (
            <motion.div 
              key={saint.id} 
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-black/5 dark:bg-white/[0.02] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:border-rose-500/20"
              id={`saint-card-${saint.id}`}
            >
              {/* Header inside Card */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs">
                    <Users size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base text-[var(--text-spiritual)] font-black flex items-center flex-wrap gap-1.5 leading-tight">
                      {saint.title && (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          {saint.title}
                        </span>
                      )}
                      <span>{saint.name}</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-400">
                    {saint.thana}
                  </span>
                  <button
                    onClick={() => toggleSaveSaint(saint)}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-500 hover:text-amber-500"
                    title={savedSaints.some((s: any) => s.id === `saintslist-${saint.id}`) ? "Remove from Favorites" : "Save to Favorites"}
                  >
                    <Star
                      size={15}
                      className={savedSaints.some((s: any) => s.id === `saintslist-${saint.id}`) ? "fill-amber-400 text-amber-500" : "text-gray-400 dark:text-gray-500"}
                    />
                  </button>
                </div>
              </div>

              {/* Status Alert if any */}
              {saint.status && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 font-extrabold inline-flex items-center gap-1.5 mb-3">
                  <Heart size={12} className="fill-rose-500" />
                  <span>{saint.status}</span>
                </div>
              )}

              {/* Stay Place Location */}
              <div className="flex items-start gap-2.5 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-[var(--border-color)] mb-4">
                <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-550 dark:text-gray-300 font-semibold m-0 leading-relaxed">
                  {saint.stay_place}
                </p>
              </div>

              {/* Contacts / Call Suite */}
              <div className="space-y-2 font-sans">
                {saint.contacts.map((contact, index) => {
                  const copyKey = `${saint.id}-${index}`;
                  return (
                    <div 
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"
                    >
                      <div className="flex items-center justify-between sm:justify-start gap-3 px-1.5 py-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                          👤 कासीद: {contact.designation}
                        </span>
                        <span className="text-xs font-mono font-black text-blue-600 dark:text-cyan-400">
                          +91 {contact.phone}
                        </span>
                      </div>
                      
                      <div className="flex gap-1.5 justify-end">
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 px-3 py-2 rounded-lg text-xs font-black cursor-pointer transition active:scale-98"
                        >
                          <Phone size={11} />
                          <span>कॉल करें</span>
                        </a>

                        <button
                          onClick={() => handleCopy(contact.phone, copyKey)}
                          className="flex items-center justify-center gap-1 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg px-2.5 py-2 text-[var(--text-spiritual)] text-xs font-bold cursor-pointer transition active:scale-98"
                        >
                          {copiedContact === copyKey ? (
                            <>
                              <Check size={11} className="text-emerald-500 dark:text-emerald-400" />
                              <span className="text-[10px]">कॉपी</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span className="text-[10px]">कॉपी</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Individual Saint Action Menu */}
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)] mt-2">
                  <button
                    onClick={() => handleShareWhatsApp(saint)}
                    className="flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition active:scale-95"
                    title="WhatsApp पर भेजें"
                  >
                    <Share2 size={12} />
                    <span>व्हाट्सएप साझा करें</span>
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSaints.length === 0 && (
          <div className="text-center text-gray-400 text-xs py-5">
            इस खोज के लिए कोई चारित्रात्मा विवरण नहीं मिला भाईसाहब।
          </div>
        )}
      </div>

      {/* Trust Footer */}
      <div className="mt-5 text-[10px] italic text-gray-500 flex items-center justify-center gap-1 font-mono border-t border-[var(--border-color)] pt-3">
        <ShieldCheck size={11} />
        <span>Verified by Jain Shwetambar Terapanthi Sabha, Delhi • June 2026</span>
      </div>
    </div>
  );
}
