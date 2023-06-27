# Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

import json
from pathlib import Path

from rich.pretty import pprint

try:
    with open("./messages/en.json", "r") as f:
        en = json.load(f)
except IOError:
    print("Can't open en.json")
    exit(1)

for lang in Path("./messages/").glob("*.json"):
    if lang.name == "en.json":
        continue
    with open(lang, "r") as f:
        data = json.load(f)
    for key in en['common'].keys():
        if key not in data['common'].keys():
            print(f"Adding {key} to {lang.name}")
            data['common'][key] = "NOT TRANSLATED"
    with open(lang, "w", encoding="utf-8") as f:
        json.dump(data, f, sort_keys=True, indent=2, ensure_ascii=False)
