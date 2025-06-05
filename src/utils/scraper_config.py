
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
    Break down each important point into separate paragraphs explaining what it means.
    
    Original text: {text}
    
    Simplified version for kids:
    """
    
    # Text processing
    MAX_CONTENT_LENGTH = 2000  # Increased for more details
    
    # Headers for web requests
    REQUEST_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    # Category detection keywords and emojis
    CATEGORIES = {
        'agriculture': {
            'keywords': ['agricultură', 'fermieri', 'culturi', 'animale', 'recoltă', 'pământ', 'semințe', 'tractoare'],
            'emoji': '🚜',
            'name': 'Agricultură'
        },
        'budget': {
            'keywords': ['buget', 'bani', 'finanțare', 'cheltuieli', 'venituri', 'investiții', 'economie', 'financiar'],
            'emoji': '💰',
            'name': 'Buget și Finanțe'
        },
        'people': {
            'keywords': ['cetățeni', 'populație', 'oameni', 'familii', 'copii', 'pensionari', 'tineri', 'social'],
            'emoji': '👥',
            'name': 'Oameni și Societate'
        },
        'education': {
            'keywords': ['educație', 'școli', 'universități', 'elevi', 'studenți', 'învățământ', 'profesori'],
            'emoji': '🎓',
            'name': 'Educație'
        },
        'health': {
            'keywords': ['sănătate', 'spitale', 'medici', 'tratament', 'medicină', 'pacienți', 'asigurări'],
            'emoji': '🏥',
            'name': 'Sănătate'
        },
        'infrastructure': {
            'keywords': ['drumuri', 'poduri', 'construcții', 'transport', 'autostrăzi', 'infrastructură'],
            'emoji': '🛣️',
            'name': 'Infrastructură'
        },
        'environment': {
            'keywords': ['mediu', 'natură', 'poluare', 'ecologie', 'sustenabilitate', 'energie verde'],
            'emoji': '🌱',
            'name': 'Mediu'
        },
        'technology': {
            'keywords': ['digitalizare', 'tehnologie', 'computer', 'internet', 'digital', 'IT'],
            'emoji': '💻',
            'name': 'Tehnologie'
        },
        'law': {
            'keywords': ['lege', 'juridic', 'justiție', 'tribunal', 'regulament', 'normativ'],
            'emoji': '⚖️',
            'name': 'Legi și Justiție'
        },
        'defense': {
            'keywords': ['apărare', 'armată', 'securitate', 'militari', 'NATO'],
            'emoji': '🛡️',
            'name': 'Apărare și Securitate'
        },
        'international': {
            'keywords': ['extern', 'internațional', 'UE', 'Europa', 'relații', 'diplomație'],
            'emoji': '🌍',
            'name': 'Relații Internaționale'
        },
        'general': {
            'keywords': [],
            'emoji': '🏛️',
            'name': 'General'
        }
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
        'transparență': 'să spunem adevărul despre tot',
        'cetățeni': 'oamenii din țară',
        'eficiență': 'să facă lucrurile mai bine și mai repede',
        'măsuri': 'lucruri pe care le fac',
        'implementarea': 'să pună în practică',
        'optimizare': 'să facă mai bine'
    }
    
    # Fun endings for different categories
    FUN_ENDINGS = {
        'agriculture': " Fermele și animalele vor fi mai fericite! 🐄🌾",
        'budget': " Banii vor fi cheltuiți pentru lucruri importante care ne ajută pe toți! 💰✨",
        'people': " Toate familiile vor fi mai fericite și mai în siguranță! 👨‍👩‍👧‍👦❤️",
        'education': " Școlile vor fi și mai frumoase pentru toți copiii! 📚🎒",
        'health': " Doctorii vor putea să ne ajute și mai bine când suntem bolnavi! 👩‍⚕️💊",
        'infrastructure': " Drumurile vor fi mai frumoase și mai sigure! 🚗🛣️",
        'environment': " Natura va fi și mai verde și curată! 🌳🦋",
        'technology': " Computerele ne vor ajuta să facem lucruri foarte cool! 💻🚀",
        'law': " Regulile vor fi mai clare pentru toată lumea! 📜⚖️",
        'defense': " Țara noastră va fi în siguranță! 🛡️🏰",
        'international': " Ne vom înțelege și mai bine cu prietenii din alte țări! 🤝🌍",
        'general': " Lucrează pentru ca România să fie și mai frumoasă! 🇷🇴❤️"
    }

# Example usage configuration
SCRAPER_SETTINGS = {
    'check_frequency': 'daily',
    'notification_enabled': True,
    'backup_enabled': True,
    'ai_processing': True,
    'debug_mode': False,
    'extract_detailed_points': True,
    'categorize_content': True
}
