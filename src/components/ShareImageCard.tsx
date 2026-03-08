import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareImageCardProps {
  title: string;
  simplifiedContent: string;
  source: string;
  date: string;
  country: 'ro' | 'uk';
}

const ShareImageCard: React.FC<ShareImageCardProps> = ({ title, simplifiedContent, source, date, country }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generate = async (action: 'download' | 'share') => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      // Show the hidden card for rendering
      cardRef.current.style.display = 'block';
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 600,
        height: 400,
      });
      cardRef.current.style.display = 'none';

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(b => resolve(b!), 'image/png')
      );

      if (action === 'share' && navigator.share) {
        const file = new File([blob], 'friendly-gov-article.png', { type: 'image/png' });
        await navigator.share({
          title,
          text: simplifiedContent.substring(0, 100),
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'friendly-gov-article.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Share/download failed:', e);
    } finally {
      setGenerating(false);
    }
  };

  const isRo = country === 'ro';

  return (
    <>
      {/* Hidden render target */}
      <div
        ref={cardRef}
        style={{
          display: 'none',
          position: 'fixed',
          left: '-9999px',
          width: '600px',
          height: '400px',
          padding: '32px',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          color: '#064e3b',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7, marginBottom: '8px' }}>
          Friendly GOV {country === 'ro' ? '🇷🇴' : '🇬🇧'} • {source} • {date}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>
          {title.length > 100 ? title.substring(0, 100) + '…' : title}
        </div>
        <div style={{ fontSize: '15px', lineHeight: 1.6, opacity: 0.9 }}>
          {simplifiedContent.length > 280 ? simplifiedContent.substring(0, 280) + '…' : simplifiedContent}
        </div>
        <div style={{ position: 'absolute', bottom: '16px', right: '24px', fontSize: '11px', opacity: 0.5 }}>
          friendlygov.app
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generate('download')}
          disabled={generating}
          className="gap-2"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isRo ? 'Descarcă imagine' : 'Download image'}
        </Button>
        {typeof navigator.share === 'function' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => generate('share')}
            disabled={generating}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {isRo ? 'Distribuie' : 'Share'}
          </Button>
        )}
      </div>
    </>
  );
};

export default ShareImageCard;
