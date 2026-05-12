from playwright.sync_api import sync_playwright

DEVICES = [
    ("iphone-se",    375, 667),
    ("iphone-13pro", 390, 844),
    ("iphone-xr",    414, 896),
    ("iphone-pmax",  430, 932),
]

OUT_DIR = r"C:\Users\victo\dev\matchowner\matchowner-waitlist\scripts"
URL = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Pre-warm: trigger Next dev compilation once
    warm = browser.new_context(viewport={"width": 375, "height": 667})
    warm_page = warm.new_page()
    warm_page.goto(URL, timeout=90000, wait_until="domcontentloaded")
    warm_page.wait_for_load_state("networkidle", timeout=90000)
    warm.close()
    print("warmed", flush=True)

    for name, w, h in DEVICES:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(URL, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle", timeout=60000)
        page.wait_for_timeout(700)
        out = f"{OUT_DIR}\\hero-{name}.png"
        page.screenshot(path=out, full_page=False)
        print(f"saved {out} ({w}x{h})", flush=True)
        ctx.close()
    browser.close()
