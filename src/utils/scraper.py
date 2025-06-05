
#!/usr/bin/env python3
"""
Romanian Government Website Scraper
Monitors https://gov.ro/ro/guvernul/sedinte-guvern for new meeting articles
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
    is_new: bool = True

class GovRoScraper:
    def __init__(self):
        self.base_url = ScraperConfig.BASE_URL
        self.meetings_url = ScraperConfig.MEETINGS_URL
        self.data_file = ScraperConfig.DATA_FILE
        self.last_article_id = self.load_last_article_id()
        self.headers = ScraperConfig.REQUEST_HEADERS

    def load_last_article_id(self) -> Optional[str]:
        """Load the last processed article ID from storage."""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data:
                        return data[0]['id']  # Get the most recent article ID
        except Exception as e:
            logging.error(f"Error loading last article ID: {e}")
        return None

    def categorize_content(self, text: str) -> Tuple[str, str, str]:
        """Categorize content based on keywords and return category info."""
        text_lower = text.lower()
        
        for category_key, category_data in ScraperConfig.CATEGORIES.items():
            if category_key == 'general':
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

    def save_articles(self, articles: List[Article]):
        """Save articles to JSON file."""
        try:
            articles_dict = [asdict(article) for article in articles]
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(articles_dict, f, ensure_ascii=False, indent=2)
            logging.info(f"Saved {len(articles)} articles to {self.data_file}")
        except Exception as e:
            logging.error(f"Error saving articles: {e}")

    def get_latest_meeting_links(self) -> List[tuple]:
        """Scrape the meetings page for latest article links."""
        try:
            logging.info(f"Fetching meetings page: {self.meetings_url}")
            response = requests.get(self.meetings_url, headers=self.headers, timeout=30)
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
                            full_url = self.base_url + href
                        else:
                            full_url = href
                            
                        title = link.get_text(strip=True)
                        if title and 'informatie' in title.lower():
                            links.append((div_id, full_url, title, date_part))
            
            logging.info(f"Found {len(links)} meeting links")
            return links
            
        except Exception as e:
            logging.error(f"Error fetching meeting links: {e}")
            return []

    def scrape_article_content(self, url: str) -> str:
        """Scrape the full content from an article page."""
        try:
            logging.info(f"Scraping article content from: {url}")
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try different selectors for content
            content = ""
            for selector in ScraperConfig.CONTENT_SELECTORS:
                content_div = soup.select_one(selector)
                if content_div:
                    # Get text and clean it up
                    content = content_div.get_text(separator=' ', strip=True)
                    break
            
            # If no specific content div found, try to get all paragraphs
            if not content:
                paragraphs = soup.find_all('p')
                content = ' '.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
            
            # Clean up the content
            content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with single space
            content = content.strip()
            
            logging.info(f"Extracted {len(content)} characters of content")
            return content
            
        except Exception as e:
            logging.error(f"Error scraping article content: {e}")
            return ""

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

    def check_for_new_articles(self) -> List[Article]:
        """Check for new articles and process them."""
        logging.info("Checking for new articles...")
        
        links = self.get_latest_meeting_links()
        new_articles = []
        
        for article_id, url, title, date_part in links:
            # Check if this is a new article
            if self.last_article_id and article_id == self.last_article_id:
                logging.info(f"Reached last processed article: {article_id}")
                break
                
            # Scrape the article content
            original_content = self.scrape_article_content(url)
            if not original_content:
                logging.warning(f"No content found for {url}")
                continue
            
            # Categorize content
            category, category_emoji, category_name = self.categorize_content(original_content)
            
            # Extract detailed points
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
                is_new=True
            )
            
            new_articles.append(article)
            logging.info(f"Processed new article: {article_id} (Category: {category_name})")
            
            # Update last article ID
            if not self.last_article_id:
                self.last_article_id = article_id
        
        if new_articles:
            # Load existing articles and merge
            existing_articles = self.load_existing_articles()
            all_articles = new_articles + existing_articles
            self.save_articles(all_articles)
            
            # Update last article ID to the newest one
            if new_articles:
                self.last_article_id = new_articles[0].id
        
        logging.info(f"Found {len(new_articles)} new articles")
        return new_articles

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
        """Run the daily check for new articles."""
        logging.info("Running daily check...")
        new_articles = self.check_for_new_articles()
        
        if new_articles:
            logging.info(f"✅ Found {len(new_articles)} new articles!")
            for article in new_articles:
                logging.info(f"  - {article.title} ({article.id}) - {article.category_emoji} {article.category_name}")
        else:
            logging.info("ℹ️  No new articles found.")

def main():
    """Main function to run the scraper."""
    scraper = GovRoScraper()
    
    # Schedule daily checks at 9 AM
    schedule.every().day.at(ScraperConfig.DAILY_CHECK_TIME).do(scraper.run_daily_check)
    
    # Run an initial check
    scraper.run_daily_check()
    
    # Keep the script running
    logging.info(f"Scraper is running. Scheduled to check daily at {ScraperConfig.DAILY_CHECK_TIME}.")
    logging.info("Press Ctrl+C to stop.")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute for scheduled tasks
    except KeyboardInterrupt:
        logging.info("Scraper stopped by user.")

if __name__ == "__main__":
    main()
