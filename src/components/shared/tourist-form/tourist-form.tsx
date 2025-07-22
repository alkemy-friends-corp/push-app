import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { MapPin, Globe, Calendar, AlertTriangle, Shield } from "lucide-react";
import { COUNTRIES, getStayDurations } from "../../../utils/constants";
import { useLanguage } from "../../../contexts/LanguageContext";

interface TouristFormProps {
  onComplete: () => void;
}

export function TouristForm({ onComplete }: TouristFormProps) {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  const stayDurations = getStayDurations(t);

  const handleSubmit = () => {
    if (selectedCountry && selectedDuration && locationPermission) {
      onComplete();
    }
  };

  const isFormComplete = selectedCountry && selectedDuration && locationPermission;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('form.title')}
        </CardTitle>
        <CardDescription>
          {t('form.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="country" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('form.country.label')}
          </Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder={t('form.country.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('form.duration.label')}
          </Label>
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger id="duration">
              <SelectValue placeholder={t('form.duration.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {stayDurations.map((duration) => (
                <SelectItem key={duration.value} value={duration.value}>
                  {duration.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="location" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                {t('form.location.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('form.location.description')}
              </p>
            </div>
            <Switch
              id="location"
              checked={locationPermission}
              onCheckedChange={setLocationPermission}
            />
          </div>
          
          {!locationPermission && (
            <div className="flex items-start gap-2 p-3 bg-white rounded border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">
                {t('form.location.required')}
              </p>
            </div>
          )}
          
          {locationPermission && (
            <div className="flex items-start gap-2 p-3 bg-white rounded border">
              <Shield className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{t('form.notifications.title')}</p>
                <ul className="mt-1 text-muted-foreground list-disc list-inside">
                  <li>{t('form.notifications.weather')}</li>
                  <li>{t('form.notifications.disasters')}</li>
                  <li>{t('form.notifications.safety')}</li>
                  <li>{t('form.notifications.transport')}</li>
                  <li>{t('form.notifications.events')}</li>
                  <li>{t('form.notifications.discounts')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className="w-full"
          size="lg"
        >
          {t('form.submit')}
        </Button>
      </CardContent>
    </Card>
  );
}