"""Render the seven module portfolios with the layout of the lesson 01 PDF.

Run with a Python runtime containing reportlab (the Codex bundle includes it).
The site's JavaScript dependencies are unchanged.
"""
import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
FONT_ROOT = Path("C:/Windows/Fonts")
for family, file in [("Arial", "arial.ttf"), ("Arial-Bold", "arialbd.ttf")]:
    pdfmetrics.registerFont(TTFont(family, str(FONT_ROOT / file)))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")

NAVY = colors.HexColor("#112A40")
TEAL = colors.HexColor("#0CA9A7")
PALE = colors.HexColor("#E1F5F3")
LINE = colors.HexColor("#CDDFE5")
MUTED = colors.HexColor("#5E7588")
ORANGE = colors.HexColor("#FFB33A")
WHITE = colors.white
W, H = A4
WIDTH = W - 104

STYLES = {
    "body": ParagraphStyle("Body", fontName="Arial", fontSize=10.3, leading=14.7,
                           textColor=NAVY, spaceAfter=10, alignment=TA_LEFT),
    "heading": ParagraphStyle("Heading", fontName="Arial-Bold", fontSize=22,
                              leading=26, textColor=NAVY, spaceAfter=14),
    "sub": ParagraphStyle("Subheading", fontName="Arial-Bold", fontSize=13.5,
                          leading=17, textColor=TEAL, spaceBefore=7, spaceAfter=7),
    "cell": ParagraphStyle("Cell", fontName="Arial", fontSize=9.5, leading=13.2,
                           textColor=NAVY, spaceAfter=0),
    "small": ParagraphStyle("Small", fontName="Arial", fontSize=8.4, leading=11.4,
                            textColor=MUTED, spaceAfter=7, splitLongWords=True),
    "cover": ParagraphStyle("Cover", fontName="Arial-Bold", fontSize=31,
                            leading=36, textColor=WHITE),
    "subtitle": ParagraphStyle("Subtitle", fontName="Arial", fontSize=15,
                               leading=21, textColor=colors.HexColor("#D1E0EB")),
    "cover_key": ParagraphStyle("CoverKey", fontName="Arial", fontSize=11,
                                leading=16, textColor=WHITE),
}


def p(text, style="body"):
    return Paragraph(escape(text).replace("\n", "<br/>"), STYLES[style])


def bold(text, rest="", style="body"):
    return Paragraph("<b>" + escape(text) + "</b>" + ("<br/>" + escape(rest) if rest else ""), STYLES[style])


def box(title, text):
    table = Table([[bold(title, text)]], colWidths=[WIDTH - 4])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("LINEBEFORE", (0, 0), (0, -1), 3, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def header(c, number, module):
    c.setStrokeColor(LINE)
    c.line(52, 40, W - 52, 40)
    c.setFont("Arial", 7)
    c.setFillColor(MUTED)
    c.drawString(52, 26, f"BBS ONE  |  SEGURANÇA DIGITAL NA PRÁTICA  |  MÓDULO {module:02}")
    c.drawRightString(W - 52, 26, f"{number:02}")


def page(c, number, module, content):
    header(c, number, module)
    remaining = list(content)
    frame = Frame(52, 65, WIDTH, H - 119, leftPadding=0, rightPadding=0,
                  topPadding=0, bottomPadding=0)
    frame.addFromList(remaining, c)
    if remaining:
        raise ValueError(f"Module {module}, page {number}: content overflow ({len(remaining)} blocks)")
    c.showPage()


def cover(c, item):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(TEAL)
    c.circle(W - 51, H - 100, 94, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#1B4057"))
    c.circle(W - 51, H - 100, 65, stroke=0, fill=1)
    c.setFillColor(ORANGE)
    c.setFont("Arial-Bold", 10.5)
    c.drawString(57, H - 121, f"PORTFÓLIO DIDÁTICO • MÓDULO {item['number']:02}")
    title = p(item["title"], "cover")
    _, height = title.wrap(WIDTH, 180)
    title.drawOn(c, 57, H - 145 - height)
    subtitle = p(item["subtitle"], "subtitle")
    _, sub_h = subtitle.wrap(WIDTH - 8, 110)
    subtitle.drawOn(c, 57, H - 172 - height - sub_h)
    c.setFillColor(colors.HexColor("#1C4056"))
    c.setStrokeColor(TEAL)
    c.rect(77, 416, WIDTH - 32, 101, stroke=1, fill=1)
    c.setFillColor(WHITE)
    c.setFont("Arial", 10)
    c.drawString(92, 491, "IDEIA-CHAVE")
    key = p(item["key"], "cover_key")
    _, key_h = key.wrap(WIDTH - 63, 68)
    key.drawOn(c, 92, 476 - key_h)
    c.setFillColor(colors.HexColor("#D1E0EB"))
    c.setFont("Arial", 15)
    c.drawString(57, 300, "Segurança Digital na Prática • BBS One")
    c.setFont("Arial", 9.1)
    c.drawString(57, 279, "Público geral • leitura estimada: 12 minutos • revisão: 22 out. 2026")
    c.setStrokeColor(colors.HexColor("#2B566D"))
    for offset in range(5):
        c.arc(52 + offset * 15, 122 + offset * 10, 246 + offset * 15,
              228 + offset * 10, 15, 150)
    c.showPage()


def render(item):
    destination = ROOT / "public/materials" / item["file"]
    c = canvas.Canvas(str(destination), pagesize=A4, invariant=1)
    c.setTitle(item["materialTitle"])
    c.setAuthor("BBS One | Academia do Caos")
    c.setSubject(f"Módulo {item['number']:02} - Segurança Digital na Prática")
    n = item["number"]
    cover(c, item)

    rows = [[bold("SINAL / AÇÃO", style="cell"), bold("O QUE CONFERIR", style="cell")]]
    rows.extend([[p(a, "cell"), p(b, "cell")] for a, b in item["risks"]])
    table = Table(rows, colWidths=[164, WIDTH - 164], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    page(c, 2, n, [p("01 | Entenda a mecânica", "heading"), p(item["mechanism"]),
                   p("Onde mora o risco", "sub"), table, Spacer(1, 15),
                   box("A sequência para reconhecer", item["sequence"])])

    blocks = [p("02 | Sinais para reconhecer", "heading"),
              p("Observe o conjunto: um detalhe isolado não encerra a análise. Pergunte se a ação faz sentido para a situação e confirme pelo caminho adequado.")]
    for title, text in item["signals"]:
        blocks += [p(title, "sub"), p(text)]
    page(c, 3, n, blocks)

    blocks = [p("03 | Casos para praticar", "heading"),
              p("Os cenários abaixo são fictícios. Use-os para treinar a decisão antes de encontrar uma situação parecida no dia a dia.")]
    for index, (title, situation, action) in enumerate(item["cases"], 1):
        blocks += [p(f"Caso {index} - {title}", "sub"), p(situation),
                   bold("Resposta segura", action), Spacer(1, 6)]
    page(c, 4, n, blocks)

    blocks = [p("04 | Pausa de 20 segundos", "heading"),
              p("Use o checklist PARE antes de concluir a ação. Se uma resposta ainda depende da mensagem ou da pessoa suspeita, procure uma confirmação independente."),
              p("Checklist: PARE", "sub")]
    for letter, title, text in item["checklist"]:
        blocks += [box(f"{letter} - {title}", text), Spacer(1, 10)]
    blocks += [p(item["nuance"][0], "sub"), p(item["nuance"][1])]
    page(c, 5, n, blocks)

    blocks = [p("05 | Hábitos que reduzem o risco", "heading"),
              p("A prática fica mais simples quando você sabe qual caminho seguro usar. No trabalho, combine os cuidados abaixo com os procedimentos da organização."),
              p("No dia a dia", "sub")]
    for text in item["habits"]:
        blocks += [p("• " + text), Spacer(1, 3)]
    blocks += [Spacer(1, 12), box("Regra de ouro", item["rule"])]
    page(c, 6, n, blocks)

    blocks = [p("06 | Se algo saiu do esperado", "heading"),
              p("Não esconda o ocorrido nem espere ter todas as respostas para pedir ajuda. Estas são orientações de conscientização; a resposta concreta deve seguir o serviço e a equipe responsáveis.")]
    for i, (title, text) in enumerate(item["response"], 1):
        blocks += [p(f"{i}. {title}", "sub"), p(text)]
    blocks += [Spacer(1, 6), box("Lembre-se", item["closing"])]
    page(c, 7, n, blocks)

    blocks = [p("07 | Mini laboratório", "heading"),
              p("Leia cada cenário e escolha seu próximo passo antes de consultar o comentário. Na aula do portal, responda às cinco perguntas; são necessários quatro acertos.")]
    for title, comment in item["labs"]:
        blocks += [p(title, "sub"), p(comment)]
    blocks += [box("D. Traga para a sua rotina", "Identifique o canal oficial que você usaria neste tema e um cuidado que pode aplicar hoje. Não registre senhas, códigos nem dados de outras pessoas neste exercício."),
               Spacer(1, 11), p("Fontes para continuar estudando", "sub")]
    for title, url in item["sources"]:
        blocks += [p(title, "small"), Paragraph(
            f'<link href="{escape(url, quote=True)}" color="#177B7C">{escape(url)}</link>', STYLES["small"])]
    blocks += [p("Consulta às fontes: 22 out. 2026. Material autoral de conscientização com exemplos fictícios. Telas e procedimentos podem variar por serviço, conta e política organizacional.", "small")]
    page(c, 8, n, blocks)
    c.save()
    print(f"Módulo {n:02}: 8 páginas - {destination.name}")


if __name__ == "__main__":
    data = json.loads((ROOT / "content/module-portfolios.json").read_text(encoding="utf-8"))
    for item in data:
        render(item)
