import json
import re
import pandas as pd
from jobspy import scrape_jobs
from datetime import datetime, date, timezone

def is_vue_important_and_india(job):
    title = str(job.get("title", "")).lower()
    location = str(job.get("location", "")).lower()
    
    # 1. Location filter (India only)
    is_india = False
    if not location or location in ["nan", "n/a", "none"]:
        is_india = True
    else:
        tokens = re.findall(r'\b\w+\b', location)
        if "in" in tokens or "india" in tokens or "ind" in tokens:
            is_india = True
        elif any(city in location for city in ["bengaluru", "bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai", "noida", "gurgaon", "gurugram", "kolkata", "ahmedabad", "jaipur"]):
            is_india = True
            
        # Exclude foreign countries
        for foreign in ["usa", "united states", "canada", "united kingdom", "uk", "germany", "france", "australia"]:
            if re.search(r'\b' + re.escape(foreign) + r'\b', location):
                is_india = False
                
    if not is_india:
        return False
        
    # 2. Title filter (Vue/Frontend/Fullstack importance)
    pos_patterns = [
        r'\bvue\b',
        r'\bfrontend\b',
        r'\bfront-end\b',
        r'\bfront\s+end\b',
        r'\bfullstack\b',
        r'\bfull-stack\b',
        r'\bfull\s+stack\b',
        r'\bui\b',
        r'\bweb\s+developer\b',
        r'\bweb\s+engineer\b'
    ]
    
    has_positive = any(re.search(pat, title) for pat in pos_patterns)
    if has_positive:
        # Exclude QA or non-developer/designer roles
        if any(word in title for word in ["qa", "test", "design", "scrum", "project manager"]):
            if not any(re.search(pat, title) for pat in [r'\bvue\b', r'\bdeveloper\b', r'\bengineer\b']):
                return False
        return True
        
    return False

def main():
    print("=== Multi-Site Job Scraper (LinkedIn, Indeed, Naukri, Glassdoor, ZipRecruiter) ===")
    print("Filter: Only jobs where Vue is important (Frontend/Fullstack/Vue) and location is India.\n")
    
    search_term = "Vue.js"
    location = "India"
    hours_old = 168 # 7 days (last week)
    
    print(f"Searching for: '{search_term}'")
    print(f"Location:       '{location}'")
    print(f"Max age:        {hours_old} hours (last week)\n")
    
    try:
        # Scrape jobs concurrently from all platforms
        jobs = scrape_jobs(
            site_name=["linkedin", "indeed", "naukri", "zip_recruiter", "glassdoor"],
            search_term=search_term,
            location=location,
            results_wanted=100,
            hours_old=hours_old,
            country_indeed='india' # Indeed India support
        )
        
        total_found = len(jobs)
        print(f"\nScraping complete. Raw download found {total_found} jobs.")
        
        if total_found == 0:
            print("No jobs found matching the raw criteria.")
            # Create empty files to avoid breaking downstream uses
            jobs.to_csv("multi_site_jobs.csv", index=False)
            with open("multi_site_jobs.json", "w") as f:
                json.dump([], f)
            return

        # Convert DataFrame to a list of dicts for JSON
        jobs_json = jobs.to_dict(orient="records")
        
        # Helper to sanitize values for JSON serialization
        def clean_val(val):
            if pd.isna(val):
                return None
            if isinstance(val, (datetime, date, pd.Timestamp)):
                return val.isoformat()
            return val

        cleaned_jobs = []
        for job in jobs_json:
            cleaned_job = {k: clean_val(v) for k, v in job.items()}
            # Apply our location & tech relevance filter
            if is_vue_important_and_india(cleaned_job):
                cleaned_jobs.append(cleaned_job)

        total_filtered = len(cleaned_jobs)
        print(f"Filtering complete. Kept {total_filtered} out of {total_found} jobs.")

        if total_filtered == 0:
            print("No jobs remained after applying the Vue-importance & India location filters.")
            # Write empty structures
            pd.DataFrame().to_csv("multi_site_jobs.csv", index=False)
            with open("multi_site_jobs.json", "w") as f:
                json.dump([], f)
            return

        # Export filtered results to CSV
        filtered_df = pd.DataFrame(cleaned_jobs)
        filtered_df.to_csv("multi_site_jobs.csv", index=False)
        print("Saved filtered results to multi_site_jobs.csv")

        # Save to JSON
        with open("multi_site_jobs.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_jobs, f, indent=2)
        print("Saved filtered results to multi_site_jobs.json")

        # Generate a beautiful Markdown report
        report_lines = []
        report_lines.append("# Multi-Site Vue.js Jobs Report (India)")
        report_lines.append("### Filters: Title mentions Frontend/Fullstack/Vue/UI/Web | Location: India only")
        report_lines.append(f"Generated on: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        
        report_lines.append("## 📊 Summary by Platform")
        
        from collections import Counter
        site_counts = Counter(j.get("site", "unknown") for j in cleaned_jobs)
        for site, count in site_counts.items():
            report_lines.append(f"- **{site.upper() if len(site) <= 3 else site.capitalize()}**: {count} jobs")
        report_lines.append(f"- **Total**: {total_filtered} jobs\n")
        
        report_lines.append("## 💼 Job Listings")
        report_lines.append("| Title | Company | Location | Platform | Date Posted | URL |")
        report_lines.append("| --- | --- | --- | --- | --- | --- |")
        
        # Sort jobs by date posted descending (newest first)
        sorted_jobs = sorted(cleaned_jobs, key=lambda x: x.get("date_posted") or "", reverse=True)
        
        for j in sorted_jobs:
            title = j.get("title", "N/A") or "N/A"
            company = j.get("company", "N/A") or "N/A"
            loc = j.get("location", "N/A") or "N/A"
            site = j.get("site", "N/A") or "N/A"
            site_name = site.upper() if len(site) <= 3 else site.capitalize()
            date_val = j.get("date_posted", "N/A") or "N/A"
            if date_val != "N/A" and len(date_val) >= 10:
                date_val = date_val[:10]
            url = j.get("job_url", "#") or "#"
            
            # Escape Markdown pipes to keep the table structural integrity
            title = str(title).replace("|", "\\|").strip()
            company = str(company).replace("|", "\\|").strip()
            loc = str(loc).replace("|", "\\|").strip()
            
            link_str = f"[View Job]({url})" if url != "#" else "N/A"
            report_lines.append(f"| {title} | {company} | {loc} | {site_name} | {date_val} | {link_str} |")
            
        with open("multi_site_jobs_report.md", "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))
        print("Saved markdown report to multi_site_jobs_report.md")
        
    except Exception as e:
        print(f"An error occurred during execution: {e}")

if __name__ == "__main__":
    main()
