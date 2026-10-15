#!/usr/bin/env python3
"""Genere quiz.html (application autonome) a partir des fichiers Markdown du module 13.

Usage :  python build_quiz.py      puis ouvrir quiz.html dans le navigateur.
Les questions sont lues dans questions*.md, les cours dans README.md / approfondissement.md.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

TRACKS = {
    "gcp": {"dir": "gcp-devops-engineer", "name": "GCP DevOps Engineer", "short": "GCP"},
    "az": {"dir": "az-305", "name": "AZ-305 Azure Solutions Architect", "short": "AZ-305"},
    "tf": {"dir": "terraform", "name": "Terraform (Associate -> avance)", "short": "Terraform"},
}
QUESTION_FILES = {
    "questions.md": "Base",
    "questions-avancees.md": "Avancees",
    "questions-complementaires.md": "Complementaires",
}
COURSE_FILES = {"README.md": "Cours", "approfondissement.md": "Approfondissement"}
SKIP_SECTIONS = ("grille", "pour aller plus loin", "correction globale", "mini etudes", "mini études")

RE_Q = re.compile(r"^###\s+Q(\d+)\s*$")
RE_CASE_Q = re.compile(r"^\*\*([A-Z]\d+)\.\*\*\s*(.*)$")
RE_OPT = re.compile(r"^-\s+([A-E])\.\s+(.*)$")
RE_ANS = re.compile(r"^[A-E](?:\s*(?:,|et)\s*[A-E])*\.?$")


def parse_answers(details):
    m = re.search(r"\*\*(.+?)\*\*", details)
    if not m or not RE_ANS.match(m.group(1).strip()):
        return None, details
    letters = re.findall(r"[A-E]", m.group(1))
    return sorted(set(letters)), details[m.end():].strip()


def parse_file(path, track, source):
    lines = path.read_text(encoding="utf-8").splitlines()
    questions, section, context, cur = [], "General", "", None

    def flush():
        nonlocal cur
        if cur is None:
            return
        body = "\n".join(cur["lines"])
        det = re.search(r"<details>.*?</summary>(.*?)</details>", body, re.S)
        before = body[: det.start()] if det else body
        opts = [RE_OPT.match(l.strip()) for l in before.splitlines()]
        opts = [(m.group(1), m.group(2).replace("**", "")) for m in opts if m]
        stem = "\n".join(l for l in before.splitlines() if not RE_OPT.match(l.strip())).strip()
        answers, expl = (None, "")
        if det:
            answers, expl = parse_answers(det.group(1).strip())
        if det and not opts:  # question ouverte : auto-evaluation
            if cur["context"]:
                stem = cur["context"] + "\n\n" + stem
            questions.append({
                "id": f"{track}:{source[:3].lower()}:{cur['num']}",
                "track": track, "source": source, "num": cur["num"], "section": cur["section"],
                "q": stem, "opts": [], "ans": [], "exp": det.group(1).strip(), "open": True,
            })
        elif len(opts) < 2 or not answers:
            print(f"  ! ignoree : {path.name} {cur['num']}", file=sys.stderr)
        else:
            if cur["context"]:
                stem = cur["context"] + "\n\n" + stem
            questions.append({
                "id": f"{track}:{source[:3].lower()}:{cur['num']}",
                "track": track, "source": source, "num": cur["num"], "section": cur["section"],
                "q": stem, "opts": [{"k": k, "t": t} for k, t in opts],
                "ans": answers, "exp": expl,
            })
        cur = None

    for line in lines:
        m_q, m_c = RE_Q.match(line), RE_CASE_Q.match(line)
        if m_q or m_c:
            flush()
            if m_q:
                cur = {"num": "Q" + m_q.group(1), "section": section, "context": "", "lines": []}
            else:
                cur = {"num": m_c.group(1), "section": section, "context": context, "lines": [m_c.group(2)]}
            continue
        if line.startswith("## "):
            flush()
            section = line[3:].strip()
            if section.lower().startswith(SKIP_SECTIONS):
                section = None
            context = ""
        elif line.startswith("### "):
            flush()
            context, section = "", re.sub(r"^Cas ", "Cas ", line[4:].strip())
        elif line.strip() == "---":
            flush()
        elif cur is not None and section is not None:
            cur["lines"].append(line)
        elif section is not None and line.startswith("**Contexte**"):
            context = line.strip()
    flush()
    return questions


def main():
    questions, courses = [], []
    for tid, t in TRACKS.items():
        d = ROOT / t["dir"]
        for fname, source in QUESTION_FILES.items():
            p = d / fname
            if p.exists():
                qs = parse_file(p, tid, source)
                print(f"{tid:3} {fname:32} {len(qs):3} questions")
                questions += qs
        for fname, label in COURSE_FILES.items():
            p = d / fname
            if p.exists():
                courses.append({"track": tid, "doc": label, "md": p.read_text(encoding="utf-8")})
    courses.append({"track": "all", "doc": "Vue d'ensemble",
                    "md": (ROOT / "README.md").read_text(encoding="utf-8")})
    data = {"tracks": TRACKS, "questions": questions, "courses": courses}
    tpl = (ROOT / "quiz_template.html").read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    (ROOT / "quiz.html").write_text(tpl.replace("/*__DATA__*/null", payload), encoding="utf-8")
    print(f"=> quiz.html : {len(questions)} questions, {len(courses)} documents de cours")


if __name__ == "__main__":
    main()
