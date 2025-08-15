// Liste complète des langues avec leurs drapeaux et codes
export interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "sq", name: "Albanais", flag: "🇦🇱", nativeName: "Shqip" },
  { code: "am", name: "Amharique", flag: "🇪🇹", nativeName: "አማርኛ" },
  { code: "ar", name: "Arabe", flag: "🇸🇦", nativeName: "العربية" },
  { code: "hy", name: "Arménien", flag: "🇦🇲", nativeName: "Հայերեն" },
  { code: "az", name: "Azéri", flag: "🇦🇿", nativeName: "Azərbaycan" },
  { code: "eu", name: "Basque", flag: "🇪🇸", nativeName: "Euskara" },
  { code: "be", name: "Biélorusse", flag: "🇧🇾", nativeName: "Беларуская" },
  { code: "bn", name: "Bengali", flag: "🇧🇩", nativeName: "বাংলা" },
  { code: "bs", name: "Bosniaque", flag: "🇧🇦", nativeName: "Bosanski" },
  { code: "bg", name: "Bulgare", flag: "🇧🇬", nativeName: "Български" },
  { code: "ca", name: "Catalan", flag: "🇪🇸", nativeName: "Català" },
  { code: "ceb", name: "Cebuano", flag: "🇵🇭", nativeName: "Cebuano" },
  { code: "zh", name: "Chinois", flag: "🇨🇳", nativeName: "中文" },
  { code: "hr", name: "Croate", flag: "🇭🇷", nativeName: "Hrvatski" },
  { code: "cs", name: "Tchèque", flag: "🇨🇿", nativeName: "Čeština" },
  { code: "da", name: "Danois", flag: "🇩🇰", nativeName: "Dansk" },
  { code: "nl", name: "Néerlandais", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "en", name: "Anglais", flag: "🇬🇧", nativeName: "English" },
  { code: "eo", name: "Espéranto", flag: "🌍", nativeName: "Esperanto" },
  { code: "et", name: "Estonien", flag: "🇪🇪", nativeName: "Eesti" },
  { code: "fi", name: "Finnois", flag: "🇫🇮", nativeName: "Suomi" },
  { code: "fr", name: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "gl", name: "Galicien", flag: "🇪🇸", nativeName: "Galego" },
  { code: "ka", name: "Géorgien", flag: "🇬🇪", nativeName: "ქართული" },
  { code: "de", name: "Allemand", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "el", name: "Grec", flag: "🇬🇷", nativeName: "Ελληνικά" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳", nativeName: "ગુજરાતી" },
  {
    code: "ht",
    name: "Créole haïtien",
    flag: "🇭🇹",
    nativeName: "Kreyòl Ayisyen",
  },
  { code: "ha", name: "Hausa", flag: "🇳🇬", nativeName: "Hausa" },
  { code: "haw", name: "Hawaïen", flag: "🇺🇸", nativeName: "ʻŌlelo Hawaiʻi" },
  { code: "he", name: "Hébreu", flag: "🇮🇱", nativeName: "עברית" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "hmn", name: "Hmong", flag: "🇱🇦", nativeName: "Hmong" },
  { code: "hu", name: "Hongrois", flag: "🇭🇺", nativeName: "Magyar" },
  { code: "is", name: "Islandais", flag: "🇮🇸", nativeName: "Íslenska" },
  { code: "ig", name: "Igbo", flag: "🇳🇬", nativeName: "Igbo" },
  {
    code: "id",
    name: "Indonésien",
    flag: "🇮🇩",
    nativeName: "Bahasa Indonesia",
  },
  { code: "ga", name: "Irlandais", flag: "🇮🇪", nativeName: "Gaeilge" },
  { code: "it", name: "Italien", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "ja", name: "Japonais", flag: "🇯🇵", nativeName: "日本語" },
  { code: "jv", name: "Javanais", flag: "🇮🇩", nativeName: "Basa Jawa" },
  { code: "kn", name: "Kannada", flag: "🇮🇳", nativeName: "ಕನ್ನಡ" },
  { code: "kk", name: "Kazakh", flag: "🇰🇿", nativeName: "Қазақ" },
  { code: "km", name: "Khmer", flag: "🇰🇭", nativeName: "ខ្មែរ" },
  { code: "ko", name: "Coréen", flag: "🇰🇷", nativeName: "한국어" },
  { code: "ku", name: "Kurde", flag: "🇹🇷", nativeName: "Kurdî" },
  { code: "ky", name: "Kirghize", flag: "🇰🇬", nativeName: "Кыргызча" },
  { code: "lo", name: "Lao", flag: "🇱🇦", nativeName: "ລາວ" },
  { code: "la", name: "Latin", flag: "🇻🇦", nativeName: "Latina" },
  { code: "lv", name: "Letton", flag: "🇱🇻", nativeName: "Latviešu" },
  { code: "lt", name: "Lituanien", flag: "🇱🇹", nativeName: "Lietuvių" },
  {
    code: "lb",
    name: "Luxembourgeois",
    flag: "🇱🇺",
    nativeName: "Lëtzebuergesch",
  },
  { code: "mk", name: "Macédonien", flag: "🇲🇰", nativeName: "Македонски" },
  { code: "mg", name: "Malgache", flag: "🇲🇬", nativeName: "Malagasy" },
  { code: "ms", name: "Malais", flag: "🇲🇾", nativeName: "Bahasa Melayu" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳", nativeName: "മലയാളം" },
  { code: "mt", name: "Maltais", flag: "🇲🇹", nativeName: "Malti" },
  { code: "mi", name: "Maori", flag: "🇳🇿", nativeName: "Māori" },
  { code: "mr", name: "Marathi", flag: "🇮🇳", nativeName: "मराठी" },
  { code: "mn", name: "Mongol", flag: "🇲🇳", nativeName: "Монгол" },
  { code: "my", name: "Birman", flag: "🇲🇲", nativeName: "မြန်မာ" },
  { code: "ne", name: "Népalais", flag: "🇳🇵", nativeName: "नेपाली" },
  { code: "no", name: "Norvégien", flag: "🇳🇴", nativeName: "Norsk" },
  { code: "ny", name: "Chichewa", flag: "🇲🇼", nativeName: "Chichewa" },
  { code: "or", name: "Odia", flag: "🇮🇳", nativeName: "ଓଡ଼ିଆ" },
  { code: "ps", name: "Pachto", flag: "🇦🇫", nativeName: "پښتو" },
  { code: "fa", name: "Persan", flag: "🇮🇷", nativeName: "فارسی" },
  { code: "pl", name: "Polonais", flag: "🇵🇱", nativeName: "Polski" },
  { code: "pt", name: "Portugais", flag: "🇵🇹", nativeName: "Português" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ro", name: "Roumain", flag: "🇷🇴", nativeName: "Română" },
  { code: "ru", name: "Russe", flag: "🇷🇺", nativeName: "Русский" },
  { code: "sm", name: "Samoan", flag: "🇼🇸", nativeName: "Gagana Samoa" },
  { code: "gd", name: "Gaélique écossais", flag: "🇬🇧", nativeName: "Gàidhlig" },
  { code: "sr", name: "Serbe", flag: "🇷🇸", nativeName: "Српски" },
  { code: "st", name: "Sesotho", flag: "🇱🇸", nativeName: "Sesotho" },
  { code: "sn", name: "Shona", flag: "🇿🇼", nativeName: "Shona" },
  { code: "sd", name: "Sindhi", flag: "🇵🇰", nativeName: "سنڌي" },
  { code: "si", name: "Cingalais", flag: "🇱🇰", nativeName: "සිංහල" },
  { code: "sk", name: "Slovaque", flag: "🇸🇰", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovène", flag: "🇸🇮", nativeName: "Slovenščina" },
  { code: "so", name: "Somali", flag: "🇸🇴", nativeName: "Soomaali" },
  { code: "es", name: "Espagnol", flag: "🇪🇸", nativeName: "Español" },
  { code: "su", name: "Soundanais", flag: "🇮🇩", nativeName: "Basa Sunda" },
  { code: "sw", name: "Swahili", flag: "🇹🇿", nativeName: "Kiswahili" },
  { code: "sv", name: "Suédois", flag: "🇸🇪", nativeName: "Svenska" },
  { code: "tg", name: "Tadjik", flag: "🇹🇯", nativeName: "Тоҷикӣ" },
  { code: "ta", name: "Tamoul", flag: "🇮🇳", nativeName: "தமிழ்" },
  { code: "tt", name: "Tatar", flag: "🇷🇺", nativeName: "Татар" },
  { code: "te", name: "Telugu", flag: "🇮🇳", nativeName: "తెలుగు" },
  { code: "th", name: "Thaï", flag: "🇹🇭", nativeName: "ไทย" },
  { code: "tr", name: "Turc", flag: "🇹🇷", nativeName: "Türkçe" },
  { code: "tk", name: "Turkmène", flag: "🇹🇲", nativeName: "Türkmen" },
  { code: "uk", name: "Ukrainien", flag: "🇺🇦", nativeName: "Українська" },
  { code: "ur", name: "Ourdou", flag: "🇵🇰", nativeName: "اردو" },
  { code: "ug", name: "Ouïghour", flag: "🇨🇳", nativeName: "ئۇيغۇر" },
  { code: "uz", name: "Ouzbek", flag: "🇺🇿", nativeName: "O'zbek" },
  { code: "ve", name: "Venda", flag: "🇿🇦", nativeName: "Tshivenda" },
  { code: "vi", name: "Vietnamien", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  { code: "cy", name: "Gallois", flag: "🇬🇧", nativeName: "Cymraeg" },
  { code: "xh", name: "Xhosa", flag: "🇿🇦", nativeName: "isiXhosa" },
  { code: "yi", name: "Yiddish", flag: "🇮🇱", nativeName: "יידיש" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬", nativeName: "Yorùbá" },
  { code: "zu", name: "Zoulou", flag: "🇿🇦", nativeName: "isiZulu" },
];

// Fonction pour obtenir les informations d'une langue par son code
export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

// Fonction pour obtenir le nom d'affichage d'une langue
export function getLanguageDisplayName(code: string): string {
  const lang = getLanguageInfo(code);
  if (!lang) return code.toUpperCase();

  return `${lang.flag} ${lang.name}`;
}

// Fonction pour obtenir le nom natif d'une langue
export function getLanguageNativeName(code: string): string {
  const lang = getLanguageInfo(code);
  return lang?.nativeName || lang?.name || code.toUpperCase();
}
