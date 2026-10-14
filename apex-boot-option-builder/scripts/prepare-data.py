import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "data/apex_dx12_all_static_registrations.csv"
target = root / "public/data/registrations.json"

fields = (
    "name", "default", "value_kind", "min_bound", "max_bound",
    "help", "description", "confidence", "category"
)
by_name = {}
with source.open(encoding="utf-8-sig", newline="") as file:
    for row in csv.DictReader(file):
        name = row["name"].strip()
        if name:
            entry = by_name.setdefault(name, {key: row[key] for key in fields})
            for key in fields[1:]:
                if not entry[key] and row[key]:
                    entry[key] = row[key]
data = list(by_name.values())

target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Prepared {len(data)} registrations → {target.relative_to(root)}")
