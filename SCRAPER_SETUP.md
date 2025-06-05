
# Romanian Government Web Scraper Setup Guide

## Overview
This web scraper monitors the Romanian Government website (gov.ro) for new meeting articles and automatically processes them into kid-friendly content using AI.

## Features
- ✅ Daily automated checking for new government articles
- ✅ Extracts full content from article pages
- ✅ AI-powered text simplification for 5-year-olds
- ✅ Persistent storage of scraped data
- ✅ Beautiful web dashboard for monitoring
- ✅ Logging and error handling
- ✅ Configurable scheduling

## Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables (Optional)
If you want to use OpenAI for better text simplification:
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Run the Scraper
```bash
cd src/utils
python scraper.py
```

### 4. View Results
The web dashboard at `http://localhost:8080` will show all scraped articles.

## Configuration

### Basic Settings
Edit `src/utils/scraper_config.py` to customize:
- Check frequency (default: daily at 9 AM)
- AI model settings
- Content selectors
- Output file locations

### Advanced AI Integration
To use OpenAI for better text simplification:

1. Install OpenAI library:
```bash
pip install openai
```

2. Update the `simplify_text_for_kids()` function in `scraper.py`:
```python
import openai

def simplify_text_for_kids(self, text: str) -> str:
    client = openai.OpenAI(api_key=ScraperConfig.OPENAI_API_KEY)
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user", 
            "content": ScraperConfig.AI_PROMPT_TEMPLATE.format(text=text)
        }],
        max_tokens=300,
        temperature=0.7
    )
    
    return response.choices[0].message.content
```

## How It Works

### 1. Website Monitoring
- Checks `https://gov.ro/ro/guvernul/sedinte-guvern` for new articles
- Looks for `div.sedinte_lista` elements with new IDs
- Compares against previously processed articles

### 2. Content Extraction
- Follows links to full article pages
- Extracts main content using multiple CSS selectors
- Cleans and formats text

### 3. AI Processing
- Simplifies complex government language
- Replaces technical terms with kid-friendly explanations
- Adds emojis and engaging language
- Makes content appropriate for 5-year-olds

### 4. Storage & Display
- Saves articles to JSON format
- Displays in beautiful web dashboard
- Shows both original and simplified versions

## File Structure
```
├── src/
│   ├── pages/Index.tsx          # Web dashboard
│   └── utils/
│       ├── scraper.py           # Main scraper script
│       └── scraper_config.py    # Configuration
├── requirements.txt             # Python dependencies
├── scraped_articles.json        # Stored articles (auto-generated)
└── scraper.log                 # Logs (auto-generated)
```

## Monitoring & Maintenance

### Logs
Check `scraper.log` for:
- Successful scraping operations
- Error messages
- Article processing status

### Data Storage
Articles are stored in `scraped_articles.json` with:
- Original content
- Simplified kid-friendly version
- Metadata (date, URL, etc.)
- Processing timestamps

### Scheduling
The scraper runs continuously and checks for new articles daily at 9 AM.
To change the schedule, modify the `schedule.every().day.at("09:00")` line in `scraper.py`.

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check internet connection
   - Government website might be temporarily down
   - Consider adding retry logic

2. **Content Not Found**
   - Website structure may have changed
   - Update CSS selectors in config
   - Check the website manually

3. **AI Processing Fails**
   - Verify OpenAI API key (if using)
   - Check API quota limits
   - Fallback to rule-based simplification

### Manual Testing
Run a one-time check:
```python
from scraper import GovRoScraper
scraper = GovRoScraper()
articles = scraper.check_for_new_articles()
print(f"Found {len(articles)} articles")
```

## Extending the Scraper

### Adding New Websites
1. Create new scraper class inheriting from base
2. Implement site-specific selectors
3. Add to main scraping loop

### Improving AI Processing
1. Experiment with different prompts
2. Add more sophisticated text processing
3. Train custom models for Romanian government text

### Adding Notifications
1. Integrate email/SMS alerts
2. Add Slack/Discord webhooks
3. Create RSS feeds

## Legal & Ethical Considerations
- Respects robots.txt
- Uses reasonable request delays
- Only scrapes publicly available information
- For educational/informational purposes
- Consider adding rate limiting for production use

## Support
For issues or questions:
1. Check the logs first
2. Review configuration settings
3. Test manually with a single URL
4. Create an issue with detailed error information
```

This comprehensive scraper system includes:
- **Beautiful Web Dashboard** with real-time monitoring
- **Full Python Scraper** with robust error handling
- **AI Integration** for text simplification
- **Automatic Scheduling** for daily checks
- **Persistent Storage** and logging
- **Configuration Management** for easy customization
- **Complete Documentation** for setup and usage

The scraper monitors the Romanian government website, detects new articles by checking for new `div.sedinte_lista` elements, extracts full content, and transforms it into engaging content that a 5-year-old could understand and enjoy!
