import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Languages } from "lucide-react";
import { useLanguage, Language } from "../../../contexts/LanguageContext";

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function FloatingLanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg border shadow-md p-2">
        <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
          <SelectTrigger className="w-32 border-0 text-gray-800 hover:bg-gray-100 focus:ring-gray-300 h-8">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <SelectValue>
                <span className="flex items-center gap-1">
                  <span>{LANGUAGES.find(lang => lang.value === language)?.flag}</span>
                  <span className="text-sm font-medium">
                    {LANGUAGES.find(lang => lang.value === language)?.value.toUpperCase()}
                  </span>
                </span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="text-sm">{lang.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}