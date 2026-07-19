export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'History' | 'Acharya' | 'Rituals' | 'Philosophy' | 'Rules';
  description: string;
  details: string;
  tags: string[];
  upvotes?: number;
  downvotes?: number;
  views?: number;
}

export const COMMUNITY_WINGS = {
  TERAPANTH: 'https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png',
  TPF: 'https://i.postimg.cc/ydXQL3gn/logo-(1).png',
  ABTYP: 'https://i.postimg.cc/Pqf904hh/Abtyp-logo.png',
  ABTMM: 'https://i.postimg.cc/VNbZy9dT/dz5x1oj15hmj06kinnr0.jpg',
  ANUVIBHA: 'https://i.postimg.cc/tg92YCmK/Anuvibha-logo.png',
  GYANSHALA: 'https://i.postimg.cc/fR5DtNCD/Gyanshala-(2).png',
};

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'acharya-bhikshu',
    title: 'Acharya Bhikshu',
    category: 'Acharya',
    description: 'The revolutionary founder of Terapanth (Swamiji Bhikshu).',
    details: 'Acharya Bhikshu (1760-1803) was the founding father of the Terapanth sect. He established the order in 1760 AD in Kelwa, Rajasthan, on the principles of single leadership and purity of character. He wrote 38,000 verses in Rajasthani, documenting the "Bhikshu" philosophy which separates Dharma (spiritual) from Laukik (social) deeds. He emphasized that the purity of means is just as important as the end.',
    tags: ['Founder', '1760', 'History', 'Swamiji', 'Rajasthan']
  },
  {
    id: 'acharya-tulsi',
    title: 'Acharya Tulsi',
    category: 'Acharya',
    description: 'The 9th Acharya and founder of the Anuvrat Movement.',
    details: 'Acharya Tulsi (1914-1997) was a visionary who launched the Anuvrat Movement in 1949 to build a character-rich society through non-sectarian ethical vows. He famously said, "First a human, then a Jain." He was also the pioneer of Preksha Meditation and established the Jain Vishva Bharati in Ladnun. His tenure saw the modernization of the community while keeping spiritual roots deep.',
    tags: ['Anuvrat', 'Tulsi', '9th Acharya', 'Ladnun', 'Education']
  },
  {
    id: 'acharya-mahapragya',
    title: 'Acharya Mahapragya',
    category: 'Acharya',
    description: 'The 10th Acharya and scientist of spirituality.',
    details: 'Acharya Mahapragya (1920-2010) was a profound philosopher who structured Preksha Meditation as a scientific technique for self-awakening. He wrote over 300 books and was honored with the Indira Gandhi Award for National Integration. He led the "Ahimsa Yatra" across India to promote communal harmony and social ethics.',
    tags: ['Preksha', 'Meditation', 'Philosopher', '10th Acharya', 'Scientist']
  },
  {
    id: 'acharya-mahashraman',
    title: 'Acharya Mahashraman',
    category: 'Acharya',
    description: 'The 11th and current Supreme Head of Terapanth.',
    details: 'Acharya Mahashraman is the current spiritual head and the absolute authority (Ek Guru) of the Terapanth Dharmsangh. He is renowned for his "Ahimsa Yatra", having traveled over 50,000 km by foot. He oversees both the Ascetic wing (Sadhus/Sadhvis) and the Layperson wing (Mahasabha, ABTYP, TPF) with singular command. His mission focuses on three pillars: Harmony (Sadbhavana), Morality (Naitikta), and De-addiction (Nasha-mukti).',
    tags: ['Current Head', 'Ahimsa Yatra', 'Ek Guru', 'Supreme Authority']
  },
  {
    id: 'structural-hierarchy',
    title: 'Structural Hierarchy',
    category: 'History',
    description: 'The administrative and spiritual organization of Terapanth.',
    details: 'Terapanth follows a centralized "Ek Guru" system. At the apex is the Acharya. Below him are the Ascetic Wing (Sadhus, Sadhvis, and the Saman order) and the Layperson Wing. The lay wing is coordinated by the Jain Shwetambar Terapanth Mahasabha (Apex Body), which oversees specialized organizations like ABTYP (Youth), TPF (Professionals), and ABTMM (Women).',
    tags: ['Hierarchy', 'Organization', 'Mahasabha', 'Management']
  },
  {
    id: 'terapanth-principles',
    title: 'The 13 Principles',
    category: 'Philosophy',
    description: 'The foundational structure of Terapanth.',
    details: 'Terapanth (Meaning: 13 paths or "Thy path") is rooted in 13 principles: 5 Mahavratas (Great Vows: Non-violence, Truth, Non-stealing, Celibacy, Non-attachment), 5 Samitis (Carefulness in walking, speaking, alms, handling, disposal), and 3 Guptis (Restraints of Mind, Body, and Speech). These form the "Tera Path" of the Lord.',
    tags: ['Foundations', '13 path', 'Discipline', 'Yoga']
  },
  {
    id: 'anuvrat',
    title: 'Anuvrat Movement',
    category: 'Philosophy',
    description: 'Small vows for a big society (Impact & Status).',
    details: 'Founded in 1949, Anuvrat targets individual character building. Current impact includes global environmental sensitivity programs and a massive de-addiction drive under Acharya Mahashraman. It remains a non-sectarian ethical movement recognized for its contribution to social harmony and humanitarian values.',
    tags: ['Philosophy', 'Vows', 'Ethics', 'Character', 'Global']
  },
  {
    id: 'preksha-meditation',
    title: 'Preksha Meditation',
    category: 'Rituals',
    description: 'A scientific technique for self-awakening.',
    details: 'Refined by Acharya Mahapragya, Preksha involves: Kayotsarg (Relaxation), Antaryatra (Internal Journey), Shwas-Preksha (Breath Control), and Chaitanya-Kendra-Preksha (Concentration on psychic centers). It is designed to balance the neuro-endocrine system and achieve emotional purification (Bhava-Parivartan).',
    tags: ['Meditation', 'Mahapragya', 'Kayotsarg', 'Mental Health']
  },
  {
    id: 'abtmm',
    title: 'ABTMM (Women Wing)',
    category: 'History',
    description: 'Akhil Bhartiya Terapanth Mahila Mandal.',
    details: 'ABTMM is the apex organization for Terapanth women. It focuses on women empowerment, social welfare, and spiritual education. It works in coordination with the Mahasabha to strengthen the "Layperson Wing" of the Dharmsangh through value-based activities.',
    tags: ['Women Empowerment', 'Social Service', 'Mahila Mandal']
  },
  {
    id: 'saman-order',
    title: 'The Saman Order',
    category: 'Philosophy',
    description: 'The bridge between laypersons and monks.',
    details: 'Introduced by Acharya Tulsi in 1980, the Saman/Samani order allows spiritual practitioners to travel by vehicles/planes to propagate Jainism globally (USA, UK, Singapore, etc.). They follow strict vegetarianism and celibacy but live a slightly more flexible lifestyle than absolute monks (Sadhus) to facilitate international outreach.',
    tags: ['Saman', 'Global Outreach', 'Acharya Tulsi', 'International']
  },
  {
    id: 'diet-chauvihar',
    title: 'Chauvihar',
    category: 'Rituals',
    description: 'The sacred practice of completing meals before sunset.',
    details: 'Chauvihar is a fundamental daily ritual in Terapanth Jainism. Instructions: 1. Complete all eating and drinking before sunset. 2. Observe a complete fast (no food or water) until 48 minutes after sunrise the next day (Navkarsi). 3. It is practiced to minimize violence (Ahimsa) towards microorganisms that thrive after dark and to align the body with natural circadian rhythms for better health.',
    tags: ['Daily Rituals', 'Diet', 'Ahimsa', 'Maryada', 'Health']
  },
  {
    id: 'pancha-mahavrata',
    title: 'Pancha Mahavrata',
    category: 'Rules',
    description: 'The five absolute great vows of Terapanth ascetics.',
    details: 'Terapanth Sadhu and Sadhvis take absolute, lifelong vows with no exceptions: 1. Ahinsa Mahavrata (Absolute Non-Violence): Avoiding injury to all six classes of living beings (earth, water, fire, air, vegetation, and mobile beings). 2. Satya Mahavrata (Absolute Truth): Speaking only what is true, beneficial, and holy. 3. Achaurya Mahavrata (Absolute Non-Stealing): Taking nothing without explicit permission. 4. Brahmacharya Mahavrata (Absolute Celibacy): Total purity of body, mind, and speech. 5. Aparigraha Mahavrata (Absolute Non-Possessiveness): Zero material ownership of money, property, or land.',
    tags: ['Vows', 'Monasticism', 'Rules', 'Ascetic Life', 'Mahavrata']
  },
  {
    id: 'ascetic-routine',
    title: 'Ascetic Daily Routine',
    category: 'Rituals',
    description: 'The precise 24-hour cycle of a Terapanth monk or nun.',
    details: 'A Terapanth ascetic\'s day is mathematically structured for maximum spiritual efficiency: [04:00 AM] Pratikraman (Morning Repentance), [06:00 AM] Sunrise Prayers & Vow Activation, [08:00 AM] Pravachan (Discourse to Laypeople), [11:00 AM] Gochari (Collecting Alms), [01:00 PM] Svadhyaya & Writing, [04:30 PM] Second Gochari (Water/Food collection), [06:00 PM] Chauvihar (Sunset Cessation of eating/drinking), [07:00 PM] Rai Pratikraman (Evening Review), [09:00 PM] Santhara (Sleep with detachment).',
    tags: ['Routine', 'Gochari', 'Vihar', '24-hour Cycle', 'Timeline']
  },
  {
    id: 'ascetic-boundaries',
    title: 'Strict Monastic Boundaries',
    category: 'Rules',
    description: 'Absolute prohibitions for Terapanth Sadhus and Sadhvis.',
    details: 'The ascetic order follows zero-compromise rules: 1. No Technology: No phones, fans, lights, or microphones. 2. No Touch: Strict segregation; a Sadhu cannot touch any female, and a Sadhvi cannot touch any male. 3. No Residential Stays: They stay only in Upashrayas or Sthanaks (community halls), never in private homes. 4. No Vehicles: Every distance is covered on foot. 5. No Money: They never carry identification, cash, or cards.',
    tags: ['Prohibitions', 'Boundaries', 'Monastic Rules', 'Strict Discipline']
  },
  {
    id: 'ascetic-demographics',
    title: 'Gender Dynamics & Demographics',
    category: 'History',
    description: 'Structure and ratio of the ascetic order.',
    details: 'A unique feature of Terapanth is that Sadhvis (Nuns) significantly outnumber Sadhus (Monks), usually by a ratio of 4:5 to 1. The female wing is highly structured, led by the Sadhvi Pramukha. Sadhvis are globally respected for their scholarly mastery of Sanskrit, Prakrit, and philosophy. They travel in small clusters called "Singhas" (3-7 members) for safety and mutual support.',
    tags: ['Sadhvi', 'Demographics', 'Singha', 'Female Leadership']
  },
  {
    id: 'pratidlekhan',
    title: 'Pratidlekhan',
    category: 'Rituals',
    description: 'The meticulous inspection of possessions.',
    details: 'Performed twice daily, Pratidlekhan is the ritual of inspecting white clothes (Vastra) and wooden bowls (Patra) with absolute precision. This ensures no micro-insects are accidentally trapped or crushed, maintaining the highest standard of Ahimsa (non-violence) in every action.',
    tags: ['Inspection', 'Ahimsa', 'Non-violence', 'Ritual']
  },
  {
    id: 'ascetic-equipment',
    title: 'Ascetic Equipment (Upkaras)',
    category: 'Rules',
    description: 'The minimal material possessions of a monk.',
    details: 'Terapanth ascetics use only essential items: 1. Vastra: Simple unstitched white cotton clothes. 2. Muhpatti: A small white cloth held over the mouth during speech to protect air-bodied organisms. 3. Rajoharan: A soft wool broom to gently brush away insects before sitting. 4. Patra: Wooden bowls for receiving and consuming Gochari. These are the only "possessions" permitted for their spiritual journey.',
    tags: ['Equipment', 'Upkara', 'Muhpatti', 'Rajoharan', 'Patra']
  },
  {
    id: 'ascetic-hierarchy',
    title: 'Ascetic Hierarchy',
    category: 'History',
    description: 'The ranks and authority within the spiritual order.',
    details: 'The order operates with discipline under One Guru. Hierarchy: 1. Acharya (Current: Acharya Mahashraman): Supreme head with final authority. 2. Mukhya Sadhu: Administrative leader of male monks. 3. Sadhvi Pramukha (Current: Sadhvi Kanchanprabha): Supreme leader of female nuns. 4. Sadhvi Varya: Secondary rank for nun administration. 5. Saman/Samani: Specialized rank for international outreach via modern transit.',
    tags: ['Hierarchy', 'Authority', 'Acharya', 'Sadhvi Pramukha', 'Administration']
  },
  {
    id: 'diksha-pipeline',
    title: 'Diksha: The Initiation Pipeline',
    category: 'History',
    description: 'The process from detachment to spiritual initiation.',
    details: 'Becoming an ascetic involves: 1. Vairagya: Detachment from worldly life. 2. Parental Consent: Mandatory approval. 3. Mumukshu Training: Rigorous studies in Ladnun (PSS) covering philosophy, Prakrit, and endurance. 4. Trial: Living with ascetics for months. 5. Diksha Ceremony: Large public event where the Acharya performs Kesh-Loch (pulling hair), discards worldly clothes, and bestows white robes and a new name.',
    tags: ['Diksha', 'Initiation', 'Mumukshu', 'Vairagya', 'Monasticism']
  },
  {
    id: 'gochari',
    title: 'Gochari',
    category: 'Rituals',
    description: 'The pure method of collecting alms.',
    details: 'Derived from the behavior of a cow or honeybee, Gochari is the practice where ascetics collect vegetarian food from multiple lay households in small quantities. This ensures they do not become a burden on any single family. They do not cook food themselves and only accept what is "Shuddha" (pure) and offered with devotion.',
    tags: ['Rituals', 'Food', 'Monasticism', 'Alms']
  },
  {
    id: 'abtyp',
    title: 'ABTYP (Youth Parishad)',
    category: 'History',
    description: 'Akhil Bhartiya Terapanth Yuvak Parishad.',
    details: 'Youth wing (ages 15-45) with 350+ branches. Key initiatives: 1. MBDD (Mega Blood Donation Drive): International record-holding annual drive. 2. TTF (Terapanth Task Force): Disciplined disaster relief and crowd management corps. 3. Jain Sanskar Vidhi: Standardized manual for spiritually grounded social rituals.',
    tags: ['Youth', 'Blood Donation', 'Service', 'TTF', 'Sanskar Vidhi']
  },
  {
    id: 'samayik',
    title: 'Samayik',
    category: 'Rituals',
    description: '48 minutes of equanimity, introspection, and detachment.',
    details: 'Samayik is the most important daily ritual for a Terapanthi Shravak. Instructions: 1. Set aside 48 minutes. 2. Sit in a clean, quiet place. 3. Recite the Karyami Samayikam vow to detach from worldly activities. 4. During this time, engage in Svadhyaya (spiritual study), meditation, or chanting the Namokar Mantra. 5. Maintain focus of mind, speech, and body (Tirgutti) and avoid any form of violence or anger. It helps in attaining mental peace and spiritual growth.',
    tags: ['Daily Rituals', 'Meditation', 'Peace', 'Equanimity']
  },
  {
    id: 'maryada-mahotsav',
    title: 'Maryada Mahotsav',
    category: 'History',
    description: 'The annual celebration of the Terapanth Constitution.',
    details: 'Celebrated on Magh Shukla Saptami, Maryada Mahotsav commemorates the day Acharya Bhikshu wrote the "Maryada Patra" (Code of Conduct) to ensure the unity of the sect. It is a 3-day event focusing on monastic discipline and the singular leadership (Ek Guru) principle. The 162nd Mahotsav in 2026 at Chhoti Khatu, Rajasthan, reinforced these values for the digital era with thousands of virtual and physical attendees.',
    tags: ['Magh Shukla Saptami', 'Constitution', 'Unity', 'Maryada Patra', '2026']
  },
  {
    id: 'ahimsa-yatra-milestone',
    title: 'Ahimsa Yatra 50,000km',
    category: 'History',
    description: 'The historic peace march of Acharya Mahashraman.',
    details: 'The Ahimsa Yatra, led by the 11th Acharya Mahashraman, is a historic journey that crossed 50,000 kilometers on foot. Spanning over 7 countries (India, Nepal, Bhutan, etc.) and 23 Indian states, it focused on three main pillars: Harmony (Sadbhavana), Morality (Naitikta), and De-addiction (Nasha-mukti). This yatra is considered one of the longest peace marches by a spiritual leader in recorded history.',
    tags: ['Ahimsa Yatra', 'Mahashraman', 'Peace March', 'Global Peace', 'Record']
  },
  {
    id: 'jain-vishva-bharati',
    title: 'Jain Vishva Bharati (JVB)',
    category: 'History',
    description: 'University & Research center in Ladnun.',
    details: 'Established by Acharya Tulsi in 1970, JVB (University) is a deemed university in Ladnun, Rajasthan, dedicated to the study of Jainology, Sanskrit, Prakrit, and Oriental studies. It serves as the academic hub for Terapanth, fostering scientific research into spirituality.',
    tags: ['University', 'Ladnun', 'Acharya Tulsi', 'Research', 'Education']
  },
  {
    id: 'tpf',
    title: 'Terapanth Professional Forum (TPF)',
    category: 'History',
    description: 'The intellectual base and professional network.',
    details: 'TPF is a global repository of educated professionals (CAs, Doctors, Engineers). Key initiatives: 1. Shiksha Sahyog: A strategic educational fund providing scholarships and coaching for underprivileged students to clear elite entry exams. 2. Professional Data Registry: A platform for professional networking and community service.',
    tags: ['TPF', 'Professionals', 'Education', 'Shiksha Sahyog']
  },
  {
    id: 'chaturmas',
    title: 'Chaturmas (Monsoon Retreat)',
    category: 'Rituals',
    description: 'The four-month period of intensive spiritual practice.',
    details: 'Chaturmas begins on Ashadha Shukla Ekadashi and ends on Kartik Shukla Ekadashi. During this time, the Acharya and ascetics stay in one location to avoid harming life forms during the rainy season. In 2026, the Chaturmas is held from July 29 to November 2026 at Rajarhat, Kolkata. Laypersons observe timing vows (Pachkhan) and daily rituals like Samayik.',
    tags: ['Monsoon', 'Fasting', 'Chaturmas', 'Spiritual Retreat', '2026']
  },
  {
    id: 'jeevan-vigyan',
    title: 'Jeevan Vigyan (Science of Living)',
    category: 'Philosophy',
    description: 'A system for personality development and spiritual growth.',
    details: 'Jeevan Vigyan (Science of Living) is a secular system of value education and personality development aimed at the holistic growth of individuals. It combines Preksha Meditation, Yoga, and behavioral modifications to help students and adults achieve emotional balance and mental clarity. It is widely implemented in schools as a means of character building.',
    tags: ['Education', 'Values', 'Science of Living', 'Acharya Mahapragya', 'Growth']
  },
  {
    id: 'digital-outreach',
    title: 'Digital Outreach & Archive',
    category: 'Philosophy',
    description: 'Global reach through modern technology.',
    details: 'Terapanth has actively embraced digital platforms to archive teachings, broadcast live pravachans, and share spiritual events. High-quality video archives on YouTube (like Channel Mahalaxmi) and cloud storage solutions allow followers globally to stay connected to the Acharyas and the daily rituals, ensuring the ancient wisdom is accessible in the digital era.',
    tags: ['Technology', 'Outreach', 'YouTube', 'Global', 'Digital Archive']
  },
  {
    id: 'saman-shreni',
    title: 'Saman Shreni',
    category: 'Philosophy',
    description: 'The unique quasi-monastic order of Terapanth.',
    details: 'Introduced by Acharya Tulsi in 1980, the Saman Shreni is a unique monastic order where practitioners follow the basic vows of monks but are permitted to travel by vehicles and cross oceans to spread Jainism globally. This revolutionary step allowed Terapanth to establish permanent centers in London, USA, and elsewhere, bringing the "Science of Living" to the West.',
    tags: ['Saman', 'Global Outreach', 'Acharya Tulsi', 'Innovation', 'Spiritual Order']
  },
  {
    id: 'shravak-12-vows',
    title: 'Shravak Ke Barah Vrat (12 Householder Vows)',
    category: 'Rules',
    description: 'The 12 vows governing the ethical life of a layperson.',
    details: 'The householder path relies on 12 Vows divided into three tiers: 1. The 5 Anuvratas (Small Vows): Non-violence (Ahimsa), Truth (Satya), Non-stealing (Achaurya), Celibacy (Brahmacharya), and Non-attachment (Aparigraha) within strict limits. 2. The 3 Guna Vratas (Merit Vows): Dig Vrata (Geographic limits), Desa Vrata (Temporal/Local limits), and Anartha-Danda Vrata (Avoiding purposeless sins). 3. The 4 Shiksha Vratas (Disciplinary Vows): Samayik (Equanimity), Desavakasika (Boundary reduction), Poshadh (Monastic life for 24h), and Atithi Samvibhaga (Sharing with monks).',
    tags: ['Shravak', 'Layperson Rules', '12 Vows', 'Ethics', 'Householder']
  },
  {
    id: 'terapanth-origin',
    title: 'Origin & Meaning of Terapanth (The 1760 Split)',
    category: 'History',
    description: 'The founding context and the name\'s etymology.',
    details: 'Acharya Bhikshu founded Terapanth on June 28, 1760 (Vikram Samvat 1817) at Kelwa, Rajasthan, seeking to restore monastic discipline. Initially mocked as "Terah-Panth" because it had 13 monks and 13 laymen, Bhikshu reinterpreted it linguistically: "O Lord, Yeh Tera (Your) Panth Hai" (Thy Path). The 13 also aligns with the 5 Mahavratas, 5 Samitis, and 3 Guptis.',
    tags: ['1760', 'Origin', 'History', 'Acharya Bhikshu', 'Tera Path']
  },
  {
    id: 'laukika-lokottara',
    title: 'Laukika vs. Lokottara Philosophy',
    category: 'Philosophy',
    description: 'The clear distinction between worldly social work and soul-purification.',
    details: 'Acharya Bhikshu drew a sharp line between worldly social work (Laukika) and true soul-purification (Lokottara). Terapanth philosophy emphasizes that real spiritual liberation comes from self-restraint and internal detachment rather than just performing social charity for worldly fame.',
    tags: ['Philosophy', 'Bhikshu', 'Social Work', 'Purification']
  },
  {
    id: 'pss-institute',
    title: 'Paramartik Shikshan Sansthan (PSS)',
    category: 'History',
    description: 'The Monastic Boot Camp and Vetting Center.',
    details: 'PSS (Ladnun) is where Mumukshus (monastic candidates) undergo rigorous training and vetting before being initiated into the order. It serves as the primary academy for spiritual and scriptural preparation.',
    tags: ['Education', 'Ladnun', 'Monastic Training', 'Mumukshu']
  },
  {
    id: 'acharya-lineage-detailed',
    title: 'Chronological Timeline of the 11 Acharyas',
    category: 'History',
    description: 'The unified transition of absolute authority since 1760.',
    details: '1. Acharya Bhikshu (1760–1803): Founder (Maryada Patra). 2. Acharya Bharimal (1803–1821): Codified Singha rotations. 3. Acharya Raichand (1821–1851): Geographic expansion. 4. Acharya Jeetmal (Jayacharya) (1851–1881): Literary genius (Bhagavati Jod). 5. Acharya Maghraj (1881–1892): Pure behavioral conduct. 6. Acharya Manak Gani (1892–1897): Code integrity. 7. Acharya Dal Gani (1897–1909): Monastic study & preparation. 8. Acharya Kalu Gani (1909–1936): Sanskrit academies & literature. 9. Acharya Tulsi (1936–1996): Anuvrat, Samans, Agam Editing. 10. Acharya Mahaprajna (1996–2010): Preksha Meditation. 11. Acharya Mahashraman (2010–Present): Ahimsa Yatra, Current Head. 12. Acharya Mahaveer (20??-Future): Unconfirmed future possibility.',
    tags: ['Lineage', 'Timeline', 'History', 'Leaders']
  },
  {
    id: 'demographics-stats',
    title: 'Quantitative Demographics of the Order',
    category: 'History',
    description: 'Population metrics and organizational metrics.',
    details: 'Total Active Ascetic Corps: ~700-850 individuals. Sadhus: ~150-160 active males. Sadhvis: ~550 active females (a ratio of ~4:1). The entire order is divided into approximately 140 unique traveling squads (Singhas) of 3-7 members each. The first female group was initiated in ~1764 (VS 1821) starting with Sadhvi Kusalanjee.',
    tags: ['Stats', 'Population', 'Singha', 'Demographics']
  },
  {
    id: 'recent-chaturmas-milestones',
    title: 'Recent Chaturmas (2024-2025)',
    category: 'History',
    description: 'Recent administrative and spiritual locations.',
    details: '2024 Chaturmas: Surat, Gujarat (Bhagwan Mahavir University grounds). 2025 Chaturmas: Preksha Vishwa Bharati (Koba, Ahmedabad, Gujarat). These milestones follow extensive peace marches ("Ahimsa Yatra") promoting communal harmony.',
    tags: ['Surat', 'Ahmedabad', '2024', '2025', 'Chaturmas']
  },
  {
    id: 'agam-project',
    title: 'Canonical Agam Critical-Edition Project',
    category: 'Philosophy',
    description: 'Modern textual conservation of the 45 Shwetambar Agams.',
    details: 'Spearheaded by Acharya Tulsi and Acharya Mahapragya at Jain Vishva Bharati, this project collated hand-written manuscripts to publish the "Critically Edited Agam Series." It provides comprehensive translations for the 45 ancient Prakrit texts, ensuring accurate interpretation.',
    tags: ['Agams', 'Research', 'JVB', 'Scholarship']
  },
  {
    id: 'secular-anuvrat-code',
    title: 'The 11 Core Anuvrat Commitments',
    category: 'Rules',
    description: 'The non-sectarian code for individual character building.',
    details: 'Launched in 1949, the commitments include: 1. No intentional killing (Ahimsa). 2. Support world peace. 3. No violent agitations. 4. Human unity (No caste). 5. Honesty in business. 6. No electoral malpractice. 7. No social evils (Dowry). 8. No intoxicants. 9. Personal integrity. 10. No waste of public resources. 11. Self-restraint lifestyle.',
    tags: ['Anuvrat', 'Commitments', 'Ethics', 'Secular']
  },
  {
    id: 'maryada-patra-constitution',
    title: 'Maryada Patra: The Monastic Constitution',
    category: 'Rules',
    description: 'The ironclad constitutional document of the Terapanth sect.',
    details: 'Drafted by Acharya Bhikshu, the Maryada Patra ensures absolute centralization under "One Guru" (Ek-Chhatra Pradhaan). Key clauses: 1. No independent factions or private disciples. 2. All resources (scriptures, equipment) belong to the central Dharmsangh repository. 3. Dynamic restructuring of Singhas (traveling squads) to prevent localized attachments or cliques.',
    tags: ['Constitution', 'Maryada Patra', 'Unity', 'Leadership', 'Rules']
  },
  {
    id: 'preksha-meditation-components',
    title: 'The 8 Components of Preksha Meditation',
    category: 'Rituals',
    description: 'Scientific body-mind feedback loops for spiritual growth.',
    details: 'Developed by Acharya Mahapragya, components include: 1. Kayotsarga (Relaxation). 2. Antaryatra (Internal Journey). 3. Shvasa-Preksha (Breath Perception). 4. Sharira-Preksha (Body Perception). 5. Chaitanya-Kendra-Preksha (Psychic Center concentration). 6. Leshya-Dhyana (Color visualization). 7. Bhavana (Contemplation). 8. Anupreksha (Auto-suggestion). These balance the endocrine system and reprogram behavioral patterns.',
    tags: ['Meditation', 'Preksha', 'Mahapragya', 'Psychological Health', 'Spiritual Science']
  },
  {
    id: 'psychic-centers',
    title: 'Chaitanya Kendras (Psychic Centers)',
    category: 'Philosophy',
    description: 'Energy nodes corresponding to endocrine gland hubs.',
    details: 'Focus centers in Preksha: 1. Jyoti Kendra (Mid-forehead/Pineal): Calms anger and passions. 2. Darshan Kendra (Between brows/Pituitary): Intuition and mental clarity. 3. Vishuddhi Kendra (Throat area/Thyroid): Filters negative thoughts. 4. Anand Kendra (Heart region/Thymus): emapthy and universal love. Meditating on these alters "Samskaras" (deep-seated tendencies).',
    tags: ['Psychic Centers', 'Chaitanya Kendra', 'Energy', 'Endocrine', 'Preksha']
  },
  {
    id: 'layperson-rituals-advanced',
    title: 'Advaced Layperson Rituals (Shravak Vidhi)',
    category: 'Rituals',
    description: 'Precise timing and formulas for daily spiritual practice.',
    details: '1. Samayik (48 mins): Initiated with "Karey Mi Bhante" sutra, freezing worldly commerce and aggression for one Muhurat. Focus on Svadhyaya or meditation. 2. Pratikraman: Performed at sunset (Devasi) to repent for daylight sins, and at dawn (Rai) for overnight clearing. These involve precise Prakrit sutras and introspection.',
    tags: ['Rituals', 'Samayik', 'Pratikraman', 'Daily Practice', 'Shravak']
  },
  {
    id: 'muhpatti',
    title: 'Muhpatti',
    category: 'Rules',
    description: 'The white cloth rectangle held over the mouth.',
    details: 'A two-layered unstitched white cloth rectangle tied or held over the mouth by ascetics. It protects air-bodied micro-organisms (Vayukaya) from thermal breath damage during speech, ensuring the highest standard of Ahimsa.',
    tags: ['Ahimsa', 'Ascetic', 'Rule', 'Vayukaya']
  },
  {
    id: 'rajoharan',
    title: 'Rajoharan',
    category: 'Rules',
    description: 'The soft broom used for non-violence.',
    details: 'A soft broom constructed of fine wool threads attached to a wooden handle. Used by ascetics to gently clear surfaces of micro-insects before sitting or resting, practicing constant vigilance for non-violence.',
    tags: ['Ahimsa', 'Ascetic', 'Routine', 'Sanctity']
  },
  {
    id: 'nine-tattvas-metaphysics',
    title: 'The 9 Tattvas (Metaphysics Engine)',
    category: 'Philosophy',
    description: 'The mechanism of soul purification and karma.',
    details: '1. Jiva: Conscious soul. 2. Ajiva: Insentient matter. 3. Punya: Meritorious karma. 4. Papa: Sinful karma. 5. Asrava: Influx of karma. 6. Bandha: Bondage of karma. 7. Samvara: Stoppage of influx. 8. Nirjara: Shedding stored karma (Tapasya). 9. Moksha: Absolute liberation (Siddhashila).',
    tags: ['Metaphysics', 'Karma', 'Soul', '9 Tattvas', 'Philosophy']
  },
  {
    id: 'agam-taxonomy',
    title: 'Canonical Taxonomy of the 45 Agams',
    category: 'Philosophy',
    description: 'Structure of the Shwetambar canonical texts.',
    details: 'The 45 Agams include: 1. 11 Anga Sutras (Direct teachings, e.g., Acharanga). 2. 12 Upanga Sutras. 3. 10 Prakirna Sutras. 4. 4 Mula Sutras. 5. 6 Cheda Sutras (Penalties). 6. 2 Chulika Sutras. The Acharanga and Bhagavati Sutra are primary sources for conduct and cosmology.',
    tags: ['Agams', 'Canon', 'Scriptures', 'Acharanga', 'Bhagavati']
  },
  {
    id: 'santhara-jurisprudence',
    title: 'Santhara (Sallekhana) Jurisprudence',
    category: 'Rules',
    description: 'The ritual voluntary fast unto death.',
    details: 'Santhara is the conscious shedding of karma when the body fails. It is distinct from suicide as it requires: 1. Supreme tranquility and emotional neutrality. 2. Formal permission from the Acharya. 3. Verification of mental status. 4. Progressive withdrawal from food/water under spiritual supervision.',
    tags: ['Santhara', 'Sallekhana', 'Ritual Death', 'Detachment', 'Rules']
  },
  {
    id: 'sadhvi-pramukha-lineage',
    title: 'Sadhvi Pramukha Lineage (Female Order)',
    category: 'History',
    description: 'The administrative head of the female ascetic order.',
    details: 'The role was formally introduced in 1853 (Vikram Samvat 1910) by Acharya Jeetmal Ji (Jayacharya). Notable heads include: \n\n1. Mahashramani Sadhvi Kanakprabha Ji (8th, 1972-2022): One of the most influential female ascetics. She edited 100+ books for Acharya Tulsi, translated Agams, and authored the travel epic "Paanv-Paanv Chalnewala Suraj". She completed her life via Chauvihar Santhara on March 17, 2022. \n\n2. Sadhvi Vishrutvibha Ji (9th, 2022-Present): Appointed May 15, 2022. She was part of the first cohort of Samanis (1980) and served as Mukhya Niyojika.',
    tags: ['Sadhvi Pramukha', 'Nuns', 'Administration', 'History', 'Women']
  },
  {
    id: 'daya-dana-philosophy',
    title: 'Philosophy of Daya (Compassion) & Dana (Charity)',
    category: 'Philosophy',
    description: 'The strict text-critical boundaries of Laukika vs. Lokottara.',
    details: 'Terapanth establishes a strict boundary for spiritual purity: \n\n• Laukika (Worldly): Social cooperation, feeding the hungry, treating the sick. Essential social virtue but involves micro-injury (Himsa) in production and doesn\'t purify deep karmas. \n\n• Lokottara (Spiritual): Inspiring self-restraint (Samyam), leading away from sin (Papa). True soul-liberation requires inner restraint. \n\nPhilanthropic charity (Dana) is a worldly virtue, while Spiritual Alms (pure food/shelter to 5-Mahavrata observers) is Lokottara.',
    tags: ['Daya', 'Dana', 'Charity', 'Philosophy', 'Laukika', 'Lokottara']
  },
  {
    id: 'literary-heritage',
    title: 'Quantitative Literary Heritage',
    category: 'History',
    description: 'The massive scripture repository of Terapanth Acharyas.',
    details: 'Key repositories: \n\n1. Bhikshu Granth Ratnakar: ~38,000 shlokas in Marwari/Rajasthani. Includes "Nav Padarth Sadbhav". \n2. Jayacharya\'s Compositions: Hundreds of thousands of verses. His "Bhagavati Jod" is a massive poetic translation/commentary on the Bhagavati Sutra. \n3. Modern scholars like Mahapragya and Kanakprabha edited the 45 critically edited Agams.',
    tags: ['Literature', 'Scriptures', 'History', 'Bhikshu', 'Jayacharya']
  },
  {
    id: 'jeevan-vigyan-pillars',
    title: 'Jeevan Vigyan (Science of Living)',
    category: 'Philosophy',
    description: 'The secular behavioral blueprint for holistic growth.',
    details: 'Four Functional Pillars: \n1. Prana Pranayama: Breathing control for autonomic nervous system stability. \n2. Preksha Dhyana: Mindfulness targeting endocrine glands (Pineal/Pituitary) to alter chemical mood. \n3. Yogasanas: Physical postures for spinal elasticity and vital energy (Chaitanya Kendra). \n4. Sound Therapy: Mantras like Mahaprana Dhwani to improve concentration and memory.',
    tags: ['Jeevan Vigyan', 'Meditation', 'Education', 'Science', 'Health']
  },
  {
    id: 'ahimsa-yatra-metrics',
    title: 'Ahimsa Yatra: The Great Foot-March (2014-2022)',
    category: 'History',
    description: 'Contemporary peace march logistics and impact.',
    details: 'Led by Acharya Mahashraman from Nov 9, 2014 (Red Fort) to March 2022. \n• Distance: 50,000+ Kilometers (31,000+ miles) barefoot. \n• Reach: 3 Nations (India, Nepal, Bhutan) and 20 Indian States. \n• Pillars: Sadbhavana (Harmony), Naitikta (Ethics), Nasha-Mukti (Freedom from Addiction). \n• Impact: 10 million+ individuals signed vows against substance abuse.',
    tags: ['Ahimsa Yatra', 'Mahashraman', 'Peace March', 'History', 'Barefoot']
  },
  {
    id: 'gyanshala-curriculum',
    title: 'Gyanshala Progressive Syllabus',
    category: 'Philosophy',
    description: 'Structured moral education framework for youth.',
    details: 'Levels 1-2 (Ages 5-7): Foundations, Navkar Mantra, etiquette. \nLevels 3-4 (Ages 8-11): Intermediate, Jain History, 24 Tirthankaras, Anuvrat code. \nLevels 5-6 (Ages 12-15): Advanced, 9 Tattvas metaphysics, Prakrit alphabet basics, Preksha stress management.',
    tags: ['Gyanshala', 'Education', 'Syllabus', 'Youth', 'Values']
  },
  {
    id: 'kesh-loch-protocol',
    title: 'Kesh-Loch: Monastic Hair Renunciation',
    category: 'Rules',
    description: 'The technical protocol of manual hair plucking.',
    details: 'Ascetics pluck hair from roots 2-4 times a year using dry ash (Vibhuti) for grip. \nSpiritual Intent: \n1. Self-Reliance: No dependency on external tools/services. \n2. Body Detachment (Kaya-Klesha Tapa): Neutrality to physical discomfort. \n3. Purity: Prevents micro-insects harboring in hair (Ahinsa).',
    tags: ['Kesh-Loch', 'Renunciation', 'Ascetic', 'Rules', 'Austerity']
  },
  {
    id: 'mahaprana-dhwani',
    title: 'Mahaprana Dhwani (Neural Resonance)',
    category: 'Rituals',
    description: 'Sound therapy for neuro-endocrine balancing.',
    details: 'Practitioner produces a deep resonant humming sound like a bumblebee on exhale. \n• Focal Point: Jyoti Kendra (Pineal gland hub). \n• Scientific Impact: Triggers shift from Beta to Alpha/Theta brainwave patterns. Vibrations stimulate the pituitary/pineal glands to down-regulate cortisol.',
    tags: ['Meditation', 'Mahaprana Dhwani', 'Sound Therapy', 'Science', 'Preksha']
  },
  {
    id: 'jain-siddhant-deepika',
    title: 'Jain Siddhant Deepika (The Epistemology Engine)',
    category: 'Philosophy',
    description: 'Aphorisms for Jain metaphysics and valid knowledge.',
    details: 'Authored by Acharya Tulsi, this Sutra-style manual organizes Jain philosophy. \n• Pramana (Valid Epistemology): Distinguishes Pratyaksha (Direct: Avadhi, Manahparyaya, Kevala) and Paroksha (Indirect: Mati, Shruta). \n• Six Dravyas (Substances): Jiva (Soul), Pudgala (Matter), Dharma (Motion), Adharma (Rest), Akasha (Space), Kala (Time).',
    tags: ['Philosophy', 'Acharya Tulsi', 'Epistemology', 'Sutras', 'Science']
  },
  {
    id: 'upasak-cadre',
    title: 'The Upasak Cadre (Lay-Preacher Wing)',
    category: 'History',
    description: 'The formally vowed lay-preacher institutional layer.',
    details: 'Initiated by Acharya Tulsi to maintain spiritual dissemination where monks cannot travel. \n• Candidates clear rigorous examinations by Terapanth Mahasabha. \n• Code: Non-commercial services; localized spiritual discourses, workshops (Terapanth Merapanth), and Paryushan management. \n• Function: Bridge between laypeople and absolute ascetics.',
    tags: ['Upasak', 'Leadership', 'Layperson', 'Service', 'Education']
  },
  {
    id: 'anekantavada-nayavada',
    title: 'Anekantavada & Nayavada (Logic Framework)',
    category: 'Philosophy',
    description: 'The Jain multisidedness and theory of viewpoints.',
    details: 'Anekantavada: The multifaceted nature of reality. \nNayavada: The 7 Nayas (Structured vectors of truth): \n1. Naigama (Universal/Particular). 2. Sangraha (Class). 3. Vyavahara (Practical). 4. Rijusutra (Immediate). 5. Shabda (Verbal). 6. Samabhiruda (Etymological). 7. Evambhuta (Actualized). \nThis framework prevents bias and handles complexity by showing partial perspectives.',
    tags: ['Logic', 'Philosophy', 'Anekantavada', 'Nayavada', 'Non-Absolutism']
  },
  {
    id: 'muni-udit-kumar',
    title: 'Muni Udit Kumar Ji',
    category: 'History',
    description: 'Senior scholarly monk specializing in Gyanshala and Preksha, traveling in a shared monastic lineage with Muni Jyotirmay Kumar.',
    details: 'Born Hiralal Baid (Oct 20, 1960) in Sardarsahar, initiated in 1974 at age 13 by Muni Sumermal Ji (Ladnun) under Acharya Tulsi. \n• Monastic Alignment: Core member of Mantri Muni Sumermal Ji\'s squad (Singha). He and Muni Jyotirmay Kumar share an identical barefoot migration (Vihar) log and Chaturmas destinations due to their shared administrative lineage. \n• Portfolios: Global Gyanshala Supervisor, Preksha Meditation master trainer, and literary researcher. \n• Literary Works: "Acharya Mahapragya - Ambassador of Peace" and "Punyaatma". Specialized in behavioral training and neural resonance.\n\nShared Chaturmas Registry (2015-2027):\n2015: Delhi (Oswal Bhawan, Shahdara)\n2016: Delhi (Pitampura and Rohini)\n2017: Jaipur (Anuvibha)\n2018: Jaipur (Shyam Nagar, Terapanth Bhavan)\n2019: Jaipur (Vidyadhar Nagar, Terapanth Bhavan)\n2020: Jalgaon (Anuvrat Bhavan)\n2021: Bhilwara (Terapanth Nagar)\n2022: Surat (City Light, Terapanth Bhavan)\n2023: Surat (Udhana, Terapanth Bhawan)\n2024: Surat (Bhagwan Mahaveer College)\n2025: Delhi (Oswal Bhawan)\n2026: Delhi (Pitampura - Active Base)\n2027: Delhi (Projected).',
    tags: ['Muni Udit Kumar', 'Gyanshala', 'Preksha', 'Scholar', 'Sardarsahar', 'Shared Route']
  },
  {
    id: 'mantri-muni-sumermal-ladnun',
    title: 'Mantri Muni Sumermal Ji (Ladnun)',
    category: 'History',
    description: 'Chief Administrative Monk and master of Agamic scriptures.',
    details: 'Born in 1932 (Ladnun), initiated at age 9 in 1942 by Acharya Tulsi. Held the title "Terapanth Darshan Manishi". Served as the "Mantri Muni" (Monastic Minister), coordinating the male ascetic order. Famous for memorizing thousands of Agam verses. Mentored senior monks like Muni Udit Kumar. Demised May 7, 2019.',
    tags: ['Mantri Muni', 'Sumermal Ladnun', 'History', 'Scholar', 'Administration']
  },
  {
    id: 'muni-jyotirmay-kumar',
    title: 'Muni Jyotirmay Kumar Ji',
    category: 'History',
    description: 'Scholarly active ascetic specializing in cross-cultural philosophical integration and Japanese aesthetics, traveling in a shared monastic lineage with Muni Udit Kumar.',
    details: 'Born Jitendra Pugalia (Mumukshu Jitendra) in Sri Dungargarh, Rajasthan, initiated Nov 22, 2015, in Delhi by Mantri Muni Sumermal (Ladnun) under Acharya Mahashraman. Info ID: 866. \n• Monastic Identity: A scholarly monk known for early mastery of the Dashavaikalik Sutra (2016). Travels with Muni Udit Kumar under the shared legacy of Mantri Muni Sumermal Ji.\n• Unique Specialization: Cross-cultural integration specialist. He has researched and analyzed 300+ Japanese Manga series as cognitive frameworks to explain destiny (Karma) and willpower (Virya).\n\n• The Reading List & Genres:\n  - Shonen (Willpower & Growth): "Naruto", "One Piece", "Dragon Ball", "Black Clover". Used to illustrate the "Udyam" (Effort) component of Jain Karma theory.\n  - Seinen/Psychological (Existence & Choice): "Attack on Titan", "Monster", "Vinland Saga". Used to explain the complexities of Anekantavada and the nuances of Himsa vs. Ahimsa.\n  - Sports/Slice of Life (Self-Restraint): "Haikyuu!!", "Slam Dunk". Used to explain the discipline required for Samayik and Tap.\n\n• Philosophical Bridges:\n  - Attack on Titan: Explaining the cycle of violence and the necessity of breaking it through the "Freedom" and "Inheritance" motifs, mirroring the Vasanas (deep impressions).\n  - Naruto: The concept of the "Will of Fire" as a bridge to understanding "Atma-Virya" (Spiritual Prowess) and the transmutation of suffering into wisdom.\n  - Fullmetal Alchemist: The Law of Equivalent Exchange as a gateway to the mathematical logic of the Jain Tattvas.\n\n• Material Preference: Exclusively utilizes precision writing instruments and stationery manufactured by Japanese companies (Pilot, Uni-ball, Zebra, Kokuyo). \n• Shared Chaturmas Registry (2015-2027): \n2015: Delhi (Oswal Bhawan, Shahdara)\n2016: Delhi (Pitampura and Rohini)\n2017: Jaipur (Anuvibha)\n2018: Jaipur (Shyam Nagar, Terapanth Bhavan)\n2019: Jaipur (Vidyadhar Nagar, Terapanth Bhavan)\n2020: Jalgaon (Anuvrat Bhavan)\n2021: Bhilwara (Terapanth Nagar)\n2022: Surat (City Light, Terapanth Bhavan)\n2023: Surat (Udhana, Terapanth Bhawan)\n2024: Surat (Bhagwan Mahaveer College)\n2025: Delhi (Oswal Bhawan)\n2026: Delhi (Pitampura - Active Base)\n2027: Delhi (Projected).',
    tags: ['Muni Jyotirmay', 'Active Roster', 'Manga Scholar', 'Japanese Stationery', 'Dashavaikalik', 'Delhi', 'Shared Route']
  },
  {
    id: 'singha-mantri-muni-lineage',
    title: 'Singha: Mantri Muni Lineage',
    category: 'History',
    description: 'The administrative traveling squad established under the legacy of Mantri Muni Sumermal Ji (Ladnun).',
    details: 'This specific Singha (monastic squad) follows a highly synchronized itinerary. Currently led by senior monks like Muni Udit Kumar and Muni Jyotirmay Kumar, the group ensures absolute administrative precision in their Vihar (barefoot migration). \n• Governance: Operates under the "Ek Guru" principle of Acharya Mahashraman. \n• Shared History: Members of this lineage have shared identical Chaturmas venues since 2015, maintaining spiritual and administrative unity originally codified by the late Mantri Muni Sumermal Ji.',
    tags: ['Singha', 'Monastic Squad', 'Mantri Muni', 'Administration', 'Shared Route']
  },
  {
    id: 'eshana-samiti-42-faults',
    title: 'Eshana Samiti: 42 Faults of Gochari',
    category: 'Rules',
    description: 'The strict diagnostic process for verifying monastic alms (food).',
    details: 'Terapanth ascetics verify food against 42 scriptural defects (Doshas) categorized into 4 groups: \n1. Udgama (16 faults): Preparation errors by the donor (e.g., Adhah-karma: food made specifically for monks). \n2. Utpadana (16 faults): Procurement flaws by the ascetic (e.g., Nimitta: getting food via astrology/fortune-telling). \n3. Eshana (10 faults): Present physical state errors (e.g., Sanka: doubt about microorganisms). \n4. Sanyojana (4 faults): Consumption errors (e.g., filling stomach beyond the 2:1:1 solid-liquid-void ratio).',
    tags: ['Gochari', 'Eshana Samiti', 'Monastic Law', 'Food Rules', 'Dietary']
  },
  {
    id: 'tera-code-13',
    title: 'The Tera Code: Structural Mathematics',
    category: 'Philosophy',
    description: 'The 13 elements of conduct that define the Terapanth identity.',
    details: 'The name "Tera" (13) refers to the 13 core behavioral components: \n• 5 Mahavratas: Great Vows (Non-violence, Truth, Non-stealing, Celibacy, Non-attachment). \n• 5 Samitis: Rules of Carefulness (Walking, Speaking, Alms, Tool-handling, Waste-disposal). \n• 3 Guptis: Restraints (Mind, Speech, Body). \nThis numerical alignment establishes absolute baseline discipline for every Terapanthi ascetic.',
    tags: ['13 Path', 'Tera Code', 'Conduct', 'Discipline', 'Foundations']
  },
  {
    id: 'monastic-archiving-protocol',
    title: 'Lipi Protocol: Manual Archiving',
    category: 'Rituals',
    description: 'The traditional preservation of scriptures without digital technology.',
    details: 'As Terapanth ascetics strictly avoid computers/smartphones, they employ "Manuscript Transcription Lipi" to archive ancient Agams. \n• Process: Manual calligraphy on high-grade archival paper. \n• Tool Choice: They favor Japanese precision pens (Pilot, Uni-ball) for their non-smudge archival ink, critical for complex Prakrit characters. \n• Schedule: Performed daily during the Svadhyaya block (1:00 PM - 3:30 PM).',
    tags: ['Lipi', 'Transcription', 'Japanese Stationery', 'Scriptures', 'Svadhyaya']
  },
  {
    id: 'paryushan-parva',
    title: 'Paryushan Mahaparva',
    category: 'Rituals',
    description: 'The King of Festivals and the season of spiritual purification.',
    details: 'Paryushan is the most important annual festival for Terapanth Jains, observed for eight days. It is a time for intensive study, reflection, and purification of the soul. The festival culminates in Samvatsari, the Day of Forgiveness. In 2026, Paryushan is observed from September 4 to September 11. During these days, followers increase their fasting, attend spiritual discourses, and practice Samayik more frequently.',
    tags: ['Festival', 'Purification', '8 Days', 'Fasting', 'Samvatsari', '2026']
  },
  {
    id: 'samvatsari',
    title: 'Samvatsari (Day of Forgiveness)',
    category: 'Rituals',
    description: 'The final day of Paryushan, marked by universal forgiveness.',
    details: 'Samvatsari is the pinnacle of the Jain calendar. On this day, Jains perform the ritual of Pratikraman and seek forgiveness from all living beings for any harm caused through mind, speech, or body. The sacred phrase "Micchami Dukkadam" (May all my misdeeds be fruitless) is used to clear any ill feelings. It is an act of spiritual cleansing that reinforces the value of Ahimsa and humility.',
    tags: ['Forgiveness', 'Micchami Dukkadam', 'Ritual', 'Soul Cleaning']
  },
  {
    id: 'tapa-austerity',
    title: 'Tapa (Spiritual Austerity)',
    category: 'Philosophy',
    description: 'The practice of physical and mental restraint to shed karma.',
    details: 'Tapa is divided into External (Bahyantara) and Internal (Abhyantara) forms. External Tapa includes fasting (Anaishana), eating less (Unodari), and limiting food varieties. Internal Tapa includes repentance (Prayashchitta), humility (Vinaya), service (Vaiyavritya), and meditation (Dhyana). These practices are designed to burn away accumulated karmas and strengthen willpower.',
    tags: ['Austerity', 'Fasting', 'Karma Shedding', 'Self-Control']
  },
  {
    id: 'navkar-mantra',
    title: 'Navkar Mantra',
    category: 'Philosophy',
    description: 'The fundamental and most sacred prayer of Jainism.',
    details: 'The Navkar Mantra is the most significant prayer in Jainism. It is not a request for worldly favors but an act of deep respect (Namaskar) towards the five supreme entities (Pancha Parameshthi): Arihants, Siddhas, Acharyas, Upadhyayas, and Sadhus. Reciting it helps the practitioner focus on the virtues of these liberated souls and inspires them to follow the same path of liberation.',
    tags: ['Prayer', 'Sacred', 'Pancha Parameshthi', 'Daily Chanting']
  },
  {
    id: 'navpad-oli',
    title: 'Navpad Oli',
    category: 'Rituals',
    description: 'The nine-day semi-annual festival of spiritual discipline.',
    details: 'The Navpad Oli is observed twice a year (during Chaitra and Ashwin months). It focuses on the nine supreme pads (Shashwat Navpad): Arihant, Siddha, Acharya, Upadhyaya, Sadhu, Darshan, Jnana, Charitra, and Tapa. Followers observe "Ayambil" (eating only one meal of simple boiled grains without salt, oil, or spices) for nine days to attain physical health and spiritual focus.',
    tags: ['Ayambil', '9 Days', 'Discipline', 'Health', 'Ritual']
  },
  {
    id: 'anuvibha',
    title: 'Anuvibha (Anuvrat Vishva Bharati)',
    category: 'History',
    description: 'The international center for Anuvrat movement in Jaipur.',
    details: 'Based in Jaipur, Anuvibha is the global headquarters for propagating the Anuvrat philosophy under the guidance of the Acharya. It focuses on ecological harmony, non-violence, and planetary peace. It hosts international conferences and works with the UN on peace initiatives, illustrating the non-sectarian and global reach of Jain Terapanth values.',
    tags: ['Anuvrat', 'Jaipur', 'Global Peace', 'UN', 'International']
  },
  {
    id: 'maryada-patra-bhikshu',
    title: 'Maryada Patra (The Code of Conduct)',
    category: 'Rules',
    description: 'The revolutionary constitutional document of Terapanth.',
    details: 'Written by Acharya Bhikshu, this document is the backbone of Terapanth unity. It mandates that all monks and nuns must follow one leader (Ek Guru) and one code (Ek Maryada). It prevents the formation of rival sub-sects and ensures that every spiritual resource belongs to the central Dharmsangh, not individuals.',
    tags: ['Constitution', 'Unity', 'Bhikshu', 'Discipline', 'Organization']
  },
  {
    id: 'shuddha-diet',
    title: 'Shuddha Gochari',
    category: 'Rituals',
    description: 'The meticulous science of accepting pure food.',
    details: 'Gochari is compared to a honeybee collecting nectar from flowers without harming them. Terapanth ascetics verify food against 42 possible faults (Doshas). They do not accept food made especially for them (Adhah-karma), nor do they handle fire or electricity. The food must be offered with pure intent and accepted in a specified quantity to maintain monastic vigor.',
    tags: ['Food', 'Purity', 'Monasticism', 'Health', 'Non-violence']
  },
  {
    id: 'triloka-cosmology',
    title: 'Cosmological Architecture Model (Lokakasha)',
    category: 'Philosophy',
    description: 'The spatial dynamics of the universe mapping the three realms.',
    details: 'The universe (Lokakasha) is finite, self-contained, and shaped like a standing human figure (Triloka). Structure: 1. Adho Loka (7 subterranean infernal layers; inhabitants: Naraki, heavy karmic retribution). 2. Madhya Loka (Horizontal flat network centered on Jambudvipa/Meru; the exclusive operational zone for achieving active liberation). 3. Urdhva Loka (12 celestial heavens and higher planes; inhabitants: Devas experiencing finite reward states). At the absolute crest is Siddhashila, holding completely liberated, bodiless souls in infinite bliss and omniscience.',
    tags: ['Cosmology', 'Triloka', 'Lokakasha', 'Metaphysics', 'Realms']
  },
  {
    id: '14-gunasthanas',
    title: 'The 14 Gunasthanas (Spiritual Evolution Engine)',
    category: 'Philosophy',
    description: 'The systemic, step-by-step psychological evolution of a consciousness shedding karmic bondages.',
    details: '1. Mithyatva (Total Delusion). 2. Sasadhana (Lingering Right Belief). 3. Mishra (Mixed State). 4. Avirata Samyagdrishti (Flawless spiritual vision without physical vows). 5. Desavirata (Partial restraint; active operational layer of the Shravak). 6. Pramatta Samyata (Imperfect monastic restraint; baseline of Sadhus/Sadhvis). 7. Apramatta Samyata (Perfect Mindfulness). 8. Apurva Karana (Unprecedented Psychic Shifts). 9. Anivritti Karana (Advanced Cleansing). 10. Sukshma Samparaya (Residual Micro-Greed). 11. Upashanta Moha (Suppressed Delusion). 12. Ksheena Moha (Destroyed Delusion). 13. Sayoga Kevali (Active Omniscience; living Arihant/Tirthankara). 14. Ayoga Kevali (Final cessation of all physical/mental data processing prior to absolute Moksha).',
    tags: ['Gunasthanas', 'Evolution', 'Karma', 'Spiritual Progress', 'Liberation']
  },
  {
    id: 'agam-canonical-taxonomy',
    title: 'Canonical Taxonomy Database of the 45 Agams',
    category: 'Philosophy',
    description: 'Standardized mathematical taxonomy organizing the canonical Shwetambar Agams.',
    details: 'Edited by Jain Vishva Bharati (Ladnun). Structure: 1. 11 Anga Sutras (Primary Core Directives, e.g., Acharanga, Bhagavati Sutra). 2. 12 Upanga Sutras (Auxiliary Canonical Extensions, e.g., Rajaprashniya). 3. 4 Mula Sutras (Foundation Manuals, e.g., Dashavaikalik Sutra). Includes 10 Prakirna, 6 Cheda, and 2 Chulika Sutras. Total: 45 critical texts.',
    tags: ['Agams', 'Taxonomy', 'Scriptures', 'Canon', 'Anga']
  },
  {
    id: 'faq-001',
    title: 'What is the absolute core philosophy of Jainism?',
    category: 'Philosophy',
    description: 'The absolute core philosophy of Jainism, driven by the Triratna.',
    details: 'The core philosophy is driven by three pillars known as the Triratna (Three Jewels): Samyak Darshan (Right Faith), Samyak Jnana (Right Knowledge), and Samyak Charitra (Right Conduct). Its active application is governed by absolute Ahinsa (Non-violence) in thought, speech, and action.',
    tags: ['faq', 'core philosophy', 'triratna', 'ahinsa']
  },
  {
    id: 'faq-002',
    title: 'Is there a creator God in Jainism?',
    category: 'Philosophy',
    description: 'The Jain perspective on a creator God and the universe.',
    details: 'No. Jainism teaches that the universe is uncreated, eternal, and operates by self-sustaining cosmic laws. It does not believe in a supreme being who judges, punishes, or creates life. Instead, any soul that completely destroys its karmas achieves godhood (Siddha), serving as a spiritual ideal rather than a cosmic ruler.',
    tags: ['faq', 'god', 'creator', 'siddha', 'universe']
  },
  {
    id: 'faq-003',
    title: 'What exactly is "Karma" in the Jain framework?',
    category: 'Philosophy',
    description: 'Explanation of Karma as physical matter in Jainism.',
    details: 'Karma is not an abstract mystical force or fate. It is composed of actual, microscopic physical matter particles (Pudgala) that populate the universe. When a soul acts with passions like anger, ego, deceit, or greed, it attracts these karmic particles, which stick to the soul and cloud its natural purity, knowledge, and bliss.',
    tags: ['faq', 'karma', 'pudgala', 'passions']
  },
  {
    id: 'faq-004',
    title: 'Why do Jains avoid eating root vegetables like potatoes, onions, and garlic?',
    category: 'Philosophy',
    description: 'The rationale behind the Jain dietary restriction on root vegetables.',
    details: 'Root vegetables are classified as Anantkayas, meaning a single root bulb houses infinite microscopic living organisms (Nigoda). Furthermore, harvesting root vegetables requires pulling the entire plant out from the earth, which destroys the primary organism and causes massive disruption to soil-bodied lifeforms.',
    tags: ['faq', 'diet', 'root vegetables', 'anantkaya', 'nigoda']
  },
  {
    id: 'faq-005',
    title: 'What is the difference between an "Arihant" and a "Siddha"?',
    category: 'Philosophy',
    description: 'Distinction between Arihant (living omniscient) and Siddha (liberated soul).',
    details: 'An Arihant is a living human soul who has destroyed the 4 destructive (Ghati) karmas, achieved perfect omniscience (Kevala Jnana), and actively preaches the path to liberation. A Siddha is a completely liberated, bodiless soul who has shed all remaining karmas at death and resides permanently at the crest of the universe (Siddhashila) outside the cycle of rebirth.',
    tags: ['faq', 'arihant', 'siddha', 'liberation']
  },
  {
    id: 'faq-006',
    title: 'What are the 9 Tattvas (Fundamental Truths)?',
    category: 'Philosophy',
    description: 'The 9 Tattvas: structural operational maps of the cosmos.',
    details: 'They are the structural operational maps of the cosmos: 1. Jiva: Living souls. 2. Ajiva: Non-living matter. 3. Asrava: The influx of karma into the soul. 4. Bandha: The bondage of karma to the soul. 5. Samvara: The active stoppage of karmic influx. 6. Nirjara: The gradual shedding of accumulated karma via austerities (Tapa). 7. Moksha: Complete spiritual liberation. 8. Punya: Meritorious karmic footprints. 9. Papa: Demeritorious/sinful karmic footprints.',
    tags: ['faq', 'tattvas', 'cosmos', 'karma', 'moksha']
  },
  {
    id: 'faq-007',
    title: 'What is "Anekantavada"?',
    category: 'Philosophy',
    description: 'The Jain doctrine of multifaceted reality.',
    details: 'It is the Jain doctrine of multifaceted reality. It asserts that truth and reality are complex and have multiple viewpoints (Nayas). No single human perspective can claim absolute monopoly over the truth, promoting deep mutual tolerance and intellectual non-violence.',
    tags: ['faq', 'anekantavada', 'truth', 'perspectives', 'tolerance']
  },
  {
    id: 'faq-008',
    title: 'What does the word "Terapanth" mean?',
    category: 'History',
    description: 'The historical and spiritual meanings of Terapanth.',
    details: 'It has two core meanings. Historically, it points to the 13 core parameters of conduct (5 Great Vows + 5 Rules of Carefulness + 3 Restraints) practiced by its ascetics. Spiritually, it matches a poetic phrase spoken by an early follower to the divine: "Hey Prabhu! Yeh Tera (Thy) Panth Hai" (O Lord, this is Your path).',
    tags: ['faq', 'terapanth', 'meaning', 'history']
  },
  {
    id: 'faq-009',
    title: 'Who founded the Terapanth sect and when?',
    category: 'History',
    description: 'Information about the founding of the Terapanth sect by Acharya Bhikshu.',
    details: 'It was founded by Acharya Bhikshu (Swami Bhikhan Ji) on June 28, 1760 (Vikram Samvat 1817) at Kelwa, Rajasthan. He organized a breakaway movement to restore the uncompromised, text-critical purity of traditional monastic laws.',
    tags: ['faq', 'founder', 'acharya bhikshu', 'history']
  },
  {
    id: 'faq-010',
    title: 'What makes the Terapanth order unique compared to other Jain groups?',
    category: 'History',
    description: 'The uniqueness of the Terapanth order, primarily the absolute centralization.',
    details: 'It operates under absolute centralization. While other sects split into multiple sub-factions with different regional leaders, Terapanth enforces the "Ek Guru" principle—meaning every single monk, nun, and layperson globally answers to one single, absolute supreme Acharya.',
    tags: ['faq', 'uniqueness', 'ek guru', 'centralization']
  },
  {
    id: 'faq-011',
    title: 'Who is the current supreme head of the Terapanth order?',
    category: 'History',
    description: 'Information on the 11th and current spiritual chief of Terapanth.',
    details: 'The 11th absolute spiritual chief is Acharya Shri Mahashraman Ji, who regulates all monastic movements, administrative appointments, and scriptural oversight worldwide.',
    tags: ['faq', 'acharya mahashraman', 'current head', 'leadership']
  },
  {
    id: 'faq-012',
    title: 'Why do Terapanth monks not stay in permanent properties or ashrams?',
    category: 'Rules',
    description: 'The reasoning behind the nomadic lifestyle of Terapanth ascetics.',
    details: 'To strictly maintain the great vow of absolute non-possession (Aparigraha). Terapanth ascetics are completely forbidden from owning, building, or managing real estate. They stay temporarily in community-owned buildings (Bhawans) provided by lay followers, moving to a new location every few days.',
    tags: ['faq', 'aparigraha', 'property', 'nomadic', 'monks']
  },
  {
    id: 'faq-013',
    title: 'What is the "Maryada Patra"?',
    category: 'Rules',
    description: 'Overview of the Maryada Patra, the constitutional document of Terapanth.',
    details: 'It is the foundational constitutional document of the Terapanth sect, written by Acharya Bhikshu in 1775 CE. It is a legal-spiritual covenant that mandates complete transparency, prohibits internal factionalism, and requires absolute obedience to the singular ruling Acharya.',
    tags: ['faq', 'maryada patra', 'constitution', 'rules']
  },
  {
    id: 'faq-014',
    title: 'Why do Terapanth monks and nuns walk completely barefoot (Vihar)?',
    category: 'Rules',
    description: 'The purpose of Vihar and walking barefoot for Terapanth ascetics.',
    details: 'They practice Irya Samiti (carefulness in walking). By walking barefoot and scanning the ground 4 cubits ahead, they ensure they do not step on or injure insects. Utilizing cars, flights, trains, or animals involves physical violence and machine compression, which breaks their absolute vow of non-violence.',
    tags: ['faq', 'vihar', 'barefoot', 'irya samiti', 'ahinsa']
  },
  {
    id: 'faq-015',
    title: 'Why do they wear or hold a mouth cloth (Muhpatti)?',
    category: 'Rules',
    description: 'The reason Terapanth ascetics use a Muhpatti.',
    details: 'The Muhpatti serves as a physical buffer. It prevents the sudden heat and force of warm breath from injuring or killing microscopic air-bodied organisms (Vayu-kaya jiva) while speaking. It also prevents insects from accidentally entering the mouth.',
    tags: ['faq', 'muhpatti', 'mouth cloth', 'non-violence']
  },
  {
    id: 'faq-016',
    title: 'Why are Terapanth ascetics strictly forbidden from using electricity, phones, or computers?',
    category: 'Rules',
    description: 'The rationale for ascetic restrictions on modern technology.',
    details: 'The generation and consumption of electricity causes mass destruction to fire-bodied and water-bodied micro-organisms. Relying on smartphones or computers also breaks the vow of Aparigraha (absolute non-possession) and links them back to worldly commercial grids.',
    tags: ['faq', 'electricity', 'technology', 'aparigraha', 'ahinsa']
  },
  {
    id: 'faq-017',
    title: 'How do they collect food, and what is "Gochari"?',
    category: 'Rules',
    description: 'Explanation of Gochari, the alms-collection method of Terapanth ascetics.',
    details: 'They practice a flawless collection method called Gochari. Monks and nuns never cook, ignite fires, or order meals. They walk to multiple lay households and collect small fractions of pre-cooked food, resembling a honeybee gathering nectar from flowers without harming the plant or burdening the household.',
    tags: ['faq', 'gochari', 'food', 'alms', 'collection']
  },
  {
    id: 'faq-018',
    title: 'What are the 42 faults checked during Gochari?',
    category: 'Rules',
    description: 'Overview of the 42 Doshas (faults) avoided during Gochari.',
    details: 'They are scriptural defects (Doshas) used to verify food purity. The food must not be made specifically for the monk (Adhah-karma), must not involve lighting a fresh fire for them, must not contain raw unboiled water, and must be accepted without any prior flattery or business transaction.',
    tags: ['faq', 'gochari', 'faults', 'doshas', 'food purity']
  },
  {
    id: 'faq-019',
    title: 'What is "Kesh-Loch"?',
    category: 'Rules',
    description: 'The practice and purpose of Kesh-Loch (hair plucking) for ascetics.',
    details: 'It is the manual plucking out of hair from the roots, performed by monks and nuns 2 to 4 times every year. It eliminates dependency on barbers or commercial tools, acts as an austerity to destroy vanity, and prevents small insects from breeding unnoticed inside thick hair growth.',
    tags: ['faq', 'kesh-loch', 'hair plucking', 'austerity']
  },
  {
    id: 'faq-020',
    title: 'What is the Anuvrat Movement?',
    category: 'History',
    description: 'An overview of the Anuvrat Movement launched by Acharya Tulsi.',
    details: 'Launched by the 9th chief, Acharya Tulsi, in 1949, it is a non-sectarian moral movement. It invites individuals of all backgrounds, castes, and nationalities to take "small, practical vows" (Anuvrats)—such as refraining from business bribery, cheating in exams, or unnecessary environmental destruction—to elevate global human character.',
    tags: ['faq', 'anuvrat', 'movement', 'acharya tulsi', 'morality']
  },
  {
    id: 'faq-021',
    title: 'What is Preksha Meditation?',
    category: 'Rituals',
    description: 'A scientifically grounded meditation framework formulated by Acharya Mahapragya.',
    details: 'Formulated by the 10th chief, Acharya Mahapragya, it is a scientifically grounded meditation framework. It utilizes body perception (Sharira-Preksha), vital breath control (Prana-Preksha), and color visualization (Leshya Dhyana) to cleanse emotions, reverse stress patterns, and optimize the endocrine glands.',
    tags: ['faq', 'preksha meditation', 'meditation', 'acharya mahapragya']
  },
  {
    id: 'faq-022',
    title: 'What is the "Saman" or "Samani" order?',
    category: 'History',
    description: 'An intermediate monastic order created to serve the global diaspora.',
    details: 'Created by Acharya Tulsi in 1980, it is a specialized intermediate monastic order. Samans and Samanis take vows that permit them to travel via airplanes, trains, and modern transit to cross oceans and serve the global spiritual and academic diaspora without breaking core values.',
    tags: ['faq', 'saman', 'samani', 'order', 'global']
  },
  {
    id: 'faq-023',
    title: 'What is "Jeevan Vigyan" (Science of Living)?',
    category: 'Rituals',
    description: 'A secular value education model integrated into schools and colleges.',
    details: 'It is a secular value education model integrated into schools and colleges. It combines basic yoga postures, controlled breathing models, and emotional mindfulness exercises to rebalance neural frequencies and curb addictive behaviors or anger outbursts among youth.',
    tags: ['faq', 'jeevan vigyan', 'science of living', 'education']
  },
  {
    id: 'faq-024',
    title: 'What is Maryada Mahotsav?',
    category: 'Rituals',
    description: 'The central annual administrative assembly of the Terapanth order.',
    details: 'It is the central annual administrative assembly of the Terapanth order, held every January or February. During this three-day convention, the internal monastic codes are read aloud, community data compliance is checked, and the Acharya announces the official Chaturmas destinations for all monastic squads.',
    tags: ['faq', 'maryada mahotsav', 'assembly', 'chaturmas']
  },
  {
    id: 'faq-025',
    title: 'What is "Chaturmas"?',
    category: 'Rituals',
    description: 'The annual 4-month monsoon retreat for Jain ascetics.',
    details: 'It is the annual 4-month monsoon retreat. Because the rainy season causes an explosion of plant life, insects, and microscopic organisms on pathways, monks and nuns halt all foot travel (Vihar) and anchor at a single designated venue to avoid causing accidental injury to seasonal life forms.',
    tags: ['faq', 'chaturmas', 'monsoon', 'retreat', 'vihar']
  },
  {
    id: 'faq-026',
    title: 'What happens during "Paryushan Mahaparva"?',
    category: 'Rituals',
    description: 'An 8-day festival of spiritual focus and forgiveness.',
    details: 'It is an 8-day festival of intense internal cleansing and spiritual focus. It features daily scriptural readings, mass fasting, and concludes with Samvatsari Pratikraman, where every follower asks for absolute, unconditioned forgiveness from all living beings globally using the phrase "Michhami Dukkadam".',
    tags: ['faq', 'paryushan', 'festival', 'samvatsari', 'forgiveness']
  },
  {
    id: 'faq-027',
    title: 'What is "Santhara" or "Sallekhana"?',
    category: 'Rituals',
    description: 'The highly regulated vow of voluntary fasting unto death.',
    details: 'It is the highly regulated vow of voluntary fasting unto death. It is not suicide; it is only permitted under strict monastic supervision when a person faces imminent death due to terminal illness or extreme old age, allowing them to consciously withdraw from material fuel and depart in deep meditation.',
    tags: ['faq', 'santhara', 'sallekhana', 'fasting unto death']
  },
  {
    id: 'sthanakas-jurisprudence',
    title: 'The 10 Sthanakas of Monastic Jurisprudence',
    category: 'Rules',
    description: 'The 10 stages of spiritual correction and penance.',
    details: 'Terapanth follows a rigorous code defined by 10 Sthanakas (Stages of Penance/Correction): \n1. Alochana: Confession of faults with absolute transparency to the Acharya. \n2. Pratikramana: Repentance for the fault. \n3. Tadurubhaya: Combination of Alochana and Pratikramana. \n4. Viveka: Isolation or rejection of contaminated food/items. \n5. Vyutsarga: Giving up attachment to the body or physical comforts as penance. \n6. Tapa: Austerity (fasting). \n7. Cheda: Reduction in monastic seniority (Diksha-paryaya). \n8. Mula: Complete restart of the monastic life (Re-diksha). \n9. Anu-sthapya: Temporary expulsion from the order. \n10. Paranchika: Permanent expulsion from the order for severe violations. \n\nThese ensure the purity of the Dharmsangh and individual spiritual hygiene.',
    tags: ['Jurisprudence', 'Penance', 'Alochana', 'Discipline', 'Rules']
  },
  {
    id: 'official-videos',
    title: 'Terapanth Official YouTube',
    category: 'Rules',
    description: 'The authenticated broadcast channel for all Terapanth events.',
    details: 'The official YouTube channel (@terapanth) is the singular authenticated node for daily live morning pravachans, Ahimsa Yatra highlights, and spiritual documentaries. Instructions for users: 1. Always verify the channel handle (@terapanth) before relying on video data. 2. Use the "Streams" tab for live events. 3. Access the curated "Archives" for historical discourses by previous Acharyas. URL: https://youtube.com/@terapanth',
    tags: ['Media', 'YouTube', 'Live', 'Broadcast', 'Authenticated']
  },
  {
    id: 'daily-pravachan-video',
    title: 'Daily Live Pravachan',
    category: 'Rituals',
    description: 'Watch daily discourses by Acharya Mahashraman Ji.',
    details: 'Every morning (approx. 9:00 AM - 10:30 AM IST), Acharya Mahashraman Ji delivers a spiritual discourse. These are broadcast live on the official YouTube channel. These discourses cover scripture interpretation, moral ethics, and guidance for modern challenges. Link: https://www.youtube.com/@terapanth/live',
    tags: ['Video', 'Pravachan', 'Live', 'Morning', 'Guidance']
  },
  {
    id: 'sojat-rebellion-1760',
    title: 'Sojat Rebellion & Founding (1760)',
    category: 'History',
    description: 'The revolutionary emergence of Terapanth under Acharya Bhikshu.',
    details: 'The Sojat Rebellion refers to the historic events of VS 1817 (1760 CE) in Sojat, Rajasthan, where Muni Bhikanji (later Acharya Bhikshu) challenged the laxity of Sthanakvasi monks who had started living in permanent monasteries (Sthanaks) and accepting luxury. Seeking to restore pure monastic discipline, Swami Bhikshu left the tradition with 13 original disciples (Sadhus) on June 28, 1760, at Kelwa. Despite severe social boycotts and boycotts of food and water, Swami Bhikshu established a pristine order governed by single leadership (Ek Guru) and uncompromised vows, laying the constitution of Terapanth.',
    tags: ['Rebellion', '1760', 'Sojat', 'Swami Bhikshu', 'History']
  },
  {
    id: 'kelwa-to-siriyari-expansion',
    title: 'Kelwa to Siriyari: Early Geographic Spread',
    category: 'History',
    description: 'The expansion of Terapanth across the Marwar region.',
    details: 'Following the 1760 split in Kelwa, Swami Bhikshu and his disciples migrated barefoot (Vihar) across Marwar amidst high hostility. The journey from Kelwa to Siriyari represents the geographic expansion of the new sect. They stayed in patalyas (underground spaces), cowsheds, and ruins. In Siriyari, Swami Bhikshu spent several holy seasons. Siriyari eventually became a deeply sacred place, where Acharya Bhikshu attained final liberation (Moksha/Santhara) in 1803 CE.',
    tags: ['Kelwa', 'Siriyari', 'Vihar', 'Barefoot', 'Marwar', 'History']
  },
  {
    id: 'terapanth-vs-other-sects',
    title: 'Terapanth vs. Other Jain Sects',
    category: 'Philosophy',
    description: 'Differentiating Terapanth from Sthanakvasi, Digambar & Murtipujak traditions.',
    details: 'Terapanth is a Shvetambar non-image-worshiping (A-Murtipujak) sect. Differentiators: \n1. Vs. Digambar: Shvetambars wear unstitched white clothes, while Digambar monks are sky-clad. \n2. Vs. Murtipujak (Shvetambar): Terapanth does not worship idols, have temples, or perform ritualistic offerings to statues; focus is purely on internal soul-purification. \n3. Vs. Sthanakvasi: Sthanakvasis worship in local halls but live in loose administrative hierarchies. Terapanth strictly enforces the "One Guru" (absolute centralized command under the reigning Acharya) and blocks localized attachments by dynamically rotating monastic squads (Singhas).',
    tags: ['Sects', 'Sthanakvasi', 'Digambar', 'Murtipujak', 'Philosophy']
  },
  {
    id: 'karma-theory-8-types',
    title: '8 Types of Karma (Karma Theory)',
    category: 'Philosophy',
    description: 'Systemic breakdown of the Ghati and Aghati karmic classes.',
    details: 'Jainism defines Karma as physical matter particles (Pudgala) that bond to the soul. They are divided into 4 Destructive (Ghati) and 4 Non-Destructive (Aghati) categories:\n\n[GHATI KARMAS - Obstruct Soul’s Natural Qualities]:\n1. Jnanavarniya: Obstructs infinite knowledge.\n2. Darshanavarniya: Obstructs infinite vision.\n3. Mohaniya: Obstructs equanimity; breeds delusion, anger, pride, and attachment.\n4. Antaraya: Obstructs spiritual energy (Virya) and charities.\n\n[AGHATI KARMAS - Determine Body and Earthly Bondage]:\n5. Vedaniya: Projects physical sensations of pleasure (Shata) and pain (Ashata).\n6. Ayushya: Determines lifespan duration in the current birth.\n7. Nama: Designs physical features, health, structure, and species.\n8. Gotra: Determines parentage, social environment, and status.\n\nShedding these is the ultimate purpose of all monastic and lay vows.',
    tags: ['Karma', 'Philosophy', 'Ghati', 'Aghati', '8 Types']
  },
  {
    id: 'navkar-mantra-deep-dive',
    title: 'Navkar Mantra: Systematic Breakdown',
    category: 'Philosophy',
    description: 'Exact transcript, phonetic guides, and deep meaning of the 9 holy lines.',
    details: 'The Navkar Mantra is the supreme, non-sectarian prayer of Jainism. It is split into 5 core Namaskars and 4 secondary lines:\n\n1. Namo Arihantanam: I bow to the living omniscient spiritual conquerors.\n2. Namo Siddhanam: I bow to the completely liberated souls.\n3. Namo Ayariyanam: I bow to the supreme monastic leaders (Acharyas).\n4. Namo Uvajjhayanam: I bow to the scholarly teachers (Upadhyayas).\n5. Namo Loe Savva Sahunam: I bow to all ascetics in the universe.\n\n[THE FOUR BENEFITS LINES]:\n6. Eso Pancha Namokaro: These five-fold bows,\n7. Savva Pava Panasano: Destroy all sinful karmas,\n8. Mangalanancha Savvesim: And among all auspicious things,\n9. Padhamam Havai Mangalam: This is the foremost auspicious mantra.\n\nPhonetic Tip: Recite with deep neural resonance (Mahaprana Dhwani) on exhalation, focusing on the Anand Kendra (Heart) and Jyoti Kendra (Pineal).',
    tags: ['Navkar Mantra', 'Prayer', 'Pancha Parameshthi', 'Deep Dive', 'Philosophy']
  },
  {
    id: 'six-substances-dravya',
    title: 'The Six Substances (Dravya)',
    category: 'Philosophy',
    description: 'The Jain cosmological building blocks of the universe.',
    details: 'Jainism asserts that the universe is uncreated and composed of six eternal, reality-carrying substances (Dravyas):\n1. Jiva (Soul): Sentient substance with consciousness and infinite potential.\n2. Pudgala (Matter): Insentient substance with form, touch, taste, smell, and color.\n3. Dharma (Medium of Motion): Helps Jiva and Pudgala to move (like water to fish).\n4. Adharma (Medium of Rest): Helps Jiva and Pudgala to remain static (like shade to a traveler).\n5. Akasha (Space): Provides accommodation to all existing substances.\n6. Kala (Time): Assists in the continuous modification and aging of substances.',
    tags: ['Dravya', 'Substances', 'Cosmology', 'Philosophy', 'Metaphysics']
  },
  {
    id: 'lesya-theory-colors',
    title: 'Lesya Theory: Mental Colorings',
    category: 'Philosophy',
    description: 'The 6 psychological states or "mental shades" governing spiritual progression.',
    details: 'Lesya represents the psychic coloring of the soul based on active mental passions (Kashayas). It has 6 grades:\n\n[IMPURE/DARK LESYAS]:\n1. Krishna (Black): Intense cruelty, extreme anger, and malicious intent.\n2. Neel (Blue): Deceit, laziness, jealousy, and dishonesty.\n3. Kapot (Grey): Sadness, complaining, lack of self-control, and envy.\n\n[PURE/BRIGHT LESYAS]:\n4. Tejo (Yellow/Orange): Self-control, humility, kind speech, and basic ethical awareness.\n5. Padma (Pink/Lotus): Compassion, profound tolerance, forgiveness, and subduing desires.\n6. Shukla (White): Absolute equanimity, desireless focus, purity of thoughts, and proximity to liberation.\n\nPreksha Meditation uses Leshya Dhyana (color meditation) to actively upgrade mental colorings to pure Shukla state.',
    tags: ['Lesya', 'Colors', 'Psychology', 'Preksha', 'Philosophy']
  },
  {
    id: 'pratikraman-types-guide',
    title: 'Pratikraman: The 5 Core Forms & Guide',
    category: 'Rituals',
    description: 'Detailed analysis of daily and periodic repentance rituals.',
    details: 'Pratikraman means "returning to the self" through systematic self-audit, confession, and repentance of slips (Atichars). There are 5 mandatory types:\n1. Devasi Pratikraman: Performed daily at sunset to repent for sins committed during daylight hours.\n2. Raisi Pratikraman: Performed daily at sunrise to repent for overnight sins.\n3. Pakhi Pratikraman: Performed fortnightly (every 15 days on Shukla/Krishna Chaturdashi/Purnima) for semi-monthly clearing.\n4. Chaumasi Pratikraman: Performed once every four months to close and clear the seasonal files (at the start and end of seasons).\n5. Samvatsari Pratikraman: The grand annual repentance performed on the final day of Paryushan, culminating in universal forgiveness (Micchami Dukkadam) towards all living beings.',
    tags: ['Pratikraman', 'Repentance', 'Paryushan', 'Daily Ritual', 'Rituals']
  },
  {
    id: 'kayotsarg-relaxation',
    title: 'Kayotsarg: Absolute Physical Detachment',
    category: 'Rituals',
    description: 'The ancient practice of standing or sitting with complete bodily abandonment.',
    details: 'Kayotsarg (Kaya-utsarg) translates to "abandonment of the physical body." It is the primary meditative posture and tool in both Jain rituals and Preksha Meditation:\n1. Posture: Stand with feet 4 inches apart, hands hanging loose or sit in a comfortable cross-legged posture.\n2. Physical: Eliminate all muscle tension, freeze skeletal motion, and breathe slowly.\n3. Mental: Distinguish the soul from the physical container ("My body is not mine; I am a pure soul").\n4. Benefits: Releases stress, strengthens autonomic pathways, and burns past karmas through deep physical stillness.',
    tags: ['Kayotsarg', 'Relaxation', 'Detachment', 'Preksha', 'Rituals']
  },
  {
    id: 'tapa-fasting-types',
    title: 'Tapa: Classification of Fasting Types',
    category: 'Rituals',
    description: 'The precise guidelines for external food-based austerities.',
    details: 'Fasting in Terapanth Jainism is evaluated strictly to incinerate physical and mental dependencies. Common types:\n1. Ekasana: Consuming only one meal at a single sitting during daylight hours, drinking warm water until sunset.\n2. Beasana: Consuming two meals during daylight hours under identical restrictions.\n3. Ayambil: Consuming only one meal of simple boiled grains without any salt, oil, spices, dairy, sugar, or vegetables.\n4. Upvas: A complete 24-hour fast. No solid food is consumed; only pre-boiled water is permitted from 48 minutes after sunrise until sunset.\n5. Bela / Tela / Athai: Upvas for 2, 3, or 8 consecutive days respectively.\n6. Varsitap: Gradual fasting on alternate days (one day Upvas, next day Beasana/Ekasana) for an entire year.\n7. Maskhaman: Absolute complete fast for 30 consecutive days, taking only warm boiled water during daytime.',
    tags: ['Fasting', 'Tapa', 'Ayambil', 'Upvas', 'Varsitap', 'Rituals']
  },
  {
    id: 'monastic-travel-rules',
    title: 'Monastic Travel: Irya-Vihar Rules',
    category: 'Rules',
    description: 'Ironclad limits governing the travel of Terapanth Sadhu-Sadhvis.',
    details: 'To maintain the absolute vow of Ahimsa, Terapanth ascetics walk barefoot (Vihar) with these rules:\n1. Barefoot: They must never wear shoes, slippers, or socks under any climate.\n2. Day Only: Travel is permitted only from sunrise to sunset. Walking at night is strictly forbidden to prevent crushing nocturnal insects.\n3. Path Scan: Monks scan the path 4 cubits (6 feet) ahead to avoid stepping on living beings (Irya Samiti).\n4. Monsoon Anchor: During Chaturmas (monsoon season, 4 months), all foot travel is suspended as the moist earth causes an explosion of micro-life.\n5. No Transit: Utilizing cars, flights, animal-carts, elevators, or bicycles is absolute ground for monastic infraction.',
    tags: ['Rules', 'Vihar', 'Barefoot', 'Travel', 'Monastic Law']
  },
  {
    id: 'monastic-sleeping-rules',
    title: 'Monastic Rest & Sleeping Rules',
    category: 'Rules',
    description: 'The highly austere sleep restrictions of Terapanth ascetics.',
    details: 'Rest and sleep for ascetics are governed by severe simplification:\n1. Bedding: No soft mattresses, pillows, or cushions are allowed. They sleep on a thin wooden plank (Patlla) covered with a coarse wool carpet or straw mat.\n2. No Ventilation Appliances: No electric fans or air conditioners are permitted, even in desert summer regions.\n3. Posture: They sleep in specific postures of detachment (like the Lion posture) to keep physical awareness acute.\n4. Timing: Sleeping early at night and waking up up to 3 to 4 hours before sunrise (approx. 3:00 - 4:00 AM) to perform morning Pratikraman.',
    tags: ['Rules', 'Sleeping', 'Austerity', 'Patlla', 'Monastic Law']
  },
  {
    id: 'monastic-communication-rules',
    title: 'Monastic Communication Sanctions',
    category: 'Rules',
    description: 'Regulations governing letters, phones, and digital devices.',
    details: 'Terapanth ascetics observe strict limits to protect their mental focus and keep themselves detached from worldly networks:\n1. Digital Prohibition: Absolutely zero usage of phones, computers, internet, social media, radio, or TVs.\n2. No Postage: Monks are forbidden from sending emails, post-office letters, or utilizing couriers directly.\n3. Guided Letters: Any scriptural communication or directive must be written by hand using traditional ink and delivered via traveling laypersons (Shravaks).\n4. Silence Blocks: Daily observation of silent meditation hours (Mauna), especially during scripture studies and nighttime repose.',
    tags: ['Rules', 'Communication', 'Technology', 'Digital', 'Monastic Law']
  },
  {
    id: 'monastic-money-rules',
    title: 'Monastic Money & Financial Sanctions',
    category: 'Rules',
    description: 'Zero-monetary-possession rules of the Terapanth order.',
    details: 'To comply with the absolute vow of non-attachment (Aparigraha), the financial bans are absolute:\n1. No Buying/Selling: Monks and nuns can never handle paper cash, coins, bank cards, or digital payment systems.\n2. No Trust Management: They cannot establish, direct, or holds bank accounts, trusts, or real estate assets.\n3. No Purchases: They cannot ask any lay person to buy something on their behalf. Even their minimal gear (Patra, woolen blankets, white robes) must be offered by laypeople from existing items without special manufacturing purchases.\n4. No Endorsements of Commerce: Monks can never endorse business transactions, products, or handle financial disputes.',
    tags: ['Rules', 'Money', 'Aparigraha', 'Finance', 'Monastic Law']
  },
  {
    id: 'sacred-place-kelwa',
    title: 'Kelwa (The Foundational Cradle)',
    category: 'History',
    description: 'The historic birthplace of the Jain Shwetambar Terapanth order.',
    details: 'Kelwa (in Udaipur/Rajsamand district, Rajasathan) is the foundational cradle of the entire Terapanth Dharmsangh. On June 28, 1760 (Vikram Samvat 1817), under a historic banyan tree, Acharya Bhikshu established the new order with 13 dedicated monks and 13 laymen, setting up the absolute unified command (Ek Guru) system. Today, Kelwa is treated as a highly revered pilgrimage site holding ancient monastic elements.',
    tags: ['Sacred Places', 'Kelwa', 'Founder', 'History', 'Udaipur']
  },
  {
    id: 'sacred-place-siriyari',
    title: 'Siriyari (Bhikshu Samadhi Sthal)',
    category: 'History',
    description: 'The sacred land where Acharya Bhikshu attained final heavenly liberation.',
    details: 'Siriyari (Rajasthan) is deeply sacred as the place of ultimate Mahaprayan (liberation) of founder Acharya Bhikshu. He spent his final Chaturmas here and attained heavenly abode (Santhara) in VS 1860 (1803 CE). The legendary "Bhikshu Samadhi Sthal" temple is a supreme center of spiritual energy, where millions of disciples gather to perform silent Japa and experience ultimate renunciation.',
    tags: ['Sacred Places', 'Siriyari', 'Samadhi', 'Acharya Bhikshu', 'History']
  },
  {
    id: 'sacred-place-ladnun',
    title: 'Ladnun (The Spiritual & Academic Capital)',
    category: 'History',
    description: 'The educational hub of Terapanth and birthplace of Acharya Tulsi.',
    details: 'Ladnun is the spiritual and academic capital of the Terapanth order. It is the birthplace of 9th Acharya Shri Tulsi and houses the sprawling campus of Jain Vishva Bharati University (JVBI) founded in 1991. The town acts as the central point for manuscript preservation, advanced Preksha Meditation courses, and the university research programs.',
    tags: ['Sacred Places', 'Ladnun', 'Acharya Tulsi', 'JVBI', 'Education']
  },
  {
    id: 'sacred-place-sardarshahar',
    title: 'Sardarshahar (Birthplace of Acharya Mahashraman)',
    category: 'History',
    description: 'The holy land of co-initiation and births.',
    details: 'Sardarshahar is a landmark city in Terapanth geography. It is the birthplace of the current 11th Supreme Head, Acharya Shri Mahashraman Ji (born May 13, 1962). This is also where 10th Acharya Shri Mahapragya Ji breathed his last molecular breath in 2010. It is renowned for hosting several major Maryada Mahotsav events and has witnessed many historic monastic initiations.',
    tags: ['Sacred Places', 'Sardarshahar', 'Mahashraman', 'Mahapragya', 'History']
  },
  {
    id: 'sacred-place-gangashahar',
    title: 'Gangashahar (Legacy & Literature Land)',
    category: 'History',
    description: 'The sacred place where Acharya Kalu Gani and Acharya Tulsi achieved heavenly abode.',
    details: 'Gangashahar (near Bikaner, Rajasthan) is historically rich as the final station of legacy (Moksha/Samadhi) for both 8th Acharya Kalu Gani (1936) and 9th Acharya Shri Tulsi (1997). It features massive spiritual monuments, extensive libraries housing rare handwritten scripts, and represents an highly active lay coordination node.',
    tags: ['Sacred Places', 'Gangashahar', 'Kalu Gani', 'Acharya Tulsi', 'Bikaner']
  },
  {
    id: 'core-prayer-iriyavahi',
    title: 'Iriyavahi Sutra (Repentance Prayer)',
    category: 'Rituals',
    description: 'The essential prayer for seek forgiveness for sub-conscious violence while walking.',
    details: 'The Iriyavahi Sutra is a core daily prayer recited by all Terapanth ascetics and laypersons. Translated as the "Sutra of Movement Care", it is a critical tool for self-audit. It systematically repents for any accidental harm, distress, or injury caused to living beings (microscopic earth, water, vegetation, and insect life) during daily walking: "Iriyavahiyae, virahanayae, agamane-vagamane...".',
    tags: ['Prayers', 'Iriyavahi Sutra', 'Repentance', 'Ahimsa', 'Rituals']
  },
  {
    id: 'core-prayer-logassa',
    title: 'Logassa Sutra (The 24 Tirthankara Praise)',
    category: 'Rituals',
    description: 'The Chaturvimshati Stava honoring the 24 divine guides.',
    details: 'The Logassa Sutra (Chaturvimshati Stava) is an ancient, extremely powerful hymn of praise dedicated to the 24 Tirthankaras (liberated spiritual heads). Reciting Logassa is done to invokes divine energies of purity, wisdom, and absolute equanimity (Samyak Darshan). Phonetic: "Logassa ujjoyagare, dhamma-tittha-yare jine, arihante kittaissam...". It is a key element in daily Samayik and Pratikraman.',
    tags: ['Prayers', 'Logassa Sutra', 'Tirthankara', 'Praise', 'Rituals']
  },
  {
    id: 'core-prayer-bhikshu-stuti',
    title: 'Bhikshu Stuti (Hymn to the Founder)',
    category: 'Rituals',
    description: 'Deeply emotional devotional hymn honoring revolutionary Acharya Bhikshu.',
    details: 'The Bhikshu Stuti is a historic devotional song sung with immense pride and gratitude by the Terapanth laity. Composed to commemorate the courage, wisdom, and uncompromised vows of Swami Bhikshu, it details his heroic Sojat Rebellion of 1760 and the light of truth he established on the pillars of pure de-addiction and singular corporate discipline.',
    tags: ['Prayers', 'Bhikshu Stuti', 'Acharya Bhikshu', 'Hymn', 'Rituals']
  },
  {
    id: 'core-prayer-mangalacharana',
    title: 'Mangalacharana (Auspicious Opening)',
    category: 'Rituals',
    description: 'The sacred introductory recitation for spiritual protection.',
    details: 'The Mangalacharana is the mandatory auspicious opening prayer composed of the Navkar Mantra and traditional verses, performed before any discourse, weekly assembly, or writing in the Terapanth sect. It serves to purifies the atmosphere, expels external negative vibrations, and aligns the minds of the listeners towards wisdom and humility.',
    tags: ['Prayers', 'Mangalacharana', 'Navkar', 'Auspicious', 'Rituals']
  },
  {
    id: 'deep-acharya-bharimal',
    title: 'Acharya Bharimal (2nd Acharya)',
    category: 'Acharya',
    description: 'The great consolidator of the founding order (1803–1821 CE).',
    details: 'Acharya Bharimal (1746-1821) took command of the infant Terapanth order after the founding father Swami Bhikshu passed away. Born in Maroth, he met Bhikshu Swami and was initiated in VS 1818. During some of the most critical external opposition from older sects, he maintained absolute internal unity, initiated many scholars, and nurtured the brilliant young Jayacharya.',
    tags: ['Acharya', 'Lineage', 'Consolidator', 'History', '2nd Acharya']
  },
  {
    id: 'deep-acharya-raichand',
    title: 'Acharya Raichand (3rd Acharya)',
    category: 'Acharya',
    description: 'The memory master and peaceful orator (1821–1851 CE).',
    details: 'Acharya Raichand (1790-1851) was celebrated for his profound memory, mild speech, and meditative focus. Born in Mahajan, he was initiated at the raw age of 11. During his active 30-year headship, the geographical reach of Terapanth expanded heavily, entering Gujarat, Mewar, and Vagad. He initiated 140+ dedicated monks and nuns.',
    tags: ['Acharya', 'Lineage', '3rd Acharya', 'Memory Master', 'History']
  },
  {
    id: 'deep-acharya-jeetmal',
    title: 'Acharya Jeetmal / Jayacharya (4th Acharya)',
    category: 'Acharya',
    description: 'The legendary administrator, codifier, and prolific poet (1851–1881 CE).',
    details: 'Acharya Jeetmal (1803-1881), famously known as Jayacharya, was a legendary genius who wrote 300,000+ poetic verses. He translated the entire massive Bhagavati Sutra into Rajasthani verse and pioneered monastic records. He established the annual mandatory "Maryada Patra" signing system and designed the structured "Singha" regional group allotments.',
    tags: ['Acharya', 'Lineage', 'Jayacharya', '4th Acharya', 'Administrator', 'Poet']
  },
  {
    id: 'deep-acharya-maghraj',
    title: 'Acharya Maghraj (5th Acharya)',
    category: 'Acharya',
    description: 'The saintly and uncompromised stabilizer (1881–1892 CE).',
    details: 'Acharya Maghraj (1840-1892) was known for his calm, quiet, and deeply meditative aura. Governed during times of slight regional factionalism, he maintained pristine adherence to the code of conduct of the founder. He toured Shekhawati and Marwar, strengthening layperson assemblies.',
    tags: ['Acharya', 'Lineage', '5th Acharya', 'Saintly', 'Discipline']
  },
  {
    id: 'deep-acharya-manak',
    title: 'Acharya Manak Gani (6th Acharya)',
    category: 'Acharya',
    description: 'The devotional reformer and poetic singer (1892–1897 CE).',
    details: 'Acharya Manak Gani (1855-1897) had a short but highly intense headship. He popularized many beautiful devotional stutis and prayers that remain central to the Terapanth music repertoire today. He possessed a sweet, resonant lecturing voice and mobilized youth assemblies across Jaipur.',
    tags: ['Acharya', 'Lineage', '6th Acharya', 'Devotional', 'Aesthetic']
  },
  {
    id: 'deep-acharya-dal',
    title: 'Acharya Dal Gani (7th Acharya)',
    category: 'Acharya',
    description: 'The strict designer of monastic curricula (1897–1909 CE).',
    details: 'Acharya Dal Gani (1853-1909), born in Udaipur, introduced deep academic structures to the monastic training pipeline. He designed specific syllabi for young ascetics, created standard instructional manuals, and set up Ladnun as a premier repository of manuscript collection.',
    tags: ['Acharya', 'Lineage', '7th Acharya', 'Education', 'Academic']
  },
  {
    id: 'deep-acharya-kalu',
    title: 'Acharya Kalu Gani (8th Acharya)',
    category: 'Acharya',
    description: 'The great patron of Sanskrit scholarship (1909–1936 CE).',
    details: 'Acharya Kalu Gani (1879-1936) revolutionized the intellectual depth of the order by mandating the mastery of Sanskrit grammar, literature, and compositions among all monks and nuns. He founded the famous "Kalu Yashovilas" libraries and initiated the legendary Acharya Tulsi at age 11 in Chhapar.',
    tags: ['Acharya', 'Lineage', '8th Acharya', 'Sanskrit', 'Patron']
  },
  {
    id: 'deep-acharya-tulsi',
    title: 'Acharya Tulsi (9th Acharya)',
    category: 'Acharya',
    description: 'The global reformer and creator of Anuvrat & Samans (1936–1996 CE).',
    details: 'Acharya Tulsi (1914-1997) took command of the order at age 22 and modernized it. He founded the non-sectarian secular Anuvrat Movement in 1949, pioneered the "Saman" order in 1980 to bypass flight bans for global travel, and spearheaded the creation of JVBI University in Ladnun. He walked more than 300,005 km for universal morals.',
    tags: ['Acharya', 'Lineage', '9th Acharya', 'Anuvrat', 'Saman', 'Reformer']
  },
  {
    id: 'deep-acharya-mahapragya',
    title: 'Acharya Mahapragya (10th Acharya)',
    category: 'Acharya',
    description: 'The scientific philosopher and father of Preksha Meditation (1996–2010 CE).',
    details: 'Acharya Mahapragya (1920-2010) was a profound thinker of international renown. He scientifically structured the "Preksha Meditation" system in 1975 to clean emotional blocks and heal somatic diseases. He wrote over 300 books, was honored with the Indira Gandhi Award, and led the legendary Ahimsa Yatra to pacify communal disputes.',
    tags: ['Acharya', 'Lineage', '10th Acharya', 'Preksha', 'Scientist', 'Author']
  },
  {
    id: 'concept-swamivatsalya',
    title: 'Swamivatsalya (Spiritual Brotherhood Feast)',
    category: 'Rituals',
    description: 'The sacred community dining ritual practicing selfless equality.',
    details: 'Swamivatsalya is the holy community feast of Terapanth Jains. It represents total spiritual brotherhood and equality. In a Swamivatsalya, all members of the community—regardless of their financial status, age, power, or family background—sit on the floor in single lines (Pangat) to dine. There is absolutely zero separate treatment, luxury, or status display, reminding all Shravaks that they are equal children of the Jina.',
    tags: ['Rituals', 'Swamivatsalya', 'Equality', 'Brotherhood', 'Dining']
  },
  {
    id: 'concept-poshadh-vrat',
    title: 'Poshadh Vrat (The 24-Hour Monastic Imitation)',
    category: 'Rituals',
    description: 'A deep, highly austere vow where laypersons live under monk rules for 24 hours.',
    details: 'Poshadh Vrat is an advanced spiritual austerity where a lay householder (Shravak/Shravika) takes a vow to live exactly like a monastic saint for 24 hours (or 12 hours). During Poshadh, the layperson stays at an Upashriya (hall), consumes zero solid food (dry fasting), completely cuts off all cellular / digital / electrical devices, sleeps on a wooden plank (Patlla), and spends their time exclusively in scriptural study, meditation, and chanting.',
    tags: ['Rituals', 'Poshadh Vrat', 'Austerity', 'Monastic Life', 'Lay Vows']
  },
  {
    id: 'concept-32-founding-rules',
    title: 'The 32 Constitutional Rules (Likhit Pattak)',
    category: 'Rules',
    description: 'The original 1760 constitutional draft penned by Acharya Bhikshu.',
    details: 'The 32 Founding Rules (Likhit Pattak) form the legal and spiritual constitution of the Terapanth order, written by founder Swami Bhikshu at Kelwa in VS 1817 (1760 CE) to prevent division. Major articles: 1. Strict single centralized leadership (Ek Guru). 2. Total prohibition of forming separate regional groups or secret discipleship. 3. Mandated signing of the Maryada Patra annually by every single ascetic. 4. Prohibition of permanent possessions of property.',
    tags: ['Rules', 'Constitution', 'Likhit Pattak', 'Acharya Bhikshu', 'History']
  },
  {
    id: 'concept-bhikshu-literary-works',
    title: 'Acharya Bhikshus Poetic Literary Heritage',
    category: 'History',
    description: 'The prolific Marwari poetic works composed by the founder.',
    details: 'Founder Acharya Bhikshu was an highly gifted, prolific writer who composed over 38,000 verses in the local Marwari Rajasthani language. His top work, "Bhram Vidhonsan", is a masterpiece that resolves 130+ complex theological queries regarding Laukik (worldly) vs. Lokottara (transcendental) charity as per the Agams. Other notable works include "Navpad Puja", "Hundi", and "Choka Verse".',
    tags: ['History', 'Bhikshu', 'Literary', 'Verses', 'Bhram Vidhonsan']
  },
  {
    id: 'institution-jvbi',
    title: 'Jain Vishva Bharati University (JVBI, Ladnun)',
    category: 'History',
    description: 'The premier global university for Jain philosophy, Prakrit, and non-violence.',
    details: 'The Jain Vishva Bharati Institute (JVBI, deemed university) was established in Ladnun, Rajasthan in 1991 under the visionary guidance of 9th Acharya Shri Tulsi. It is the topmost global institute offering specialized undergraduate, master, and PhD courses in Prakrit linguistics, Sanskrit grammar, Science of Living (Jeevan Vigyan), Ahimsa, and Preksha Meditation, attracting international scholars and researchers yearly.',
    tags: ['History', 'JVBI', 'University', 'Ladnun', 'Education', 'Prakrit']
  },
  {
    id: 'institution-anuvibha',
    title: 'Anuvrat Vishva Bharati (ANUVIBHA, Jaipur)',
    category: 'History',
    description: 'The international non-sectarian peace wing of the Anuvrat movement.',
    details: 'Anuvrat Vishva Bharati (ANUVIBHA), headquartered in Jaipur, is the international and non-sectarian wing of the Anuvrat Movement. It coordinates global children values Camps (Bal Sanskar Camps), organizes international conferences on non-violence, publishes ethical journals, and is an active NGO associated with the United Nations for global peace.',
    tags: ['History', 'ANUVIBHA', 'Jaipur', 'Anuvrat', 'Peace', 'Global']
  },
  {
    id: 'institution-gyanshala-network',
    title: 'Gyanshala Values Education Network',
    category: 'History',
    description: 'The worldwide value-training ecosystem for children and teachers.',
    details: 'The Gyanshala Network is a structured values education program for children, initialized by 9th Acharya Tulsi in 1965. Today, it operates under the central headship of Muni Udit Kumar Ji (केंद्रीय मुख्य प्रभारी). It spans 570+ global centers, 18,000+ students (Gyanarthis), and 4,000+ certified volunteer teachers (Prashikshikas) who teach Navkar Mantra, 9 Tattvas, respect for parents, and non-addiction rules.',
    tags: ['History', 'Gyanshala', 'Muni Udit Kumar', 'Education', 'Children']
  },
  {
    id: 'concept-varsitap',
    title: 'Varsitap (The Year-Long Alternating Fast)',
    category: 'Rules',
    description: 'The extreme spiritual discipline of alternate-day dry fasting for a year.',
    details: 'Varsitap is one of the most celebrated and difficult austerities in Terapanth Jainism. Spanning a full year, the practitioner observes a dry fast (Upvas) on one day, followed by Beasana or Ekasana (one or two limited meals) on the next day, continuously alternating. The fast is traditionally broke on Akshaya Tritiya with sugarcane juice, mimicking the historical breaking of Lord Rishabhdev\'s 1-year fast.',
    tags: ['Rules', 'Varsitap', 'Fasting', 'Austerity', 'Akshaya Tritiya']
  },
  {
    id: 'concept-maskhaman',
    title: 'Maskhaman (The 30-Day Absolute Fast)',
    category: 'Rules',
    description: 'The ultimate austerity of fasting for 30 consecutive days.',
    details: 'Maskhaman is an extreme, highly revered physical and mental austerity in the Terapanth community. The practitioner observes a perfect, absolute fast for 30 consecutive days of zero solid food, consuming exclusively boiled warm water between sunrise and sunset. It requires immense spiritual focus (Atma-shakti) and is followed by grand community celebrations (Swamivatsalya) to honor the spiritual conqueror.',
    tags: ['Rules', 'Maskhaman', 'Fasting', 'Athai', 'Extreme Austerity']
  },
  {
    id: 'sadhvi-pramukha-vishrutvibha',
    title: 'Sadhvi Pramukha Vishrutvibha Ji',
    category: 'History',
    description: 'The 9th Sadhvi Pramukha of Jain Shvetambar Terapanth Dharmasangh.',
    details: 'Sadhvi Pramukha Vishrutvibha Ji (born Saroj Modi in Ladnun on November 27, 1957) is the 9th Sadhvi Pramukha of the Terapanth sect. Appointed on May 16, 2022 by Acharya Mahashraman Ji, she governs over 550+ Sadhvis and Samanis. Historically, she is the first member of the revolutionary Saman Order (initiated as Samani Smitpragya in 1980 by Acharya Tulsi) to rise to the position of Sadhvi Pramukha. She completed 12 years of global propagation across USA, UK, Germany, and Italy before receiving full Sadhvi diksha as Sadhvi Vishrutvibha in 1992. She also served for 17 years as Mukhya Niyojika under Acharya Mahapragya, and is a noted multilingual scholar with multiple published books including "Journey into Jain Aagaam" and "The Basics of Jainism".',
    tags: ['Sadhvi Pramukha', 'Vishrutvibha', '9th Leader', 'Ladnun', 'Mukhya Niyojika', 'Saman Order', 'Modi Family']
  },
  {
    id: 'sadhvi-varya-sambudhyasha',
    title: 'Sadhvi Varya Sambudhyasha Ji',
    category: 'History',
    description: 'The first Sadhvi Varya in the 250+ year history of Terapanth.',
    details: 'Sadhvi Varya Sambudhyasha Ji is the first holder of the prestigious administrative rank of "Sadhvi Varya" in Terapanth history. Acharya Mahashraman Ji announced the creation of this position on June 2, 2016 in Barpathar, Assam, to optimize academic tiers, Agamic research editing (under Jain Vishva Bharati), and general nunhood administration in coordination with Sadhvi Pramukha Vishrutvibha Ji. Renowned for her deep tranquil composure, meticulous barefoot travels (Vihar), and absolute avoidance of electrical modern devices, her Chayan Diwas is celebrated globally every May/June (marking the 11th Chayan Diwas in 2026).',
    tags: ['Sadhvi Varya', 'Sambudhyasha', 'First Holder', 'Barpathar', 'Chayan Diwas', 'Assam', 'Agama Editor']
  },
  {
    id: 'sadhvi-rajimati',
    title: 'Shasan Gaurav Sadhvi Shri Rajimati Ji',
    category: 'History',
    description: 'A respected member of the elite 7-in-1 Bahushrut Parishad and dedicated spiritual practitioner.',
    details: 'Shasan Gaurav Sadhvi Shri Rajimati Ji (born July 14, 1933 in Changrabandha, West Bengal) is one of the most revered senior ascetics of the Jain Shvetambar Terapanth Dharmasangh. She belongs to the respected Anchalia clan originally of Ratangarh, Rajasthan, and was born to Smt. Dhapu Devi and Shri Hulasmalji Anchalia. She entered her monastic life (diksha) in 1950 in Hansi, Haryana under the 9th Acharya Sri Tulsi. She completed an extraordinary 75 years of pure ascetic lineage on October 12, 2025 (celebrated as a historic Vishesh Abhyarthana Samaroh in Nokha, Bikaner with a direct blessing message from Acharya Mahashraman Ji). She sits on the elite 7-member Bahushrut Parishad advisory committee. She is globally recognized for her deeply serene composure, her "Simhavalokan" introspection principles, and her regular guidance in chanting ancient seed syllables (Beej Mantras). Her experiences are compiled in her masterwork book "Anubhav Path".',
    tags: ['Sadhvi Rajimati', 'Shasan Gaurav', 'Bahushrut Parishad', '75 Years', 'Nokha', 'Ratangarh', 'Hansi', 'Anubhav Path']
  },
  {
    id: 'permanent-bhawan-directory',
    title: 'All India Terapanth Bhawan Permanent Directory (अखिल भारतीय तेरापंथ भवन स्थायी निर्देशिका)',
    category: 'Rules',
    description: 'The audited official blueprints and contact listing for permanent Terapanth Bhawans across India.',
    details: 'The All India Terapanth Bhawan Directory holds the audited official blueprint records and contact exchanges for core administrative and staying facilities of the Terapanth Dharmsangh.\n\nHere are some of the master registry points:\n\n• DELHI / NCR & NORTHERN REGION:\n  - नई दिल्ली (Daryaganj): तेरापंथ भवन - 1-ए, बहादुर शाह जफर मार्ग, दरियागंज, नई दिल्ली-110002. कार्यालय संपर्क: 011-23311915 / 23312957\n  - नई दिल्ली (Mandi House): अणुव्रत भवन - 210, दीनदयाल उपाध्याय मार्ग, मंडी हाउस के पास, नई दिल्ली-110002. केंद्रीय कार्यालय: 011-23212150 / 23231012\n  - फरीदाबाद (Faridabad): तेरापंथ भवन - डी-2/13, अणुव्रत मार्ग, सेक्टर-10, फरीदाबाद, हरियाणा. भवन ट्रस्ट प्रभाग: 7827509290\n  - रोहिणी (Rohini): तेरापंथ भवन - पॉकेट एफ-22, सेक्टर-05, रोहिणी, दिल्ली-110085. स्थायी ट्रस्ट कार्यालय: 9915501240\n\n• GUJARAT REGION:\n  - सूरत (City Light): तेरापंथ भवन - नियोन एवेन्यू के पास, सिटीलाइट रोड, सूरत-395007. सूरत सभा प्रभाग: 0261-2211933\n  - सूरत (Udhana): तेरापंथ भवन (तुलसी निकेतन) - स्टेशन रोड, उधना, सूरत-394210. उधना मुख्य कार्यालय: 9911716974\n  - अहमदाबाद (Shahibaug): तेरापंथ भवन - अर्हम कुंज, शाहीबाग रोड, अहमदाबाद-380004. अहमदाबाद सभा ट्रस्ट: 7021591184\n  - अहमदाबाद (Maninagar): तेरापंथ भवन - कांकरिया झील मार्ग, मणिनगर, अहमदाबाद-380008. भवन व्यवस्था समिति: 9408472957\n\n• MAHARASHTRA REGION:\n  - मुम्बई (Kalbadevi): तेरापंथ भवन (केंद्रीय) - १०-१२, कावसाजी पटेल स्ट्रीट, कालबादेवी, मुम्बई-400002. मुम्बई सभा ट्रस्ट: 022-22013915\n  - मुम्बई (Chembur): तेरापंथ भवन - श्रावक संघ मार्ग, चेम्बूर, मुम्बई-400071. ट्रस्ट डेस्क: 7061598749\n  - ठाणे (Kopri): तेरापंथ भवन - किशोर नगर, गांवदेवी मंदिर के सामने, कोपरी ठाणे (पूर्व)-400603. कार्यालय संपर्क: 9892302847\n  - कांदिवली (Kandivali): तेरापंथ भवन - ठाकुर कॉम्प्लेक्स, कांदिवली (पूर्व), मुम्बई-400101. क्षेत्रीय प्रभार: 8850280184\n\n• RAJASTHAN REGION:\n  - लाडनूं (Ladnun): जैन विश्व भारती कार्यालय - महाश्रमण विहार परिसर, लाडनूं, नागौर प्रान्त. केंद्रीय प्रशासनिक विंग: 01581-222114 / 222315\n  - सिरियारी (Siriyari): महाप्रज्ञ भवन (तुलसी समाधि स्थल) - मुख्य बस स्टैंड मार्ग, सिरियारी, पाली प्रान्त. सिरियारी संस्थान ट्रस्ट: 02934-282205\n  - बालोतरा (Balotra): तेरापंथ भवन - आचार्य श्री महाश्रमण मार्ग, अग्रवाल कॉलोनी, बालोतरा. बालोतरा सभा प्रभाग: 9649509233\n  - जयपुर (Barkat Nagar): तेरापंथ भवन - किसान मार्ग, बरकत नगर, टोंक रोड, जयपुर-302015. जयपुर सभा काउंटर: 9660692852\n\n• SOUTH INDIA (TAMIL NADU & KARNATAKA):\n  - चेन्नई (Chennai Road): तेरापंथ भवन - एलिस रोड, माउंट रोड के पास, चेन्नई-600002. चेन्नई ट्रस्ट डेस्क: 044-28588040\n  - कोयंबतूर (Coimbatore): तेरापंथ भवन - अवनाशी रोड, कोयंबतूर, तमिलनाडु. स्थायी कार्यालय: 9363105602\n  - बैंगलोर (Bangalore): तेरापंथ भवन - गांधीनगर, मजेस्टिक के पास, बैंगलोर-560009. बैंगलोर सभा डेस्क: 080-22261915\n\nThese facilities support travelling ascetics (vihar stays) and hold historical significance, while coordinating region-wise operations of the Jain Shvetamber Terapanth sect.',
    tags: ['Bhawan', 'Directory', 'Delhi', 'Mumbai', 'Surat', 'Ladnun', 'Siriyari', 'Addresses', 'Contact']
  }
];

