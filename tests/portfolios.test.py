"""Validate the authored PDFs using the bundled Python PDF libraries."""
import json
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
content = json.loads((ROOT / "content/module-portfolios.json").read_text(encoding="utf-8"))
for item in content:
    path = ROOT / "public/materials" / item["file"]
    reader = PdfReader(path)
    assert len(reader.pages) == 8, path.name
    text = "\n".join(page.extract_text() for page in reader.pages)
    for marker in [f"MÓDULO {item['number']:02}", "Entenda a mecânica", "Sinais para reconhecer",
                   "Casos para praticar", "Checklist: PARE", "Hábitos que reduzem o risco",
                   "Se algo saiu do esperado", "Mini laboratório", "Fontes para continuar estudando"]:
        assert marker in text, (path.name, marker)
    assert "\ufffd" not in text and "\u25a0" not in text, path.name
    links = [str(annotation.get_object().get("/A", {}).get("/URI", ""))
             for page in reader.pages for annotation in page.get("/Annots", [])]
    for _, url in item["sources"]:
        assert url in links, (path.name, url)
    with pdfplumber.open(path) as pdf:
        for index, page in enumerate(pdf.pages):
            for char in page.chars:
                assert char["x0"] >= 48 and char["x1"] <= page.width - 45, (path.name, index + 1, char["text"])
                assert char["top"] >= 20 and char["bottom"] <= page.height - 18, (path.name, index + 1)
    print(f"PASS: module {item['number']:02}, eight pages, text, hyperlinks and page bounds.")
