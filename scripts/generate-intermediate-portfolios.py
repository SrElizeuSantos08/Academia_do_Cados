"""Generate the intermediate materials using the academy's existing PDF layout."""
import importlib.util
import json
import sys
sys.dont_write_bytecode = True
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("portfolios", ROOT / "scripts/generate-module-portfolios.py")
layout = importlib.util.module_from_spec(spec)
spec.loader.exec_module(layout)

for item in json.loads((ROOT / "content/intermediate-course.json").read_text(encoding="utf-8")):
    questions = item["questions"]
    layout.render({**item,
        "file": f"portfolio-intermediario-{item['number']:02}-2026.pdf",
        "materialTitle": f"Portfólio intermediário - {item['moduleTitle']}",
        "trackLabel": "Segurança Digital no Trabalho • Intermediário",
        "title": item["moduleTitle"], "subtitle": item["lessonTitle"],
        "mechanism": item["scenario"], "sequence": item["key"],
        "cases": [(q["question"], "Escolha seu próximo passo antes de consultar a resposta.", q["explanation"]) for q in questions[:3]],
        "checklist": item["checks"],
        "nuance": ("Decisão e consequência", item["decision"]["orientation"]),
        "rule": item["key"], "closing": item["key"],
        "labs": [(q["question"], q["explanation"]) for q in questions[2:]],
    })
