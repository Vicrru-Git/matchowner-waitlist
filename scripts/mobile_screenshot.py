from playwright.sync_api import sync_playwright

OUT = r"C:\Users\victo\dev\matchowner\matchowner-waitlist\scripts\hero-mobile.png"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 375, "height": 667}, device_scale_factor=2)
    page = ctx.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path=OUT, full_page=False)
    print(f"saved {OUT}")
    browser.close()
