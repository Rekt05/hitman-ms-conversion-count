import requests
import json
from pathlib import Path
from datetime import datetime

#file names
OUT_MAIN = Path("MainBoard.json")
OUT_CE = Path("CategoryExtensions.json")
OUT_ET = Path("ElusiveTargets.json")
OUT_ESC = Path("Escalations.json")
OUT_FL = Path("Freelancer.json")
OUT_ALL = Path("CombinedBoards.json")

BOARDS = {
    "Main Board": "j1ne5891",
    "Category Extensions": "v1ponx76",
    "Elusive Targets": "4d7nxqn6",
    "Escalations": "kdkmjxg1",
    "Freelancer": "76r35zv6"
}

PLATFORM_MAP = {
    "4p9zjrer": "PS5",
    "8gej2n93": "PC",
    "nzelkr6q": "PS4",
    "o7e2mx6w": "Xbox One",
    "nzelyv9q": "Xbox Series X",
    "o7e2xj9w": "Xbox Series S",
    "7m6ylw9p": "Switch"
}

def format_time_fg(seconds):
    if seconds is None:
        return "Unknown"
    seconds = int(float(seconds))
    m = seconds // 60
    s = seconds % 60
    return f"{m}:{s:02}"

def format_time_il(seconds, has_ms):
    if seconds is None:
        return "Unknown"
    if has_ms:
        m = int(seconds // 60)
        s = int(seconds % 60)
        ms = int(round((seconds - int(seconds)) * 1000))
        return f"{m}:{s:02}:{ms:03}"
    else:
        seconds = int(seconds)
        m = seconds // 60
        s = seconds % 60
        return f"{m}:{s:02}"

all_combined = []

for board_name, game_id in BOARDS.items():
    all_runs = []
    offset = 0
    BASE_URL = f"https://www.speedrun.com/api/v1/runs?game={game_id}&max=200&status=verified&offset="

    while True:
        url = BASE_URL + str(offset)
        data = requests.get(url).json().get("data", [])

        if not data:
            print(f"All {board_name} runs found")
            break

        for run in data:
            weblink = run.get("weblink")

            videos = (run.get("videos") or {}).get("links")
            video = videos[0]["uri"] if videos else "no video"

            platform_code = (run.get("system") or {}).get("platform", "Unknown")
            platform_name = PLATFORM_MAP.get(platform_code, "Unknown")

            submitted_raw = run.get("submitted")
            if submitted_raw:
                submitted_dt = datetime.fromisoformat(submitted_raw.replace("Z", "+00:00"))
                submitted_date = submitted_dt.strftime("%d/%m/%Y")
            else:
                submitted_date = "Unknown"

            time_seconds = run.get("times", {}).get("primary_t", None)
            run_type = "IL" if run.get("level") else "FG"

            if run_type == "FG":
                formatted_time = format_time_fg(time_seconds)
                ms_status = "N/A"
            else:
                if time_seconds is not None and (time_seconds % 1) != 0:
                    formatted_time = format_time_il(time_seconds, has_ms=True)
                    ms_status = "Completed"
                else:
                    formatted_time = format_time_il(time_seconds, has_ms=False)
                    ms_status = "Unconverted"

            run_entry = {
                "weblink": weblink,
                "video": video,
                "platform": platform_name,
                "submitted": submitted_date,
                "time": formatted_time,
                "run_type": run_type,
                "MS": ms_status
            }

            all_runs.append(run_entry)
            all_combined.append(run_entry)

        print(f"{len(all_runs)} runs so far for {board_name}")
        offset += 200

    #save individually
    out_path = {
        "Main Board": OUT_MAIN,
        "Category Extensions": OUT_CE,
        "Elusive Targets": OUT_ET,
        "Escalations": OUT_ESC,
        "Freelancer": OUT_FL
    }[board_name]

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_runs, f, indent=2)

#save combined
with open(OUT_ALL, "w", encoding="utf-8") as f:
    json.dump(all_combined, f, indent=2)

print(f"Total combined verified runs collected: {len(all_combined)}")