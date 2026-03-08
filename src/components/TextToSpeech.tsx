import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  language: 'ro' | 'en';
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, language }) => {
  const [speaking, setSpeaking] = useState(false);

  const toggle = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ro' ? 'ro-RO' : 'en-GB';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [text, language, speaking]);

  if (!('speechSynthesis' in window)) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-2"
    >
      {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {speaking
        ? (language === 'ro' ? 'Oprește' : 'Stop')
        : (language === 'ro' ? 'Ascultă' : 'Listen')
      }
    </Button>
  );
};

export default TextToSpeech;
