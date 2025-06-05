
#!/usr/bin/env python3
"""
Romanian Government Website Scraper
Monitors multiple government websites for new articles
and processes them with AI to make them kid-friendly.
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import os
from datetime import datetime, timedelta
import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple
import schedule
import logging
from scraper_config import ScraperConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)

@dataclass
class Article:
    id: str
    date: str
    title: str
    original_content: str
    simplified_content: str
    detailed_points: List[str]
    category: str
    category_emoji: str
    category_name: str
    url: str
    scraped_at: str
    source: str  # Added source field
    is_new: bool = True

class MultiWebsiteScraper:
    def __init__(self):
        self.data_file = ScraperConfig.DATA_FILE
        self.last_article_ids = self.load_last_article_ids()
        self.headers = ScraperConfig.REQUEST_HEADERS

    def load_last_article_ids(self) -> dict:
        """Load the last processed article IDs for each website."""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    last_ids = {}
                    for source in ScraperConfig.WEBSITES.keys():
                        source_articles = [a for a in data if a.get('source') == source]
                        if source_articles:
                            last_ids[source] = source_articles[0]['id']
                    return last_ids
        except Exception as e:
            logging.error(f"Error loading last article IDs: {e}")
        return {}

    def categorize_content(self, text: str, source: str) -> Tuple[str, str, str]:
        """Categorize content based on keywords and source, return category info."""
        text_lower = text.lower()
        
        # Get preferred categories for this source
        website_config = ScraperConfig.WEBSITES[source]
        preferred_categories = website_config.get('categories', [])
        
        # Check preferred categories first
        for category_key in preferred_categories:
            if category_key == 'general':
                continue
            category_data = ScraperConfig.CATEGORIES[category_key]
            keywords = category_data['keywords']
            if any(keyword in text_lower for keyword in keywords):
                return (
                    category_key,
                    category_data['emoji'],
                    category_data['name']
                )
        
        # Check all other categories
        for category_key, category_data in ScraperConfig.CATEGORIES.items():
            if category_key == 'general' or category_key in preferred_categories:
                continue
                
            keywords = category_data['keywords']
            if any(keyword in text_lower for keyword in keywords):
                return (
                    category_key,
                    category_data['emoji'],
                    category_data['name']
                )
        
        # Default to general category
        general_cat = ScraperConfig.CATEGORIES['general']
        return ('general', general_cat['emoji'], general_cat['name'])

    def get_latest_articles_gov(self) -> List[tuple]:
        """Scrape gov.ro for latest articles."""
        try:
            website_config = ScraperConfig.WEBSITES['gov']
            logging.info(f"Fetching GOV articles from: {website_config['news_url']}")
            
            response = requests.get(website_config['news_url'], headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all sedinte_lista divs
            meeting_divs = soup.find_all('div', class_='sedinte_lista')
            links = []
            
            for div in meeting_divs:
                # Extract date from ID (e.g., sed_04_Iun -> 04_Iun)
                div_id = div.get('id', '')
                if div_id.startswith('sed_'):
                    date_part = div_id.replace('sed_', '')
                    
                    # Look for links within this div
                    link_elements = div.find_all('a', href=True)
                    for link in link_elements:
                        href = link['href']
                        if href.startswith('/'):
                            full_url = website_config['base_url'] + href
                        else:
                            full_url = href
                            
                        title = link.get_text(strip=True)
                        if title and 'informatie' in title.lower():
                            links.append((div_id, full_url, title, date_part, 'gov'))
            
            logging.info(f"Found {len(links)} GOV articles")
            return links
            
        except Exception as e:
            logging.error(f"Error fetching GOV articles: {e}")
            return []

    def get_latest_articles_mai(self) -> List[tuple]:
        """Scrape mai.gov.ro for latest articles."""
        try:
            website_config = ScraperConfig.WEBSITES['mai']
            logging.info(f"Fetching MAI articles from: {website_config['news_url']}")
            
            response = requests.get(website_config['news_url'], headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find articles using the specified selector
            article_divs = soup.select(website_config['article_selector'])
            links = []
            
            for i, div in enumerate(article_divs[:10]):  # Limit to latest 10
                # Extract title and link
                title_element = div.select_one(website_config['title_selector'])
                if title_element:
                    href = title_element.get('href', '')
                    title = title_element.get_text(strip=True)
                    
                    if href.startswith('/'):
                        full_url = website_config['base_url'] + href
                    else:
                        full_url = href
                    
                    # Generate ID and date
                    article_id = f"mai_{i+1}_{datetime.now().strftime('%d_%b')}"
                    date_part = datetime.now().strftime('%d %B %Y')
                    
                    links.append((article_id, full_url, title, date_part, 'mai'))
            
            logging.info(f"Found {len(links)} MAI articles")
            return links
            
        except Exception as e:
            logging.error(f"Error fetching MAI articles: {e}")
            return []

    def get_latest_articles_ms(self) -> List[tuple]:
        """Scrape ms.ro for latest articles."""
        try:
            website_config = ScraperConfig.WEBSITES['ms']
            logging.info(f"Fetching MS articles from: {website_config['news_url']}")
            
            response = requests.get(website_config['news_url'], headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find articles using the specified selector
            article_elements = soup.select(website_config['article_selector'])
            links = []
            
            for i, article in enumerate(article_elements[:10]):  # Limit to latest 10
                # Extract title and link
                title_element = article.select_one(website_config['title_selector'])
                if title_element:
                    href = title_element.get('href', '')
                    title = title_element.get_text(strip=True)
                    
                    if href.startswith('/'):
                        full_url = website_config['base_url'] + href
                    else:
                        full_url = href
                    
                    # Generate ID and date
                    article_id = f"ms_{i+1}_{datetime.now().strftime('%d_%b')}"
                    date_part = datetime.now().strftime('%d %B %Y')
                    
                    links.append((article_id, full_url, title, date_part, 'ms'))
            
            logging.info(f"Found {len(links)} MS articles")
            return links
            
        except Exception as e:
            logging.error(f"Error fetching MS articles: {e}")
            return []

    def scrape_article_content(self, url: str, source: str) -> Tuple[str, BeautifulSoup]:
        """Scrape the full content from an article page and return both text and soup."""
        try:
            logging.info(f"Scraping {source.upper()} article content from: {url}")
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Get content selectors for this source
            website_config = ScraperConfig.WEBSITES[source]
            content_selectors = website_config['content_selectors']
            
            # Try different selectors for content
            content = ""
            for selector in content_selectors:
                content_div = soup.select_one(selector)
                if content_div:
                    content = content_div.get_text(separator=' ', strip=True)
                    break
            
            # If no specific content div found, try to get all paragraphs
            if not content:
                paragraphs = soup.find_all('p')
                content = ' '.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
            
            # Clean up the content
            content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with single space
            content = content.strip()
            
            logging.info(f"Extracted {len(content)} characters of content from {source.upper()}")
            return content, soup
            
        except Exception as e:
            logging.error(f"Error scraping {source.upper()} article content: {e}")
            return "", None

    # ... keep existing code (extract_detailed_points_from_structured_content, parse_government_sections, simplify_government_decision, extract_detailed_points, simplify_sentence, simplify_text_for_kids methods)

    def extract_detailed_points_from_structured_content(self, soup: BeautifulSoup, source: str) -> List[str]:
        """Extract detailed points from the structured content based on source."""
        points = []
        
        if source == 'gov':
            # Use existing logic for government content
            page_desc = soup.find('div', class_='pageDescription')
            if not page_desc:
                logging.warning("No pageDescription div found, trying alternative selectors")
                for selector in ScraperConfig.CONTENT_SELECTORS:
                    page_desc = soup.select_one(selector)
                    if page_desc:
                        break
            
            if page_desc:
                content_text = page_desc.get_text(separator='\n', strip=True)
                logging.info(f"Found pageDescription content: {len(content_text)} characters")
                
                sections = self.parse_government_sections(content_text)
                
                for section in sections:
                    simplified_point = self.simplify_government_decision(section)
                    if simplified_point:
                        points.append(simplified_point)
        
        else:
            # For MAI and MS, extract from paragraphs and structure
            content_text = soup.get_text(separator='\n', strip=True)
            sections = content_text.split('\n')
            
            for section in sections:
                section = section.strip()
                if len(section) > 50:  # Only meaningful sections
                    simplified_point = self.simplify_content_by_source(section, source)
                    if simplified_point:
                        points.append(simplified_point)
        
        # Ensure we have at least some points
        if not points:
            logging.warning(f"No structured points found for {source.upper()}, falling back to generic extraction")
            points = self.get_default_points_by_source(source)
        
        return points[:6]  # Limit to 6 points for readability

    def simplify_content_by_source(self, content: str, source: str) -> str:
        """Simplify content based on the source website."""
        content_lower = content.lower()
        
        if source == 'mai':
            if any(word in content_lower for word in ['poliție', 'poliția', 'policist']):
                return "Poliția lucrează să ne protejeze și să ne țină în siguranță! 👮‍♂️🚔"
            elif any(word in content_lower for word in ['pompieri', 'incendiu', 'foc']):
                return "Pompierii se pregătesc să stingă focurile și să ne salveze! 🚒👨‍🚒"
            elif any(word in content_lower for word in ['jandarmerie', 'jandarmi']):
                return "Jandarmii păzesc orașul și ne ajută când avem evenimente! 🛡️👮‍♀️"
            elif any(word in content_lower for word in ['securitate', 'siguranța']):
                return "Lucrează ca să fim toți în siguranță în casele noastre! 🏠🔒"
        
        elif source == 'ms':
            if any(word in content_lower for word in ['spital', 'spitale', 'medici']):
                return "Doctorii din spitale vor putea să ne ajute și mai bine! 🏥👩‍⚕️"
            elif any(word in content_lower for word in ['medicament', 'medicamente', 'pastile']):
                return "Vor fi mai multe medicamente ca să ne facă bine când suntem bolnavi! 💊💚"
            elif any(word in content_lower for word in ['vaccinare', 'vaccin', 'imunizare']):
                return "Doctorilor le place să ne dea vaccinuri ca să nu ne îmbolnăvim! 💉🛡️"
            elif any(word in content_lower for word in ['sănătate', 'îngrijire']):
                return "Se gândesc cum să ne țină sănătoși și fericiți! 😊💚"
        
        return ""

    def get_default_points_by_source(self, source: str) -> List[str]:
        """Get default points based on source when no specific content found."""
        if source == 'mai':
            return [
                "Poliția lucrează zi și noapte să ne protejeze! 👮‍♂️🌙",
                "Pompierii se antrenează să stingă focurile repede! 🚒🔥",
                "Jandarmii păzesc să fim toți în siguranță! 🛡️👥",
                "Fac planuri să ne ajute când avem probleme! 📋❤️"
            ]
        elif source == 'ms':
            return [
                "Doctorii învață lucruri noi ca să ne îngrijească mai bine! 👩‍⚕️📚",
                "Spitalele vor avea aparate noi și moderne! 🏥⚡",
                "Vor fi mai multe medicamente pentru copii! 💊👶",
                "Se gândesc cum să ne țină sănătoși și fericiți! 😊💚"
            ]
        else:  # gov
            return [
                "Au luat decizii importante pentru țara noastră 🏛️",
                "Au gândit cum să facă lucrurile mai bune pentru toată lumea 💭",
                "Au vorbit despre cum să ne ajute pe toți să fim mai fericiți 😊"
            ]

    def parse_government_sections(self, content: str) -> List[str]:
        """Parse the government content into structured sections."""
        sections = []
        
        # Split by HOTĂRÂRE DE GUVERN or NOTE sections
        lines = content.split('\n')
        current_section = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if this is a new section header
            if (line.startswith('HOTĂRÂRE DE GUVERN') or 
                line.startswith('ORDONANȚĂ') or 
                line.startswith('NOTE') or 
                line.startswith('NOTĂ') or
                re.match(r'^\d+\.', line)):
                
                # Save previous section if it exists
                if current_section:
                    sections.append('\n'.join(current_section))
                    current_section = []
                
                current_section.append(line)
            else:
                if current_section:  # Only add if we're in a section
                    current_section.append(line)
        
        # Add the last section
        if current_section:
            sections.append('\n'.join(current_section))
        
        # Filter out very short sections
        sections = [s for s in sections if len(s.strip()) > 50]
        
        logging.info(f"Parsed {len(sections)} structured sections")
        return sections

    def simplify_government_decision(self, section: str) -> str:
        """Simplify a government decision section for kids."""
        section_lower = section.lower()
        
        # Identify the type and create appropriate simplification
        if 'expropriere' in section_lower and 'botoşani' in section_lower:
            return "Au hotărât să construiască un drum nou în jurul orașului Botoșani ca să nu mai fie aglomerat centrul! 🛣️💰"
        
        elif 'pompieri' in section_lower or 'situaţii de urgenţă' in section_lower:
            return "Au planuit să construiască o casă nouă pentru pompierii care ne salvează când avem probleme! 🚒👨‍🚒"
        
        elif 'agricultură' in section_lower or 'fermieri' in section_lower:
            return "Au luat măsuri să ajute fermierii să crească legume și fructe mai frumoase! 🚜🥕"
        
        elif 'buget' in section_lower or 'bani' in section_lower or 'lei' in section_lower:
            return "Au hotărât cum să cheltuie banii țării pentru lucruri importante care ne ajută pe toți! 💰📊"
        
        elif 'școli' in section_lower or 'educație' in section_lower:
            return "Au planuit să facă școlile și mai frumoase pentru toți copiii! 🎓📚"
        
        elif 'spital' in section_lower or 'sănătate' in section_lower:
            return "Au gândit cum să facă spitalele mai bune ca doctorii să ne ajute mai repede! 🏥👩‍⚕️"
        
        elif 'drum' in section_lower or 'infrastructură' in section_lower:
            return "Au planuit să construiască drumuri noi și mai frumoase! 🛣️🚧"
        
        elif 'mediu' in section_lower or 'natură' in section_lower:
            return "Au făcut reguli noi ca să păstrăm natura verde și frumoasă! 🌱🌳"
        
        elif 'energie' in section_lower:
            return "Au hotărât să folosim energie curată ca să nu poluăm aerul! ⚡🌍"
        
        elif 'digitalizare' in section_lower or 'tehnologie' in section_lower:
            return "Au planuit să folosim mai multe computere ca să facă totul mai ușor! 💻🚀"
        
        else:
            # Generic simplification based on keywords
            if any(word in section_lower for word in ['adoptat', 'aprobat', 'hotărât']):
                return "Au luat o decizie importantă care ne va ajuta pe toți! ✨🏛️"
            else:
                return "Au discutat despre lucruri importante pentru țara noastră! 💭🇷🇴"

    def extract_detailed_points(self, content: str) -> List[str]:
        """Extract detailed points from content and convert to kid-friendly format."""
        # Split content into sentences and filter meaningful ones
        sentences = re.split(r'[.!?]+', content)
        points = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20 and any(word in sentence.lower() for word in 
                ['adoptat', 'aprobat', 'hotărât', 'stabilit', 'decis', 'măsuri']):
                
                # Simplify the sentence
                simplified = self.simplify_sentence(sentence)
                if simplified:
                    points.append(simplified)
        
        # Ensure we have at least some points
        if not points:
            points = [
                "Au luat decizii importante pentru țara noastră 🏛️",
                "Au gândit cum să facă lucrurile mai bune pentru toată lumea 💭",
                "Au vorbit despre cum să ne ajute pe toți să fim mai fericiți 😊"
            ]
        
        return points[:4]  # Limit to 4 points for readability

    def simplify_sentence(self, sentence: str) -> str:
        """Simplify a single sentence for kids."""
        sentence_lower = sentence.lower()
        
        # Apply word replacements
        for old_word, new_word in ScraperConfig.WORD_REPLACEMENTS.items():
            sentence_lower = sentence_lower.replace(old_word, new_word)
        
        # Add appropriate emojis based on content
        if any(word in sentence_lower for word in ['bani', 'buget', 'finanțare']):
            sentence_lower += " 💰"
        elif any(word in sentence_lower for word in ['școli', 'educație', 'copii']):
            sentence_lower += " 🎓"
        elif any(word in sentence_lower for word in ['sănătate', 'spitale', 'medici']):
            sentence_lower += " 🏥"
        elif any(word in sentence_lower for word in ['drumuri', 'transport']):
            sentence_lower += " 🛣️"
        elif any(word in sentence_lower for word in ['natură', 'mediu', 'verde']):
            sentence_lower += " 🌱"
        
        # Capitalize first letter
        if sentence_lower:
            sentence_lower = sentence_lower[0].upper() + sentence_lower[1:]
        
        return sentence_lower if len(sentence_lower) > 10 else ""

    def simplify_text_for_kids(self, text: str, category: str) -> str:
        """
        Simplify text for 5-year-olds using AI-like processing.
        In a real implementation, this would call OpenAI API.
        """
        logging.info("Simplifying text for kids...")
        
        # Simple rules-based approach for demonstration
        simplified = text.lower()
        
        # Apply word replacements
        for old, new in ScraperConfig.WORD_REPLACEMENTS.items():
            simplified = simplified.replace(old, new)
        
        # Add category-specific fun ending
        if category in ScraperConfig.FUN_ENDINGS:
            simplified += ScraperConfig.FUN_ENDINGS[category]
        else:
            simplified += ScraperConfig.FUN_ENDINGS['general']
            
        # Capitalize first letter
        simplified = simplified[0].upper() + simplified[1:] if simplified else ""
        
        return simplified

    def save_articles(self, articles: List[Article]):
        """Save articles to JSON file."""
        try:
            articles_dict = [asdict(article) for article in articles]
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(articles_dict, f, ensure_ascii=False, indent=2)
            logging.info(f"Saved {len(articles)} articles to {self.data_file}")
        except Exception as e:
            logging.error(f"Error saving articles: {e}")

    def check_for_new_articles(self) -> List[Article]:
        """Check for new articles from all sources and process them."""
        logging.info("Checking for new articles from all sources...")
        
        all_new_articles = []
        
        # Check each website
        for source in ['gov', 'mai', 'ms']:
            try:
                if source == 'gov':
                    links = self.get_latest_articles_gov()
                elif source == 'mai':
                    links = self.get_latest_articles_mai()
                elif source == 'ms':
                    links = self.get_latest_articles_ms()
                else:
                    continue
                
                new_articles = []
                last_id = self.last_article_ids.get(source)
                
                for article_id, url, title, date_part, article_source in links:
                    # Check if this is a new article for this source
                    if last_id and article_id == last_id:
                        logging.info(f"Reached last processed article for {source.upper()}: {article_id}")
                        break
                        
                    # Scrape the article content
                    original_content, soup = self.scrape_article_content(url, source)
                    if not original_content:
                        logging.warning(f"No content found for {source.upper()} article: {url}")
                        continue
                    
                    # Categorize content
                    category, category_emoji, category_name = self.categorize_content(original_content, source)
                    
                    # Extract detailed points using the new structured method
                    if soup:
                        detailed_points = self.extract_detailed_points_from_structured_content(soup, source)
                    else:
                        detailed_points = self.extract_detailed_points(original_content)
                    
                    # Simplify for kids
                    simplified_content = self.simplify_text_for_kids(original_content, category)
                    
                    # Truncate original content if too long
                    display_content = original_content[:ScraperConfig.MAX_CONTENT_LENGTH]
                    if len(original_content) > ScraperConfig.MAX_CONTENT_LENGTH:
                        display_content += "..."
                    
                    # Create article object
                    article = Article(
                        id=article_id,
                        date=date_part,
                        title=title,
                        original_content=display_content,
                        simplified_content=simplified_content,
                        detailed_points=detailed_points,
                        category=category,
                        category_emoji=category_emoji,
                        category_name=category_name,
                        url=url,
                        scraped_at=datetime.now().isoformat(),
                        source=source,
                        is_new=True
                    )
                    
                    new_articles.append(article)
                    logging.info(f"Processed new {source.upper()} article: {article_id} (Category: {category_name})")
                    logging.info(f"Extracted {len(detailed_points)} detailed points")
                    
                    # Update last article ID for this source
                    if not self.last_article_ids.get(source):
                        self.last_article_ids[source] = article_id
                
                all_new_articles.extend(new_articles)
                
                # Sleep between sources to be respectful
                time.sleep(ScraperConfig.SLEEP_BETWEEN_REQUESTS)
                
            except Exception as e:
                logging.error(f"Error processing {source.upper()} articles: {e}")
                continue
        
        if all_new_articles:
            # Load existing articles and merge
            existing_articles = self.load_existing_articles()
            all_articles = all_new_articles + existing_articles
            self.save_articles(all_articles)
            
            # Update last article IDs to the newest ones
            for article in all_new_articles:
                if not self.last_article_ids.get(article.source):
                    self.last_article_ids[article.source] = article.id
        
        logging.info(f"Found {len(all_new_articles)} new articles across all sources")
        return all_new_articles

    def load_existing_articles(self) -> List[Article]:
        """Load existing articles from storage."""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return [Article(**item) for item in data]
        except Exception as e:
            logging.error(f"Error loading existing articles: {e}")
        return []

    def run_daily_check(self):
        """Run the daily check for new articles from all sources."""
        logging.info("Running daily check for all sources...")
        new_articles = self.check_for_new_articles()
        
        if new_articles:
            by_source = {}
            for article in new_articles:
                if article.source not in by_source:
                    by_source[article.source] = []
                by_source[article.source].append(article)
            
            logging.info(f"✅ Found {len(new_articles)} new articles total!")
            for source, articles in by_source.items():
                source_name = ScraperConfig.WEBSITES[source]['name']
                logging.info(f"  📰 {source_name}: {len(articles)} articles")
                for article in articles:
                    logging.info(f"    - {article.title} ({article.id}) - {article.category_emoji} {article.category_name}")
        else:
            logging.info("ℹ️  No new articles found from any source.")

def main():
    """Main function to run the multi-website scraper."""
    scraper = MultiWebsiteScraper()
    
    # Schedule daily checks at 9 AM
    schedule.every().day.at(ScraperConfig.DAILY_CHECK_TIME).do(scraper.run_daily_check)
    
    # Run an initial check
    scraper.run_daily_check()
    
    # Keep the script running
    logging.info(f"Multi-website scraper is running. Scheduled to check daily at {ScraperConfig.DAILY_CHECK_TIME}.")
    logging.info("Monitoring: GOV.RO, MAI.GOV.RO, MS.RO")
    logging.info("Press Ctrl+C to stop.")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute for scheduled tasks
    except KeyboardInterrupt:
        logging.info("Multi-website scraper stopped by user.")

if __name__ == "__main__":
    main()
