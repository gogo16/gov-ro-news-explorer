
"""Configuration settings for the Romanian Government Scraper."""

import os
from typing import Dict, List

class ScraperConfig:
    # URLs - Government Sites
    BASE_URL = "https://gov.ro"
    MEETINGS_URL = "https://gov.ro/ro/guvernul/sedinte-guvern"
    
    # URLs - MAI (Ministry of Internal Affairs)
    MAI_BASE_URL = "https://www.mai.gov.ro"
    MAI_NEWS_URL = "https://www.mai.gov.ro/category/comunicate-de-presa/"
    
    # URLs - MS (Ministry of Health)
    MS_BASE_URL = "https://www.ms.ro"
    MS_NEWS_URL = "https://www.ms.ro/ro/informatii-de-interes-public/noutati/"
    
    # Selectors - Government
    MEETING_DIV_CLASS = "sedinte_lista"
    CONTENT_SELECTORS = [
        '.pageDescription',  # Primary selector for detailed content
        '.article-content',
        '.content-main', 
        '.post-content',
        '#content',
        'main',
        '.main-content'
    ]
    
    # Selectors - MAI
    MAI_ARTICLE_SELECTOR = ".excerpt-big-article"
    MAI_TITLE_SELECTOR = ".title-big-article a"
    MAI_CONTENT_SELECTORS = [
        '.entry-content',
        '.post-content',
        '.article-content',
        'main .content',
        '.page-content'
    ]
    
    # Selectors - MS
    MS_ARTICLE_SELECTOR = ".news-list article"
    MS_TITLE_SELECTOR = "h3 a, .title a, a[title]"
    MS_CONTENT_SELECTORS = [
        '.content',
        '.entry-content',
        '.post-content',
        '.article-content',
        'main'
    ]
    
    # Website configurations
    WEBSITES = {
        'gov': {
            'name': 'Guvernul României',
            'emoji': '🏛️',
            'base_url': BASE_URL,
            'news_url': MEETINGS_URL,
            'article_selector': f'div.{MEETING_DIV_CLASS}',
            'title_selector': 'a',
            'content_selectors': CONTENT_SELECTORS,
            'categories': ['infrastructure', 'budget', 'agriculture', 'education', 'general']
        },
        'mai': {
            'name': 'Ministerul Afacerilor Interne',
            'emoji': '🛡️',
            'base_url': MAI_BASE_URL,
            'news_url': MAI_NEWS_URL,
            'article_selector': MAI_ARTICLE_SELECTOR,
            'title_selector': MAI_TITLE_SELECTOR,
            'content_selectors': MAI_CONTENT_SELECTORS,
            'categories': ['defense', 'law', 'general']
        },
        'ms': {
            'name': 'Ministerul Sănătății',
            'emoji': '🏥',
            'base_url': MS_BASE_URL,
            'news_url': MS_NEWS_URL,
            'article_selector': MS_ARTICLE_SELECTOR,
            'title_selector': MS_TITLE_SELECTOR,
            'content_selectors': MS_CONTENT_SELECTORS,
            'categories': ['health', 'general']
        }
    }
    
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
            'keywords': ['buget', 'bani', 'finanțare', 'cheltuieli', 'venituri', 'investiții', 'economie', 'financiar', 'lei', 'milioane'],
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
            'keywords': ['sănătate', 'spitale', 'medici', 'tratament', 'medicină', 'pacienți', 'asigurări', 'coronavirus', 'covid', 'vaccinare'],
            'emoji': '🏥',
            'name': 'Sănătate'
        },
        'infrastructure': {
            'keywords': ['drumuri', 'poduri', 'construcții', 'transport', 'autostrăzi', 'infrastructură', 'expropriere', 'botoșani', 'centură'],
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
            'keywords': ['lege', 'juridic', 'justiție', 'tribunal', 'regulament', 'normativ', 'penal', 'civil'],
            'emoji': '⚖️',
            'name': 'Legi și Justiție'
        },
        'defense': {
            'keywords': ['apărare', 'armată', 'securitate', 'militari', 'NATO', 'pompieri', 'situații de urgență', 'poliție', 'jandarmerie'],
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
    
    # ... keep existing code (WORD_REPLACEMENTS, FUN_ENDINGS, SCRAPER_SETTINGS)
    
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
        'optimizare': 'să facă mai bine',
        'expropriere': 'să cumpere case și terenuri',
        'imobile': 'case și terenuri',
        'utilitate publică': 'pentru toată lumea',
        'hotărâre de guvern': 'decizia echipei care conduce țara',
        'pompieri': 'eroii care sting focul',
        'situații de urgență': 'când se întâmplă lucruri rele',
        'poliție': 'oamenii care ne protejează',
        'jandarmerie': 'soldații care păzesc orașul',
        'spital': 'casa unde ne vindecă doctorii',
        'medicament': 'pastilele care ne fac bine'
    }
    
    # Fun endings for different categories
    FUN_ENDINGS = {
        'agriculture': " Fermele și animalele vor fi mai fericite! 🐄🌾",
        'budget': " Banii vor fi cheltuiți pentru lucruri importante care ne ajută pe toți! 💰✨",
        'people': " Toate familiile vor fi și mai fericite și mai în siguranță! 👨‍👩‍👧‍👦❤️",
        'education': " Școlile vor fi și mai frumoase pentru toți copiii! 📚🎒",
        'health': " Doctorii vor putea să ne ajute și mai bine când suntem bolnavi! 👩‍⚕️💊",
        'infrastructure': " Drumurile vor fi mai frumoase și mai sigure! 🚗🛣️",
        'environment': " Natura va fi și mai verde și curată! 🌳🦋",
        'technology': " Computerele ne vor ajuta să facem lucruri foarte cool! 💻🚀",
        'law': " Regulile vor fi mai clare pentru toată lumea! 📜⚖️",
        'defense': " Țara noastră va fi în siguranță și pompierii ne vor proteja! 🛡️🚒",
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
