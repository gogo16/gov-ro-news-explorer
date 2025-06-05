
"""Configuration settings for the Romanian Government Scraper."""

import os
from typing import Dict, List

class ScraperConfig:
    # URLs
    BASE_URL = "https://gov.ro"
    MEETINGS_URL = "https://gov.ro/ro/guvernul/sedinte-guvern"
    
    # Selectors
    MEETING_DIV_CLASS = "sedinte_lista"
    CONTENT_SELECTORS = [
        '.article-content',
        '.content-main', 
        '.post-content',
        '#content',
        'main',
        '.main-content'
    ]
    
    # File paths
    DATA_FILE = "scraped_articles.json"
    LOG_FILE = "scraper.log"
    
    # Timing
    DAILY_CHECK_TIME = "09:00"  # 24-hour format
    REQUEST_TIMEOUT = 30
    SLEEP_BETWEEN_REQUESTS = 1  # seconds
    
    # AI Processing (for future OpenAI integration)
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    AI_MODEL = "gpt-3.5-turbo"
    AI_PROMPT_TEMPLATE = """
    Rewrite the following Romanian government news article to be easily understood by a 5-year-old child. 
    Use simple words, short sentences, and make it fun and engaging. Add appropriate emojis.
    
    Original text: {text}
    
    Simplified version for kids:
    """
    
    # Text processing
    MAX_CONTENT_LENGTH = 1000
    
    # Headers for web requests
    REQUEST_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    # Word replacements for kid-friendly text
    WORD_REPLACEMENTS = {
        'guvernul': 'echipa care conduce țara',
        'adoptat': 'a hotărât',
        'acte normative': 'reguli importante',
        'ședința': 'întâlnirea',
        'ministru': 'persoana importantă',
        'hotărâre': 'decizie',
        'economică': 'cu banii',
        'dezvoltare': 'să crească frumos',
        'implementare': 'să pună în practică',
        'parlamentul': 'casa mare unde se fac legile',
        'buget': 'banii pe care îi avem',
        'legislație': 'regulile țării',
        'regulament': 'regulă importantă',
        'procedură': 'cum se face ceva',
        'strategie': 'planul mare',
        'investiție': 'să pună bani ca să crească ceva',
        'infrastructură': 'drumuri și clădiri importante',
        'digitalizare': 'să folosim mai mult computerul',
        'sustenabilitate': 'să păstrăm natura frumoasă',
        'transparență': 'să spunem adevărul despre tot'
    }
    
    # Fun endings for different types of content
    FUN_ENDINGS = {
        'decision': " Este ca și cum ar fi o echipă mare care se gândește cum să facă totul mai frumos! 🏛️✨",
        'money': " Au planuit cum să cheltuiască banii pentru școli, parcuri și drumuri mai bune! 💰🎯",
        'law': " Au făcut reguli noi ca să fim toți mai fericiți și în siguranță! 📜⭐",
        'meeting': " S-au întâlnit ca niște prieteni care vor să facă lucruri bune pentru toți! 🤝🌟",
        'default': " Lucrează pentru ca România să fie și mai frumoasă! 🇷🇴❤️"
    }

# Example usage configuration
SCRAPER_SETTINGS = {
    'check_frequency': 'daily',
    'notification_enabled': True,
    'backup_enabled': True,
    'ai_processing': True,
    'debug_mode': False
}
