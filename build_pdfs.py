import re
import os
import subprocess

CSS_STYLE = """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0F172A;
    line-height: 1.6;
    padding: 20px;
    font-size: 13px;
    background-color: #FFFFFF;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #4F46E5;
    border-bottom: 3px solid #E0E7FF;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1E293B;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 6px;
    margin-top: 20px;
    margin-bottom: 12px;
  }
  h3 {
    font-size: 15px;
    font-weight: 700;
    color: #334155;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  p, li {
    font-size: 13px;
    color: #334155;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;
  }
  th, td {
    border: 1px solid #CBD5E1;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background-color: #F1F5F9;
    color: #0F172A;
    font-weight: 700;
  }
  tr:nth-child(even) {
    background-color: #F8FAFC;
  }
  pre, code {
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    background-color: #F1F5F9;
    color: #4338CA;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
  }
  pre {
    padding: 12px;
    overflow-x: auto;
    border: 1px solid #E2E8F0;
    background-color: #0F172A;
    color: #F8FAFC;
    border-radius: 8px;
  }
  pre code {
    background-color: transparent;
    color: #F8FAFC;
  }
  blockquote {
    border-left: 4px solid #6366F1;
    padding-left: 12px;
    margin-left: 0;
    color: #475569;
    font-style: italic;
    background: #F8FAFC;
    padding: 8px 12px;
    border-radius: 0 8px 8px 0;
  }
  hr {
    border: none;
    border-top: 2px solid #E2E8F0;
    margin: 24px 0;
  }
</style>
"""

def simple_md_to_html(md_text):
    html = md_text
    # Escape HTML special chars except inside markdown syntax
    # Code blocks
    code_blocks = []
    def save_code_block(match):
        code_blocks.append(match.group(1))
        return f"___CODE_BLOCK_{len(code_blocks)-1}___"
    
    html = re.sub(r'```[\w]*\n(.*?)```', save_code_block, html, flags=re.DOTALL)
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Tables
    lines = html.split('\n')
    in_table = False
    new_lines = []
    table_buffer = []
    
    for line in lines:
        if '|' in line and (line.strip().startswith('|') or line.strip().endswith('|')):
            if not in_table:
                in_table = True
                table_buffer = []
            table_buffer.append(line)
        else:
            if in_table:
                # Convert table buffer to HTML
                in_table = False
                new_lines.append(convert_table(table_buffer))
                table_buffer = []
            new_lines.append(line)
    if in_table:
        new_lines.append(convert_table(table_buffer))
        
    html = '\n'.join(new_lines)
    
    # Bold / Italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)
    
    # Horizontal rules
    html = re.sub(r'^---$', r'<hr/>', html, flags=re.MULTILINE)
    
    # Unordered lists
    html = re.sub(r'^\s*[-*]\s+(.*?)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*?</li>\n?)+', r'<ul>\g<0></ul>', html, flags=re.DOTALL)
    
    # Paragraphs (simple)
    paragraphs = html.split('\n\n')
    formatted_p = []
    for p in paragraphs:
        p_strip = p.strip()
        if not p_strip:
            continue
        if p_strip.startswith('<h') or p_strip.startswith('<ul') or p_strip.startswith('<table') or p_strip.startswith('<hr') or p_strip.startswith('___CODE'):
            formatted_p.append(p_strip)
        else:
            formatted_p.append(f"<p>{p_strip}</p>")
    html = '\n'.join(formatted_p)
    
    # Restore code blocks
    for idx, cb in enumerate(code_blocks):
        clean_cb = cb.replace('<', '&lt;').replace('>', '&gt;')
        html = html.replace(f"___CODE_BLOCK_{idx}___", f"<pre><code>{clean_cb}</code></pre>")
        
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'>{CSS_STYLE}</head><body>{html}</body></html>"

def convert_table(lines):
    if len(lines) < 2:
        return '\n'.join(lines)
    
    headers = [c.strip() for c in lines[0].strip('|').split('|')]
    # line 1 is separator
    rows = []
    for line in lines[2:]:
        if '|' in line:
            cols = [c.strip() for c in line.strip('|').split('|')]
            rows.append(cols)
            
    th_html = ''.join([f"<th>{h}</th>" for h in headers])
    tr_html = ""
    for r in rows:
        td_html = ''.join([f"<td>{col}</td>" for col in r])
        tr_html += f"<tr>{td_html}</tr>"
        
    return f"<table><thead><tr>{th_html}</tr></thead><tbody>{tr_html}</tbody></table>"

files = [
    "SYSTEM_REQUIREMENTS_SPECIFICATION",
    "UAT_TEST_CASES_AND_TEST_PLAN",
    "DEMO_WALKTHROUGH_AND_USER_GUIDE"
]

chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

for base in files:
    md_file = f"{base}.md"
    html_file = f"{base}.html"
    pdf_file = f"{base}.pdf"
    
    if os.path.exists(md_file):
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        html_out = simple_md_to_html(content)
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_out)
        
        abs_html = os.path.abspath(html_file)
        abs_pdf = os.path.abspath(pdf_file)
        
        cmd = [
            chrome_path,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            f"--print-to-pdf={abs_pdf}",
            f"file://{abs_html}"
        ]
        print(f"Generating PDF for {base}...")
        subprocess.run(cmd, check=True)
        print(f"SUCCESS: Created {pdf_file}")

print("ALL PDFS GENERATED SUCCESSFULLY!")
